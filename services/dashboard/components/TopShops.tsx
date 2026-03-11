"use client";

import useSWR from "swr";
import React from "react";

type HourlyRow = {
  bucket_start: string;
  shop_id: string;
  revenue: number;
  orders: number;
  items: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatMoney(v: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(v);
}

export default function TopShops() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const { data, isLoading, error } = useSWR<HourlyRow[]>(
    `${base}/hourly?hours=24`,
    fetcher,
    { refreshInterval: 3000 }
  );

  const rows = data ?? [];

  const revenueByShop: Record<string, number> = {};

  for (const r of rows) {
    revenueByShop[r.shop_id] =
      (revenueByShop[r.shop_id] || 0) + (r.revenue ?? 0);
  }

  const ranking = Object.entries(revenueByShop)
    .map(([shop, revenue]) => ({ shop, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const box: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
  };

  if (error) return <div style={box}>API error loading ranking.</div>;
  if (isLoading) return <div style={box}>Loading ranking…</div>;

  return (
    <div style={box}>
      <h2 style={{ margin: 0, fontSize: 18 }}>Top shops (24h)</h2>

      <div style={{ marginTop: 12 }}>
        {ranking.map((r, i) => (
          <div
            key={r.shop}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span>
              {i + 1}. {r.shop}
            </span>
            <span>{formatMoney(r.revenue)}</span>
          </div>
        ))}

        {ranking.length === 0 && (
          <div style={{ opacity: 0.7 }}>No data yet.</div>
        )}
      </div>
    </div>
  );
}