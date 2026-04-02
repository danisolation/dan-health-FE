/**
 * API Service — Gọi backend endpoints.
 * Tất cả request đều qua Vite proxy (/api → localhost:8000).
 */
import type {
  DailyResponse,
  SyncResult,
  HeartRateRecord,
  SleepRecord,
  ActivityRecord,
} from "@/types/health";

const API_BASE = "http://localhost:8000/api/v1";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

/** Lấy overview data (activity + sleep + HR gộp theo ngày) */
export function getOverview(start: string, end: string): Promise<DailyResponse> {
  return fetchJSON(`${API_BASE}/overview?start=${start}&end=${end}`);
}

/** Lấy heart rate records */
export function getHeartRates(
  start: string,
  end: string,
  measurementType?: string,
): Promise<HeartRateRecord[]> {
  let url = `${API_BASE}/heart-rate?start=${start}&end=${end}`;
  if (measurementType) url += `&measurement_type=${measurementType}`;
  return fetchJSON(url);
}

/** Lấy sleep records */
export function getSleepRecords(start: string, end: string): Promise<SleepRecord[]> {
  return fetchJSON(`${API_BASE}/sleep?start=${start}&end=${end}`);
}

/** Lấy activity records */
export function getActivityRecords(start: string, end: string): Promise<ActivityRecord[]> {
  return fetchJSON(`${API_BASE}/activity?start=${start}&end=${end}`);
}

/** Trigger sync thủ công */
export function triggerSync(days: number): Promise<SyncResult> {
  return fetchJSON(`${API_BASE}/sync?days=${days}`, { method: "POST" });
}
