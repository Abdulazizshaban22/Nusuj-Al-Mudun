# NASIJ — Smart Urban Fabric Engine (Monorepo v1.1)

This release adds **real algorithms & dashboards**:
- AHP (weights + Consistency Ratio)
- TOPSIS (scores + ranking)
- DBSCAN (clustering) & IsolationForest (outliers)
- NDVI (remote sensing) & LST (brightness temperature)
- Prometheus metrics per endpoint
- Grafana provisioning (datasource + dashboard)
- PostGIS import notes + pg_tileserv wiring
- OSRM PBF URL validation

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
- ETL: http://localhost:9101 (algorithms under /algo/*, /rs/*)
- ETL Metrics: http://localhost:9101/metrics
- PostGIS: localhost:5432
- pg_tileserv: http://localhost:7800
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)
- OSRM: http://localhost:5000

See `docs/POSTGIS_LAYERS.md` and `docs/OSRM.md`.
