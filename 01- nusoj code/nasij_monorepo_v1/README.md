# NASIJ — Smart Urban Fabric Engine (Monorepo v1)

This is a production-ready starter for NASIJ composed of:
- **apps/web** (Next.js 14 App Router) — UI & dashboards
- **services/api** (NestJS) — Fabric API
- **services/etl** (FastAPI) — data ingestion & metrics
- **infra** — Docker Compose + PostGIS + pg_tileserv + OSRM + Prometheus + Grafana
- **engines** — stubs for 10 engines (TypeScript/Python mix, extensible)

## Quickstart (Dev)
```bash
cp .env.example .env
docker compose -f infra/docker-compose.yml up -d --build
# Initialize DB schema & sample:
docker compose -f infra/docker-compose.yml exec db psql -U $POSTGRES_USER -d $POSTGRES_DB -f /sql/schema.sql
docker compose -f infra/docker-compose.yml exec db psql -U $POSTGRES_USER -d $POSTGRES_DB -f /sql/seed_sample.sql
```
Services:
- Web: http://localhost:3000
- API: http://localhost:8088/health
- ETL Metrics: http://localhost:9101/metrics
- PostGIS: localhost:5432
- pg_tileserv: http://localhost:7800
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)
- OSRM: http://localhost:5000

> OSRM downloads an extract using `OSRM_PBF_URL` by default. Change it in `.env` to your region.
