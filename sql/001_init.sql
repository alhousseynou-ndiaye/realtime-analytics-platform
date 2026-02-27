CREATE TABLE IF NOT EXISTS events_raw (
  id BIGSERIAL PRIMARY KEY,
  event_time TIMESTAMPTZ NOT NULL,
  shop_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  qty INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  city TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_time ON events_raw(event_time);
CREATE INDEX IF NOT EXISTS idx_events_shop_time ON events_raw(shop_id, event_time);

-- Une table d'agrégats simple (par heure et par shop)
CREATE TABLE IF NOT EXISTS agg_sales_hourly (
  bucket_start TIMESTAMPTZ NOT NULL,
  shop_id TEXT NOT NULL,
  revenue NUMERIC(14,2) NOT NULL,
  orders INT NOT NULL,
  items INT NOT NULL,
  PRIMARY KEY (bucket_start, shop_id)
);