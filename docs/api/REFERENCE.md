<div dir="rtl">

# مرجع API الكامل

> **مرجع موحَّد لكل نقاط النهاية في خدمات نُسُج. مرتَّب حسب الخدمة، مع أمثلة طلب/استجابة لكل نقطة جوهرية.**

---

## 1. خرائط الخدمات والمنافذ

| الخدمة | المنفذ المحلِّي | البروتوكول | السكِيمة |
|---|---|---|---|
| Admin API | 8088 | HTTP/REST | NestJS |
| ETL/Analytics | 9101 | HTTP/REST | FastAPI |
| AI Twin (v6+) | 9102 | HTTP/REST | Flask/FastAPI |
| IoT Listener metrics | 9200 | HTTP/Prometheus | paho-mqtt + prom |
| Web (Next.js) | 3000 | HTTP/HTML | Next.js |
| Keycloak | 8081 | OIDC | Keycloak 26 |
| Mosquitto MQTT | 1883 | MQTT 3.1.1 | Mosquitto 2 |
| OSRM | 5000 | HTTP/REST | OSRM Backend |
| pg_tileserv | 7800 | HTTP/MVT | pg_tileserv |
| Prometheus | 9090 | HTTP | Prometheus |
| Grafana | 3001 | HTTP | Grafana 11 |
| PostgreSQL | 5432 | PG | PostgreSQL 15/16 + PostGIS + pgvector |

---

## 2. Admin API (`:8088`)

### المصادقة
- في الإنتاج: JWT صادر من Keycloak (`Authorization: Bearer <token>`).
- في v2.x القديمة: لا حماية — **يجب الإصلاح قبل الإنتاج**.

### نقاط النهاية

#### `GET /health`
فحص صحّة بسيط.
```json
{ "ok": true, "ts": 1716207600000 }
```

#### `GET /admin/version`
رقم إصدار الـ API.
```json
{ "version": "2.0.0" }
```

#### `GET /admin/users`
قائمة المستخدمين الإداريّين.
```json
[
  {
    "id": 1,
    "email": "admin@nusuj.sa",
    "name": "مدير المنصّة",
    "role": "admin",
    "created_at": "2026-01-15T10:00:00Z"
  }
]
```

#### `POST /admin/users`
إنشاء مستخدم أو تحديثه (Upsert على البريد).
```json
// Request body
{
  "email": "analyst@nusuj.sa",
  "name": "محلِّل بيانات",
  "role": "analyst"
}
// Response
{ "id": 5, "email": "analyst@nusuj.sa", "name": "محلِّل بيانات", "role": "analyst" }
```

#### `PUT /admin/users/:id/role`
تعديل دور مستخدم.
```json
// Request body
{ "role": "admin" }
// Response
{ "id": 5, "role": "admin" }
```
**ملاحظة أمنيّة:** يجب التحقُّق من أنّ الدّور ضمن enum: `admin | analyst | municipality | citizen | viewer`.

#### `GET /swagger`
واجهة Swagger UI لتوثيق تفاعلي.

---

## 3. ETL / Analytics API (`:9101`)

### 3.1 جغرافي (Geo)

#### `GET /geo/cells_with_indicators`
يُرجِع كل الخلايا مع مؤشِّراتها كـ GeoJSON FeatureCollection.
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": 1,
      "geometry": { "type": "Polygon", "coordinates": [[[46.6, 24.8], ...]] },
      "properties": {
        "name": "Cell North",
        "efficiency": 0.72,
        "resilience": 0.81,
        "connectivity": 0.65
      }
    }
  ]
}
```

#### `POST /upload/urban_cells`
يقبل FeatureCollection لإدخاله في `urban_cells`.
```json
// Request body
{
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "geometry": {...}, "properties": { "name": "..." } }
  ]
}
// Response
{ "inserted": 3 }
```

### 3.2 قرار متعدِّد المعايير (MCDA)

#### `POST /algo/ahp`
حساب أوزان مصفوفة المقارنات الزوجيّة.
```json
// Request
{
  "matrix": [
    [1, 3, 5],
    [1/3, 1, 2],
    [1/5, 1/2, 1]
  ]
}
// Response
{
  "weights": [0.648, 0.230, 0.122],
  "lambda_max": 3.04,
  "CI": 0.02,
  "RI": 0.58,
  "CR": 0.03,
  "ok": true
}
```
`ok = true` إن `CR < 0.1` (اتساق مقبول).

#### `POST /algo/topsis`
ترتيب البدائل.
```json
// Request
{
  "matrix": [[0.8, 0.6, 0.4], [0.5, 0.9, 0.7], [0.3, 0.4, 0.9]],
  "weights": [0.5, 0.3, 0.2],
  "benefit": [true, true, false]
}
// Response
{
  "scores": [0.62, 0.55, 0.41],
  "ranking": [0, 1, 2]
}
```

### 3.3 الاستشعار عن بُعد

#### `POST /rs/ndvi`
```json
// Request: مصفوفتين متطابقتين في الحجم
{
  "nir": [[0.5, 0.6], [0.4, 0.7]],
  "red": [[0.2, 0.3], [0.1, 0.2]]
}
// Response
{ "ndvi": [[0.42, 0.33], [0.60, 0.55]] }
```
المؤشِّرات المتاحة:
- `POST /rs/ndvi` — `(nir-red)/(nir+red)`.
- `POST /rs/evi` — `G*(nir-red)/(nir+C1*red-C2*blue+L)` بـ `G=2.5, C1=6, C2=7.5, L=1`.
- `POST /rs/savi` — `((nir-red)/(nir+red+L))*(1+L)` بـ `L=0.5`.
- `POST /rs/ndwi` — `(green-nir)/(green+nir)`.
- `POST /rs/lst_bt` — `K2/ln(K1/L+1) - 273.15` (Brightness Temperature).
- `POST /rs/cva` — Change Vector Analysis بين زمنين.

### 3.4 المكاني الإحصائي

#### `POST /algo/dbscan`
عنقدة بكثافة على نقاط (lon, lat).
```json
{
  "points": [[46.6, 24.7], [46.7, 24.8], ...],
  "eps": 0.01,
  "min_samples": 5
}
```
**تحذير:** `eps` بالدرجات وليس بالأمتار. عند 24.7°N: 0.01° ≈ 1.1 كم.

#### `POST /algo/iforest`
كشف الشذوذ.
```json
{
  "features": [[0.5, 0.3], [0.9, 0.1], ...],
  "contamination": 0.1
}
// Response
{ "anomaly_scores": [0.21, -0.85, ...], "is_outlier": [false, true, ...] }
```

#### `GET /tools/gi_hotspots_geojson?metric=fabric_index`
احسب Gi\* للبؤر الساخنة. (شرح كامل في [`../architecture/HOTSPOTS_H3.md`](../architecture/HOTSPOTS_H3.md)).
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {...},
      "properties": { "id": 12, "z": 2.31, "class": "hot" }
    }
  ]
}
```
المعاملات:
- `metric` (نص، افتراضي `fabric_index`) — أيّ مؤشِّر تحسبه.
- (مُقترَح) `z_threshold` — عتبة الدلالة.

#### `GET /tools/h3_aggregate?res=8&metric=fabric_index`
تجميع H3 سداسي.
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {...},
      "properties": { "h3": "8841a072d3fffff", "value": 0.74, "n": 12 }
    }
  ]
}
```
المعاملات:
- `res` (int، 0–15، افتراضي 8) — دقّة H3.
- `metric` — أيّ مؤشِّر.

**يجب التحقُّق من `0 ≤ res ≤ 15`** قبل الاستدعاء (إصلاح مقترح).

#### `POST /tools/moran_i`
Moran's I العامّ.
```json
{
  "values": [0.5, 0.6, 0.4, ...],
  "neighbors": [[1, 2], [0, 3], ...]
}
// Response
{ "I": 0.34, "expected": -0.01, "z": 4.21, "p_value": 0.0001 }
```

### 3.5 إمكانية الوصول

#### `POST /access/isochrone`
يوفِّر مضلَّع `Reachable Polygon` من نقطة عبر OSRM.
```json
// Request
{
  "origin": [46.6753, 24.7136],
  "cutoff": 900,         // ثوانٍ (15 دقيقة)
  "grid_km": 5,
  "n": 200
}
// Response
{
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [...] }, "properties": {} }
  ]
}
```
داخليًّا: يولِّد شبكة `n` نقطة في دائرة `grid_km`، يستعلم OSRM table، يأخذ Convex Hull للنقاط القابلة للوصول.

#### `POST /tools/2sfca`
Two-Step Floating Catchment Area.
```json
{
  "population": [{"id":1, "pop":1000, "lat":24.7, "lon":46.6}, ...],
  "facilities": [{"id":"hosp1", "cap":50, "lat":24.71, "lon":46.61}, ...],
  "catch_km": 5.0
}
// Response
{ "access_scores": [{"pop_id": 1, "score": 0.034}, ...] }
```

#### `POST /tools/gravity_access`
نموذج جاذبية بمعامل تخميد.
```json
{
  "origins": [...],
  "dests": [...],
  "beta": 0.5,
  "cap_key": "capacity"
}
```

#### `POST /tools/idw`
Inverse Distance Weighting.
```json
{
  "points": [{"x": 46.6, "y": 24.7, "z": 25.3}, ...],
  "query": [{"x": 46.65, "y": 24.72}, ...],
  "power": 2.0,
  "max_km": 10.0
}
// Response
{ "values": [25.7, ...] }
```

### 3.6 مؤشّرات الأداء (KPIs)

#### `GET /kpi/summary`
```json
{
  "fabric_index": 71.2,
  "sprawl_risk": 28.5,
  "harmony": 73.0
}
```
الصيغ:
- `fabric_index = 100·(0.4·eff + 0.3·res + 0.3·con)`
- `sprawl_risk = 100·max(0, 0.7 - 0.5·connectivity)`
- `harmony = 100·(0.5·res + 0.5·con)`

#### `GET /studio/scores?studio=Mobility`
```json
{
  "studio": "Mobility",
  "weights": { "connectivity": 0.7, "efficiency": 0.3 },
  "scores": [
    { "cell_id": 1, "score": 0.74 },
    ...
  ]
}
```
الاستديوهات المتاحة: `Mobility | Green | Heritage | Safety | Energy | Water | Housing | Economy | Wellbeing | Governance`. (تفاصيل الصيغ في [`../reference/STUDIOS.md`](../reference/STUDIOS.md).)

#### `GET /growth/hotspots`
GeoJSON بمراكز الخلايا حسب درجة فُرص النموّ.
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [46.6, 24.7] },
      "properties": { "cell_id": 12, "score": 0.65 }
    }
  ]
}
```
`score = max(0, 1 - connectivity)` (نموذج Toy، يجب استبداله بنموذج رياضي حقيقي).

### 3.7 المحاكاة

#### `GET /sim/run?name=Traffic Shift&delta=0.1`
```json
{
  "scenario": "Traffic Shift",
  "delta": 0.1,
  "before": [{ "cell_id": 1, "eff": 0.5, "res": 0.7, "con": 0.6 }, ...],
  "after":  [{ "cell_id": 1, "eff": 0.55, "res": 0.7, "con": 0.65 }, ...]
}
```
السيناريوهات: `Traffic Shift | Transit Uplift | Heat Island | Green Corridors | Flood Risk | POI Demand | LandUse Mix | Noise Spread | Solar Rooftops | Parking Stress`.

### 3.8 معايير OGC & STAC

#### `GET /ogc/collections`
```json
{
  "collections": [
    { "id": "urban_cells", "title": "Urban Cells", "extent": {...} },
    { "id": "fabric_indicators_view", "title": "Fabric Indicators", "extent": {...} }
  ]
}
```

#### `GET /ogc/collections/{id}/items?limit=100&offset=0`
يدعم `limit` (1–10000) و `offset`.
```json
{
  "type": "FeatureCollection",
  "features": [...],
  "links": [
    { "rel": "next", "href": "..." }
  ],
  "numberReturned": 100,
  "numberMatched": 5234
}
```

#### `GET /stac`
```json
{
  "stac_version": "1.0.0",
  "type": "Catalog",
  "id": "nusuj",
  "description": "NUSUJ STAC Catalog",
  "links": []
}
```

#### `GET /stac/collections`
قائمة Collections (مثل `urban-indicators`).

#### `POST /stac/search`
```json
// Request
{
  "collections": ["urban-indicators"],
  "datetime": "2025-10-01T00:00:00Z/2025-12-31T23:59:59Z",
  "bbox": [35, 16, 55, 33],
  "limit": 10
}
// Response
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "ndvi-2025-10",
      "properties": { "datetime": "2025-10-01T00:00:00Z" },
      "assets": {
        "data": {
          "href": "s3://bucket/path/ndvi-2025-10.tif",
          "type": "image/tiff; application=geotiff; profile=cloud-optimized"
        }
      }
    }
  ]
}
```

### 3.9 كتالوج الأدوات

#### `GET /tools/catalog`
يُرجِع قائمة الـ 100 أداة المُسجَّلة (كثيرٌ منها stubs).
```json
{
  "tools": [
    "2sfca", "gravity_access", "idw", "moran_i", "getis_ord_gi_star",
    "compactness", "fractal_dimension", "land_use_entropy", ...
  ]
}
```

### 3.10 مراقبة

#### `GET /metrics`
Prometheus exposition format.
```
# HELP nasij_requests_total Total NASIJ requests
# TYPE nasij_requests_total counter
nasij_requests_total{endpoint="/geo/cells_with_indicators"} 1247
# HELP nasij_req_seconds Latency seconds
# TYPE nasij_req_seconds histogram
nasij_req_seconds_bucket{endpoint="/kpi/summary",le="0.1"} 845
```

---

## 4. AI Twin API (`:9102`، v6+)

### `POST /ai/twin/ingest`
ابتلاع تدفُّق قياسات.
```json
{
  "stream_id": "aq_riyadh_central",
  "events": [
    { "ts": "2026-05-20T14:30:00Z", "lon": 46.67, "lat": 24.71, "pm25": 35 }
  ]
}
```

### `GET /ai/twin/nowcast?city=riyadh&horizon_minutes=60`
```json
{
  "city": "riyadh",
  "horizon_minutes": 60,
  "predictions": {
    "fabric_index_twin": { "value": 71.5, "ci_low": 68, "ci_high": 75 },
    "sprawl_risk_twin": { "value": 27.3, "ci_low": 24, "ci_high": 30 }
  }
}
```

### `POST /st/gi_star`
Gi\* مكاني-زمني.
```json
{
  "events": [
    {"h3": "8841a072d3fffff", "value": 0.85, "ts": "2026-05-20T14:30:00Z"}
  ],
  "spatial_window_rings": 2,
  "temporal_window_minutes": 60
}
```

### `POST /alerts/events/add`
حدث H3-مفهرس.
```json
{ "h3index": "8841a072d3fffff", "value": 0.85, "ts": "2026-05-20T14:30:00Z" }
```

---

## 5. BIM Gateway (v3.1-pro، :9115)

### `POST /bim/ingest`
رفع IFC.
```bash
curl -X POST -F "file=@building.ifc" http://localhost:9115/bim/ingest
# Response: { "ok": true, "doc": "building.ifc", "elements": [] }
```
**تنبيه:** IFC parsing **غير مُنفَّذ بعد**.

### `POST /bim/aps/translate`
بدء ترجمة Autodesk APS إلى SVF2.
```json
{ "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q..." }
```

### `GET /bim/aps/status?urn=...`
استعلام حالة الترجمة.

---

## 6. Carto Studio (v3.1-pro، :9105)

### `GET /carto/layouts`
```json
[
  { "id": "A4_portrait", "pageSize": "A4", "orientation": "portrait" },
  { "id": "A3_landscape", "pageSize": "A3", "orientation": "landscape" },
  { "id": "A2_landscape", "pageSize": "A2", "orientation": "landscape" },
  { "id": "Poster_A1", "pageSize": "A1", "orientation": "portrait" },
  { "id": "Report_A4", "pageSize": "A4", "orientation": "portrait" }
]
```

### `POST /carto/style`
رفع ملف SLD/SE.

### `POST /carto/print`
طلب طباعة PDF عبر MapFish.

---

## 7. Marketplace (v3.1-pro، :9110)

### `GET /plugins`
قائمة الـ Plugins المثبَّتة.

### `POST /plugins/install`
رفع `nasij-plugin.json` داخل ZIP.
```json
{ "ok": true, "id": "com.nasij.tools.2sfca-pro", "name": "2SFCA Pro" }
```
**يجب إضافة حدّ أقصى لحجم الـ ZIP** (Zip Bomb Protection) — انظر AUDIT.

### `POST /plugins/uninstall`
```json
{ "id": "com.nasij.tools.2sfca-pro" }
```

---

## 8. Open311 (v5.3+)

### `POST /open311/requests`
يدعم multipart upload للصور.
```bash
curl -X POST \
  -F 'service_code=001' \
  -F 'lat=24.7136' \
  -F 'lon=46.6753' \
  -F 'description=حفرة عميقة' \
  -F 'media=@photo.jpg' \
  https://api.nusuj.sa/open311/requests
```
الردّ:
```json
{ "service_request_id": "OPEN311-2026-05-20-0001", "status": "open" }
```

---

## 9. OSRM (`:5000`)

نقاط OSRM المُستخدَمة في نُسُج:
- `GET /table/v1/driving/{coords}?sources=0&annotations=duration` — للـ Isochrones.

---

## 10. MQTT Topics

| النمط | المنشور | المضمون |
|---|---|---|
| `sensors/<device_id>/<sensor_type>` | الحسّاسات | `{ "lon": 46.67, "lat": 24.71, "value": 35, "ts": "..." }` |
| `alerts/twin/<city>` | AI Twin | تنبيهات الانحراف |
| `commands/devices/<device_id>` | الـ API | أوامر التحكُّم (لاحقًا) |

---

## 11. أخطاء موحَّدة

عند الإمكان، تتبع الأخطاء بنية الـ RFC 7807 (Problem Details):
```json
{
  "type": "https://nusuj.sa/errors/invalid-h3-resolution",
  "title": "H3 resolution out of range",
  "status": 422,
  "detail": "res must be between 0 and 15, got 99"
}
```
في النسخ القديمة: استجابة FastAPI الافتراضيّة `{ "detail": "..." }` أو NestJS `{ "statusCode": 400, "message": "..." }`.

---

*هذا المرجع يتطوَّر مع كل إصدار. للمزيد، شغِّل الـ API محليًّا وافتح `/swagger` (Admin API) أو `/docs` (FastAPI).*

</div>
