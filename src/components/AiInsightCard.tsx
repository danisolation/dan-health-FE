/**
 * AI Insight Card — Hiển thị AI-generated health summary.
 * Bao gồm: summary text, anomaly badges, detailed analysis toggle.
 */
import { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { getDailyInsight, getDetailedAnalysis } from "@/services/api";
import type { InsightResponse, DetailedAnalysisResponse, AnomalyData } from "@/types/health";

interface AiInsightCardProps {
  days: number;
}

export function AiInsightCard({ days }: AiInsightCardProps) {
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [detailed, setDetailed] = useState<DetailedAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailedLoading, setDetailedLoading] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDailyInsight(days)
      .then(setInsight)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [days]);

  const handleDetailedAnalysis = useCallback(async () => {
    if (detailed) {
      setShowDetailed((prev) => !prev);
      return;
    }
    setDetailedLoading(true);
    setShowDetailed(true);
    try {
      const result = await getDetailedAnalysis(days);
      setDetailed(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi phân tích chi tiết");
    } finally {
      setDetailedLoading(false);
    }
  }, [detailed, days]);

  if (loading) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="motion-safe:animate-pulse h-5 w-5 rounded-full bg-accent-purple" />
          <p className="text-gray-400 text-sm motion-safe:animate-pulse">Đang phân tích AI...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-card border border-red-900/50 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">⚠️</span>
          <h3 className="text-sm font-medium text-red-400">Lỗi AI</h3>
        </div>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="bg-dark-card border border-accent-purple/30 rounded-xl p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <h3 className="text-sm font-medium text-accent-purple">AI Health Insight</h3>
        </div>
        {insight.cached && (
          <span className="text-xs text-gray-500 bg-dark-bg px-2 py-0.5 rounded">cached</span>
        )}
      </div>

      {/* Summary */}
      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line mb-4">
        {insight.summary}
      </p>

      {/* Anomaly badges */}
      {insight.anomalies.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {insight.anomalies.map((a) => (
            <AnomalyBadge key={`${a.metric}-${a.date}`} anomaly={a} />
          ))}
        </div>
      )}

      {/* Detailed analysis toggle */}
      <div className="border-t border-dark-border pt-3">
        <button
          onClick={handleDetailedAnalysis}
          disabled={detailedLoading}
          aria-expanded={showDetailed}
          aria-controls="detailed-analysis-panel"
          className="flex items-center gap-2 text-sm text-accent-purple hover:text-purple-300
                     disabled:text-gray-500 disabled:cursor-not-allowed transition-colors
                     focus:outline-none focus:ring-2 focus:ring-accent-purple/50 rounded px-1 -mx-1"
        >
          <span className={`transition-transform duration-200 ${showDetailed ? "rotate-90" : ""}`}>▶</span>
          <span>{detailedLoading ? "Đang phân tích chi tiết..." : showDetailed ? "Ẩn phân tích chi tiết" : "🔬 Phân tích chi tiết các chỉ số"}</span>
          {detailedLoading && (
            <span className="motion-safe:animate-spin">⏳</span>
          )}
        </button>

        {/* Detailed content */}
        <div
          id="detailed-analysis-panel"
          role="region"
          className={`grid transition-all duration-300 ease-in-out ${
            showDetailed && (detailed || detailedLoading) ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            {/* Skeleton loading */}
            {detailedLoading && (
              <div className="space-y-4 animate-pulse">
                <div className="bg-dark-bg rounded-lg p-5 border border-dark-border space-y-3">
                  <div className="h-4 bg-dark-hover rounded w-48" />
                  <div className="h-3 bg-dark-hover/70 rounded w-full" />
                  <div className="h-3 bg-dark-hover/70 rounded w-5/6" />
                  <div className="h-3 bg-dark-hover/70 rounded w-4/6" />
                  <div className="h-3 bg-dark-hover/70 rounded w-full" />
                  <div className="h-3 bg-dark-hover/70 rounded w-3/4" />
                </div>
                <div className="bg-dark-bg rounded-lg p-5 border border-dark-border space-y-3">
                  <div className="h-4 bg-dark-hover rounded w-40" />
                  <div className="h-3 bg-dark-hover/70 rounded w-full" />
                  <div className="h-3 bg-dark-hover/70 rounded w-full" />
                  <div className="h-3 bg-dark-hover/70 rounded w-full" />
                </div>
              </div>
            )}

            {detailed && (
              <div className="space-y-4">
                {/* Detailed analysis text — rendered as Markdown */}
                <div className="bg-dark-bg rounded-lg p-5 border border-dark-border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                      <span>📊</span> Phân tích chi tiết {days} ngày
                    </h4>
                    {detailed.cached && (
                      <span className="text-xs text-gray-500 bg-dark-card px-2 py-0.5 rounded">cached</span>
                    )}
                  </div>
                  <div className="prose prose-sm prose-invert max-w-none
                    prose-headings:text-gray-200 prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
                    prose-p:text-gray-300 prose-p:leading-relaxed
                    prose-strong:text-gray-200
                    prose-li:text-gray-300 prose-li:marker:text-accent-purple
                    prose-ul:my-2 prose-ol:my-2
                    prose-hr:border-dark-border">
                    <ReactMarkdown>{detailed.analysis}</ReactMarkdown>
                  </div>
                </div>

                {/* Stats summary table */}
                {Object.keys(detailed.stats).length > 0 && (
                  <div className="bg-dark-bg rounded-lg p-5 border border-dark-border overflow-x-auto">
                    <h4 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
                      <span>📈</span> Thống kê tổng hợp
                    </h4>
                    <table className="w-full text-sm text-gray-300">
                      <caption className="sr-only">Bảng thống kê sức khoẻ tổng hợp {days} ngày</caption>
                      <thead>
                        <tr className="border-b border-dark-border text-gray-400 text-xs uppercase tracking-wider">
                          <th scope="col" className="text-left py-2.5 pr-4">Chỉ số</th>
                          <th scope="col" className="text-right py-2.5 px-3">Trung bình</th>
                          <th scope="col" className="text-right py-2.5 px-3">Min</th>
                          <th scope="col" className="text-right py-2.5 px-3">Max</th>
                          <th scope="col" className="text-right py-2.5 px-3">Độ lệch</th>
                          <th scope="col" className="text-right py-2.5 pl-3">Số ngày</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(detailed.stats).map(([metric, s], i) => (
                          <tr key={metric} className={`border-b border-dark-border/30 transition-colors hover:bg-dark-hover/30 ${i % 2 === 1 ? "bg-dark-card/30" : ""}`}>
                            <td className="py-2.5 pr-4 font-medium text-gray-200">{METRIC_LABELS[metric] ?? metric}</td>
                            <td className="text-right py-2.5 px-3 font-mono tabular-nums">{s.avg}</td>
                            <td className="text-right py-2.5 px-3 font-mono tabular-nums text-blue-400">{s.min}</td>
                            <td className="text-right py-2.5 px-3 font-mono tabular-nums text-orange-400">{s.max}</td>
                            <td className="text-right py-2.5 px-3 font-mono tabular-nums text-gray-400">{s.std}</td>
                            <td className="text-right py-2.5 pl-3 text-gray-400">{s.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const METRIC_LABELS: Record<string, string> = {
  steps: "Bước chân",
  calories: "Calories (kcal)",
  sleep_minutes: "Giấc ngủ (phút)",
  sleep_score: "Điểm ngủ",
  deep_sleep_minutes: "Deep sleep (phút)",
  rem_sleep_minutes: "REM (phút)",
  light_sleep_minutes: "Light sleep (phút)",
  wake_count: "Số lần thức giấc",
  resting_heart_rate: "Nhịp tim nghỉ (bpm)",
  max_heart_rate: "Nhịp tim max (bpm)",
  avg_stress: "Stress TB",
  stress_relax_pct: "Relax %",
  stress_high_pct: "High stress %",
  avg_spo2: "SpO2 (%)",
  hrv: "HRV (ms)",
  readiness_score: "Readiness",
  daily_pai: "PAI",
  mental_score: "Mental",
  physical_score: "Physical",
};

function AnomalyBadge({ anomaly }: { anomaly: AnomalyData }) {
  const colors = {
    critical: "bg-red-900/40 text-red-400 border-red-800/50",
    warning: "bg-yellow-900/40 text-yellow-400 border-yellow-800/50",
    info: "bg-blue-900/40 text-blue-400 border-blue-800/50",
  };
  const icons = { critical: "🔴", warning: "🟡", info: "🔵" };

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${colors[anomaly.severity]}`}
      title={anomaly.message}
    >
      <span>{icons[anomaly.severity]}</span>
      {anomaly.message}
    </span>
  );
}
