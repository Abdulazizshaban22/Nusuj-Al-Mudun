<div dir="rtl">

# عمارة النظام — System Architecture

وثيقة مرجعيّة كاملة لعمارة نُسُج من **الإصدار v8.0** (الإنتاجي الموحَّد)، مع الإشارة إلى الفروق التاريخية حين تكون مهمّة.

---

## 1. مخطّط طبقات المنظومة

```
┌─────────────────────────────────────────────────────────────────────┐
│                       طبقة المستخدم النهائي                          │
├─────────────────────────────────────────────────────────────────────┤
│  admin.nusuj.sa      │  citizen.nusuj.sa      │  api.nusuj.sa       │
│  Next.js Admin       │  Next.js PWA (مواطن)    │  REST + OGC + STAC  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                  ┌───────────────┼───────────────┐
                  │      Caddy / ALB              │
                  │   TLS + Path Routing + WAF    │
                  └───────────────┬───────────────┘
                                  │
┌─────────────────────────────────────────────────────────────────────┐
│                       طبقة الخدمات الخلفيّة                          │
├──────────────┬───────────────┬───────────────┬─────────────────────┤
│ Admin API    │  ETL/Analytics│  AI Twin      │  IoT Listener        │
│ NestJS :8088 │  FastAPI :9101│  Flask :9102  │  paho-mqtt :9200     │
├──────────────┴───────────────┴───────────────┴─────────────────────┤
│  Keycloak (OIDC + JWT JWKS) :8081  │  Nafath (SSO سعودي اختياري)   │
└──────────────────────────┬─────────────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────────────┐
│                     طبقة البيانات والخدمات الجانبية                  │
├──────────────┬───────────────┬───────────────┬─────────────────────┤
│ PostgreSQL   │  OSRM         │  Mosquitto    │  pg_tileserv         │
│ + PostGIS    │  Routing      │  MQTT Broker  │  Vector Tiles MVT    │
│ + pgvector   │  :5000        │  :1883        │  :7800               │
│ :5432        │               │               │                      │
├──────────────┴───────────────┴───────────────┴─────────────────────┤
│ S3 (CloudFront + OAC) — صور Open311 + Cloud-Optimized GeoTIFFs    │
└────────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼──────────────────────────────────┐
│                  طبقة الرَّصد (Observability)                         │
│  Prometheus :9090  │  Grafana :3001  │  Loki/Tempo (v5.4+)         │
└────────────────────────────────────────────────────────────────────┘
```

---

## 2. الخدمات بالتفصيل

### 2.1 Admin API — `services/api/`

**التقنية:** NestJS 10 + TypeScript + `pg` (PostgreSQL driver)
**المنفذ:** `8088`
**المسؤولية:** إدارة المستخدمين والأدوار، نقطة دخول الإدارة، Swagger.

**نقاط النهاية المفتاحيّة:**
| المسار | الوصف |
|---|---|
| `GET /health` | فحص الصحّة (يجب توسعته لفحص الـ DB أيضًا) |
| `GET /admin/version` | إصدار الـ API |
| `GET /admin/users` | قائمة المسؤولين |
| `POST /admin/users` | إنشاء/تحديث upsert |
| `PUT /admin/users/:id/role` | تعديل الدور (admin / viewer) |
| `GET /swagger` | توثيق OpenAPI |

**الأمن:** OIDC middleware (في v5.5+) يتحقّق من JWT الصادر من Keycloak. **(تنبيه: في النسخ القديمة v2.x النقاط مفتوحة بلا حراسة — انظر [`../security/AUDIT.md`](../security/AUDIT.md)).**

### 2.2 ETL/Analytics — `services/etl/`

**التقنية:** FastAPI + Uvicorn + NumPy + Pandas + scikit-learn + Shapely + psycopg + Prometheus client
**المنفذ:** `9101`
**المسؤولية:** كل العمليّات التحليليّة والمكانيّة.

**المجموعات الوظيفيّة:**

1. **جغرافي (Geo):**
   - `GET /geo/cells_with_indicators` — FeatureCollection لكل الخلايا مع المؤشرات.
   - `POST /upload/urban_cells` — رفع طبقات جديدة (GeoJSON → PostGIS).

2. **قرار متعدِّد المعايير:**
   - `POST /algo/ahp` — أوزان من مصفوفة مقارنة + نسبة اتساق (CR).
   - `POST /algo/topsis` — ترتيب البدائل بحسب القرب من المثالي.

3. **استشعار عن بُعد:**
   - `POST /rs/ndvi`, `/rs/evi`, `/rs/savi`, `/rs/ndwi` — مؤشرات نباتية ومائية.
   - `POST /rs/lst_bt` — درجة سطح الأرض من الباند الحراري.
   - `POST /rs/cva` — تحليل متّجه التغيُّر بين زمنين.

4. **مكاني إحصائي:**
   - `POST /algo/dbscan`, `/algo/iforest` — عنقدة وكشف شذوذ.
   - `GET /tools/gi_hotspots_geojson?metric=X` — Getis-Ord Gi* للبؤر.
   - `GET /tools/h3_aggregate?res=R&metric=X` — تجميع بسداسيات H3.
   - `POST /tools/moran_i` — استقلاليّة مكانيّة عامة.

5. **إمكانيّة الوصول:**
   - `POST /access/isochrone` — مضلّع zone من نقطة عبر OSRM.
   - `POST /tools/2sfca` — تحليل التَّدفُّق الطافي ثنائي الخطوة.
   - `POST /tools/gravity_access` — نموذج جاذبية مع تخميد.
   - `POST /tools/idw` — توليد سطح Inverse Distance Weighting.

6. **مؤشرات KPI:**
   - `GET /kpi/summary` — Fabric Index, Sprawl Risk, Harmony.
   - `GET /studio/scores?studio=X` — نقاط استديو محدَّد.
   - `GET /growth/hotspots` — فرص النموّ.

7. **محاكاة:**
   - `GET /sim/run?name=X&delta=0.1` — أحد السيناريوهات العشرة.

8. **معايير OGC / STAC:**
   - `GET /ogc/collections` — قائمة المجموعات.
   - `GET /ogc/collections/{id}/items?limit=100&offset=0` — استرجاع مرقَّم.
   - `GET /stac` + `GET /stac/collections` + `POST /stac/search` (v4.7+).

9. **سوق الأدوات:**
   - `GET /tools/catalog` — كتالوج الـ 100 أداة.
   - تحميل تلقائي للوحدات من `services/etl/tools/` عبر `register(app)`.

10. **مراقبة:**
    - `GET /metrics` — Prometheus exposition.

### 2.3 AI Twin — `services/ai-twin/` (في v6.0+)

**التقنية:** Python (Flask أو FastAPI) + NumPy + (إعداد PySAL مستقبلًا)
**المنفذ:** `9102` (متغيِّر حسب الإصدار)
**المسؤولية:** التنبُّؤ شبه الفوري واكتشاف الانحراف.

**نقاط النهاية:**
- `POST /ai/twin/ingest` — ابتلاع تدفُّق المؤشِّرات.
- `GET /ai/twin/nowcast?city=X` — تنبُّؤ آنيّ.
- `POST /st/gi_star` — Gi* المكاني–الزمني (موسَّع من Gi*).
- `POST /alerts/events/add` — حدث H3-مفهرس.

### 2.4 IoT Listener — `services/iot/`

**التقنية:** Python + paho-mqtt + psycopg + Prometheus client
**المنفذ:** `9200` (Prometheus metrics فقط)
**المسؤولية:** ابتلاع تدفُّقات MQTT وحفظها في PostgreSQL.

**التدفُّق:**
```
MQTT publish on "sensors/+/+"
    │
    ▼
on_message() → json.loads(payload)
    │
    ├── if has (lon, lat) → POINT(lon lat) PostGIS geom
    │
    ▼
INSERT INTO iot_events(topic, payload, geom)
    │
    ▼
Counter("iot_events_total") +1 → /metrics
```

**جدول الوجهة:**
```sql
CREATE TABLE iot_events(
  id SERIAL PRIMARY KEY,
  topic TEXT,
  payload JSONB,
  ts TIMESTAMP DEFAULT now(),
  geom geometry(Point, 4326)
);
```

### 2.5 الواجهات — `apps/web/` و `services/web-citizen/` و `services/web-admin/`

**التقنية:** Next.js 14 (App Router) + React 18 + Leaflet + react-leaflet + Tailwind (في v3-ui+) + Framer Motion
**المنافذ:** `3000` افتراضيًا
**Routes الرئيسية:**

| Route | الغرض | الحماية |
|---|---|---|
| `/` | الصفحة الرئيسية / تنقُّل | عام |
| `/map` | خريطة Choropleth بانحراف النسيج | عام |
| `/dashboard` | لوحة التحليلات الكاملة (metrics + Gi\* + H3) | عام |
| `/access` | استكشاف Isochrones بالنقر | عام |
| `/growth` | بؤر النموّ | عام |
| `/studios` | نقاط الاستديو حسب المجال | محمي (middleware) |
| `/simulations` | السيناريوهات العشرة | محمي |
| `/insights` | توليد تقارير AR/EN | عام |
| `/iot/live` | تجميع H3 آني (تحديث 8ث) | عام |
| `/admin` | إدارة المستخدمين والأدوار | محمي |

**Middleware:**
```typescript
// apps/web/middleware.ts
export { default } from "next-auth/middleware"
export const config = { 
  matcher: ["/admin/:path*", "/studios/:path*", "/simulations/:path*"] 
}
```

---

## 3. نموذج البيانات الجوهري

تفصيل كامل في [`../reference/DATA_MODEL.md`](../reference/DATA_MODEL.md). الجداول الأساسيّة:

### `urban_cells` — وحدات التحليل
```sql
CREATE TABLE urban_cells (
  id SERIAL PRIMARY KEY,
  name TEXT,
  city TEXT,                           -- v2.3+
  geom geometry(Polygon, 4326),
  access_15min BOOLEAN                 -- v2.3+ (للوحات Grafana)
);
CREATE INDEX idx_urban_cells_geom ON urban_cells USING GIST(geom);  -- يجب إضافته
```

### `fabric_indicators` — قياسات الجودة
```sql
CREATE TABLE fabric_indicators (
  id SERIAL PRIMARY KEY,
  cell_id INT REFERENCES urban_cells(id) ON DELETE CASCADE,
  efficiency NUMERIC CHECK (efficiency BETWEEN 0 AND 1),
  resilience NUMERIC CHECK (resilience BETWEEN 0 AND 1),
  connectivity NUMERIC CHECK (connectivity BETWEEN 0 AND 1),
  computed_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_fi_cell ON fabric_indicators(cell_id);
CREATE INDEX idx_fi_time ON fabric_indicators(computed_at DESC);
```

### `iot_events` — تدفُّق الحساسات
```sql
CREATE TABLE iot_events (
  id SERIAL PRIMARY KEY,
  topic TEXT,
  payload JSONB,
  ts TIMESTAMP DEFAULT now(),
  geom geometry(Point, 4326)
);
CREATE INDEX idx_iot_geom ON iot_events USING GIST(geom);     -- يجب إضافته
CREATE INDEX idx_iot_ts ON iot_events(ts DESC);                -- يجب إضافته
```

### `urban.h3_cells` — خلايا سداسيّة (v4+)
```sql
CREATE TABLE urban.h3_cells (
  id BIGSERIAL PRIMARY KEY,
  h3index TEXT UNIQUE,
  centroid geometry(Point, 4326),
  props JSONB DEFAULT '{}'::jsonb
);
```

### `urban.embeddings` — متّجهات AI (v4+)
```sql
CREATE TABLE urban.embeddings (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT,
  entity_id BIGINT,
  vector vector(384)                   -- pgvector
);
```

### `urban.citizen_reports` — بلاغات Open311
```sql
CREATE TABLE urban.citizen_reports (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT NOT NULL,                  -- خدمة Open311 (مثل pothole)
  geom geometry(Point, 4326) NOT NULL,
  props JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `admin_users` — المستخدمون
```sql
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('admin','analyst','municipality','citizen','viewer')) DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 4. الترابُط الإلكتروني — كيف تتحدّث الخدمات؟

### مسار «بلاغ مواطن» الكامل
```
1. مواطن → citizen.nusuj.sa/report (PWA)
2. تسجيل دخول عبر Keycloak/Nafath
3. POST /open311/requests إلى api.nusuj.sa
4. CDN يحفظ الصورة في S3 (presigned URL + OAC)
5. API يدخل السجلّ في urban.citizen_reports
6. ETL يقرأ دوريًّا → يحدِّث fabric_indicators
7. Prometheus يحصي الطلب
8. AI Twin يلاحظ الانحراف ويُصدر Alert
9. مدير يفتح admin.nusuj.sa/dashboard
10. يرى البؤرة الساخنة جديدة (Gi*)
```

### مسار «حسّاس IoT»
```
sensor → MQTT publish (sensors/aq-01/pm25)
   ↓
Mosquitto broker
   ↓
iot-listener (paho-mqtt subscribe)
   ↓
INSERT iot_events (geom from lon/lat)
   ↓
Prometheus counter +1
   ↓
ETL aggregation (cron / on-demand)
   ↓
Grafana / Web /iot/live (H3 hex layer)
```

### مسار «بناء عقاري»
```
مهندس → Revit + Nasij Addin (clients/revit_addin)
   ↓
POST /bim/ingest (IFC payload)
   ↓
BIM Gateway (services/bim_gateway)
   ↓
[خطّة مستقبلية] استخراج geometries → PostGIS
   ↓
Carto Studio (services/carto) → MapFish Print → PDF
   ↓
Cinematic Export (After Effects) → Video MP4
```

---

## 5. حدود الأمان (Trust Boundaries)

```
┌─────────── الإنترنت العام ───────────────┐
│                                          │
│  المواطن، المدير، الموظف الحكومي           │
│                                          │
└──────────────────┬───────────────────────┘
                   │ HTTPS only (TLS 1.2+, HSTS)
                   │
┌──────────────────▼───────────────────────┐
│         CloudFront + WAF (Global)         │
│         (managed rules + rate limit)      │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│            ALB + WAF (Regional)           │
└──────────────────┬───────────────────────┘
                   │ JWT يجب أن يكون موجودًا
                   │   (JWKS من Keycloak)
┌──────────────────▼───────────────────────┐
│    ECS Fargate Services (Private Subnet)  │
│    api / web-admin / web-citizen / etl    │
└──────────────────┬───────────────────────┘
                   │ Security Group: only services
                   │
┌──────────────────▼───────────────────────┐
│  RDS PostgreSQL (Private, SSL enforced)    │
│  S3 (OAC, no public access)                │
└───────────────────────────────────────────┘
```

تفاصيل الأمن وفجواته في [`../security/AUDIT.md`](../security/AUDIT.md).

---

## 6. تطوُّر العمارة عبر الإصدارات

| الإصدار | تغيير معماري جوهري |
|---|---|
| v1.0 | الأساس: Monorepo بـ NestJS + FastAPI + Next.js + PostGIS |
| v1.2 | إضافة OSRM للتوجيه؛ تحوُّل geom من Geography إلى geometry (انحدار في الدقّة) |
| v2.1 | إضافة Keycloak و 10 استديوهات |
| v2.2 | إضافة MQTT/IoT pipeline |
| v2.3 | إضافة H3 + Gi* + 100 أداة + Grafana dashboards |
| v3.1-pro | إضافة BIM + Revit Addin + Carto + Cinematic Export + Marketplace |
| v4.x | Postgres 16 + pgvector + إعادة الهيكلة |
| v4.7 | تبنّي OGC/STAC + Express.js (بديل NestJS مؤقَّت) + CQL2 |
| v5.3 | إضافة PWA المواطن + Open311 multipart upload |
| v5.4 | S3 presigned URLs + Web Push (VAPID) + Helmet + Loki/Tempo |
| v5.5 | OIDC middleware كامل + Nafath SSO |
| v6.0 | خدمة AI Twin (Moran + Nowcast) |
| v7.0 | موصلات GASTAT/Balady/STAC |
| v7.5 | CloudFront + WAF + Keycloak realm prod |
| v7.6 | ECS Fargate template كامل (4 خدمات خلف ALB) |
| v7.7 | سكربتات go-live (bootstrap-keycloak.sh, seed-kpis.sh...) |
| v8.0 | الإصدار الموحَّد الإنتاجي |

السجلّ التفصيلي في [`../versions/TIMELINE.md`](../versions/TIMELINE.md).

---

## 7. القرارات المعماريّة المهمَّة (ADRs مختصرة)

### ADR-1: لماذا polyglot (TS + Python)؟
- TypeScript للـ API بسبب نمذجة البيانات الصارمة وأدوات OpenAPI.
- Python للـ ETL بسبب نضج النظام البيئي (NumPy, scikit-learn, Shapely, PySAL).

### ADR-2: لماذا PostGIS وليس مخزن مكاني سحابي مُدار؟
- التحكُّم الكامل في الفهارس المكانيّة.
- pgvector على نفس الإنستانس لتقليل التنقُّل.
- التشغيل البرّي ممكن إن طلبت جهة حكومية.

### ADR-3: لماذا H3 وليس S2 أو QuadTree؟
- شكل سداسيّ ثابت الجوار (6 جيران) — أنسب لتحليل العنقدة.
- مكتبات h3-py و h3-js ناضجة.
- أوبر تستخدمه بنجاح في مقياس عالمي.

### ADR-4: لماذا Keycloak وليس Cognito أو Auth0؟
- مفتوح المصدر — لا قفل تجاري.
- يدعم OIDC + SAML + Nafath (federation).
- قابل للنشر السيادي (sovereign cloud) مطلوب حكوميًا.

### ADR-5: لماذا OSRM وليس Google Directions؟
- لا تكلفة لكل استدعاء.
- بيانات OSM محدَّثة يوميًا.
- قابل للتشغيل البرّي.

### ADR-6: لماذا MQTT وليس Kafka أو AWS IoT Core؟
- Mosquitto خفيف يكفي للحجم الحالي.
- TLS + ACL ممكن (يجب تفعيله — انظر AUDIT).
- مسار التَّرقّي إلى Kafka واضح حين يكبر الحجم.

### ADR-7: لماذا STAC وليس قاعدة بيانات أصول مخصَّصة؟
- معيار مفتوح، تشغيل بيني مع كل أدوات Geo الحديثة.
- يدعم Cloud-Optimized GeoTIFFs على S3.
- مجتمع نشط ومكتبات للقراءة في Python/JS.

### ADR-8: لماذا Caddy/ALB متعدِّدة وليس فقط ALB؟
- Caddy للتشغيل المحلي/التجريبي (TLS تلقائي عبر ACME).
- ALB للإنتاج السحابي (مع WAF + Host routing).

</div>
