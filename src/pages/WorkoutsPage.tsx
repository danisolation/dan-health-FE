import { useEffect, useState } from "react";
import { getWorkouts } from "@/services/api";
import { useDateRange } from "@/hooks/useDateRange";
import type { WorkoutRecord } from "@/types/health";

const RANGE_OPTIONS = [7, 14, 30, 90];

export function WorkoutsPage() {
  const { start, end, days, setDays } = useDateRange(90);
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getWorkouts(start, end)
      .then(setWorkouts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [start, end]);

  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration_seconds, 0);
  const totalDistance = workouts.reduce((sum, w) => sum + w.distance_meters, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-100">🏃 Workouts</h1>
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
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="Tổng workouts" value={`${workouts.length}`} />
            <StatCard label="Tổng thời gian" value={formatDuration(totalDuration)} />
            <StatCard label="Tổng calories" value={`${totalCalories.toLocaleString()} kcal`} />
            <StatCard label="Tổng quãng đường" value={`${(totalDistance / 1000).toFixed(1)} km`} />
          </div>

          {/* Workouts table */}
          <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            {workouts.length === 0 ? (
              <div className="text-gray-500 text-center py-10">Không có workout trong khoảng thời gian này.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase border-b border-dark-border bg-dark-hover">
                    <tr>
                      <th className="px-4 py-3">Bài tập</th>
                      <th className="px-4 py-3">Ngày</th>
                      <th className="px-4 py-3 text-right">Thời gian</th>
                      <th className="px-4 py-3 text-right">Khoảng cách</th>
                      <th className="px-4 py-3 text-right">Calories</th>
                      <th className="px-4 py-3 text-right">HR avg/max</th>
                      <th className="px-4 py-3 text-right">Pace</th>
                      <th className="px-4 py-3 text-right">Steps</th>
                      <th className="px-4 py-3 text-right">TE</th>
                      <th className="px-4 py-3 text-right">Anaerobic</th>
                      <th className="px-4 py-3 text-right">Load</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {workouts.map((w) => (
                      <tr key={w.track_id} className="hover:bg-dark-hover transition-colors">
                        <td className="px-4 py-3 font-medium text-white">
                          {w.workout_name || `Type ${w.workout_type}`}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(w.start_time).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">
                          {formatDuration(w.duration_seconds)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">
                          {w.distance_meters > 0 ? `${(w.distance_meters / 1000).toFixed(2)} km` : "--"}
                        </td>
                        <td className="px-4 py-3 text-right text-accent-orange">
                          {w.calories}
                        </td>
                        <td className="px-4 py-3 text-right text-accent-red">
                          {w.avg_heart_rate ?? "--"}/{w.max_heart_rate ?? "--"}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">
                          {w.avg_pace ? formatPace(w.avg_pace) : "--"}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">
                          {w.total_steps?.toLocaleString() ?? "--"}
                        </td>
                        <td className="px-4 py-3 text-right text-accent-green">
                          {w.training_effect?.toFixed(1) ?? "--"}
                        </td>
                        <td className="px-4 py-3 text-right text-purple-400">
                          {w.anaerobic_te?.toFixed(1) ?? "--"}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">
                          {w.exercise_load ?? "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function formatPace(pace: number): string {
  const mins = Math.floor(pace);
  const secs = Math.round((pace - mins) * 60);
  return `${mins}'${secs.toString().padStart(2, "0")}"`;
}

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center hover:border-accent-blue transition-colors">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}
