"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatMoneyEUR(v: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v || 0);
}

export default function KPIs() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { data, isLoading, error } = useSWR(`${base}/kpis?hours=24`, fetcher, {
    refreshInterval: 3000,
  });

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
    minHeight: 88,
  };

  if (error) {
    return <div style={cardStyle}>API error. Check NEXT_PUBLIC_API_URL / CORS.</div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
      <div style={cardStyle}>
        <div style={{ opacity: 0.75, fontSize: 13 }}>Revenue (24h)</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>
          {isLoading ? "…" : formatMoneyEUR(data?.revenue)}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ opacity: 0.75, fontSize: 13 }}>Orders (24h)</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>
          {isLoading ? "…" : (data?.orders ?? 0)}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ opacity: 0.75, fontSize: 13 }}>Items sold (24h)</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>
          {isLoading ? "…" : (data?.items ?? 0)}
        </div>
      </div>
    </div>
  );
}