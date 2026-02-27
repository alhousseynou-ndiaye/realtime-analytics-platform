# Real-Time Analytics Platform (Kafka/Redpanda + Postgres + FastAPI)

End-to-end data engineering mini-platform:
- Producer generates sales events
- Consumer ingests from Kafka (Redpanda) into Postgres (raw + hourly aggregates)
- FastAPI exposes analytics endpoints

## Architecture

- Producer → Kafka (Redpanda)
- Consumer → PostgreSQL (raw + aggregates)
- FastAPI → Analytics API
- (Next.js → Dashboard à venir)

## Tech Stack

- Kafka / Redpanda
- PostgreSQL
- FastAPI
- Docker / Docker Compose

## Use Case

Simulates a real-time retail analytics system:
- Track sales in real-time
- Compute KPIs (revenue, orders)
- Aggregate hourly performance per shop

## Run
```bash
docker compose up --build