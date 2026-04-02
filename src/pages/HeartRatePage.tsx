import { useEffect, useState } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { getOverview } from "@/services/api";
import { useDateRange } from "@/hooks/useDateRange";
import type { DailySummary } from "@/types/health";

export function HeartRatePage() {
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

  const latest = data[data.length - 1];

  // Filter days with any HR data
  const hrData = data.filter((d) => d.resting_heart_rate != null || d.workout_avg_hr != null);

  const chartData = hrData.map((d) => ({
    label: d.date.slice(5),
    resting: d.resting_heart_rate,
    max: d.max_heart_rate,
    sleep_rhr: d.sleep_rhr,
    rhr_baseline: d.rhr_baseline,
    workout_avg: d.workout_avg_hr,
    workout_max: d.workout_max_hr,
    workout_min: d.workout_min_hr,
    workout_count: d.workout_count,
  }));

  // Stats
  const restingVals = hrData.filter((d) => d.resting_heart_rate != null).map((d) => d.resting_heart_rate!);
  const avgResting = restingVals.length
    ? Math.round(restingVals.reduce((a, b) => a + b, 0) / restingVals.length)
    : null;
  const minResting = restingVals.length ? Math.min(...restingVals) : null;
  const maxResting = restingVals.length ? Math.max(...restingVals) : null;

  const workoutHrVals = hrData.filter((d) => d.workout_avg_hr != null).map((d) => d.workout_avg_hr!);
  const avgWorkoutHr = workoutHrVals.length
    ? Math.round(workoutHrVals.reduce((a, b) => a + b, 0) / workoutHrVals.length)
    : null;
  const maxWorkoutHr = hrData.reduce((mx, d) => Math.max(mx, d.workout_max_hr ?? 0), 0) || null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-100">❤️ Nhịp tim</h1>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((n) => (
            <button
              key={n}
              onClick={() => setDays(n)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                days === n ? "bg-accent-red text-white" : "bg-dark-card text-gray-400 hover:text-gray-200"
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
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatCard label="Resting hôm nay" value={latest?.resting_heart_rate ? `${latest.resting_heart_rate}` : "--"} unit="bpm" color="text-accent-red" />
            <StatCard label="Sleep RHR" value={latest?.sleep_rhr ? `${latest.sleep_rhr}` : "--"} unit="bpm" color="text-purple-400" />
            <StatCard label="RHR Baseline" value={latest?.rhr_baseline ? `${latest.rhr_baseline}` : "--"} unit="bpm" color="text-accent-blue" />
            <StatCard label="TB Resting" value={avgResting ? `${avgResting}` : "--"} unit="bpm" color="text-gray-300" />
            <StatCard label="TB Workout HR" value={avgWorkoutHr ? `${avgWorkoutHr}` : "--"} unit="bpm" color="text-accent-orange" />
            <StatCard label="Max Workout HR" value={maxWorkoutHr ? `${maxWorkoutHr}` : "--"} unit="bpm" color="text-red-300" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Resting HR trend */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-4">❤️ Resting Heart Rate Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis domain={[40, "auto"]} tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Legend />
                  <Area type="monotone" dataKey="resting" stroke="#ef5350" fill="#ef5350" fillOpacity={0.15} name="Resting HR" />
                  {avgResting && (
                    <Line type="monotone" dataKey={() => avgResting} stroke="#78909c" strokeDasharray="8 4" name={`TB: ${avgResting}`} dot={false} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Resting vs Workout avg HR */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-4">🏃 Resting HR vs Workout HR</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis domain={[40, "auto"]} tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="resting" stroke="#ef5350" name="Resting HR" strokeWidth={2} dot={{ r: 2 }} />
                  <Bar dataKey="workout_avg" fill="#ff9800" fillOpacity={0.7} radius={[4, 4, 0, 0]} name="Workout Avg HR" />
                  <Line type="monotone" dataKey="workout_max" stroke="#ff5252" strokeDasharray="4 2" name="Workout Max" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Resting vs Sleep RHR vs Baseline */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-4">💤 Resting HR vs Sleep RHR vs Baseline</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis domain={[40, "auto"]} tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="resting" stroke="#ef5350" name="Resting HR" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="sleep_rhr" stroke="#b388ff" name="Sleep RHR" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="rhr_baseline" stroke="#42a5f5" strokeDasharray="5 5" name="RHR Baseline" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Daily resting HR bar chart */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <h3 className="text-sm text-gray-400 mb-4">📊 Resting HR hàng ngày</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                  <YAxis domain={[40, "auto"]} tick={{ fill: "#78909c", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                  <Bar dataKey="resting" fill="#ef5350" radius={[4, 4, 0, 0]} name="Resting HR" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* HR zones guide */}
          <div className="mt-4 bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-sm text-gray-400 mb-3">Mức nhịp tim nghỉ</h3>
            <div className="flex gap-4 text-xs flex-wrap">
              <span className="text-green-400">● &lt;60: Xuất sắc (vận động viên)</span>
              <span className="text-accent-blue">● 60-70: Tốt</span>
              <span className="text-accent-orange">● 70-80: Bình thường</span>
              <span className="text-accent-red">● &gt;80: Cần chú ý</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              ⚠️ Zepp Cloud API chỉ cung cấp Resting HR (từ giấc ngủ) và Workout HR (khi tập). Nhịp tim trung bình cả ngày (continuous monitoring) chỉ lưu trên điện thoại, không có qua cloud API.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, unit, color }: { label: string; value: string; unit?: string; color: string }) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
      <div className={`text-xl font-bold ${color}`}>
        {value} {value !== "--" && unit && <span className="text-sm font-normal text-gray-500">{unit}</span>}
      </div>
      <div className="text-xs text-gray-500 uppercase mt-1">{label}</div>
    </div>
  );
}
