import {
  BrainCircuit,
  Calculator,
  Target,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { useEffect, useState } from "react";
import ForecastChart from "../components/ForecastChart";
import type { ForecastDataPoint } from "../components/ForecastChart";
import { getForecast, runForecast } from "../api";
import type { ForecastMetrics } from "../api";

function Forecast() {
  const [metrics, setMetrics] = useState<ForecastMetrics>({
    next_month_forecast: 152000,
    mae: 8420,
    r2_score: 0.87,
    model_name: "Random Forest Regression",
    status: "Model Ready",
  });

  const [chartData, setChartData] = useState<ForecastDataPoint[]>([]);
  const [datasetName, setDatasetName] = useState<string>("sales.csv");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const loadForecastData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getForecast();
      if (res && res.metrics) {
        setMetrics(res.metrics);
        setChartData(res.chart_data || []);
        if (res.dataset_name) {
          setDatasetName(res.dataset_name);
        }
      }
    } catch (err: any) {
      console.error("Forecast loading error:", err);
      setError(
        err?.message || "Forecasting cannot be generated. Please check the backend connection and dataset."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecastData();
  }, []);

  const handleRunForecast = async () => {
    try {
      setRunning(true);
      setError("");
      const res = await runForecast();
      if (res && res.metrics) {
        setMetrics(res.metrics);
        setChartData(res.chart_data || []);
        if (res.dataset_name) {
          setDatasetName(res.dataset_name);
        }
      }
    } catch (err: any) {
      console.error("Run forecast error:", err);
      setError(
        err?.message || "Forecasting cannot be generated. Please make sure the backend is running."
      );
    } finally {
      setRunning(false);
    }
  };

  const formatCurrency = (val: number) => {
    return `₹${(val ?? 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            MACHINE LEARNING
          </span>

          <h2>Sales Forecast</h2>

          <p>
            Predict future sales using machine learning.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={handleRunForecast}
          disabled={running || loading}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          {running ? (
            <>
              <RefreshCw size={16} className="spin" />
              Running...
            </>
          ) : (
            "Run Forecast"
          )}
        </button>
      </div>

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 18px",
            marginBottom: "20px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            color: "#b91c1c",
            fontSize: "13px",
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <div className="model-banner">
        <div className="model-banner-icon">
          <BrainCircuit size={24} />
        </div>

        <div>
          <strong>{metrics.model_name || "Random Forest Regression"}</strong>

          <span>
            Model trained on historical features from <strong>{datasetName}</strong>
          </span>
        </div>

        <span className="model-status">
          {running ? "Training..." : (metrics.status || "Model Ready")}
        </span>
      </div>

      <div className="forecast-metrics">
        <div className="forecast-stat">
          <div className="stat-icon">
            <TrendingUp size={20} />
          </div>

          <span>Next Month Forecast</span>

          <strong>{formatCurrency(metrics.next_month_forecast)}</strong>
        </div>

        <div className="forecast-stat">
          <div className="stat-icon">
            <Calculator size={20} />
          </div>

          <span>MAE</span>

          <strong>{formatCurrency(metrics.mae)}</strong>
        </div>

        <div className="forecast-stat">
          <div className="stat-icon">
            <Target size={20} />
          </div>

          <span>R² Score</span>

          <strong>{metrics.r2_score ?? 0.85}</strong>
        </div>
      </div>

      <ForecastChart data={chartData} />

      <div className="forecast-note">
        <strong>How to interpret this forecast</strong>

        <p>
          The forecast represents model-generated
          estimates based on historical sales patterns from{" "}
          <strong>{datasetName}</strong>. Actual future sales may
          differ because of changing market conditions, seasonality and
          other external factors.
        </p>
      </div>
    </div>
  );
}

export default Forecast;