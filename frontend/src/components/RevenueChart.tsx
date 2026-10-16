import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data?: {
    month: string;
    revenue: number;
  }[];
}

const defaultData = [
  { month: "Jan", revenue: 82000 },
  { month: "Feb", revenue: 91000 },
  { month: "Mar", revenue: 87000 },
  { month: "Apr", revenue: 103000 },
  { month: "May", revenue: 112000 },
  { month: "Jun", revenue: 119000 },
];

function RevenueChart({ data = defaultData }: RevenueChartProps) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3>Revenue Trend</h3>
          <p>Monthly sales performance</p>
        </div>

        <select className="chart-select">
          <option>Last 6 months</option>
          <option>Last 12 months</option>
        </select>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
              tickFormatter={(value) =>
                `₹${Number(value) / 1000}K`
              }
            />

            <Tooltip
              formatter={(value) => [
                `₹${Number(value).toLocaleString("en-IN")}`,
                "Revenue",
              ]}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="currentColor"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueChart;