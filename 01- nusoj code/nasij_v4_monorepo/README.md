# NASIJ v4 — المنصة الوطنية للنسيج الحضري
منصة ذكاء حضري (Urban Intelligence) بهيكل أحادي (Monorepo) يضم:
- **apps/web**: واجهة Next.js
- **services/api**: ‎NestJS API (RBAC/Keycloak-ready)
- **services/etl**: ‎FastAPI للخوارزميات المكانية (AHP/TOPSIS/DBSCAN، H3 لاحقًا)
- **infra**: ‏Docker Compose + مراقبة أساسية + Mosquitto + PostGIS + pgvector

> الهدف: تشغيل نسخة تطوير محلية سريعة، ثم التوسع لاحقًا نحو Terraform/ECS.

## التشغيل السريع
```bash
cp .env.example .env
docker compose up -d --build
# الواجهة: http://localhost:3000
# API:     http://localhost:4000
# ETL:     http://localhost:5000/docs
# DB:      postgresql://nasij:nasij@localhost:5432/nasij
# Grafana: http://localhost:3001 (admin/admin) — غيّرها لاحقًا
```
## المعمارية (مختصر)
- Traefik كعكس وكيل خفيف (اختياري في dev).
- PostGIS مع pgvector.
- Keycloak جاهز لكن غير مُفعّل افتراضيًا (لتسهيل بدء التطوير).
- Mosquitto MQTT كقناة إنترنت أشياء.
- Prometheus + Grafana أساسيان مع Dashboards تمهيدية.

## خرائط الطريق
- v4.1: تفعيل H3/Gi* + RBAC كامل + Story Studio.
- v4.2: Digital Twin لكل حي + Streaming Analytics.
- v4.3: Terraform/ECS + Secrets Manager + PDPL Audit.