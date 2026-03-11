import KPIs from "../components/KPIs";
import HourlyChart from "../components/HourlyChart";
import TopShops from "../components/TopShops";

export default function Home() {
  return (
    <main>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Real-time Analytics</h1>
          <p style={{ marginTop: 8, opacity: 0.8 }}>
            Kafka / Redpanda → Postgres → FastAPI → Next.js
          </p>
        </div>

        <div style={{ opacity: 0.8, fontSize: 13 }}>
          Auto-refresh: every 3s
        </div>
      </div>

      {/* KPIs */}
      <div style={{ marginTop: 20 }}>
        <KPIs />
      </div>

      {/* Chart */}
      <div style={{ marginTop: 20 }}>
        <HourlyChart />
      </div>

      {/* Top shops ranking */}
      <div style={{ marginTop: 20 }}>
        <TopShops />
      </div>
    </main>
  );
}