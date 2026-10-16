import os
import re
import json
import pandas as pd
import numpy as np
from datetime import datetime

# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
DEFAULT_DATA_PATH = os.path.join(DATA_DIR, "sales.csv")
UPLOADED_DATA_PATH = os.path.join(DATA_DIR, "uploaded_sales.csv")
METADATA_PATH = os.path.join(DATA_DIR, "dataset_metadata.json")


# ============================================================
# COLUMN CANDIDATES FOR FLEXIBLE DETECTION
# ============================================================

COLUMN_CANDIDATES = {
    "date": [
        "date", "order_date", "orderdate", "sales_date", "salesdate",
        "transaction_date", "transactiondate", "timestamp", "datetime",
        "invoice_date", "invoicedate", "time"
    ],
    "sales": [
        "sales", "revenue", "total_sales", "totalsales", "purchase_amount",
        "purchaseamount", "amount", "total_amount", "totalamount",
        "grand_total", "price_total", "total"
    ],
    "profit": [
        "profit", "net_profit", "netprofit", "margin", "gross_profit",
        "grossprofit", "earnings", "income"
    ],
    "quantity": [
        "quantity", "qty", "units", "units_sold", "unitssold",
        "count", "volume", "num_items"
    ],
    "product": [
        "product", "product_name", "productname", "item", "item_name",
        "itemname", "description", "sku", "title"
    ],
    "category": [
        "category", "product_category", "productcategory", "type",
        "department", "genre", "group", "class"
    ],
    "region": [
        "region", "area", "location", "city", "state", "country",
        "territory", "market", "zone", "district"
    ],
    "unit_price": [
        "unit_price", "unitprice", "price", "rate", "cost_per_unit"
    ],
    "cost": [
        "cost", "unit_cost", "unitcost", "total_cost", "totalcost",
        "expense", "cogs"
    ],
    "discount": [
        "discount", "discount_rate", "discount_amount", "rebate"
    ]
}


def normalize_col_name(col: str) -> str:
    """Normalize a column name for comparison (lowercase, alphanumeric only)."""
    return re.sub(r"[^a-z0-9]", "", str(col).strip().lower())


def find_column(df: pd.DataFrame, candidates: list) -> str | None:
    """Find a column in df matching any candidate name."""
    col_map = {normalize_col_name(col): col for col in df.columns}
    for candidate in candidates:
        norm = normalize_col_name(candidate)
        if norm in col_map:
            return col_map[norm]
    return None


def clean_numeric_series(series: pd.Series) -> pd.Series:
    """Clean and convert series to numeric, stripping currency signs and commas."""
    if pd.api.types.is_numeric_dtype(series):
        return pd.to_numeric(series, errors="coerce")
    
    cleaned = (
        series.astype(str)
        .str.replace(r"[₹\$,€£%\s]", "", regex=True)
        .str.replace(",", "", regex=False)
        .replace(["nan", "None", "null", ""], np.nan)
    )
    return pd.to_numeric(cleaned, errors="coerce")


# ============================================================
# ACTIVE DATASET MANAGEMENT
# ============================================================

BACKEND_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "sales.csv")


def get_active_dataset_path() -> str:
    """Return the active dataset path: uploaded dataset if present, else default."""
    if os.path.exists(UPLOADED_DATA_PATH):
        return UPLOADED_DATA_PATH
    if os.path.exists(DEFAULT_DATA_PATH):
        return DEFAULT_DATA_PATH
    if os.path.exists(BACKEND_DATA_PATH):
        return BACKEND_DATA_PATH
    return DEFAULT_DATA_PATH


def get_dataset_metadata() -> dict:
    """Read saved dataset metadata or generate from default dataset."""
    if os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    path = get_active_dataset_path()
    filename = os.path.basename(path)
    return {
        "filename": filename,
        "is_uploaded": os.path.exists(UPLOADED_DATA_PATH),
        "updated_at": datetime.now().isoformat()
    }


def save_dataset_metadata(meta: dict):
    """Save dataset metadata to JSON."""
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)


# ============================================================
# PREPROCESSING PIPELINE
# ============================================================

def preprocess_sales_dataframe(df: pd.DataFrame, original_filename: str = "uploaded_sales.csv") -> tuple[pd.DataFrame, dict]:
    """
    Validate, clean, and standardize an uploaded sales DataFrame.
    Returns: (cleaned_df, metadata_dict)
    Raises ValueError with descriptive messages if validation fails.
    """
    if df is None or df.empty:
        raise ValueError("The uploaded CSV dataset is empty. Please upload a file with data.")

    # 1. Detect columns
    detected = {}
    for key, candidates in COLUMN_CANDIDATES.items():
        detected[key] = find_column(df, candidates)

    # 2. Validate Date Column
    date_col = detected["date"]
    if not date_col:
        # Check if any non-numeric column contains parseable dates
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                continue
            sample = df[col].dropna().head(10)
            if sample.empty:
                continue
            sample_str = sample.astype(str)
            if not sample_str.str.contains(r"\d+[-/.]\d+|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b", case=False, regex=True).any():
                continue
            try:
                parsed = pd.to_datetime(sample, errors="coerce")
                if parsed.notna().sum() >= max(1, int(len(sample) * 0.7)):
                    date_col = col
                    detected["date"] = col
                    break
            except Exception:
                continue

    if not date_col:
        raise ValueError(
            "No usable Date column found in CSV. "
            "Please include a date column such as 'Date', 'Order_Date', or 'Transaction_Date'."
        )

    # Parse Dates
    parsed_dates = pd.to_datetime(df[date_col], errors="coerce")
    valid_date_count = parsed_dates.notna().sum()
    if valid_date_count == 0:
        raise ValueError(
            f"The column '{date_col}' contains invalid dates that could not be parsed."
        )

    df_clean = df.copy()
    df_clean["_parsed_date"] = parsed_dates
    # Drop rows with unparseable dates
    df_clean = df_clean.dropna(subset=["_parsed_date"]).copy()

    # 3. Validate Sales / Revenue Column
    sales_col = detected["sales"]
    qty_col = detected["quantity"]
    price_col = detected["unit_price"]

    if sales_col:
        df_clean["_sales_val"] = clean_numeric_series(df_clean[sales_col]).fillna(0.0)
    elif qty_col and price_col:
        # Calculate sales from quantity * price
        q = clean_numeric_series(df_clean[qty_col]).fillna(1.0)
        p = clean_numeric_series(df_clean[price_col]).fillna(0.0)
        df_clean["_sales_val"] = q * p
        sales_col = "Sales"
    else:
        raise ValueError(
            "No usable Sales or Revenue column found. "
            "Please include a column like 'Sales', 'Revenue', 'Amount', or both 'Quantity' and 'Unit_Price'."
        )

    # 4. Handle Quantity
    if qty_col:
        df_clean["_quantity_val"] = clean_numeric_series(df_clean[qty_col]).fillna(1.0).astype(int)
    else:
        df_clean["_quantity_val"] = 1

    # 5. Handle Cost and Profit
    profit_col = detected["profit"]
    cost_col = detected["cost"]

    if profit_col:
        df_clean["_profit_val"] = clean_numeric_series(df_clean[profit_col]).fillna(0.0)
    elif cost_col:
        # Profit = Sales - Cost
        cost_val = clean_numeric_series(df_clean[cost_col]).fillna(0.0)
        df_clean["_profit_val"] = df_clean["_sales_val"] - cost_val
        profit_col = "Profit"
    else:
        # If no profit/cost is given, estimate profit margin as 20% of sales
        df_clean["_profit_val"] = (df_clean["_sales_val"] * 0.20).round(2)
        profit_col = "Profit"

    # 6. Handle Categorical Columns (Product, Category, Region)
    product_col = detected["product"]
    if product_col:
        df_clean["_product_val"] = df_clean[product_col].fillna("Unknown Product").astype(str)
    else:
        df_clean["_product_val"] = "Product " + (df_clean.index + 1).astype(str)

    category_col = detected["category"]
    if category_col:
        df_clean["_category_val"] = df_clean[category_col].fillna("General").astype(str)
    else:
        df_clean["_category_val"] = "General"

    region_col = detected["region"]
    if region_col:
        df_clean["_region_val"] = df_clean[region_col].fillna("Global").astype(str)
    else:
        df_clean["_region_val"] = "Global"

    # 7. Remove exact duplicate rows
    initial_rows = len(df_clean)
    df_clean = df_clean.drop_duplicates()
    duplicates_removed = initial_rows - len(df_clean)

    # 8. Sort chronologically
    df_clean = df_clean.sort_values(by="_parsed_date").reset_index(drop=True)

    # 9. Format standardized output columns
    standard_df = pd.DataFrame()
    standard_df["Order_Date"] = df_clean["_parsed_date"].dt.strftime("%Y-%m-%d")
    standard_df["Product"] = df_clean["_product_val"]
    standard_df["Category"] = df_clean["_category_val"]
    standard_df["Region"] = df_clean["_region_val"]
    standard_df["Quantity"] = df_clean["_quantity_val"]
    standard_df["Sales"] = df_clean["_sales_val"].round(2)
    standard_df["Profit"] = df_clean["_profit_val"].round(2)

    # Preserve any additional useful columns from original dataset
    for col in df_clean.columns:
        if not col.startswith("_") and col not in standard_df.columns:
            standard_df[col] = df_clean[col].values

    # Calculate summary metrics
    total_sales = float(standard_df["Sales"].sum())
    total_profit = float(standard_df["Profit"].sum())
    total_orders = int(len(standard_df))
    avg_order = round(total_sales / total_orders, 2) if total_orders > 0 else 0.0
    min_date = str(standard_df["Order_Date"].min())
    max_date = str(standard_df["Order_Date"].max())

    metadata = {
        "filename": original_filename,
        "is_uploaded": True,
        "rows": total_orders,
        "columns": int(standard_df.shape[1]),
        "column_names": standard_df.columns.tolist(),
        "date_range": [min_date, max_date],
        "total_sales": round(total_sales, 2),
        "total_profit": round(total_profit, 2),
        "total_quantity": int(standard_df["Quantity"].sum()),
        "average_order": avg_order,
        "detected_columns": {k: v for k, v in detected.items() if v is not None},
        "duplicates_removed": duplicates_removed,
        "updated_at": datetime.now().isoformat()
    }

    return standard_df, metadata

