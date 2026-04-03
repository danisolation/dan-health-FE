import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getActivityRecords } from "@/services/api";
import { useDateRange } from "@/hooks/useDateRange";
import { useApiData } from "@/hooks/useApiData";
import { CHART_TOOLTIP_STYLE, CHART_GRID_STROKE, CHART_AXIS_TICK, BAR_RADIUS_TOP } from "@/utils/chart";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

export function ActivityPage() {
  const { start, end, days, setDays } = useDateRange(30);

  const { data, loading, error, retry } = useApiData(
    () => getActivityRecords(start, end),
    [start, end],
    { pageTitle: "Vận động" },
  );

  const records = data ?? [];
  const latest = records[records.length - 1];
  const avgSteps = records.length
    ? Math.round(records.reduce((s, d) => s + d.steps, 0) / records.length)
    : 0;
  const totalCal = records.reduce((s, d) => s + d.calories, 0);

  const chartData = records.map((d) => ({
    label: d.activity_date.slice(5),
    steps: d.steps,
    calories: d.calories,
    distance_km: +(d.distance_meters / 1000).toFixed(2),
  }));

  return (
    <div>
      <PageHeader title="🚶 Vận động" days={days} onDaysChange={setDays} />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : records.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="Hôm nay" value={latest?.steps?.toLocaleString() ?? "--"} sub="steps" color="text-accent-blue" />
            <StatCard label="Avg / ngày" value={avgSteps.toLocaleString()} sub="steps" color="text-accent-blue" />
            <StatCard label="Tổng calories" value={totalCal.toLocaleString()} sub="kcal" color="text-accent-blue" />
            <StatCard
              label="Distance"
              value={latest?.distance_meters ? `${(latest.distance_meters / 1000).toFixed(1)}` : "--"}
              unit="km"
              color="text-accent-blue"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Steps hàng ngày">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="steps" fill="#4fc3f7" radius={BAR_RADIUS_TOP} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Calories & Distance">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis yAxisId="cal" tick={CHART_AXIS_TICK} />
                  <YAxis yAxisId="dist" orientation="right" tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend />
                  <Line yAxisId="cal" type="monotone" dataKey="calories" stroke="#ffa726" name="Calories" strokeWidth={2} dot={false} />
                  <Line yAxisId="dist" type="monotone" dataKey="distance_km" stroke="#26a69a" name="Distance (km)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
