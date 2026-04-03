import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getOverview, getTrends } from "@/services/api";
import { useDateRange } from "@/hooks/useDateRange";
import { useApiData } from "@/hooks/useApiData";
import { formatMinutes } from "@/utils/format";
import { CHART_TOOLTIP_STYLE, CHART_GRID_STROKE, CHART_AXIS_TICK, BAR_RADIUS_TOP } from "@/utils/chart";
import type { DailySummary, TrendData } from "@/types/health";
import { AiInsightCard } from "@/components/AiInsightCard";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

export function OverviewPage() {
  const { start, end, days, setDays } = useDateRange(30);

  const { data, loading, error, retry } = useApiData(
    async () => {
      const [overview, trendsRes] = await Promise.all([
        getOverview(start, end),
        getTrends(days),
      ]);
      return { daily: overview.data, trends: trendsRes.trends };
    },
    [start, end, days],
    { pageTitle: "Tổng quan" },
  );

  const daily = data?.daily ?? [];
  const trends = data?.trends ?? [];
  const latest = daily[daily.length - 1];
  const trendFor = (metric: string) => trends.find((t: TrendData) => t.metric === metric);

  const chartData = daily.map((d: DailySummary) => ({
    ...d,
    label: d.date.slice(5),
  }));

  return (
    <div>
      <PageHeader title="Tổng quan" days={days} onDaysChange={setDays} />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : daily.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <AiInsightCard days={days} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
            <StatCard icon="🚶" label="Steps" value={latest?.steps?.toLocaleString() ?? "--"} trend={trendFor("steps")} />
            <StatCard icon="🔥" label="Calories" value={latest?.calories?.toLocaleString() ?? "--"} trend={trendFor("calories")} />
            <StatCard icon="📏" label="Distance" value={latest?.distance_meters ? `${(latest.distance_meters / 1000).toFixed(1)}` : "--"} unit="km" />
            <StatCard icon="😴" label="Giấc ngủ" value={formatMinutes(latest?.sleep_minutes)} trend={trendFor("sleep_minutes")} />
            <StatCard icon="💤" label="Sleep Score" value={latest?.sleep_score != null ? `${latest.sleep_score}` : "--"} trend={trendFor("sleep_score")} />
            <StatCard
              icon="❤️"
              label="Nhịp tim"
              value={latest?.resting_heart_rate ? `${latest.resting_heart_rate}/${latest.max_heart_rate ?? "--"}` : "--"}
              trend={trendFor("resting_heart_rate")}
            />
            <StatCard icon="😰" label="Stress" value={latest?.avg_stress != null ? `${latest.avg_stress}` : "--"} trend={trendFor("avg_stress")} />
            <StatCard icon="🫁" label="SpO2" value={latest?.avg_spo2 != null ? `${latest.avg_spo2}%` : "--"} trend={trendFor("avg_spo2")} />
            <StatCard icon="💓" label="HRV" value={latest?.hrv != null ? `${Math.round(latest.hrv)}` : "--"} unit="ms" trend={trendFor("hrv")} />
            <StatCard icon="⚡" label="PAI" value={latest?.daily_pai != null ? `${Math.round(latest.daily_pai)}` : "--"} trend={trendFor("daily_pai")} />
            <StatCard icon="💪" label="Readiness" value={latest?.readiness_score != null ? `${latest.readiness_score}` : "--"} trend={trendFor("readiness_score")} />
            <StatCard icon="🧠" label="Mental" value={latest?.mental_score != null ? `${latest.mental_score}` : "--"} trend={trendFor("mental_score")} />
            <StatCard icon="🏋️" label="Physical" value={latest?.physical_score != null ? `${latest.physical_score}` : "--"} trend={trendFor("physical_score")} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="🚶 Steps hàng ngày">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="steps" fill="#4fc3f7" radius={BAR_RADIUS_TOP} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="❤️ Nhịp tim">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis domain={[40, 180]} tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend />
                  <Line type="monotone" dataKey="resting_heart_rate" stroke="#ef5350" name="Resting" dot={false} />
                  <Line type="monotone" dataKey="max_heart_rate" stroke="#ff8a80" strokeDasharray="5 5" name="Max" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="😴 Giấc ngủ">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend />
                  <Bar dataKey="deep_sleep_minutes" stackId="sleep" fill="#3949ab" name="Deep" />
                  <Bar dataKey="light_sleep_minutes" stackId="sleep" fill="#7986cb" name="Light" />
                  <Bar dataKey="rem_sleep_minutes" stackId="sleep" fill="#9fa8da" name="REM" />
                  <Bar dataKey="awake_minutes" stackId="sleep" fill="#546e7a" name="Awake" radius={BAR_RADIUS_TOP} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="🔥 Calories">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="calories" fill="#ffa726" radius={BAR_RADIUS_TOP} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="🫁 SpO2">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis domain={[85, 100]} tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="avg_spo2" stroke="#26c6da" name="SpO2 %" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="😰 Stress">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="avg_stress" stroke="#ffa726" name="Avg Stress" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="💓 HRV & ⚡ PAI">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis yAxisId="hrv" tick={CHART_AXIS_TICK} />
                  <YAxis yAxisId="pai" orientation="right" tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend />
                  <Line yAxisId="hrv" type="monotone" dataKey="hrv" stroke="#7c4dff" name="HRV (ms)" dot={false} />
                  <Line yAxisId="pai" type="monotone" dataKey="daily_pai" stroke="#ab47bc" name="PAI" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="💪 Readiness & Body Scores">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
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
