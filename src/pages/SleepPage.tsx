import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getSleepRecords } from "@/services/api";
import { useDateRange } from "@/hooks/useDateRange";
import { formatMinutes } from "@/utils/format";
import type { SleepRecord } from "@/types/health";

export function SleepPage() {
  const { start, end, days, setDays } = useDateRange(30);
  const [data, setData] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSleepRecords(start, end)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [start, end]);

  const latest = data[data.length - 1];
  const avgTotal = data.length
    ? Math.round(data.reduce((s, d) => s + d.total_minutes, 0) / data.length)
    : 0;

  const chartData = data.map((d) => ({
    label: d.sleep_date.slice(5),
    deep: d.deep_sleep_minutes,
    light: d.light_sleep_minutes,
    rem: d.rem_sleep_minutes,
    awake: d.awake_minutes,
    total: d.total_minutes,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-100">😴 Giấc ngủ</h1>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((n) => (
            <button
              key={n}
              onClick={() => setDays(n)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                days === n ? "bg-indigo-600 text-white" : "bg-dark-card text-gray-400 hover:text-gray-200"
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <StatCard label="Tổng ngủ" value={formatMinutes(latest?.total_minutes)} />
            <StatCard label="Deep" value={formatMinutes(latest?.deep_sleep_minutes)} />
            <StatCard label="Light" value={formatMinutes(latest?.light_sleep_minutes)} />
            <StatCard label="REM" value={formatMinutes(latest?.rem_sleep_minutes)} />
            <StatCard label="Avg / đêm" value={formatMinutes(avgTotal)} />
          </div>

          {/* Stacked bar chart */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                <YAxis tick={{ fill: "#78909c", fontSize: 11 }} label={{ value: "phút", angle: -90, position: "insideLeft", fill: "#78909c" }} />
                <Tooltip
                  contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }}
                  formatter={(value: number, name: string) => [`${value} phút`, name]}
                />
                <Legend />
                <Bar dataKey="deep" stackId="sleep" fill="#3949ab" name="Deep" />
                <Bar dataKey="light" stackId="sleep" fill="#7986cb" name="Light" />
                <Bar dataKey="rem" stackId="sleep" fill="#9fa8da" name="REM" />
                <Bar dataKey="awake" stackId="sleep" fill="#546e7a" name="Awake" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
      <div className="text-xl font-bold text-indigo-300">{value}</div>
      <div className="text-xs text-gray-500 uppercase mt-1">{label}</div>
    </div>
  );
}
