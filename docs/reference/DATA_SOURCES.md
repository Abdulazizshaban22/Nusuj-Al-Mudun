<div dir="rtl">

# مصادر البيانات — Data Sources

> **جميع مصادر البيانات التي يُستفاد منها أو يُكامَل معها في نُسُج، مع تراخيصها وطرق ابتلاعها.**

أُعيد بناء هذه الوثيقة بعد حذف `SOURCES.md` ووثائق الـ `XX_notes.md` في `nasij_v3_2_bootstrap/scripts/`. المعلومات مستخرَجة من أسماء السكربتات + قراءة `01_osm_osrm.sh` + توثيق الخبير #8.

---

## 1. الجدول الشامل

| # | المصدر | النوع | الترخيص | الاستخدام في نُسُج |
|---|---|---|---|---|
| 1 | OpenStreetMap (Geofabrik) | شبكة طرق + POI | ODbL | بناء OSRM للتوجيه + الـ Isochrones |
| 2 | ESA WorldCover 10m | راستر تصنيف الغطاء | CC BY 4.0 | حساب نسبة الخضرة، المسطَّحات المائيّة، المباني |
| 3 | WorldPop Global | راستر كثافة السكان 100م | CC BY 4.0 | مدخل لمؤشِّر `efficiency` (كثافة السكان) |
| 4 | Microsoft Global Building Footprints | بصمات مباني | ODbL | كثافة البناء، FAR، Coverage Ratio |
| 5 | Copernicus DEM (GLO-30) | راستر ارتفاع 30م | Public Domain | مخاطر الفيضانات، انحدارات الطرق |
| 6 | OpenAQ | بيانات مفتوحة لجودة الهواء | CC BY 4.0 | مؤشِّر السلامة/الرفاه + IoT-like |
| 7 | RCRC Open Data Portal | بيانات بلديّة الرياض | حسب الترخيص | المترو، النقل العامّ، الحدود الإداريّة |
| 8 | GASTAT | إحصاءات سكانيّة سعوديّة | الترخيص الحكومي | تطبيع المؤشِّرات لكل مدينة |
| 9 | Balady | تصاريح البناء | الترخيص الحكومي | معدَّل التنمية، Land Use Mix |
| 10 | STAC Sentinel-2 / Landsat | صور أقمار | CC BY 4.0 | NDVI, EVI, NDWI, LST_BT |

---

## 2. تفاصيل المصادر

### 2.1 OpenStreetMap (Geofabrik)

**الموقع:** `https://download.geofabrik.de/asia/saudi-arabia-latest.osm.pbf`

**النوع:** PBF (Protocol Buffer Format) — الصيغة المضغوطة لـ OSM.

**حجم تقريبي:** ~200 MB للسعودية الكاملة.

**ابتلاع في نُسُج:**
```bash
# في nasij_v3_2_bootstrap/scripts/01_osm_osrm.sh
curl -L -o saudi-arabia-latest.osm.pbf \
  https://download.geofabrik.de/asia/saudi-arabia-latest.osm.pbf

# استخراج مدن محدَّدة:
docker run --rm -v $(pwd):/data osmium-tool/osmium \
  extract --bbox 46.38,24.33,47.10,25.10 -o riyadh.osm.pbf saudi-arabia-latest.osm.pbf

# بناء OSRM:
docker run --rm -v $(pwd):/data osrm/osrm-backend osrm-extract -p /opt/car.lua /data/riyadh.osm.pbf
docker run --rm -v $(pwd):/data osrm/osrm-backend osrm-partition /data/riyadh.osrm
docker run --rm -v $(pwd):/data osrm/osrm-backend osrm-customize /data/riyadh.osrm
```

**التحديث:** يوميًّا من Geofabrik. سكربت `osrm_batch.sh` (v2.3) يدعم تحديث متعدِّد المدن.

**ترخيص ODbL:** يجب إعادة النشر كمصدر مفتوح. **ملاحظة:** هذا قد يتعارض مع `license: proprietary` في STAC catalog (يجب مراجعة قانونيّة).

---

### 2.2 ESA WorldCover (10m)

**الموقع:** `https://esa-worldcover.org/`

**الإصدارات:**
- v100 (2020 — الأقدم)
- v200 (2021 — الأحدث)

**النوع:** GeoTIFF بدقّة 10 متر، مقسَّم إلى بلاطات 3°×3°.

**التصنيفات (11 صنف):**
| Code | الصنف |
|---|---|
| 10 | شجر |
| 20 | شجيرات |
| 30 | عشب |
| 40 | محاصيل |
| 50 | مباني |
| 60 | أرض جرداء |
| 70 | ثلج/جليد |
| 80 | مياه |
| 90 | مستنقعات |
| 95 | أعشاب بحريّة |
| 100 | طحالب |

**استخدام في نُسُج:**
- تصنيف `WorldCover == 10/20/30` كمسطَّحات خضراء → مدخل لـ `resilience.green_ratio`.
- `WorldCover == 50` كمباني → مقارنة مع MS Buildings.
- `WorldCover == 80` كمسطَّحات مائيّة → خطر الفيضانات + الوصول للماء.

---

### 2.3 WorldPop Global

**الموقع:** `https://hub.worldpop.org/` أو عبر Google Earth Engine.

**النوع:** GeoTIFF بدقّة 100 متر، طبقة لكل سنة (2020 المُعتمَدة).

**القيمة لكل بكسل:** عدد السكان التقريبي في تلك الـ 100×100 م².

**استخدام في نُسُج:**
- مدخل لـ 2SFCA (`population` في `/tools/2sfca`).
- حساب `density_per_hectare` لكل urban_cell عبر `ST_Sum(rast)`.
- مدخل لمحاكاة سيناريوهات النموّ السكاني.

**كود الاستيراد المُقترَح:**
```sql
-- إنشاء جدول راستر
SELECT raster2pgsql -s 4326 -t 100x100 worldpop_sau_2020.tif worldpop_2020 | psql -d nasij

-- استعلام: عدد السكان داخل خلية
SELECT cell_id, SUM(ST_SummaryStats(ST_Clip(wp.rast, uc.geom)).sum) AS population
FROM urban_cells uc
JOIN worldpop_2020 wp ON ST_Intersects(uc.geom, wp.rast)
GROUP BY cell_id;
```

---

### 2.4 Microsoft Global Building Footprints

**الموقع:** `https://github.com/microsoft/GlobalMLBuildingFootprints` أو Planetary Computer.

**النوع:** GeoJSON FeatureCollection لكل دولة. السعودية حوالي 5M مبنى.

**خصائص لكل مبنى:** Polygon فقط (لا ارتفاع، لا نوع استخدام).

**استخدام في نُسُج:**
- `coverage_ratio = sum(building_area) / cell_area` ضمن `efficiency`.
- `building_count_per_cell` كمؤشِّر كثافة.
- مدخل لـ FAR (إن دُمج مع DEM لاستنتاج الارتفاع).

---

### 2.5 Copernicus DEM (GLO-30)

**الموقع:** OpenTopography أو Planetary Computer.

**النوع:** GeoTIFF بدقّة 30 متر للارتفاع فوق سطح البحر.

**استخدام في نُسُج:**
- **مخاطر الفيضانات:** المناطق المنخفضة بجوار المسارات المائيّة أو ساحلًا.
- **انحدارات الطرق:** OSRM يستفيد منه (slope cost) إن دُمج.
- **خطّ الأفق:** حساب الـ viewshed للجوانب البصريّة.

---

### 2.6 OpenAQ

**الموقع:** `https://docs.openaq.org/`

**النوع:** REST API + تنزيل bulk للبيانات التاريخية.

**القياسات:** PM2.5, PM10, NO2, O3, SO2, CO، من محطات قياس حول العالم.

**ابتلاع في نُسُج:**
```python
import requests
# جلب محطات السعوديّة:
stations = requests.get("https://api.openaq.org/v3/locations?country=SA").json()

# جلب قياسات حسّاس:
measurements = requests.get(
    f"https://api.openaq.org/v3/locations/{station_id}/measurements"
).json()

# تحويل إلى MQTT message:
mqtt_payload = {
    "lon": station.coordinates.longitude,
    "lat": station.coordinates.latitude,
    "pm25": measurement.value,
    "ts": measurement.date.utc
}
client.publish(f"sensors/openaq_{station_id}/pm25", json.dumps(mqtt_payload))
```

---

### 2.7 RCRC (Royal Commission for Riyadh City)

**الموقع:** بوّابة البيانات المفتوحة لأمانة الرياض.

**البيانات المتاحة:**
- خطوط ومحطات مترو الرياض.
- خطوط الحافلات.
- الحدود الإداريّة (Provinces, Cities, Districts).
- مسارات الدرّاجات.

**التراخيص:** يجب مراجعة الموقع الرسمي. عمومًا مفتوحة للاستخدام غير التجاري.

---

### 2.8 GASTAT (الهيئة العامة للإحصاء)

**ابتلاع في نُسُج (v7.0+):**
```python
# services/connectors/gastat.py
def fetch_population_by_district(year):
    response = requests.get(
        "https://api.stats.gov.sa/population/districts",
        params={"year": year},
        headers={"Authorization": f"Bearer {GASTAT_API_KEY}"}
    )
    return response.json()

# ETL transform:
# services/etl/gastat_to_kpi.py
def transform_to_kpi(gastat_data):
    """يُحوِّل بيانات GASTAT إلى تحديثات على fabric_indicators."""
    for district in gastat_data:
        # احسب population_density
        # حدِّث efficiency component للخلايا في هذه المنطقة
```

---

### 2.9 Balady (أمانات المدن)

**ابتلاع في نُسُج (v7.0+):**
```python
# services/connectors/balady.py
def fetch_open_permits(city, since_date):
    return requests.get(
        f"https://api.balady.gov.sa/{city}/permits",
        params={"since": since_date.isoformat()}
    ).json()

# services/etl/balady_permits_to_kpi.py
def update_development_intensity(permits):
    """عدد تصاريح البناء الجديدة → development_intensity كمدخل لـ efficiency."""
```

---

### 2.10 STAC Sentinel-2 / Landsat

**Catalog:** نُسُج يحتفظ بـ STAC catalog محلِّي في `stac/`:
- `catalog.json` — Root.
- `collections/urban-indicators.json` — Collection.
- `items/ndvi-2025-10.json` — مثال على Item.

**التكامل مع Sentinel Hub:**
```python
# services/etl/satellite_ingest.py
from pystac_client import Client

client = Client.open("https://earth-search.aws.element84.com/v1")
items = client.search(
    collections=["sentinel-2-l2a"],
    bbox=[46.38, 24.33, 47.10, 25.10],   # Riyadh
    datetime="2026-05-01/2026-05-31",
    query={"eo:cloud_cover": {"lt": 10}}
).item_collection()

for item in items:
    # تنزيل النطاقات NIR + RED → حساب NDVI → رفع إلى urban-indicators
```

---

## 3. خريطة التدفُّق من المصدر إلى المؤشِّر

```
                                    ┌────────────────┐
                                    │  المصادر الخارجيّة │
                                    └────────────────┘
                                            │
            ┌────────────┬───────────┬──────┴──────┬──────────────┐
            │            │           │             │              │
   ┌────────▼────┐ ┌─────▼────┐ ┌────▼───┐ ┌──────▼────┐  ┌──────▼───┐
   │ OSM (PBF)   │ │WorldCover│ │WorldPop│ │MS Buildings│ │STAC Imgs │
   └────────┬────┘ └─────┬────┘ └────┬───┘ └──────┬────┘  └──────┬───┘
            │            │           │            │              │
   ┌────────▼─────────────────────────▼──────────────────────────▼───┐
   │              Bootstrap Pipeline (v3.2)                          │
   │  scripts/01_osm_osrm.sh + raster2pgsql + STAC ingestion         │
   └─────────────────────────┬──────────────────────────────────────┘
                             │
   ┌─────────────────────────▼──────────────────────────────────────┐
   │                   PostgreSQL + PostGIS + pgvector              │
   │  urban_cells + fabric_indicators + iot_events + urban.h3_cells │
   └─────────────────────────┬──────────────────────────────────────┘
                             │
   ┌─────────────────────────▼──────────────────────────────────────┐
   │            ETL Engines (FastAPI + NumPy/Shapely)                │
   │   - حساب efficiency, resilience, connectivity                   │
   │   - تجميع H3                                                    │
   │   - استخراج Hotspots (Gi*)                                     │
   └─────────────────────────┬──────────────────────────────────────┘
                             │
                  ┌──────────┴──────────┐
                  │     API + AI Twin    │
                  └──────────┬──────────┘
                             │
                  ┌──────────▼──────────┐
                  │       الواجهات       │
                  └─────────────────────┘
```

---

## 4. ملاحظات حول الاستيراد المتزامن

- **OSM يُحدَّث يوميًّا** — اعمل rebuild أسبوعي لـ OSRM.
- **WorldCover/WorldPop يُحدَّثان سنويًّا** — قابلية سحب آليّ كل 1 يناير.
- **MS Buildings يُحدَّث ربع سنويًّا** — دمج تصاعدي via diff.
- **OpenAQ مباشرة عبر WebSocket** — تحويل إلى MQTT في `services/connectors/openaq.py`.
- **GASTAT/Balady** — جدولة Cron يوميّة عبر sqsbeat أو CronJob في Kubernetes.

---

## 5. توافق التراخيص

| ترخيص | يسمح بإعادة النشر؟ | يتطلَّب نسب؟ | يتطلَّب فتح المشتقَّات؟ |
|---|---|---|---|
| ODbL | ✅ | ✅ | ✅ (Share-Alike للقاعدة فقط) |
| CC BY 4.0 | ✅ | ✅ | ❌ |
| Public Domain | ✅ | ❌ | ❌ |
| Proprietary (نُسُج الحالي) | حسب الاتّفاق | حسب الاتّفاق | ❌ |

**توصية:** مراجعة قانونيّة قبل النشر النهائي لأنّ توليفة `proprietary` مع `ODbL` قد تتطلَّب فتح طبقات OSM المُشتقَّة.

</div>
