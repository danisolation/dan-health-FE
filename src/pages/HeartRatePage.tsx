import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { getOverview } from "@/services/api";
import { useDateRange } from "@/hooks/useDateRange";
import { useApiData } from "@/hooks/useApiData";
import { CHART_TOOLTIP_STYLE, CHART_GRID_STROKE, CHART_AXIS_TICK, BAR_RADIUS_TOP } from "@/utils/chart";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

export function HeartRatePage() {
  const { start, end } = useDateRange();

  const { data, loading, error, retry } = useApiData(
    () => getOverview(start, end).then((res) => res.data),
    [start, end],
    { pageTitle: "Nhịp tim" },
  );

  const allData = data ?? [];
  const latest = allData[allData.length - 1];

  const hrData = allData.filter((d) => d.resting_heart_rate != null || d.workout_avg_hr != null);

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

  const restingVals = hrData.filter((d) => d.resting_heart_rate != null).map((d) => d.resting_heart_rate!);
  const avgResting = restingVals.length
    ? Math.round(restingVals.reduce((a, b) => a + b, 0) / restingVals.length)
    : null;

  const workoutHrVals = hrData.filter((d) => d.workout_avg_hr != null).map((d) => d.workout_avg_hr!);
  const avgWorkoutHr = workoutHrVals.length
    ? Math.round(workoutHrVals.reduce((a, b) => a + b, 0) / workoutHrVals.length)
    : null;
  const maxWorkoutHr = hrData.reduce((mx, d) => Math.max(mx, d.workout_max_hr ?? 0), 0) || null;

  return (
    <div>
      <PageHeader title="❤️ Nhịp tim" />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : hrData.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatCard label="Resting hôm nay" value={latest?.resting_heart_rate ? `${latest.resting_heart_rate}` : "--"} unit="bpm" color="text-accent-red" />
            <StatCard label="Sleep RHR" value={latest?.sleep_rhr ? `${latest.sleep_rhr}` : "--"} unit="bpm" color="text-purple-400" />
            <StatCard label="RHR Baseline" value={latest?.rhr_baseline ? `${latest.rhr_baseline}` : "--"} unit="bpm" color="text-accent-blue" />
            <StatCard label="TB Resting" value={avgResting ? `${avgResting}` : "--"} unit="bpm" />
            <StatCard label="TB Workout HR" value={avgWorkoutHr ? `${avgWorkoutHr}` : "--"} unit="bpm" color="text-accent-orange" />
            <StatCard label="Max Workout HR" value={maxWorkoutHr ? `${maxWorkoutHr}` : "--"} unit="bpm" color="text-red-300" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="❤️ Resting Heart Rate Trend">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis domain={[40, "auto"]} tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend />
                  <Area type="monotone" dataKey="resting" stroke="#ef5350" fill="#ef5350" fillOpacity={0.15} name="Resting HR" />
                  {avgResting && (
                    <Line type="monotone" dataKey={() => avgResting} stroke="#78909c" strokeDasharray="8 4" name={`TB: ${avgResting}`} dot={false} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="🏃 Resting HR vs Workout HR">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis domain={[40, "auto"]} tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend />
                  <Line type="monotone" dataKey="resting" stroke="#ef5350" name="Resting HR" strokeWidth={2} dot={{ r: 2 }} />
                  <Bar dataKey="workout_avg" fill="#ff9800" fillOpacity={0.7} radius={BAR_RADIUS_TOP} name="Workout Avg HR" />
                  <Line type="monotone" dataKey="workout_max" stroke="#ff5252" strokeDasharray="4 2" name="Workout Max" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="💤 Resting HR vs Sleep RHR vs Baseline">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis domain={[40, "auto"]} tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend />
                  <Line type="monotone" dataKey="resting" stroke="#ef5350" name="Resting HR" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="sleep_rhr" stroke="#b388ff" name="Sleep RHR" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="rhr_baseline" stroke="#42a5f5" strokeDasharray="5 5" name="RHR Baseline" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="📊 Resting HR hàng ngày">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis domain={[40, "auto"]} tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="resting" fill="#ef5350" radius={BAR_RADIUS_TOP} name="Resting HR" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* HR zones guide */}
          <div className="mt-4 bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-sm text-gray-300 mb-3">Mức nhịp tim nghỉ</h3>
            <div className="flex gap-4 text-xs flex-wrap">
              <span className="text-green-400">● &lt;60: Xuất sắc (vận động viên)</span>
              <span className="text-accent-blue">● 60-70: Tốt</span>
              <span className="text-accent-orange">● 70-80: Bình thường</span>
              <span className="text-accent-red">● &gt;80: Cần chú ý</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ⚠️ Zepp Cloud API chỉ cung cấp Resting HR (từ giấc ngủ) và Workout HR (khi tập). Nhịp tim trung bình cả ngày (continuous monitoring) chỉ lưu trên điện thoại, không có qua cloud API.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
