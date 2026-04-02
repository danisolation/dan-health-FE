import { useEffect, useState } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getOverview } from "@/services/api";
import { useDateRange } from "@/hooks/useDateRange";
import type { DailySummary } from "@/types/health";

const RANGE_OPTIONS = [7, 14, 30, 90];

export function ReadinessPage() {
  const { start, end, days, setDays } = useDateRange(30);
  const [data, setData] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOverview(start, end)
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [start, end]);

  const latest = data[data.length - 1];

  const chartData = data
    .filter((d) => d.hrv != null || d.readiness_score != null || d.daily_pai != null)
    .map((d) => ({
      label: d.date.slice(5),
      hrv: d.hrv,
      sleep_hrv: d.sleep_hrv,
      readiness_score: d.readiness_score,
      daily_pai: d.daily_pai,
      mental_score: d.mental_score,
      physical_score: d.physical_score,
    }));

  // Stats
  const hrvValues = data.filter((d) => d.hrv != null).map((d) => d.hrv!);
  const avgHrv = hrvValues.length ? Math.round(hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length) : null;
  const readinessValues = data.filter((d) => d.readiness_score != null).map((d) => d.readiness_score!);
  const avgReadiness = readinessValues.length ? Math.round(readinessValues.reduce((a, b) => a + b, 0) / readinessValues.length) : null;
  const paiValues = data.filter((d) => d.daily_pai != null).map((d) => d.daily_pai!);
  const latestPai = paiValues.length ? paiValues[paiValues.length - 1] : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-100">💪 Readiness & HRV</h1>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <StatCard icon="💪" label="Readiness" value={latest?.readiness_score != null ? `${latest.readiness_score}` : "--"} />
            <StatCard icon="💓" label="HRV" value={latest?.hrv != null ? `${Math.round(latest.hrv)}ms` : "--"} />
            <StatCard icon="😴" label="Sleep HRV" value={latest?.sleep_hrv != null ? `${Math.round(latest.sleep_hrv)}ms` : "--"} />
            <StatCard icon="⚡" label="PAI" value={latestPai != null ? `${Math.round(latestPai)}` : "--"} />
            <StatCard icon="🧠" label="Mental" value={latest?.mental_score != null ? `${latest.mental_score}` : "--"} />
            <StatCard icon="🏋️" label="Physical" value={latest?.physical_score != null ? `${latest.physical_score}` : "--"} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* HRV trend */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-4">💓 HRV Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="hrv" stroke="#7c4dff" name="HRV Baseline" dot={false} />
                  <Line type="monotone" dataKey="sleep_hrv" stroke="#b388ff" strokeDasharray="5 5" name="Sleep HRV" dot={false} />
                </LineChart>
              </ResponsiveContainer>
              {avgHrv != null && (
                <div className="text-xs text-gray-500 mt-2 text-center">TB: {avgHrv}ms</div>
              )}
            </div>

            {/* Readiness score */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-4">💪 Readiness Score</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Bar dataKey="readiness_score" fill="#66bb6a" radius={[4, 4, 0, 0]} name="Readiness" />
                </BarChart>
              </ResponsiveContainer>
              {avgReadiness != null && (
                <div className="text-xs text-gray-500 mt-2 text-center">TB: {avgReadiness}/100</div>
              )}
            </div>

            {/* PAI */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-4">⚡ PAI (Personal Activity Intelligence)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="daily_pai" stroke="#ab47bc" fill="#ab47bc" fillOpacity={0.2} name="PAI" />
                </AreaChart>
              </ResponsiveContainer>
            </div>


            {/* Mental & Physical Scores */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-4">🧠 Mental & 🏋️ Physical Scores</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="mental_score" stroke="#29b6f6" name="Mental" dot={false} />
                  <Line type="monotone" dataKey="physical_score" stroke="#ffa726" name="Physical" dot={false} />
                  <Line type="monotone" dataKey="readiness_score" stroke="#66bb6a" strokeDasharray="5 5" name="Readiness" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center hover:border-accent-blue transition-colors">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}
