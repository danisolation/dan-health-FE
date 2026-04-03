import { useState, useCallback, useEffect } from "react";
import { triggerSync, triggerCronSync } from "@/services/api";
import type { SyncResult } from "@/types/health";

interface HeaderProps {
  sidebarCollapsed: boolean;
  onMobileMenuOpen: () => void;
}

export function Header({ sidebarCollapsed, onMobileMenuOpen }: HeaderProps) {
  const [syncing, setSyncing] = useState(false);
  const [cronSyncing, setCronSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [cronMessage, setCronMessage] = useState<string | null>(null);

  // Auto-dismiss sync toast after 6 seconds
  useEffect(() => {
    if (!syncResult && !cronMessage) return;
    const timer = setTimeout(() => {
      setSyncResult(null);
      setCronMessage(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [syncResult, cronMessage]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncResult(null);
    setCronMessage(null);
    try {
      const result = await triggerSync(7);
      setSyncResult(result);
    } catch (err) {
      setSyncResult({ error: err instanceof Error ? err.message : "Lỗi kết nối" });
    } finally {
      setSyncing(false);
    }
  }, []);

  const handleCronSync = useCallback(async () => {
    setCronSyncing(true);
    setSyncResult(null);
    setCronMessage(null);
    try {
      const result = await triggerCronSync();
      if (result.sync.error) {
        setSyncResult({ error: result.sync.error });
      } else {
        const cleanupTotal = Object.values(result.cleanup).reduce((a, b) => a + b, 0);
        const syncCounts = Object.entries(result.sync.counts ?? {})
          .map(([k, v]) => `${v} ${k}`)
          .join(", ");
        setCronMessage(`✅ Sync: ${syncCounts} | Cleanup: ${cleanupTotal} records xóa`);
      }
    } catch (err) {
      setSyncResult({ error: err instanceof Error ? err.message : "Lỗi kết nối" });
    } finally {
      setCronSyncing(false);
    }
  }, []);

  return (
    <header
      className={`
        fixed top-0 right-0 z-30 h-14
        bg-dark-card border-b border-dark-border
        flex items-center justify-between px-4 md:px-6
        transition-all duration-300
        left-0 ${sidebarCollapsed ? "md:left-16" : "md:left-56"}
      `}
      role="banner"
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden text-gray-400 hover:text-gray-200 p-1"
          aria-label="Mở menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h2 className="text-sm font-medium text-gray-300">
          Health Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Sync status message */}
        {(syncResult || cronMessage) && (
          <span
            role="status"
            className={`text-xs px-3 py-1 rounded-full motion-safe:animate-fade-in ${
              syncResult?.error
                ? "bg-red-900/50 text-red-300"
                : "bg-green-900/50 text-green-300"
            }`}
          >
            {syncResult?.error
              ? `❌ ${syncResult.error}`
              : cronMessage
                ? cronMessage
                : `✅ Synced: ${Object.entries(syncResult?.counts ?? {})
                    .map(([k, v]) => `${v} ${k}`)
                    .join(", ")}`}
          </span>
        )}

        {/* Cron Sync button */}
        <button
          onClick={handleCronSync}
          disabled={cronSyncing || syncing}
          title="Sync hôm qua + xóa dữ liệu cũ > 90 ngày"
          className="flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-lg text-sm
                     bg-emerald-700 hover:bg-emerald-600 disabled:bg-gray-700
                     disabled:cursor-not-allowed transition-colors"
        >
          <span className={cronSyncing ? "motion-safe:animate-spin" : ""} role="img" aria-hidden="true">🧹</span>
          <span className="hidden sm:inline">{cronSyncing ? "Đang chạy..." : "Cron Sync"}</span>
        </button>

        {/* Sync button */}
        <button
          onClick={handleSync}
          disabled={syncing || cronSyncing}
          className="flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-lg text-sm
                     bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700
                     disabled:cursor-not-allowed transition-colors"
        >
          <span className={syncing ? "motion-safe:animate-spin" : ""} role="img" aria-hidden="true">🔄</span>
          <span className="hidden sm:inline">{syncing ? "Đang sync..." : "Sync 7 ngày"}</span>
        </button>
      </div>
    </header>
  );
}
