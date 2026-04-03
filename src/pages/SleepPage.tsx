import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getSleepRecords } from "@/services/api";
import { useDateRange } from "@/hooks/useDateRange";
import { useApiData } from "@/hooks/useApiData";
import { formatMinutes } from "@/utils/format";
import { CHART_TOOLTIP_STYLE, CHART_GRID_STROKE, CHART_AXIS_TICK, BAR_RADIUS_TOP } from "@/utils/chart";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

export function SleepPage() {
  const { start, end } = useDateRange();

  const { data, loading, error, retry } = useApiData(
    () => getSleepRecords(start, end),
    [start, end],
    { pageTitle: "Giấc ngủ" },
  );

  const records = data ?? [];
  const latest = records[records.length - 1];
  const avgTotal = records.length
    ? Math.round(records.reduce((s, d) => s + d.total_minutes, 0) / records.length)
    : 0;

  const chartData = records.map((d) => ({
    label: d.sleep_date.slice(5),
    deep: d.deep_sleep_minutes,
    light: d.light_sleep_minutes,
    rem: d.rem_sleep_minutes,
    awake: d.awake_minutes,
    total: d.total_minutes,
    sleep_score: d.sleep_score,
  }));

  return (
    <div>
      <PageHeader title="😴 Giấc ngủ" />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : records.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
            <StatCard label="Tổng ngủ" value={formatMinutes(latest?.total_minutes)} color="text-indigo-300" />
            <StatCard label="Sleep Score" value={latest?.sleep_score != null ? `${latest.sleep_score}` : "--"} color="text-indigo-300" />
            <StatCard label="Deep" value={formatMinutes(latest?.deep_sleep_minutes)} color="text-indigo-300" />
            <StatCard label="Light" value={formatMinutes(latest?.light_sleep_minutes)} color="text-indigo-300" />
            <StatCard label="REM" value={formatMinutes(latest?.rem_sleep_minutes)} color="text-indigo-300" />
            <StatCard label="Onset Latency" value={latest?.sleep_onset_latency != null ? `${latest.sleep_onset_latency}` : "--"} unit="m" color="text-indigo-300" />
            <StatCard label="Wake Count" value={latest?.wake_count != null ? `${latest.wake_count}` : "--"} color="text-indigo-300" />
            <StatCard label="Avg / đêm" value={formatMinutes(avgTotal)} color="text-indigo-300" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Sleep Stages">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis tick={CHART_AXIS_TICK} label={{ value: "phút", angle: -90, position: "insideLeft", fill: "#78909c" }} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value, name) => [`${value} phút`, name]}
                  />
                  <Legend />
                  <Bar dataKey="deep" stackId="sleep" fill="#3949ab" name="Deep" />
                  <Bar dataKey="light" stackId="sleep" fill="#7986cb" name="Light" />
                  <Bar dataKey="rem" stackId="sleep" fill="#9fa8da" name="REM" />
                  <Bar dataKey="awake" stackId="sleep" fill="#546e7a" name="Awake" radius={BAR_RADIUS_TOP} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="💤 Sleep Score Trend">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="sleep_score" stroke="#7c4dff" name="Sleep Score" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
