/**
 * TypeScript interfaces cho dữ liệu health từ Amazfit.
 * Mapping 1:1 với backend API response và dashboard.html data.
 */

/** Summary card data cho ngày hiện tại / mới nhất */
export interface DailySummary {
  date: string;
  steps: number;
  distance_meters: number;
  calories: number;
  sleep_minutes: number;
  deep_sleep_minutes: number;
  light_sleep_minutes: number;
  rem_sleep_minutes: number;
  awake_minutes: number;
  sleep_score: number | null;
  resting_heart_rate: number | null;
  max_heart_rate: number | null;
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
  created_at: string;
}

/** Workout record */
export interface WorkoutRecord {
  track_id: string;
  workout_type: number;
  workout_name: string;
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
  vo2_max: number | null;
  synced_at: string;
}

/** API response wrappers */
export interface DailyResponse {
  data: DailySummary[];
}

export interface WorkoutsResponse {
  data: WorkoutRecord[];
}

export interface SyncResult {
  status?: string;
  counts?: Record<string, number>;
  synced_at?: string;
  error?: string;
}

/** Sidebar navigation item */
export interface NavItem {
  label: string;
  icon: string;
  path: string;
}
