/** Format helpers cho UI display */

export function formatDate(d: Date): string {
  return d.toISOString().split("T")[0]!;
}

export function formatMinutes(m: number | null | undefined): string {
  if (!m) return "--";
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h > 0 ? `${h}h ${min}m` : `${min}m`;
}

/** Tính ngày start mặc định (N ngày trước) */
export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

export function today(): string {
  return formatDate(new Date());
}
