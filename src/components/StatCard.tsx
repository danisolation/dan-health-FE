import type { TrendData } from "@/types/health";
import { TrendIndicator } from "@/components/TrendIndicator";

interface StatCardProps {
  label: string;
  value: string;
  icon?: string;
  unit?: string;
  sub?: string;
  color?: string;
  trend?: TrendData;
}

export function StatCard({ label, value, icon, unit, sub, color = "text-white", trend }: StatCardProps) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center hover:border-accent-blue/50 transition-colors">
      {icon && (
        <div className="text-2xl mb-1" role="img" aria-hidden="true">{icon}</div>
      )}
      <div className="flex items-center justify-center gap-1">
        <div className={`text-xl font-bold ${color}`}>
          {value}
          {value !== "--" && unit && (
            <span className="text-sm font-normal text-gray-400 ml-0.5">{unit}</span>
          )}
        </div>
        {trend && <TrendIndicator trend={trend} showPct={false} />}
      </div>
      <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">{label}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}
