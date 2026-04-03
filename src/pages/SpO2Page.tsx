import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { getOverview, getSpO2Readings } from "@/services/api";
import { useDateRange } from "@/hooks/useDateRange";
import { useApiData } from "@/hooks/useApiData";
import { CHART_TOOLTIP_STYLE, CHART_GRID_STROKE, CHART_AXIS_TICK } from "@/utils/chart";
import type { DailySummary, SpO2Reading } from "@/types/health";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

export function SpO2Page() {
  const { start, end } = useDateRange();

  const { data, loading, error, retry } = useApiData(
    async () => {
      const [overview, readings] = await Promise.all([
        getOverview(start, end),
        getSpO2Readings(start, end),
      ]);
      return { daily: overview.data, readings };
    },
    [start, end],
    { pageTitle: "SpO2" },
  );

  const dailyData = data?.daily ?? [];
  const readings = data?.readings ?? [];
  const latest = dailyData[dailyData.length - 1];

  const dailyChart = dailyData
    .filter((d: DailySummary) => d.avg_spo2 != null)
    .map((d: DailySummary) => ({
      label: d.date.slice(5),
      avg_spo2: d.avg_spo2,
    }));

  const detailChart = groupReadingsByDate(readings);

  const spo2Values = dailyData.filter((d: DailySummary) => d.avg_spo2 != null).map((d: DailySummary) => d.avg_spo2!);
  const avgSpo2 = spo2Values.length ? Math.round(spo2Values.reduce((a, b) => a + b, 0) / spo2Values.length) : null;
  const maxSpo2 = spo2Values.length ? Math.max(...spo2Values) : null;
  const minSpo2 = spo2Values.length ? Math.min(...spo2Values) : null;

  return (
    <div>
      <PageHeader title="🫁 SpO2" />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : dailyData.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            <StatCard label="Hôm nay" value={latest?.avg_spo2 != null ? `${latest.avg_spo2}%` : "--"} color="text-accent-teal" />
            <StatCard label="TB giai đoạn" value={avgSpo2 != null ? `${avgSpo2}%` : "--"} color="text-accent-blue" />
            <StatCard label="Cao nhất" value={maxSpo2 != null ? `${maxSpo2}%` : "--"} color="text-accent-green" />
            <StatCard label="Thấp nhất" value={minSpo2 != null ? `${minSpo2}%` : "--"} color="text-accent-red" />
            <StatCard label="ODI" value={latest?.spo2_odi != null ? `${latest.spo2_odi.toFixed(1)}` : "--"} color="text-accent-orange" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="📊 SpO2 trung bình hàng ngày">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis domain={[85, 100]} tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="avg_spo2" stroke="#26c6da" fill="#26c6da" fillOpacity={0.2} name="SpO2 %" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title={`📈 Chi tiết SpO2 readings (${readings.length} readings)`}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={detailChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis domain={[85, 100]} tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="spo2_value" stroke="#00bcd4" dot={false} name="SpO2 %" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* SpO2 level guide */}
          <div className="mt-4 bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-sm text-gray-300 mb-3">Mức SpO2</h3>
            <div className="flex gap-4 text-xs flex-wrap">
              <span className="text-green-400">● 95-100%: Bình thường</span>
              <span className="text-accent-orange">● 90-94%: Thấp</span>
              <span className="text-accent-red">● &lt;90%: Nguy hiểm</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function groupReadingsByDate(readings: SpO2Reading[]) {
  const byDate: Record<string, number[]> = {};
  for (const r of readings) {
    const d = r.reading_date;
    if (!byDate[d]) byDate[d] = [];
    byDate[d]!.push(r.spo2_value);
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([d, vals]) => ({
      label: d.slice(5),
      spo2_value: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
    }));
}
