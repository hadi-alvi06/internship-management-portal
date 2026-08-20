import { LineChart, Line, ResponsiveContainer } from "recharts";

export default function Sparkline({ data, color }) {
  const chartData = (data || []).map((value, index) => ({ index, value }));

  return (
    <div className="sparkline-wrap">
      <ResponsiveContainer width="100%" height={36}>
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}