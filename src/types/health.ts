/**
 * TypeScript interfaces cho dữ liệu health từ Amazfit.
 * Mapping 1:1 với backend API response.
 */

/** Summary card data cho ngày hiện tại / mới nhất */
export interface DailySummary {
  date: string;
  // Activity
  steps: number;
  distance_meters: number;
  calories: number;
  // Sleep
  sleep_minutes: number;
  deep_sleep_minutes: number;
  light_sleep_minutes: number;
  rem_sleep_minutes: number;
  awake_minutes: number;
  sleep_score: number | null;
  sleep_start: string | null;
  sleep_end: string | null;
  sleep_onset_latency: number | null;
  wake_count: number | null;
  interruption_score: number | null;
  sleep_resting_hr: number | null;
  // Heart rate
  resting_heart_rate: number | null;
  max_heart_rate: number | null;
  // Stress
  avg_stress: number | null;
  min_stress: number | null;
  max_stress: number | null;
  stress_relax_pct: number | null;
  stress_normal_pct: number | null;
  stress_medium_pct: number | null;
  stress_high_pct: number | null;
  // SpO2
  avg_spo2: number | null;
  spo2_odi: number | null;
  // PAI
  daily_pai: number | null;
  pai_low_zone_min: number | null;
  pai_medium_zone_min: number | null;
  pai_high_zone_min: number | null;
  // Readiness / HRV
  readiness_score: number | null;
  readiness_insight: number | null;
  hrv: number | null;
  sleep_hrv: number | null;
  hrv_score: number | null;
  // Body scores
  rhr_score: number | null;
  rhr_baseline: number | null;
  sleep_rhr: number | null;
  mental_score: number | null;
  mental_baseline: number | null;
  physical_score: number | null;
  physical_baseline: number | null;
  // Medical
  afib_baseline: number | null;
  ahi_score: number | null;
  ahi_baseline: number | null;
  // Workout HR
  workout_avg_hr: number | null;
  workout_max_hr: number | null;
  workout_min_hr: number | null;
  workout_count: number;
}

/** Heart rate record từ backend */
export interface HeartRateRecord {
  id: number;
  recorded_at: string;
  bpm: number;
  measurement_type: "resting" | "active" | "max" | "auto" | null;
  created_at: string;
}

/** Sleep record từ backend */
export interface SleepRecord {
  id: number;
  sleep_date: string;
  total_minutes: number;
  deep_sleep_minutes: number;
  light_sleep_minutes: number;
  rem_sleep_minutes: number;
  awake_minutes: number;
  sleep_score: number | null;
  sleep_start: string | null;
  sleep_end: string | null;
  sleep_onset_latency: number | null;
  wake_count: number | null;
  interruption_score: number | null;
  resting_heart_rate: number | null;
  created_at: string;
}

/** Activity record từ backend */
export interface ActivityRecord {
  id: number;
  activity_date: string;
  steps: number;
  calories: number;
  distance_meters: number;
  active_minutes: number;
  // Stress
  min_stress: number | null;
  max_stress: number | null;
  stress_relax_pct: number | null;
  stress_normal_pct: number | null;
  stress_medium_pct: number | null;
  stress_high_pct: number | null;
  // SpO2
  spo2_odi: number | null;
  // PAI
  daily_pai: number | null;
  pai_low_zone_min: number | null;
  pai_medium_zone_min: number | null;
  pai_high_zone_min: number | null;
  // Readiness
  readiness_score: number | null;
  readiness_insight: number | null;
  hrv: number | null;
  sleep_hrv: number | null;
  hrv_score: number | null;
  // Body
  rhr_score: number | null;
  rhr_baseline: number | null;
  sleep_rhr: number | null;
  mental_score: number | null;
  mental_baseline: number | null;
  physical_score: number | null;
  physical_baseline: number | null;
  // Medical
  afib_baseline: number | null;
  ahi_score: number | null;
  ahi_baseline: number | null;
  created_at: string;
}

/** Stress reading detail */
export interface StressReading {
  id: number;
  reading_date: string;
  recorded_at: string;
  stress_value: number;
  created_at: string;
}

/** SpO2 reading detail */
export interface SpO2Reading {
  id: number;
  reading_date: string;
  recorded_at: string;
  spo2_value: number;
  reading_type: string | null;
  created_at: string;
}

/** Workout record */
export interface WorkoutRecord {
  id: number;
  track_id: string;
  workout_type: number | null;
  workout_name: string | null;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  distance_meters: number;
  calories: number;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  min_heart_rate: number | null;
  avg_pace: number | null;
  total_steps: number | null;
  training_effect: number | null;
  // Extended
  anaerobic_te: number | null;
  exercise_load: number | null;
  avg_stride_length: number | null;
  pause_time: number | null;
  synced_at: string | null;
  created_at: string;
}

/** API response wrappers */
export interface DailyResponse {
  data: DailySummary[];
}

export interface SyncResult {
  status?: string;
  counts?: Record<string, number>;
  synced_at?: string;
  error?: string;
}

export interface CronSyncResult {
  sync: SyncResult;
  cleanup: Record<string, number>;
}

// ===================== AI Insights =====================

/** Trend analysis cho 1 metric */
export interface TrendData {
  metric: string;
  direction: "improving" | "declining" | "stable";
  change_pct: number;
  current_avg: number;
  previous_avg: number;
  latest_value: number | null;
}

/** Anomaly detected */
export interface AnomalyData {
  metric: string;
  date: string;
  value: number;
  baseline: number;
  z_score: number;
  severity: "info" | "warning" | "critical";
  message: string;
}

/** AI daily insight response */
export interface InsightResponse {
  summary: string;
  trends: TrendData[];
  anomalies: AnomalyData[];
  generated_at: string;
  cached: boolean;
}

/** Trends-only response */
export interface TrendsResponse {
  trends: TrendData[];
  days: number;
}

/** Anomalies-only response */
export interface AnomaliesResponse {
  anomalies: AnomalyData[];
  days: number;
}

/** Sidebar navigation item */
export interface NavItem {
  label: string;
  icon: string;
  path: string;
}
