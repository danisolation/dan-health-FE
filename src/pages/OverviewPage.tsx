import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getOverview } from "@/services/api";
import { useDateRange } from "@/hooks/useDateRange";
import { formatMinutes } from "@/utils/format";
import type { DailySummary } from "@/types/health";

const RANGE_OPTIONS = [7, 14, 30, 90];

export function OverviewPage() {
  const { start, end, days, setDays } = useDateRange(30);
  const [data, setData] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOverview(start, end)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [start, end]);

  // Latest day for summary cards
  const latest = data[data.length - 1];

  // Chart data with short date labels
  const chartData = data.map((d) => ({
    ...d,
    label: d.date.slice(5), // MM-DD
  }));

  return (
    <div>
      {/* Header + date range */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-100">Tổng quan</h1>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
            <SummaryCard icon="🚶" label="Steps" value={latest?.steps?.toLocaleString() ?? "--"} />
            <SummaryCard icon="🔥" label="Calories" value={latest?.calories?.toLocaleString() ?? "--"} />
            <SummaryCard icon="📏" label="Distance" value={latest?.distance_meters ? `${(latest.distance_meters / 1000).toFixed(1)} km` : "--"} />
            <SummaryCard icon="😴" label="Giấc ngủ" value={formatMinutes(latest?.sleep_minutes)} />
            <SummaryCard icon="💤" label="Sleep Score" value={latest?.sleep_score != null ? `${latest.sleep_score}` : "--"} />
            <SummaryCard
              icon="❤️"
              label="Nhịp tim"
              value={latest?.resting_heart_rate ? `${latest.resting_heart_rate}/${latest.max_heart_rate ?? "--"}` : "--"}
            />
            <SummaryCard icon="😰" label="Stress" value={latest?.avg_stress != null ? `${latest.avg_stress}` : "--"} />
            <SummaryCard icon="🫁" label="SpO2" value={latest?.avg_spo2 != null ? `${latest.avg_spo2}%` : "--"} />
            <SummaryCard icon="💓" label="HRV" value={latest?.hrv != null ? `${Math.round(latest.hrv)}ms` : "--"} />
            <SummaryCard icon="⚡" label="PAI" value={latest?.daily_pai != null ? `${Math.round(latest.daily_pai)}` : "--"} />
            <SummaryCard icon="💪" label="Readiness" value={latest?.readiness_score != null ? `${latest.readiness_score}` : "--"} />
            <SummaryCard icon="🧠" label="Mental" value={latest?.mental_score != null ? `${latest.mental_score}` : "--"} />
            <SummaryCard icon="🏋️" label="Physical" value={latest?.physical_score != null ? `${latest.physical_score}` : "--"} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Steps */}
            <ChartCard title="🚶 Steps hàng ngày">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Bar dataKey="steps" fill="#4fc3f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Heart Rate */}
            <ChartCard title="❤️ Nhịp tim">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis domain={[40, 180]} tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="resting_heart_rate" stroke="#ef5350" name="Resting" dot={false} />
                  <Line type="monotone" dataKey="max_heart_rate" stroke="#ff8a80" strokeDasharray="5 5" name="Max" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Sleep */}
            <ChartCard title="😴 Giấc ngủ">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="deep_sleep_minutes" stackId="sleep" fill="#3949ab" name="Deep" />
                  <Bar dataKey="light_sleep_minutes" stackId="sleep" fill="#7986cb" name="Light" />
                  <Bar dataKey="rem_sleep_minutes" stackId="sleep" fill="#9fa8da" name="REM" />
                  <Bar dataKey="awake_minutes" stackId="sleep" fill="#546e7a" name="Awake" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Calories */}
            <ChartCard title="🔥 Calories">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Bar dataKey="calories" fill="#ffa726" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* SpO2 */}
            <ChartCard title="🫁 SpO2">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis domain={[85, 100]} tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="avg_spo2" stroke="#26c6da" name="SpO2 %" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Stress */}
            <ChartCard title="😰 Stress">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="avg_stress" stroke="#ffa726" name="Avg Stress" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* HRV & PAI */}
            <ChartCard title="💓 HRV & ⚡ PAI">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis yAxisId="hrv" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis yAxisId="pai" orientation="right" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Legend />
                  <Line yAxisId="hrv" type="monotone" dataKey="hrv" stroke="#7c4dff" name="HRV (ms)" dot={false} />
                  <Line yAxisId="pai" type="monotone" dataKey="total_pai" stroke="#ab47bc" name="PAI" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Readiness & Body Scores */}
            <ChartCard title="💪 Readiness & Body Scores">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="readiness_score" stroke="#66bb6a" name="Readiness" dot={false} />
                  <Line type="monotone" dataKey="mental_score" stroke="#29b6f6" name="Mental" dot={false} />
                  <Line type="monotone" dataKey="physical_score" stroke="#ffa726" name="Physical" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

// ── Sub-components ──

interface SummaryCardProps {
  icon: string;
  label: string;
  value: string;
}

function SummaryCard({ icon, label, value }: SummaryCardProps) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center hover:border-accent-blue transition-colors">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4">
      <h3 className="text-sm text-gray-400 mb-4">{title}</h3>
      {children}
    </div>
  );
}
