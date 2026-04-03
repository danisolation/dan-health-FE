import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
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

export function ReadinessPage() {
  const { start, end, days, setDays } = useDateRange(30);

  const { data, loading, error, retry } = useApiData(
    () => getOverview(start, end).then((r) => r.data),
    [start, end],
    { pageTitle: "Readiness & HRV" },
  );

  const records = data ?? [];
  const latest = records[records.length - 1];

  const chartData = records
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

  const hrvValues = records.filter((d) => d.hrv != null).map((d) => d.hrv!);
  const avgHrv = hrvValues.length ? Math.round(hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length) : null;
  const readinessValues = records.filter((d) => d.readiness_score != null).map((d) => d.readiness_score!);
  const avgReadiness = readinessValues.length ? Math.round(readinessValues.reduce((a, b) => a + b, 0) / readinessValues.length) : null;
  const paiValues = records.filter((d) => d.daily_pai != null).map((d) => d.daily_pai!);
  const latestPai = paiValues.length ? paiValues[paiValues.length - 1] : null;

  return (
    <div>
      <PageHeader title="💪 Readiness & HRV" days={days} onDaysChange={setDays} />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : records.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <StatCard icon="💪" label="Readiness" value={latest?.readiness_score != null ? `${latest.readiness_score}` : "--"} />
            <StatCard icon="💓" label="HRV" value={latest?.hrv != null ? `${Math.round(latest.hrv)}` : "--"} unit="ms" />
            <StatCard icon="😴" label="Sleep HRV" value={latest?.sleep_hrv != null ? `${Math.round(latest.sleep_hrv)}` : "--"} unit="ms" />
            <StatCard icon="⚡" label="PAI" value={latestPai != null ? `${Math.round(latestPai)}` : "--"} />
            <StatCard icon="🧠" label="Mental" value={latest?.mental_score != null ? `${latest.mental_score}` : "--"} />
            <StatCard icon="🏋️" label="Physical" value={latest?.physical_score != null ? `${latest.physical_score}` : "--"} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="💓 HRV Trend">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend />
                  <Line type="monotone" dataKey="hrv" stroke="#7c4dff" name="HRV Baseline" dot={false} />
                  <Line type="monotone" dataKey="sleep_hrv" stroke="#b388ff" strokeDasharray="5 5" name="Sleep HRV" dot={false} />
                </LineChart>
              </ResponsiveContainer>
              {avgHrv != null && (
                <div className="text-xs text-gray-400 mt-2 text-center">TB: {avgHrv}ms</div>
              )}
            </ChartCard>

            <ChartCard title="💪 Readiness Score">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="readiness_score" fill="#66bb6a" radius={BAR_RADIUS_TOP} name="Readiness" />
                </BarChart>
              </ResponsiveContainer>
              {avgReadiness != null && (
                <div className="text-xs text-gray-400 mt-2 text-center">TB: {avgReadiness}/100</div>
              )}
            </ChartCard>

            <ChartCard title="⚡ PAI (Personal Activity Intelligence)">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="daily_pai" stroke="#ab47bc" fill="#ab47bc" fillOpacity={0.2} name="PAI" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="🧠 Mental & 🏋️ Physical Scores">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={CHART_AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend />
                  <Line type="monotone" dataKey="mental_score" stroke="#29b6f6" name="Mental" dot={false} />
                  <Line type="monotone" dataKey="physical_score" stroke="#ffa726" name="Physical" dot={false} />
                  <Line type="monotone" dataKey="readiness_score" stroke="#66bb6a" strokeDasharray="5 5" name="Readiness" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
