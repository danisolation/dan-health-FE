/**
 * AI Insight Card — Hiển thị AI-generated health summary.
 * Bao gồm: summary text, anomaly badges, loading state.
 */
import { useEffect, useState } from "react";
import { getDailyInsight } from "@/services/api";
import type { InsightResponse, AnomalyData } from "@/types/health";

interface AiInsightCardProps {
  days: number;
}

export function AiInsightCard({ days }: AiInsightCardProps) {
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDailyInsight(days)
      .then(setInsight)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [days]);

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
        <div className="flex flex-wrap gap-2">
          {insight.anomalies.map((a) => (
            <AnomalyBadge key={`${a.metric}-${a.date}`} anomaly={a} />
          ))}
        </div>
      )}
    </div>
  );
}

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
