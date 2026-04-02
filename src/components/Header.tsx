import { useState, useCallback } from "react";
import { triggerSync } from "@/services/api";
import type { SyncResult } from "@/types/health";

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export function Header({ sidebarCollapsed }: HeaderProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await triggerSync(7);
      setSyncResult(result);
    } catch (err) {
      setSyncResult({ error: err instanceof Error ? err.message : "Lỗi kết nối" });
    } finally {
      setSyncing(false);
    }
  }, []);

  return (
    <header
      className={`
        fixed top-0 right-0 z-30 h-14
        bg-dark-card border-b border-dark-border
        flex items-center justify-between px-6
        transition-all duration-300
        ${sidebarCollapsed ? "left-16" : "left-56"}
      `}
    >
      <h2 className="text-sm font-medium text-gray-300">
        Health Dashboard
      </h2>

      <div className="flex items-center gap-4">
        {/* Sync status message */}
        {syncResult && (
          <span
            className={`text-xs px-3 py-1 rounded-full ${
              syncResult.error
                ? "bg-red-900/50 text-red-300"
                : "bg-green-900/50 text-green-300"
            }`}
          >
            {syncResult.error
              ? `❌ ${syncResult.error}`
              : `✅ Synced: ${Object.entries(syncResult.counts ?? {})
                  .map(([k, v]) => `${v} ${k}`)
                  .join(", ")}`}
          </span>
        )}

        {/* Sync button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm
                     bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700
                     disabled:cursor-not-allowed transition-colors"
        >
          <span className={syncing ? "animate-spin" : ""}>🔄</span>
          {syncing ? "Đang sync..." : "Sync Now"}
        </button>
      </div>
    </header>
  );
}
