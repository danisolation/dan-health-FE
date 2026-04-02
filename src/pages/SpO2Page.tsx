import { useEffect, useState } from "react";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { getOverview, getSpO2Readings } from "@/services/api";
import { useDateRange } from "@/hooks/useDateRange";
import type { DailySummary, SpO2Reading } from "@/types/health";

const RANGE_OPTIONS = [7, 14, 30, 90];

export function SpO2Page() {
  const { start, end, days, setDays } = useDateRange(30);
  const [dailyData, setDailyData] = useState<DailySummary[]>([]);
  const [readings, setReadings] = useState<SpO2Reading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getOverview(start, end).then((r) => setDailyData(r.data)),
      getSpO2Readings(start, end).then(setReadings),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [start, end]);

  const latest = dailyData[dailyData.length - 1];

  // Daily avg SpO2
  const dailyChart = dailyData
    .filter((d) => d.avg_spo2 != null)
    .map((d) => ({
      label: d.date.slice(5),
      avg_spo2: d.avg_spo2,
    }));

  // Detail readings grouped by date
  const detailChart = groupReadingsByDate(readings);

  // Stats
  const spo2Values = dailyData.filter((d) => d.avg_spo2 != null).map((d) => d.avg_spo2!);
  const avgSpo2 = spo2Values.length ? Math.round(spo2Values.reduce((a, b) => a + b, 0) / spo2Values.length) : null;
  const maxSpo2 = spo2Values.length ? Math.max(...spo2Values) : null;
  const minSpo2 = spo2Values.length ? Math.min(...spo2Values) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-100">🫁 SpO2</h1>
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            <StatCard label="Hôm nay" value={latest?.avg_spo2 != null ? `${latest.avg_spo2}%` : "--"} color="text-accent-teal" />
            <StatCard label="TB giai đoạn" value={avgSpo2 != null ? `${avgSpo2}%` : "--"} color="text-accent-blue" />
            <StatCard label="Cao nhất" value={maxSpo2 != null ? `${maxSpo2}%` : "--"} color="text-accent-green" />
            <StatCard label="Thấp nhất" value={minSpo2 != null ? `${minSpo2}%` : "--"} color="text-accent-red" />
            <StatCard label="ODI" value={latest?.spo2_odi != null ? `${latest.spo2_odi.toFixed(1)}` : "--"} color="text-accent-orange" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Daily avg SpO2 */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-4">📊 SpO2 trung bình hàng ngày</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis domain={[85, 100]} tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="avg_spo2" stroke="#26c6da" fill="#26c6da" fillOpacity={0.2} name="SpO2 %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Detail readings */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-4">📈 Chi tiết SpO2 readings ({readings.length} readings)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={detailChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis domain={[85, 100]} tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="spo2_value" stroke="#00bcd4" dot={false} name="SpO2 %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SpO2 level guide */}
          <div className="mt-4 bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-sm text-gray-400 mb-3">Mức SpO2</h3>
            <div className="flex gap-4 text-xs">
              <span className="text-green-400">● 95-100%: Bình thường</span>
              <span className="text-accent-orange">● 90-94%: Thấp</span>
              <span className="text-accent-red">● &lt;90%: Nguy hiểm</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function groupReadingsByDate(readings: SpO2Reading[]) {
  const byDate: Record<string, number[]> = {};
  for (const r of readings) {
    const d = r.reading_date;
    if (!byDate[d]) byDate[d] = [];
    byDate[d]!.push(r.spo2_value);
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([d, vals]) => ({
      label: d.slice(5),
      spo2_value: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
    }));
}

interface StatCardProps {
  label: string;
  value: string;
  color: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center hover:border-accent-blue transition-colors">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
