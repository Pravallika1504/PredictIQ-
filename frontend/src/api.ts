export const API_BASE_URL = "http://127.0.0.1:8000";

// ============================================================
// DATA MODELS
// ============================================================

export interface DashboardSummary {
  revenue: number;
  profit: number;
  orders: number;
  average_order: number;
  dataset_name?: string;
  total_quantity?: number;
  revenue_growth?: string;
}

export interface MonthlyDataPoint {
  month: string;
  revenue: number;
}

export interface RecentSale {
  product: string;
  category: string;
  region: string;
  quantity: number;
  sales: number;
  profit: number;
  date?: string;
}

export interface ForecastMetrics {
  next_month_forecast: number;
  mae: number;
  r2_score: number;
  model_name: string;
  status: string;
  currency_symbol?: string;
}

export interface ForecastDataPoint {
  month: string;
  actual: number | null;
  forecast: number | null;
}

export interface ForecastResponse {
  status: string;
  metrics: ForecastMetrics;
  chart_data: ForecastDataPoint[];
  dataset_name?: string;
  forecast_summary?: {
    total_forecast: number;
    average_monthly_forecast: number;
    forecast_periods: number;
  };
}

export interface InsightItem {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  trend: "up" | "down";
}

// ============================================================
// API CLIENT WRAPPER WITH COMPREHENSIVE ERROR EXTRACTION
// ============================================================

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (error: any) {
    // Network errors (e.g. backend server is not running or CORS blocked)
    console.error("Network error connecting to API:", error);
    throw new Error(
      "Backend is unavailable. Please make sure the FastAPI backend is running on http://127.0.0.1:8000."
    );
  }

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson?.detail) {
        if (typeof errJson.detail === "string") {
          errorDetail = errJson.detail;
        } else if (Array.isArray(errJson.detail)) {
          errorDetail = errJson.detail.map((d: any) => d.msg || JSON.stringify(d)).join("; ");
        }
      } else if (errJson?.message) {
        errorDetail = errJson.message;
      }
    } catch {
      const text = await response.text();
      if (text) errorDetail = text;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// ============================================================
// API ENDPOINTS
// ============================================================

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>("/analytics/summary");
}

export async function getMonthlyRevenue(): Promise<{ data: MonthlyDataPoint[] }> {
  return apiFetch<{ data: MonthlyDataPoint[] }>("/analytics/monthly");
}

export async function getRecentSales(): Promise<{ data: RecentSale[] }> {
  return apiFetch<{ data: RecentSale[] }>("/analytics/recent-sales");
}

export async function getForecast(): Promise<ForecastResponse> {
  return apiFetch<ForecastResponse>("/forecast");
}

export async function runForecast(): Promise<ForecastResponse> {
  return apiFetch<ForecastResponse>("/forecast/run", {
    method: "POST"
  });
}

export async function getInsights(): Promise<{ dataset_name: string; insights: InsightItem[] }> {
  return apiFetch<{ dataset_name: string; insights: InsightItem[] }>("/analytics/insights");
}

export async function uploadSalesFile(file: File): Promise<{
  status: string;
  message: string;
  dataset: any;
}> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });
  } catch (error: any) {
    console.error("Upload network error:", error);
    throw new Error(
      "Backend is unavailable. Please make sure the FastAPI backend is running on http://127.0.0.1:8000."
    );
  }

  if (!response.ok) {
    let errorDetail = `Upload failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson?.detail) {
        if (typeof errJson.detail === "string") {
          errorDetail = errJson.detail;
        } else if (Array.isArray(errJson.detail)) {
          errorDetail = errJson.detail.map((d: any) => d.msg || JSON.stringify(d)).join("; ");
        }
      } else if (errJson?.message) {
        errorDetail = errJson.message;
      }
    } catch {
      const text = await response.text();
      if (text) errorDetail = text;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export async function resetDataset(): Promise<{ status: string; message: string }> {
  return apiFetch<{ status: string; message: string }>("/upload/reset", {
    method: "POST"
  });
}