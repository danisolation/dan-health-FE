import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getHeartRates } from "@/services/api";
import { useDateRange } from "@/hooks/useDateRange";
import type { HeartRateRecord } from "@/types/health";

interface DailyHR {
  date: string;
  resting: number | null;
  max: number | null;
}

export function HeartRatePage() {
  const { start, end, days, setDays } = useDateRange(30);
  const [data, setData] = useState<DailyHR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getHeartRates(start, end)
      .then((records) => {
        // Gộp theo ngày
        const byDate = new Map<string, DailyHR>();
        for (const r of records) {
          const d = r.recorded_at.split("T")[0]!;
          if (!byDate.has(d)) byDate.set(d, { date: d, resting: null, max: null });
          const entry = byDate.get(d)!;
          if (r.measurement_type === "resting") entry.resting = r.bpm;
          if (r.measurement_type === "max") entry.max = r.bpm;
        }
        setData(Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [start, end]);

  const latest = data[data.length - 1];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-100">❤️ Nhịp tim</h1>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((n) => (
            <button
              key={n}
              onClick={() => setDays(n)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                days === n ? "bg-accent-red text-white" : "bg-dark-card text-gray-400 hover:text-gray-200"
              }`}
            >
              {n}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-20">Đang tải...</div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="Resting hôm nay" value={latest?.resting ? `${latest.resting} bpm` : "--"} color="text-accent-red" />
            <StatCard label="Max hôm nay" value={latest?.max ? `${latest.max} bpm` : "--"} color="text-red-300" />
            <StatCard
              label="Avg Resting"
              value={(() => {
                const vals = data.filter((d) => d.resting).map((d) => d.resting!);
                return vals.length ? `${Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)} bpm` : "--";
              })()}
              color="text-gray-300"
            />
            <StatCard label="Records" value={`${data.length} ngày`} color="text-gray-300" />
          </div>

          {/* Chart */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data.map((d) => ({ ...d, label: d.date.slice(5) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                <XAxis dataKey="label" tick={{ fill: "#78909c", fontSize: 11 }} />
                <YAxis domain={[40, 200]} tick={{ fill: "#78909c", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1a2733", border: "1px solid #2a3f52", borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="resting" stroke="#ef5350" name="Resting HR" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="max" stroke="#ff8a80" strokeDasharray="5 5" name="Max HR" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 uppercase mt-1">{label}</div>
    </div>
  );
}
