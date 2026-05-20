
# NASIJ v2 — Go‑Live Pack

This monorepo contains:
- **apps/web** (Next.js App Router) — dashboards, map, access, growth, admin
- **services/etl** (FastAPI) — AI/RS algorithms, OGC Features Core, OSRM, KPI
- **services/api** (NestJS) — admin API, Swagger, gateways
- **services/iot** — MQTT broker (Mosquitto) + listener (Python) -> PostGIS + Prometheus
- **infra/** — docker compose, PostGIS schema, Grafana provisioning, Keycloak, Caddy (TLS reverse proxy)

Follow `infra/QUICKSTART.md` to run end‑to‑end.
