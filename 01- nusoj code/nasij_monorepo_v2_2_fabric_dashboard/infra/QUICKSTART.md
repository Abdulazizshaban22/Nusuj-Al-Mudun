
# Quickstart (Local)

```bash
cp ../.env.example ../.env
docker compose up -d --build

# DB schema + sample
docker compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB -f /sql/schema.sql
docker compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB -f /sql/seed_sample.sql
```

Open:
- Web http://localhost:3000
- ETL http://localhost:9101/docs  (OpenAPI)
- Admin API Swagger http://localhost:8088/swagger
- Grafana http://localhost:3001  (admin/admin)
- Prometheus http://localhost:9090
- OSRM http://localhost:5000
- pg_tileserv http://localhost:7800
- Keycloak http://localhost:8081

## MQTT test
Publish:
```
docker compose exec mosquitto sh -c "apk add --no-cache mosquitto-clients && mosquitto_pub -h mosquitto -t sensors/env/air -m '{"lon":46.7,"lat":24.7,"pm25":20}'"
```
The listener will write into `iot_events` and expose metrics on :9200.
