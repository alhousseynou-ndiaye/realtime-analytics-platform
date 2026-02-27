import json, os, random, time
from datetime import datetime, timezone
from kafka import KafkaProducer
from pydantic import BaseModel

BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
TOPIC = os.getenv("TOPIC", "sales_events")

CITIES = ["Paris", "Lyon", "Marseille", "Toulouse", "Lille"]
PAYMENTS = ["card", "cash", "wallet"]
SHOPS = ["shop_001", "shop_002", "shop_003"]
PRODUCTS = [f"p_{i:03d}" for i in range(1, 51)]

class SalesEvent(BaseModel):
  event_time: str
  shop_id: str
  product_id: str
  qty: int
  unit_price: float
  currency: str = "EUR"
  payment_method: str
  city: str

producer = KafkaProducer(
  bootstrap_servers=BOOTSTRAP,
  value_serializer=lambda v: json.dumps(v).encode("utf-8"),
  linger_ms=50,
)

def make_event() -> dict:
  e = SalesEvent(
    event_time=datetime.now(timezone.utc).isoformat(),
    shop_id=random.choice(SHOPS),
    product_id=random.choice(PRODUCTS),
    qty=random.randint(1, 5),
    unit_price=round(random.uniform(1.5, 120.0), 2),
    payment_method=random.choice(PAYMENTS),
    city=random.choice(CITIES),
  )
  return e.model_dump()

if __name__ == "__main__":
  print(f"[producer] bootstrap={BOOTSTRAP} topic={TOPIC}")
  while True:
    evt = make_event()
    producer.send(TOPIC, evt)
    print("[producer] sent", evt)
    time.sleep(0.3)