import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getActivityRecords } from "@/services/api";
import { useDateRange } from "@/hooks/useDateRange";
import type { ActivityRecord } from "@/types/health";

export function ActivityPage() {
  const { start, end, days, setDays } = useDateRange(30);
  const [data, setData] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getActivityRecords(start, end)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [start, end]);

  const latest = data[data.length - 1];
  const avgSteps = data.length
    ? Math.round(data.reduce((s, d) => s + d.steps, 0) / data.length)
    : 0;
  const totalCal = data.reduce((s, d) => s + d.calories, 0);

  const chartData = data.map((d) => ({
    label: d.activity_date.slice(5),
    steps: d.steps,
    calories: d.calories,
    distance_km: +(d.distance_meters / 1000).toFixed(2),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-100">🚶 Vận động</h1>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((n) => (
            <button
              key={n}
              onClick={() => setDays(n)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                days === n ? "bg-accent-blue text-dark-bg" : "bg-dark-card text-gray-400 hover:text-gray-200"
              }`}
            >
              {n}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-20">Đang tải...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="Hôm nay" value={latest?.steps?.toLocaleString() ?? "--"} sub="steps" />
            <StatCard label="Avg / ngày" value={avgSteps.toLocaleString()} sub="steps" />
            <StatCard label="Tổng calories" value={totalCal.toLocaleString()} sub="kcal" />
            <StatCard
              label="Distance"
              value={latest?.distance_meters ? `${(latest.distance_meters / 1000).toFixed(1)}` : "--"}
              sub="km"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Steps bar */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-4">Steps hàng ngày</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Bar dataKey="steps" fill="#4fc3f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Calories line */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-4">Calories & Distance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis yAxisId="cal" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis yAxisId="dist" orientation="right" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Legend />
                  <Line yAxisId="cal" type="monotone" dataKey="calories" stroke="#ffa726" name="Calories" strokeWidth={2} dot={false} />
                  <Line yAxisId="dist" type="monotone" dataKey="distance_km" stroke="#26a69a" name="Distance (km)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
      <div className="text-xl font-bold text-accent-blue">{value}</div>
      <div className="text-xs text-gray-500 uppercase mt-1">{label}</div>
      <div className="text-[10px] text-gray-600">{sub}</div>
    </div>
  );
}
