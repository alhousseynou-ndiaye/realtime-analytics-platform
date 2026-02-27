"use client";

import useSWR from "swr";
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

type HourlyRow = {
  bucket_start: string;
  shop_id: string;
  revenue: number;
  orders: number;
  items: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<HourlyRow[]>);

function fmtHour(ts: string) {
  const d = new Date(ts);
  // affichage "20" pour 20h (simple et lisible)
  return d.toLocaleString("fr-FR", { hour: "2-digit" });
}

export default function HourlyChart() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const { data, isLoading, error } = useSWR<HourlyRow[]>(
    `${base}/hourly?hours=24`,
    fetcher,
    { refreshInterval: 3000 }
  );

  const rows = data ?? [];

  const box: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
  };

  if (error) return <div style={box}>API error loading hourly.</div>;
  if (isLoading) return <div style={box}>Loading chart…</div>;

  // 1) Shops présents (dynamiques)
  const shops: string[] = Array.from(new Set(rows.map((r) => r.shop_id))).sort();

  // 2) On transforme: (bucket_start, shop_id, revenue) -> 1 objet par bucket_start
  //   { bucket_start: "...", shop_001: 1200, shop_002: 800, ... }
  const byBucket: Record<string, { bucket_start: string; [shopId: string]: number | string }> = {};

  for (const r of rows) {
    const key = r.bucket_start;
    if (!byBucket[key]) {
      byBucket[key] = { bucket_start: key };
    }
    byBucket[key][r.shop_id] = r.revenue ?? 0;
  }

  // 3) Série triée
  const series = Object.values(byBucket).sort(
    (a, b) => +new Date(String(a.bucket_start)) - +new Date(String(b.bucket_start))
  );

  return (
    <div style={box}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Revenue by hour per shop (24h)</h2>
        <div style={{ opacity: 0.7, fontSize: 13 }}>
          {series.length} points • {shops.length} shops
        </div>
      </div>

      <div style={{ height: 320, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="bucket_start" tickFormatter={(v) => fmtHour(String(v))} />
            <YAxis />
            <Tooltip
              labelFormatter={(l) => new Date(String(l)).toLocaleString("fr-FR")}
              formatter={(v: any, name: any) => [Number(v ?? 0).toFixed(2), String(name)]}
            />
            <Legend />

            {shops.map((shop) => (
              <Line
                key={shop}
                type="monotone"
                dataKey={shop}
                name={shop}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {shops.length === 0 && (
        <div style={{ marginTop: 10, opacity: 0.8, fontSize: 13 }}>
          No data yet. Wait a few seconds for producer/consumer to fill the DB.
        </div>
      )}
    </div>
  );
}