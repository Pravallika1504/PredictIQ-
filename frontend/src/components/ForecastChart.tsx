import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface ForecastDataPoint {
  month: string;
  actual: number | null;
  forecast: number | null;
}

interface ForecastChartProps {
  data?: ForecastDataPoint[];
}

const defaultForecastData: ForecastDataPoint[] = [
  { month: "Jul", actual: 119000, forecast: null },
  { month: "Aug", actual: 124000, forecast: null },
  { month: "Sep", actual: 131000, forecast: null },
  { month: "Oct", actual: null, forecast: 137000 },
  { month: "Nov", actual: null, forecast: 144000 },
  { month: "Dec", actual: null, forecast: 152000 },
];

function ForecastChart({ data }: ForecastChartProps) {
  const chartData = data && data.length > 0 ? data : defaultForecastData;

  const formatYAxis = (value: any) => {
    const num = Number(value);
    if (isNaN(num)) return `₹0`;
    if (Math.abs(num) >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L`;
    }
    if (Math.abs(num) >= 1000) {
      return `₹${(num / 1000).toFixed(0)}K`;
    }
    return `₹${num}`;
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3>Sales Forecast</h3>
          <p>Historical sales and predicted values</p>
        </div>
      </div>

      <div className="chart-container forecast-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
            />

            <Tooltip
              formatter={(value: any, name: any) => [
                value != null ? `₹${Number(value).toLocaleString("en-IN")}` : "N/A",
                name,
              ]}
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4 }}
              connectNulls
            />

            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast"
              stroke="#10b981"
              strokeWidth={3}
              strokeDasharray="6 6"
              dot={{ r: 4 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ForecastChart;