
# NASIJ v2.3 — Hot/Cold (Gi*), H3 Grid, 100-metric Picker, Grafana KPIs

## What's new
- ETL `/tools/gi_hotspots_geojson` (Gi* z-scores + classes) and `/tools/h3_aggregate` (H3 hex bins).
- Dashboard updated to toggle Gi* and H3 layers + pick any metric from the 100-tool catalog.
- Grafana provisioning: Postgres datasource + `fabric_city.json` dashboard.
- Multi-city OSRM build script `scripts/osrm_batch.sh`.

## How to run
1) `docker compose up -d --build`
2) Init DB (first time): `docker compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB -f /sql/schema.sql`
3) Import your city layers to `urban_cells` (see README).
4) Open `http://localhost:3000/dashboard` and toggle Gi*/H3.
5) (Optional) Run `scripts/osrm_batch.sh` to bake OSRM for multiple cities.

## Notes
- Ensure ETL image installs `h3` (requirements.txt already updated).
- Grafana will auto-pick the datasource and dashboards on first run.
