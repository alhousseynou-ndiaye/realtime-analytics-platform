from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from .db import get_db
from .schemas import KPIs, ShopHourly

app = FastAPI(title="Real-Time Analytics API", version="0.1.0")

@app.get("/health")
def health():
  return {"ok": True}

@app.get("/kpis", response_model=KPIs)
def kpis(
  hours: int = Query(24, ge=1, le=168),
  db: Session = Depends(get_db),
):
  to_ts = datetime.now(timezone.utc)
  from_ts = to_ts - timedelta(hours=hours)

  row = db.execute(
    text("""
      SELECT
        COALESCE(SUM(qty * unit_price), 0)::float AS revenue,
        COUNT(*)::int AS orders,
        COALESCE(SUM(qty), 0)::int AS items
      FROM events_raw
      WHERE event_time >= :from_ts AND event_time < :to_ts
    """),
    {"from_ts": from_ts, "to_ts": to_ts}
  ).mappings().one()

  return KPIs(from_ts=from_ts, to_ts=to_ts, **row)

@app.get("/hourly", response_model=list[ShopHourly])
def hourly(
  hours: int = Query(24, ge=1, le=168),
  shop_id: str | None = None,
  db: Session = Depends(get_db),
):
  to_ts = datetime.now(timezone.utc)
  from_ts = to_ts - timedelta(hours=hours)

  q = """
    SELECT bucket_start, shop_id, revenue::float, orders, items
    FROM agg_sales_hourly
    WHERE bucket_start >= :from_ts AND bucket_start < :to_ts
  """
  params = {"from_ts": from_ts.replace(minute=0, second=0, microsecond=0), "to_ts": to_ts}

  if shop_id:
    q += " AND shop_id = :shop_id"
    params["shop_id"] = shop_id

  q += " ORDER BY bucket_start ASC, shop_id ASC"

  rows = db.execute(text(q), params).mappings().all()
  return [ShopHourly(**r) for r in rows]