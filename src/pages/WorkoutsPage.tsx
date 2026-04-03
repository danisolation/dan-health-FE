import { getWorkouts } from "@/services/api";
import { useDateRange } from "@/hooks/useDateRange";
import { useApiData } from "@/hooks/useApiData";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

export function WorkoutsPage() {
  const { start, end, days, setDays } = useDateRange(90);

  const { data, loading, error, retry } = useApiData(
    () => getWorkouts(start, end),
    [start, end],
    { pageTitle: "Workouts" },
  );

  const workouts = data ?? [];
  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration_seconds, 0);
  const totalDistance = workouts.reduce((sum, w) => sum + w.distance_meters, 0);

  return (
    <div>
      <PageHeader title="🏃 Workouts" days={days} onDaysChange={setDays} />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : workouts.length === 0 ? (
        <EmptyState message="Không có workout trong khoảng thời gian này." icon="🏃" />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="Tổng workouts" value={`${workouts.length}`} />
            <StatCard label="Tổng thời gian" value={formatDuration(totalDuration)} />
            <StatCard label="Tổng calories" value={`${totalCalories.toLocaleString()}`} sub="kcal" />
            <StatCard label="Tổng quãng đường" value={`${(totalDistance / 1000).toFixed(1)}`} unit="km" />
          </div>

          {/* Workouts table */}
          <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase border-b border-dark-border bg-dark-hover">
                  <tr>
                    <th scope="col" className="px-4 py-3">Bài tập</th>
                    <th scope="col" className="px-4 py-3">Ngày</th>
                    <th scope="col" className="px-4 py-3 text-right">Thời gian</th>
                    <th scope="col" className="px-4 py-3 text-right">Khoảng cách</th>
                    <th scope="col" className="px-4 py-3 text-right">Calories</th>
                    <th scope="col" className="px-4 py-3 text-right">HR avg/max</th>
                    <th scope="col" className="px-4 py-3 text-right hidden md:table-cell">Pace</th>
                    <th scope="col" className="px-4 py-3 text-right hidden md:table-cell">Steps</th>
                    <th scope="col" className="px-4 py-3 text-right hidden lg:table-cell">TE</th>
                    <th scope="col" className="px-4 py-3 text-right hidden lg:table-cell">Anaerobic</th>
                    <th scope="col" className="px-4 py-3 text-right hidden lg:table-cell">Load</th>
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
                      <td className="px-4 py-3 text-right text-gray-300 hidden md:table-cell">
                        {w.avg_pace ? formatPace(w.avg_pace) : "--"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300 hidden md:table-cell">
                        {w.total_steps?.toLocaleString() ?? "--"}
                      </td>
                      <td className="px-4 py-3 text-right text-accent-green hidden lg:table-cell">
                        {w.training_effect?.toFixed(1) ?? "--"}
                      </td>
                      <td className="px-4 py-3 text-right text-purple-400 hidden lg:table-cell">
                        {w.anaerobic_te?.toFixed(1) ?? "--"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300 hidden lg:table-cell">
                        {w.exercise_load ?? "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
