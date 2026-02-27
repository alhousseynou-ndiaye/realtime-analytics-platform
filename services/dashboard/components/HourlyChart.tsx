"use client";

import useSWR from "swr";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function fmtHour(ts: string) {
  // ts is ISO; show "HH:00"
  const d = new Date(ts);
  return d.toLocaleString("fr-FR", { hour: "2-digit" });
}

export default function HourlyChart() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { data, isLoading, error } = useSWR(`${base}/hourly?hours=24`, fetcher, {
    refreshInterval: 3000,
  });

  const box: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
  };

  if (error) return <div style={box}>API error loading hourly.</div>;
  if (isLoading) return <div style={box}>Loading chart…</div>;

  // API returns per hour per shop; for a first MVP, sum shops by hour
  const byHour = new Map<string, { bucket_start: string; revenue: number; orders: number; items: number }>();
  for (const r of (data || [])) {
    const k = r.bucket_start;
    const prev = byHour.get(k) || { bucket_start: k, revenue: 0, orders: 0, items: 0 };
    prev.revenue += r.revenue || 0;
    prev.orders += r.orders || 0;
    prev.items += r.items || 0;
    byHour.set(k, prev);
  }
  const series = Array.from(byHour.values()).sort((a, b) => +new Date(a.bucket_start) - +new Date(b.bucket_start));

  return (
    <div style={box}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Revenue by hour (24h)</h2>
        <div style={{ opacity: 0.7, fontSize: 13 }}>{series.length} points</div>
      </div>

      <div style={{ height: 320, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="bucket_start" tickFormatter={fmtHour} />
            <YAxis />
            <Tooltip
              labelFormatter={(l) => new Date(l as string).toLocaleString("fr-FR")}
              formatter={(v: any, name) => [Number(v).toFixed(2), name]}
            />
            <Line type="monotone" dataKey="revenue" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}