<div dir="rtl">

# نموذج البيانات الكامل

> **الجداول، العلاقات، الفهارس، والمحاذير لكل ما يُخزَّن في نُسُج.**

---

## 1. خريطة الجداول

```
┌────────────────────────────────────────────────────┐
│  schema: public  (التراث: v1–v3)                    │
├────────────────────────────────────────────────────┤
│  urban_cells          (المضلَّعات الإداريّة)            │
│  fabric_indicators    (المؤشِّرات لكل خلية)            │
│  iot_events           (تدفُّق MQTT)                   │
│  admin_users          (الإدارة)                       │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  schema: urban  (v4+)                               │
├────────────────────────────────────────────────────┤
│  urban.h3_cells       (خلايا H3)                     │
│  urban.embeddings     (متّجهات AI 384-dim)            │
│  urban.citizen_reports (Open311)                     │
└────────────────────────────────────────────────────┘
```

---

## 2. الجداول التفصيليّة

### 2.1 `urban_cells` — وحدات التحليل المكاني

```sql
CREATE TABLE urban_cells (
  id           SERIAL PRIMARY KEY,
  name         TEXT,
  city         TEXT,                              -- أُضيف في v2.3 للوحات متعدِّدة المدن
  geom         geometry(Polygon, 4326),           -- WGS84 planar (انتبه!)
  access_15min BOOLEAN,                           -- v2.3+ لِما إذا كانت ضمن 15-min city
  created_at   TIMESTAMP DEFAULT now()
);

-- الفهارس المطلوبة (يجب إضافتها):
CREATE INDEX idx_urban_cells_geom ON urban_cells USING GIST(geom);
CREATE INDEX idx_urban_cells_city ON urban_cells(city);
```

**ملاحظات:**
- النوع `geometry(Polygon, 4326)` **مسطَّح** — يؤدي إلى أخطاء 10–15% في حساب المسافات عند الرياض. النوع الأنسب جيومتريًّا هو `geography(Polygon, 4326)` لكن أبطأ. الحلّ: أضف عمودًا projected `geom_3857`.
- لا CHECK constraint على هندسة الـ polygon — يقبل أيّ شكل مغلق.
- لا CASCADE في FK من `fabric_indicators` — حذف خلية يفشل لو لها مؤشِّرات.

### 2.2 `fabric_indicators` — قياسات الجودة

```sql
CREATE TABLE fabric_indicators (
  id           SERIAL PRIMARY KEY,
  cell_id      INT REFERENCES urban_cells(id) ON DELETE CASCADE,
  efficiency   NUMERIC CHECK (efficiency   BETWEEN 0 AND 1),
  resilience   NUMERIC CHECK (resilience   BETWEEN 0 AND 1),
  connectivity NUMERIC CHECK (connectivity BETWEEN 0 AND 1),
  computed_at  TIMESTAMP DEFAULT now()
);

-- الفهارس المقترَحة:
CREATE INDEX idx_fi_cell    ON fabric_indicators(cell_id);
CREATE INDEX idx_fi_time    ON fabric_indicators(computed_at DESC);
CREATE INDEX idx_fi_cell_t  ON fabric_indicators(cell_id, computed_at DESC);
```

**تنبيهات تنفيذيّة:**
- في الإصدارات التراثيّة (v1, v2): لا توجد CHECK constraints. **يجب إضافتها**.
- ل وقت السلسلة: عدد الـ rows في `fabric_indicators` ينمو مع الوقت. **ضع retention policy** أو تحوَّل إلى TimescaleDB.

**كيف تُحسَب القيم؟**
> **في كل الإصدارات الحالية، القيم تُحقن يدويًّا أو من Seed Data، لا تُحسَب من IoT تلقائيًّا.** هذا أحد أبرز deficits التي يجب معالجتها.

التصوُّر المخطَّط:
```
iot_events (تدفُّق حسّاسات)
     │
     ▼
ETL aggregation jobs (e.g., كل ساعة)
     │
     ▼
حساب efficiency, resilience, connectivity لكل cell
     │
     ▼
INSERT INTO fabric_indicators (cell_id, eff, res, con, computed_at)
```

### 2.3 `iot_events` — تدفُّق MQTT

```sql
CREATE TABLE iot_events (
  id      SERIAL PRIMARY KEY,
  topic   TEXT,
  payload JSONB,
  ts      TIMESTAMP DEFAULT now(),
  geom    geometry(Point, 4326)
);

-- الفهارس المطلوبة (مفقودة في كل النسخ):
CREATE INDEX idx_iot_geom ON iot_events USING GIST(geom);
CREATE INDEX idx_iot_ts   ON iot_events(ts DESC);
CREATE INDEX idx_iot_topic ON iot_events(topic);

-- التقسيم المُقترَح (Partitioning بالشهر):
ALTER TABLE iot_events 
  PARTITION BY RANGE (ts);
CREATE TABLE iot_events_2026_05 PARTITION OF iot_events
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
```

**أمثلة `payload` JSONB:**
```json
// sensor: pm25
{
  "lon": 46.6753,
  "lat": 24.7136,
  "device_id": "aq-01",
  "pm25": 35,
  "ts": "2026-05-20T14:30:00Z"
}

// sensor: traffic
{
  "lon": 46.7,
  "lat": 24.8,
  "device_id": "loop-12",
  "vehicles_per_min": 45,
  "ts": "..."
}
```

**تنبيهات:**
- لا index على `payload->>'device_id'` — استعلامات حسب الجهاز بطيئة.
- لا حدّ أعلى لحجم `payload` — قد يستهلك ذاكرة كثيرة (انظر SEC-H-05).

### 2.4 `admin_users` — المسؤولون

```sql
CREATE TABLE admin_users (
  id         SERIAL PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  role       TEXT CHECK (role IN ('admin','analyst','municipality','citizen','viewer')) 
                  DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT now()
);
```

**ملاحظات:**
- لا hashed password — المصادقة كلها عبر Keycloak.
- ال `role` يجب أن يكون enum (في النسخ التراثيّة لا CHECK — انظر SEC-H-04).

### 2.5 `urban.h3_cells` — خلايا H3 (v4+)

```sql
CREATE SCHEMA urban;

CREATE TABLE urban.h3_cells (
  id       BIGSERIAL PRIMARY KEY,
  h3index  TEXT UNIQUE,                         -- مثل '8841a072d3fffff'
  centroid geometry(Point, 4326),
  props    JSONB DEFAULT '{}'::jsonb            -- خصائص مرنة
);

CREATE INDEX idx_h3_centroid ON urban.h3_cells USING GIST(centroid);
CREATE INDEX idx_h3_props_gin ON urban.h3_cells USING GIN(props);
```

**استخدام:**
- يُملأ من ETL عبر `h3.geo_to_h3(lat, lon, res=8)`.
- `props` يحفظ مؤشِّرات مجمَّعة عند هذه الـ res.

### 2.6 `urban.embeddings` — متّجهات AI

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE urban.embeddings (
  id          BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,                    -- 'cell', 'report', 'permit'
  entity_id   BIGINT NOT NULL,
  vector      vector(384),                      -- pgvector 384-dim
  created_at  TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_emb_entity ON urban.embeddings(entity_type, entity_id);
CREATE INDEX idx_emb_vec ON urban.embeddings 
  USING ivfflat (vector vector_cosine_ops) WITH (lists = 100);
```

**ملاحظات:**
- 384 = حجم متّجه `sentence-transformers/multilingual-e5-small` (الأنسب للعربية).
- يُمكن استبداله بـ 1536 لمتجهات OpenAI embedding-3-small (إذا توفَّر مزوِّد سيادي).
- `ivfflat` index يتطلَّب `lists ≈ √rows`.

### 2.7 `urban.citizen_reports` — بلاغات Open311

```sql
CREATE TABLE urban.citizen_reports (
  id         BIGSERIAL PRIMARY KEY,
  kind       TEXT NOT NULL,                     -- service_code (e.g., 'pothole')
  geom       geometry(Point, 4326) NOT NULL,
  props      JSONB,                             -- description, photo_url, citizen_id (مُشفَّر)
  created_at TIMESTAMPTZ DEFAULT now(),
  status     TEXT DEFAULT 'open'                -- open|acknowledged|in_progress|closed
);

CREATE INDEX idx_cr_geom ON urban.citizen_reports USING GIST(geom);
CREATE INDEX idx_cr_kind_status ON urban.citizen_reports(kind, status);
CREATE INDEX idx_cr_created ON urban.citizen_reports(created_at DESC);
```

**PDPL:**
- `citizen_id` (الهويّة الوطنيّة) يجب أن يُشفَّر باستخدام `pgcrypto` أو يُخزَّن عبر hashing.
- جدول `audit_log` منفصل يُسجِّل من قرأ كل تقرير.

---

## 3. العلاقات

```
              ┌─────────────────┐
              │   admin_users   │
              └─────────────────┘

              ┌─────────────────┐
              │   urban_cells   │◄──────────┐
              └─────────────────┘            │
                       │                     │ FK ON DELETE CASCADE
                       │ 1                   │
                       ▼ *                   │
              ┌──────────────────┐           │
              │ fabric_indicators│───────────┘
              └──────────────────┘

              ┌─────────────────┐
              │   iot_events    │  (لا FK — مستقل، لكن يُمكن ربطه بـ urban_cells عبر geom)
              └─────────────────┘

              ┌─────────────────┐
              │ urban.h3_cells  │
              └─────────────────┘
                       │
                       ▼ via props.cell_id (logical link)
              ┌─────────────────┐
              │   urban_cells   │
              └─────────────────┘

              ┌─────────────────────┐         ┌─────────────────┐
              │ urban.citizen_reports│         │ urban.embeddings │
              └─────────────────────┘         └─────────────────┘
                                                       │
                                                       │ entity_id (loose link)
                                                       ▼
                                              ┌─────────────────┐
                                              │ Any entity      │
                                              └─────────────────┘
```

---

## 4. الـ Extensions المطلوبة

```sql
CREATE EXTENSION IF NOT EXISTS postgis;          -- جوهري
CREATE EXTENSION IF NOT EXISTS postgis_raster;   -- v4+ للصور الجغرافية
CREATE EXTENSION IF NOT EXISTS vector;           -- v4+ لـ AI embeddings
CREATE EXTENSION IF NOT EXISTS pgcrypto;         -- يجب إضافته لـ PDPL
CREATE EXTENSION IF NOT EXISTS pg_trgm;          -- يُنصَح به للبحث النصّي العربي
```

---

## 5. حجم البيانات المتوقَّع (على 100 ألف مواطن)

| الجدول | حجم سجلّ | عدد سجلَّات/يوم | حجم سنوي |
|---|---|---|---|
| `urban_cells` | ~1 KB | ~5 (تعديلات) | ~2 MB |
| `fabric_indicators` | ~200 B | ~5,000 (لكل خلية كل ساعة) | ~360 GB |
| `iot_events` | ~500 B (مع payload صغير) | ~1M | ~180 GB |
| `urban.citizen_reports` | ~2 KB (مع image URLs) | ~500 | ~365 MB |
| `urban.embeddings` | ~3 KB (vector + meta) | ~50 | ~55 MB |

**خلاصة:** بدون استراتيجية retention، الـ DB ينمو **~500 GB/سنة**. يجب:
1. Partition `iot_events` و `fabric_indicators` بالشهر.
2. Cold storage بعد 6 أشهر (S3 + Athena).
3. Aggregated rollups (hourly/daily) للقيم القديمة.

---

## 6. سياسة النسخ الاحتياطي المُقترَحة

```bash
# يومي: pg_dump كامل إلى S3
0 2 * * * pg_dump -h localhost -U nasij -d nasij | gzip > /backups/nusuj-$(date +\%F).sql.gz && \
  aws s3 cp /backups/nusuj-$(date +\%F).sql.gz s3://nusuj-backups/db/

# كل 15 دقيقة: WAL archiving
archive_command = 'aws s3 cp %p s3://nusuj-backups/wal/%f'

# سياسة الاحتفاظ:
# - يوميًا: 7 أيام
# - أسبوعيًا: 4 أسابيع
# - شهريًا: 12 شهر
# - سنويًا: 7 سنوات (PDPL retention)
```

---

## 7. نموذج البيانات لخدمة AI Twin (لاحقًا)

```sql
-- جدول مقترَح للتنبُّؤات (لم يُنشأ بعد):
CREATE TABLE urban.twin_predictions (
  id          BIGSERIAL PRIMARY KEY,
  city        TEXT NOT NULL,
  kpi         TEXT NOT NULL,                    -- 'fabric_index' | 'sprawl_risk' | 'harmony'
  predicted_value NUMERIC,
  ci_low      NUMERIC,
  ci_high     NUMERIC,
  horizon_minutes INT,                          -- 60 = nowcast ساعة
  predicted_for TIMESTAMPTZ,
  computed_at TIMESTAMPTZ DEFAULT now(),
  model_version TEXT
);

CREATE INDEX idx_twin_city_kpi_for ON urban.twin_predictions(city, kpi, predicted_for DESC);
```

---

## 8. نموذج البيانات لـ Audit Log (لـ PDPL)

```sql
CREATE TABLE urban.audit_log (
  id          BIGSERIAL PRIMARY KEY,
  ts          TIMESTAMPTZ DEFAULT now(),
  user_email  TEXT,
  user_role   TEXT,
  action      TEXT,                             -- 'read' | 'create' | 'update' | 'delete'
  entity_type TEXT,                             -- 'citizen_report' | 'admin_user' | ...
  entity_id   BIGINT,
  details     JSONB,                            -- IP, user_agent, query_params
  source_ip   INET
);

CREATE INDEX idx_audit_ts ON urban.audit_log(ts DESC);
CREATE INDEX idx_audit_user ON urban.audit_log(user_email);
CREATE INDEX idx_audit_entity ON urban.audit_log(entity_type, entity_id);
```

كل READ على `urban.citizen_reports` يجب أن يُسجِّل صفًّا هنا.

---

## 9. سكريبت Migration الموحَّد (مقترَح)

اعتمد **Flyway** أو **Alembic** بترتيب ملفّات:

```
migrations/
├── V001__initial_schema.sql        # urban_cells, fabric_indicators
├── V002__iot_events.sql            # iot_events table + indexes
├── V003__admin_users.sql           # admin_users
├── V004__h3_cells.sql              # urban.h3_cells (v4+)
├── V005__embeddings.sql            # urban.embeddings + pgvector
├── V006__citizen_reports.sql       # urban.citizen_reports + audit_log
├── V007__add_check_constraints.sql # ضبط CHECK على efficiency, resilience, connectivity
├── V008__add_missing_indexes.sql   # كل الفهارس المفقودة
├── V009__partitioning.sql          # تقسيم iot_events بالشهر
└── V010__pdpl_audit_log.sql        # جدول التدقيق
```

**فائدة:** كل النشرات تستخدم نفس السكريبت، ولا تُفقَد بيانات في prod.

---

## 10. خرائط البيانات (للحوكمة)

اعتمد **Data Catalog** خارجي (DataHub, Amundsen, OpenMetadata) لتسجيل:
- مصدر كل عمود.
- التصنيف (PII, anonymized, public).
- المُلاك والمسؤولون.
- سياسة الوصول.

</div>
