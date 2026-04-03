/**
 * Trend Indicator — Hiển thị mũi tên xu hướng cho metrics.
 * ↑ = improving (xanh), ↓ = declining (đỏ), → = stable (xám)
 */
import type { TrendData } from "@/types/health";

interface TrendIndicatorProps {
  trend: TrendData | undefined;
  /** Hiển thị % change bên cạnh mũi tên */
  showPct?: boolean;
}

const DIRECTION_CONFIG = {
  improving: { arrow: "↑", color: "text-green-400", bg: "bg-green-900/30" },
  declining: { arrow: "↓", color: "text-red-400", bg: "bg-red-900/30" },
  stable: { arrow: "→", color: "text-gray-400", bg: "bg-gray-800/30" },
} as const;

export function TrendIndicator({ trend, showPct = true }: TrendIndicatorProps) {
  if (!trend) return null;

  const config = DIRECTION_CONFIG[trend.direction];

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}
      title={`${trend.direction}: ${trend.change_pct > 0 ? "+" : ""}${trend.change_pct.toFixed(1)}%`}
    >
      <span className="font-bold">{config.arrow}</span>
      {showPct && Math.abs(trend.change_pct) >= 1 && (
        <span>{Math.abs(trend.change_pct).toFixed(0)}%</span>
      )}
    </span>
  );
}
