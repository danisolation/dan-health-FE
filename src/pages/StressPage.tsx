import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getOverview, getStressReadings } from "@/services/api";
import { useDateRange } from "@/hooks/useDateRange";
import { useApiData } from "@/hooks/useApiData";
import { CHART_TOOLTIP_STYLE, CHART_GRID_STROKE, CHART_AXIS_TICK, BAR_RADIUS_TOP } from "@/utils/chart";
import type { DailySummary, StressReading } from "@/types/health";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

export function StressPage() {
  const { start, end } = useDateRange();

  const { data, loading, error, retry } = useApiData(
    async () => {
      const [overview, readings] = await Promise.all([
        getOverview(start, end),
        getStressReadings(start, end),
      ]);
      return { daily: overview.data, readings };
    },
    [start, end],
    { pageTitle: "Stress" },
  );

  const dailyData = data?.daily ?? [];
  const readings = data?.readings ?? [];
  const latest = dailyData[dailyData.length - 1];

  const dailyChart = dailyData
    .filter((d: DailySummary) => d.avg_stress != null)
    .map((d: DailySummary) => ({
      label: d.date.slice(5),
      avg_stress: d.avg_stress,
    }));

  const detailChart = groupReadingsByDate(readings);

  const stressValues = dailyData.filter((d: DailySummary) => d.avg_stress != null).map((d: DailySummary) => d.avg_stress!);
  const avgStress = stressValues.length ? Math.round(stressValues.reduce((a, b) => a + b, 0) / stressValues.length) : null;
  const maxStress = stressValues.length ? Math.max(...stressValues) : null;
  const minStress = stressValues.length ? Math.min(...stressValues) : null;

  return (
    <div>
      <PageHeader title="😰 Stress" />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : dailyData.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard label="Hôm nay" value={latest?.avg_stress != null ? `${latest.avg_stress}` : "--"} sub="avg" color="text-accent-orange" />
            <StatCard label="TB giai đoạn" value={avgStress != null ? `${avgStress}` : "--"} sub="average" color="text-accent-blue" />
            <StatCard label="Cao nhất" value={maxStress != null ? `${maxStress}` : "--"} sub="max" color="text-accent-red" />
            <StatCard label="Thấp nhất" value={minStress != null ? `${minStress}` : "--"} sub="min" color="text-accent-green" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="📊 Stress trung bình hàng ngày">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="avg_stress" stroke="#ffa726" fill="#ffa726" fillOpacity={0.2} name="Avg Stress" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title={`📈 Chi tiết stress readings (${readings.length} readings)`}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={detailChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="stress_value" stroke="#ff7043" dot={false} name="Stress" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Stress zone distribution */}
          <div className="mt-4">
            <ChartCard title="📊 Phân bổ stress zones">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyData.filter((d: DailySummary) => d.stress_relax_pct != null).map((d: DailySummary) => ({
                  label: d.date.slice(5),
                  relax: d.stress_relax_pct,
                  normal: d.stress_normal_pct,
                  medium: d.stress_medium_pct,
                  high: d.stress_high_pct,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend />
                  <Bar dataKey="relax" stackId="zone" fill="#66bb6a" name="Thư giãn" />
                  <Bar dataKey="normal" stackId="zone" fill="#42a5f5" name="Bình thường" />
                  <Bar dataKey="medium" stackId="zone" fill="#ffa726" name="Trung bình" />
                  <Bar dataKey="high" stackId="zone" fill="#ef5350" name="Cao" radius={BAR_RADIUS_TOP} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Stress level guide */}
          <div className="mt-4 bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-sm text-gray-300 mb-3">Mức stress</h3>
            <div className="flex gap-4 text-xs flex-wrap">
              <span className="text-green-400">● 0-25: Thư giãn</span>
              <span className="text-accent-blue">● 26-50: Bình thường</span>
              <span className="text-accent-orange">● 51-75: Trung bình</span>
              <span className="text-accent-red">● 76-100: Cao</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function groupReadingsByDate(readings: StressReading[]) {
  const byDate: Record<string, number[]> = {};
  for (const r of readings) {
    const d = r.reading_date;
    if (!byDate[d]) byDate[d] = [];
    byDate[d]!.push(r.stress_value);
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([d, vals]) => ({
      label: d.slice(5),
      stress_value: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
    }));
}
