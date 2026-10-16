import io
import os
import shutil
import pandas as pd
from fastapi import APIRouter, File, UploadFile, HTTPException

from ml.preprocessing import (
    preprocess_sales_dataframe,
    save_dataset_metadata,
    UPLOADED_DATA_PATH,
    DEFAULT_DATA_PATH,
    get_dataset_metadata,
)
from ml.forecasting import generate_sales_forecast

router = APIRouter(tags=["Upload"])


@router.post("/upload")
@router.post("/api/upload")
async def upload_sales_csv(file: UploadFile = File(...)):
    """
    Upload and preprocess a sales CSV dataset.
    Validates CSV format, date columns, sales/revenue metrics, cleans data,
    and updates the active dataset for analytics and ML forecasting.
    """
    # 1. Validate file extension
    filename = file.filename or "uploaded_sales.csv"
    if not filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload a CSV file (.csv)."
        )

    # 2. Read file content
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to read uploaded file: {str(e)}"
        )

    if not content or len(content.strip()) == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded CSV file is empty. Please provide a file with sales records."
        )

    # 3. Parse CSV with Pandas (supporting multiple encodings)
    df = None
    parse_errors = []
    for encoding in ["utf-8", "utf-8-sig", "latin-1", "cp1252"]:
        try:
            df = pd.read_csv(io.BytesIO(content), encoding=encoding)
            break
        except Exception as err:
            parse_errors.append(str(err))

    if df is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to parse CSV. Delimiter or encoding error: {parse_errors[-1] if parse_errors else 'Unknown'}"
        )

    if df.empty or len(df) == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded CSV contains no data rows."
        )

    # 4. Preprocess and validate sales data structure
    try:
        clean_df, metadata = preprocess_sales_dataframe(df, original_filename=filename)
    except ValueError as ve:
        raise HTTPException(
            status_code=400,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error while preprocessing dataset: {str(e)}"
        )

    # 5. Verify forecasting pipeline compatibility
    try:
        generate_sales_forecast(clean_df, periods_ahead=6)
    except Exception as fe:
        # If forecasting fails, log but proceed or inform user
        metadata["forecast_warning"] = str(fe)

    # 6. Save preprocessed dataset as active dataset
    try:
        os.makedirs(os.path.dirname(UPLOADED_DATA_PATH), exist_ok=True)
        clean_df.to_csv(UPLOADED_DATA_PATH, index=False)
        save_dataset_metadata(metadata)
    except Exception as se:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save processed dataset: {str(se)}"
        )

    return {
        "status": "success",
        "message": f"Dataset '{filename}' uploaded and analyzed successfully ({metadata['rows']:,} rows).",
        "dataset": metadata
    }


@router.post("/upload/reset")
@router.post("/api/upload/reset")
def reset_to_default_dataset():
    """Reset active dataset back to default sales.csv."""
    if os.path.exists(UPLOADED_DATA_PATH):
        try:
            os.remove(UPLOADED_DATA_PATH)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to reset dataset: {str(e)}"
            )

    meta = get_dataset_metadata()
    meta["is_uploaded"] = False
    meta["filename"] = "sales.csv"
    save_dataset_metadata(meta)

    return {
        "status": "success",
        "message": "Reset to default sales dataset.",
        "dataset": meta
    }

