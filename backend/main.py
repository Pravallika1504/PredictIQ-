import sys
import os

# Ensure backend directory is in sys.path so imports work regardless of working directory
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models

from routes.analytics import router as analytics_router
from routes.upload import router as upload_router
from routes.forecast import router as forecast_router


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="PredictIQ API",
    description="Sales Forecasting and Business Intelligence API",
    version="1.0.0"
)


# ============================================================
# CORS CONFIGURATION
# Supports Vite default port 5173, fallback 5174, 5175, etc.
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTES
# ============================================================

app.include_router(analytics_router)
app.include_router(upload_router)
app.include_router(forecast_router)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "status": "success",
        "message": "PredictIQ API is running",
        "version": "1.0.0"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PredictIQ Backend"
    }


# ============================================================
# API INFORMATION
# ============================================================

@app.get("/api")
def api_information():
    return {
        "application": "PredictIQ",
        "description": "Sales Forecasting and Business Intelligence",
        "backend": "FastAPI",
        "endpoints": {
            "analytics_summary": "/analytics/summary",
            "monthly_revenue": "/analytics/monthly",
            "recent_sales": "/analytics/recent-sales",
            "insights": "/analytics/insights",
            "upload": "/upload",
            "forecast": "/forecast",
            "docs": "/docs"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)