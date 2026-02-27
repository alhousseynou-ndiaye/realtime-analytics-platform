import json, os, time
import psycopg2
from kafka import KafkaConsumer
from dateutil.parser import isoparse

BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
TOPIC = os.getenv("TOPIC", "sales_events")
DBURL = os.getenv("DATABASE_URL", "postgresql://app:app@localhost:5432/analytics")

def connect_db(retries=30):
  for i in range(retries):
    try:
      conn = psycopg2.connect(DBURL)
      conn.autocommit = True
      return conn
    except Exception as e:
      print(f"[consumer] db not ready ({i+1}/{retries}) {e}")
      time.sleep(1)
  raise RuntimeError("DB not ready")

def hour_bucket(dt):
  return dt.replace(minute=0, second=0, microsecond=0)

if __name__ == "__main__":
  print(f"[consumer] bootstrap={BOOTSTRAP} topic={TOPIC} db={DBURL}")
  conn = connect_db()
  cur = conn.cursor()

  consumer = KafkaConsumer(
    TOPIC,
    bootstrap_servers=BOOTSTRAP,
    auto_offset_reset="earliest",
    enable_auto_commit=True,
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    group_id="sales-consumer",
  )

  for msg in consumer:
    e = msg.value
    dt = isoparse(e["event_time"])
    bucket = hour_bucket(dt)

    qty = int(e["qty"])
    price = float(e["unit_price"])
    revenue = qty * price

    # raw insert
    cur.execute(
      """
      INSERT INTO events_raw(event_time, shop_id, product_id, qty, unit_price, currency, payment_method, city)
      VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
      """,
      (dt, e["shop_id"], e["product_id"], qty, price, e["currency"], e["payment_method"], e["city"]),
    )

    # hourly upsert
    cur.execute(
      """
      INSERT INTO agg_sales_hourly(bucket_start, shop_id, revenue, orders, items)
      VALUES (%s,%s,%s,1,%s)
      ON CONFLICT (bucket_start, shop_id)
      DO UPDATE SET
        revenue = agg_sales_hourly.revenue + EXCLUDED.revenue,
        orders  = agg_sales_hourly.orders  + 1,
        items   = agg_sales_hourly.items   + EXCLUDED.items
      """,
      (bucket, e["shop_id"], revenue, qty),
    )

    print("[consumer] stored event + updated agg", e["shop_id"], bucket.isoformat(), f"+{revenue:.2f}")