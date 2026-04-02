import { useEffect, useState } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getOverview, getStressReadings } from "@/services/api";
import { useDateRange } from "@/hooks/useDateRange";
import type { DailySummary, StressReading } from "@/types/health";

const RANGE_OPTIONS = [7, 14, 30, 90];

export function StressPage() {
  const { start, end, days, setDays } = useDateRange(30);
  const [dailyData, setDailyData] = useState<DailySummary[]>([]);
  const [readings, setReadings] = useState<StressReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getOverview(start, end).then((r) => setDailyData(r.data)),
      getStressReadings(start, end).then(setReadings),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [start, end]);

  const latest = dailyData[dailyData.length - 1];

  // Daily avg stress chart data
  const dailyChart = dailyData
    .filter((d) => d.avg_stress != null)
    .map((d) => ({
      label: d.date.slice(5),
      avg_stress: d.avg_stress,
    }));

  // Detail readings grouped by date → average per hour
  const detailChart = groupReadingsByDate(readings);

  // Stats
  const stressValues = dailyData.filter((d) => d.avg_stress != null).map((d) => d.avg_stress!);
  const avgStress = stressValues.length ? Math.round(stressValues.reduce((a, b) => a + b, 0) / stressValues.length) : null;
  const maxStress = stressValues.length ? Math.max(...stressValues) : null;
  const minStress = stressValues.length ? Math.min(...stressValues) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-100">😰 Stress</h1>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setDays(n)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                days === n
                  ? "bg-accent-blue text-dark-bg"
                  : "bg-dark-card text-gray-400 hover:text-gray-200"
              }`}
            >
              {n}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-20">Đang tải dữ liệu...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard label="Hôm nay" value={latest?.avg_stress != null ? `${latest.avg_stress}` : "--"} sub="avg" color="text-accent-orange" />
            <StatCard label="TB giai đoạn" value={avgStress != null ? `${avgStress}` : "--"} sub="average" color="text-accent-blue" />
            <StatCard label="Cao nhất" value={maxStress != null ? `${maxStress}` : "--"} sub="max" color="text-accent-red" />
            <StatCard label="Thấp nhất" value={minStress != null ? `${minStress}` : "--"} sub="min" color="text-accent-green" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Daily avg stress */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-4">📊 Stress trung bình hàng ngày</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="avg_stress" stroke="#ffa726" fill="#ffa726" fillOpacity={0.2} name="Avg Stress" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Detail readings timeline */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-4">📈 Chi tiết stress readings ({readings.length} readings)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={detailChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="stress_value" stroke="#ff7043" dot={false} name="Stress" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stress zone distribution */}
          <div className="mt-4 bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-sm text-gray-400 mb-4">📊 Phân bổ stress zones</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData.filter(d => d.stress_relax_pct != null).map(d => ({
                label: d.date.slice(5),
                relax: d.stress_relax_pct,
                normal: d.stress_normal_pct,
                medium: d.stress_medium_pct,
                high: d.stress_high_pct,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#78909c", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="relax" stackId="zone" fill="#66bb6a" name="Thư giãn" />
                <Bar dataKey="normal" stackId="zone" fill="#42a5f5" name="Bình thường" />
                <Bar dataKey="medium" stackId="zone" fill="#ffa726" name="Trung bình" />
                <Bar dataKey="high" stackId="zone" fill="#ef5350" name="Cao" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stress level guide */}
          <div className="mt-4 bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-sm text-gray-400 mb-3">Mức stress</h3>
            <div className="flex gap-4 text-xs">
              <span className="text-green-400">● 0-25: Thư giãn</span>
              <span className="text-accent-blue">● 26-50: Bình thường</span>
              <span className="text-accent-orange">● 51-75: Trung bình</span>
              <span className="text-accent-red">● 76-100: Cao</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function groupReadingsByDate(readings: StressReading[]) {
  // Group by date, take average per date for chart
  const byDate: Record<string, number[]> = {};
  for (const r of readings) {
    const d = r.reading_date;
    if (!byDate[d]) byDate[d] = [];
    byDate[d]!.push(r.stress_value);
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([d, vals]) => ({
      label: d.slice(5),
      stress_value: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
    }));
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  color: string;
}

function StatCard({ label, value, sub, color }: StatCardProps) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center hover:border-accent-blue transition-colors">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-600 mt-1">{sub}</div>
    </div>
  );
}
