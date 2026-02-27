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
} from "recharts";
import ShopFilter from "./ShopFilter";

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
  return d.toLocaleString("fr-FR", { hour: "2-digit" });
}

function sumAllShops(rows: HourlyRow[]) {
  // { bucket_start: "...", revenue: 1234 }
  const byBucket = new Map<string, { bucket_start: string; revenue: number }>();

  for (const r of rows) {
    const key = r.bucket_start;
    const prev = byBucket.get(key) || { bucket_start: key, revenue: 0 };
    prev.revenue += r.revenue ?? 0;
    byBucket.set(key, prev);
  }

  return Array.from(byBucket.values()).sort(
    (a, b) => +new Date(a.bucket_start) - +new Date(b.bucket_start)
  );
}

function seriesForOneShop(rows: HourlyRow[], shopId: string) {
  return rows
    .filter((r) => r.shop_id === shopId)
    .map((r) => ({ bucket_start: r.bucket_start, revenue: r.revenue ?? 0 }))
    .sort((a, b) => +new Date(a.bucket_start) - +new Date(b.bucket_start));
}

export default function HourlyChart() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const { data, isLoading, error } = useSWR<HourlyRow[]>(
    `${base}/hourly?hours=24`,
    fetcher,
    { refreshInterval: 3000 }
  );

  const rows = data ?? [];

  // Shops dynamiques depuis les données
  const shops: string[] = Array.from(new Set(rows.map((r) => r.shop_id))).sort();

  // Etat filtre
  const [selectedShop, setSelectedShop] = React.useState<string>("all");

  // Si le shop sélectionné n'existe plus (ex: refresh), reset
  React.useEffect(() => {
    if (selectedShop !== "all" && shops.length > 0 && !shops.includes(selectedShop)) {
      setSelectedShop("all");
    }
  }, [shops, selectedShop]);

  const box: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
  };

  if (error) return <div style={box}>API error loading hourly.</div>;
  if (isLoading) return <div style={box}>Loading chart…</div>;

  const series =
    selectedShop === "all" ? sumAllShops(rows) : seriesForOneShop(rows, selectedShop);

  return (
    <div style={box}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>
            Revenue by hour (24h) {selectedShop === "all" ? "— All shops" : `— ${selectedShop}`}
          </h2>
          <div style={{ opacity: 0.7, fontSize: 13, marginTop: 6 }}>
            Points: {series.length} • Shops detected: {shops.length}
          </div>
        </div>

        <ShopFilter shops={shops} value={selectedShop} onChange={setSelectedShop} />
      </div>

      <div style={{ height: 320, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="bucket_start" tickFormatter={(v) => fmtHour(String(v))} />
            <YAxis />
            <Tooltip
              labelFormatter={(l) => new Date(String(l)).toLocaleString("fr-FR")}
              formatter={(v: any) => [Number(v ?? 0).toFixed(2), "revenue"]}
            />
            <Line type="monotone" dataKey="revenue" dot={false} isAnimationActive={false} />
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