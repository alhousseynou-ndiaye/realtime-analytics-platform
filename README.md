# Real-Time Analytics Platform (Kafka/Redpanda + Postgres + FastAPI)

End-to-end data engineering mini-platform:
- Producer generates sales events
- Consumer ingests from Kafka (Redpanda) into Postgres (raw + hourly aggregates)
- FastAPI exposes analytics endpoints

## Architecture
Producer -> Redpanda(topic) -> Consumer -> Postgres (events_raw + agg_sales_hourly) -> FastAPI

## Run
```bash
docker compose up --build