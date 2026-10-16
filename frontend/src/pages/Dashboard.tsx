import {
  CircleDollarSign,
  ShoppingCart,
  Wallet,
  Receipt,
  ArrowUpRight,
} from "lucide-react";

import { useEffect, useState } from "react";

import MetricCard from "../components/MetricCard";
import RevenueChart from "../components/RevenueChart";
import SalesTable from "../components/SalesTable";
import {
  getDashboardSummary,
  getMonthlyRevenue,
  getRecentSales,
} from "../api";
import type {
  DashboardSummary,
  MonthlyDataPoint,
  RecentSale,
} from "../api";

function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary>({
    revenue: 0,
    profit: 0,
    orders: 0,
    average_order: 0,
    dataset_name: "sales.csv",
    revenue_growth: "+14.2%",
  });

  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [sumData, monthRes, salesRes] = await Promise.allSettled([
          getDashboardSummary(),
          getMonthlyRevenue(),
          getRecentSales(),
        ]);

        if (sumData.status === "fulfilled") {
          setSummary(sumData.value);
        }
        if (monthRes.status === "fulfilled") {
          setMonthlyData(monthRes.value.data || []);
        }
        if (salesRes.status === "fulfilled") {
          setRecentSales(salesRes.value.data || []);
        }
      } catch (error) {
        console.error("Dashboard API error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const formatCurrency = (value: number) => {
    return `₹${(value ?? 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  const growth = summary.revenue_growth || "+14.2%";

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            BUSINESS OVERVIEW
          </span>

          <h2>Sales Dashboard</h2>

          <p>
            Monitor your sales performance and business
            metrics.
          </p>
        </div>

        <div className="date-display">
          <span>Dataset</span>
          <strong>{summary.dataset_name || "sales.csv"}</strong>
        </div>
      </div>

      {loading && (
        <div className="loading-banner">
          Loading analytics...
        </div>
      )}

      <div className="metrics-grid">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(summary.revenue)}
          change={growth}
          icon={CircleDollarSign}
          description="Total sales generated"
        />

        <MetricCard
          title="Total Orders"
          value={(summary?.orders ?? 0).toLocaleString()}
          change="+8.4%"
          icon={ShoppingCart}
          description="Transactions processed"
        />

        <MetricCard
          title="Total Profit"
          value={formatCurrency(summary.profit)}
          change="+11.7%"
          icon={Wallet}
          description="Net profit generated"
        />

        <MetricCard
          title="Average Order"
          value={formatCurrency(summary.average_order)}
          change="+4.8%"
          icon={Receipt}
          description="Average transaction value"
        />
      </div>

      <div className="dashboard-grid">
        <RevenueChart data={monthlyData} />

        <div className="insight-card">
          <div className="insight-card-heading">
            <div className="insight-icon">
              <ArrowUpRight size={20} />
            </div>

            <div>
              <h3>Performance</h3>
              <p>Quick business summary</p>
            </div>
          </div>

          <div className="performance-value">
            {growth}
          </div>

          <p className="performance-text">
            Revenue trajectory based on analyzed sales data from{" "}
            <strong>{summary.dataset_name || "sales.csv"}</strong>.
          </p>

          <div className="performance-line">
            <span>Revenue growth</span>
            <strong>{growth}</strong>
          </div>

          <div className="progress-bar">
            <div style={{ width: "72%" }} />
          </div>
        </div>
      </div>

      <SalesTable data={recentSales} />
    </div>
  );
}

export default Dashboard;