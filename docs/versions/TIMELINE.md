<div dir="rtl">

# السجلّ الزمني الكامل للإصدارات

> **«من Skeleton عظمي إلى منصّة وطنيّة في 19 إصدارًا.»**

---

## نظرة مرئيّة سريعة

```
v1.0 ──┬── v1.1 ── v1.2                                              [الأساس]
       │                                                              [خوارزميات]
       │                                                              [خرائط]
v2.1 ──┴── v2.2 ── v2.3 ── v2-golive                                 [استديوهات]
                                                                      [IoT]
                                                                      [H3 + Gi*]
                                                                      [إنتاج تجريبي]

v3.1-pro     v3.2-bootstrap     v3-ui-full                            [مؤسّسي + BIM]
                                                                      [بيانات مفتوحة]
                                                                      [واجهة كاملة]

v4.1 ── v4.2 ── v4.3 ── v4.4 ── v4.5 ── v4.7 ── v4.8 ── v4.9-min     [إعادة هيكلة]
                                                                      [OGC/STAC/CQL2]

v5.1 ── v5.2 ── v5.3 ── v5.4-golive ── v5.4-prod ── v5.5             [ترقيعات إنتاج]
                                                                      [PWA + OIDC + نفاذ]

v6.0 ─── (AI Twin)                                                    [ذكاء تنبُّؤي]

v7.0 ── v7.5 ── v7.6 ── v7.7                                          [تكامل وطني]
                                                                      [ECS/WAF/Scripts]

                                v8.0                                  [الإصدار الموحَّد]
```

---

## التفاصيل بالإصدار

### v1.0 — الأساس (Foundation)

**الموقع:** `01- nusoj code/nasij_monorepo_v1/`
**الفلسفة:** Skeleton عظمي يثبت العمارة الكلِّيّة قبل الميزات.

**المكوِّنات:**
- NestJS API على :8088 (Health فقط)
- FastAPI ETL على :9101 (Stub /ingest فقط)
- Next.js Web على :3000 (6 صفحات placeholders)
- PostgreSQL 15 + PostGIS 3.4
- pg_tileserv + OSRM (stub) + Prometheus + Grafana
- 11 مجلَّد engines/ فارغ (وعد بمستقبل)

**ما يعمل:** docker-compose up ينتج كل الحاويات.
**ما لا يعمل:** لا توجد خوارزميات حقيقية، لا توجد بيانات حقيقية.

**ملخَّص الخبير:** «هيكل عظمي معماري نظيف، 5% إكمال للميزات.»

---

### v1.1 — خوارزميات القرار والاستشعار

**الموقع:** `01- nusoj code/nasij_monorepo_v1_1/`

**المُضاف:**
- **AHP** (Analytic Hierarchy Process) كاملًا مع حساب نسبة الاتساق.
- **TOPSIS** (Technique for Order Preference by Similarity to Ideal Solution).
- **DBSCAN** للعنقدة المكانيّة.
- **Isolation Forest** لكشف الشذوذ.
- **NDVI** و **LST_BT** (Land Surface Temperature) من باندات الأقمار.
- توثيق `POSTGIS_LAYERS.md` و `OSRM.md` (حُذِف الآن، أُعيدت معلوماته إلى الـ TIMELINE).

**المُلاحظ:** الواجهة لا تستفيد بعد — كلها playground نصية.

---

### v1.2 — التحوُّل الجغرافي + OSRM

**الموقع:** `01- nusoj code/nasij_monorepo_v1_2/`

**المُضاف الجوهري:**
- نقاط نهاية جغرافيّة: `/geo/cells`, `/geo/cells_with_indicators`, `/upload/urban_cells`.
- مؤشِّرات استشعار جديدة: **EVI**, **SAVI**, **NDWI**, **CVA** (Change Vector Analysis).
- **Isochrone عبر OSRM** — `POST /access/isochrone` يستدعي OSRM `/table/v1/driving/`.
- واجهة Leaflet كاملة في `/map` و `/access`.

**تغيير سلبي مهمّ:** نوع الـ geom انتقل من `GEOGRAPHY(POLYGON, 4326)` إلى `geometry(Polygon, 4326)`. الانتقال من إحداثيّات كرويّة إلى مسطّحة يُسبِّب خطأ يصل إلى 10–15% في حسابات المسافة عند خطّ عرض الرياض (24.7°N).

**كسر آخر:** Grafana أُزيلت من docker-compose.

---

### v2.1 — الاستديوهات العشرة + Keycloak

**الموقع:** `01- nusoj code/nasij_monorepo_v2_1_admin_studios/`

**التحوُّل المفاهيمي الأكبر:** ظهور فكرة **«الاستديو»** — وكل استديو يحسب نقاطًا للنسيج بترجيح مختلف:

| الاستديو | الصيغة |
|---|---|
| Mobility | `0.7·con + 0.3·eff` |
| Green | `0.6·res + 0.2·eff + 0.2·con` |
| Heritage | `0.5·res + 0.25·eff + 0.25·con` |
| Safety | `0.5·res + 0.3·con + 0.2·eff` |
| Energy | `0.6·eff + 0.3·res + 0.1·con` |
| Water | `0.5·res + 0.3·eff + 0.2·con` |
| Housing | `0.5·eff + 0.3·con + 0.2·res` |
| Economy | `0.5·eff + 0.3·res + 0.2·con` |
| Wellbeing | `0.5·res + 0.3·eff + 0.2·con` |
| Governance | `0.34·eff + 0.33·res + 0.33·con` |

**المُضاف:**
- **Keycloak 26.0.0** على :8081.
- **NextAuth + Keycloak provider** في الواجهة.
- **Middleware حماية الـ /admin، /studios، /simulations**.
- 10 سيناريوهات محاكاة (3 منها مُنفَّذة فقط).
- **/swagger** على Admin API.

---

### v2.2 — لوحة النسيج + IoT

**الموقع:** `01- nusoj code/nasij_monorepo_v2_2_fabric_dashboard/`

**المُضاف:**
- **MQTT/Mosquitto** على :1883.
- **iot-listener service** — يشترك في `sensors/+/+` ويحفظ في PostGIS.
- لوحة Fabric تفاعليّة في `/dashboard`.
- **/kpi/summary** — Fabric Index, Sprawl Risk, Harmony.

**ملف patch مرفق:** `nasij_v2_2_to_v2_3.patch` يحتوي خطوات الانتقال إلى v2.3.

---

### v2.3 — البؤر السداسيّة (H3 + Gi\*) + 100 أداة

**الموقع:** `01- nusoj code/nasij_monorepo_v2_3_hotspots_h3_dashboard/`

**هذا هو إصدار «الذُّروة التحليليّة»:**
- **H3 Aggregation:** `/tools/h3_aggregate?res=8&metric=X` — تجميع سداسي.
- **Getis-Ord Gi\*:** `/tools/gi_hotspots_geojson?metric=X` — بؤر مكانيّة.
- **كتالوج 100 أداة:** `/tools/catalog` يُرجِع قائمة بكل الأدوات (كثير منها stubs بعد).
- **registry_100.py** — نظام Plugin يحمَّل تلقائيًا.
- **سكربت `scripts/osrm_batch.sh`** يبني OSRM لـ Riyadh و Jeddah و Dammam.
- **لوحة Grafana `fabric_city.json`** متعدّدة المدن.

**نقص مكتشف:** اللوحة تستعلم عن أعمدة غير موجودة في schema.sql الحالي (city, gi_hotspots view, access_15min). يحتاج migration.

تفاصيل تقنيّة كاملة في [`../architecture/HOTSPOTS_H3.md`](../architecture/HOTSPOTS_H3.md).

---

### v2-golive — التحضير الأوّلي للإنتاج

**الموقع:** `01- nusoj code/nasij_monorepo_v2_golive/`

**المُضاف:**
- **Caddy** كـ reverse proxy + TLS تلقائي عبر ACME.
- توحيد كلّ الخدمات السابقة في docker-compose واحد.
- إعدادات Prometheus و Grafana موحَّدة.

**النقص الحرج:** بالرغم من الاسم «golive»، الأمن ما زال ضعيفًا (لا restart policies، لا healthchecks، CORS مفتوح، كلمات مرور افتراضيّة). انظر [`../security/AUDIT.md`](../security/AUDIT.md).

---

### v3.1-pro — المستوى المؤسسي

**الموقع:** `01- nusoj code/nasij_pro_v3_1_enterprise/`

**المُضاف الذي يصنع «Pro»:**

| الخدمة | الوصف |
|---|---|
| **BIM Gateway** | `services/bim_gateway/` — استقبال IFC + تكامل Autodesk APS (Forge) |
| **Carto Studio** | `services/carto/` — MapFish Print لطبع PDF من خرائط بأحجام A1–A4 |
| **Cinematic Export** | `services/cinematic_export/` — رندر Adobe After Effects (نصوص ExtendScript) |
| **Marketplace** | `services/marketplace/` — تثبيت Plugins من ملفات ZIP بمنفِيست `nasij-plugin.json` |
| **Revit Addin** | `clients/revit_addin/` — C# Plugin لـ Autodesk Revit يدفع التحديدات إلى BIM Gateway |
| **CloudFront IaC** | `infra/terraform/cloudfront/` — Terraform لتوزيع الأصول عبر CDN |

**أمثلة Plugin:**
- `sample_2sfca_pro.zip` — أداة Two-Step Floating Catchment Area للوصوليّة الحضريّة.

**ملاحظات:**
- IFC parsing **لم يُنفَّذ بعد** — هو placeholder.
- DLL Path في Revit Addin مُشفَّر صلبًا (`C:\NASIJ\Nasij.Revit.dll`).
- macOS only للـ Cinematic Export.

---

### v3.2-bootstrap — موصلات البيانات المفتوحة

**الموقع:** `01- nusoj code/nasij_v3_2_bootstrap/`

**المُضاف:**
- **Makefile** ينظّم تحميل وبناء OSRM للسعودية.
- **scripts/01_osm_osrm.sh** — تحميل PBF من Geofabrik وبناء OSRM.
- وثائق علميّة للموصلات السبعة (حُذِفت، أُعيدت في [`../reference/DATA_SOURCES.md`](../reference/DATA_SOURCES.md)):
  - WorldCover (ESA) — تصنيف الغطاء.
  - WorldPop — كثافة السكان.
  - MS Buildings — بصمات المباني.
  - Copernicus DEM — الارتفاعات.
  - OpenAQ — جودة الهواء.
  - RCRC — بيانات أمانة الرياض.

---

### v3-ui-full — الواجهة الكاملة بالعربية

**الموقع:** `01- nusoj code/nasij_v3_ui_full/`

**المُضاف:**
- **Tailwind CSS** + **Framer Motion** + **Recharts** (مدمج).
- مسار `app/(routes)/` بنمط Next.js App Router الحديث.
- صفحات جديدة:
  - `/insights` — توليد تقارير AR/EN.
  - `/iot/live` — تجميع H3 آني (تحديث 8 ثوان).
  - `/studio/sim` — استكشاف 10 سيناريوهات.
- **dir="rtl"** في الـ layout الرئيسي.
- Animation `«المدينة كنسيج حيّ»` في الصفحة الرئيسية.

**ضعف مكتشف:** `SessionProvider` معرَّف لكن **غير مُدمج في root layout** — `useSession()` يُرجِع `undefined`.

---

### v4.x — إعادة الهيكلة (Refactor)

**الإصدارات:** v4.1, v4.2, v4.3, v4.4, v4.5, v4.7, v4.8 (لا توجد v4.6).
**الموقعان الرئيسيان:** `nasij_v4_monorepo/`, `nasij_v4_7_monorepo/` (والباقي ZIPs).

**التحوُّل:**
- ترقية PostgreSQL إلى **16**.
- إضافة **pgvector** (متّجهات 384-dim لـ AI embeddings).
- جدول جديد `urban.h3_cells` بدلاً من خلايا polygonal فقط.
- جدول `urban.embeddings` للذكاء الاصطناعي.
- جدول `urban.citizen_reports` لـ Open311.
- **v4.7 تحوَّل من NestJS إلى Express.js** للسرعة وتوافق OGC.
- **v4.7 أضاف OGC API Features كاملًا** مع CQL2 (text + JSON).
- **v4.7 أضاف STAC 1.0.0** — `/stac`, `/stac/collections`, `/stac/search`.
- STAC catalog: `urban-indicators` collection + NDVI item (`ndvi-2025-10.tif`) كـ Cloud-Optimized GeoTIFF على S3.

**ملاحظات v4.x ZIPs (من Expert 10):**

| الإصدار | الميزة الجوهرية |
|---|---|
| v4.1 | Foundation (NestJS + FastAPI + Next.js) |
| v4.2 | Open311 schema + Story Studio UI |
| v4.3 | TOPSIS analytics + Story Maps page |
| v4.4 | **PDPL compliance** (الالتزام بحماية البيانات السعودي) + Terraform scaffolding |
| v4.5 | تركيز Terraform ECS/Fargate |
| v4.8 | تبسيط إلى Express (9 ملفات فقط) |
| v4.9-min | Prototype mini (4 ملفات — تجريبي داخلي) |

---

### v5.x — الترقيعات الإنتاجيّة (Production Patches)

**الإصدارات:** v5.1, v5.2, v5.3, v5.4-golive, v5.4-prod-wireup, v5.5 (كلها ZIPs).

| الإصدار | الميزة الرئيسة |
|---|---|
| **v5.1** | تطابق STAC/OGC + CQL2 + ابتلاع Open311 |
| **v5.2** | KPI compute + Admin UI + Story Viewer |
| **v5.3** | **Citizen PWA** كامل — manifest, service worker, Open311 multipart upload, صفحات Consent/Report/Notifications |
| **v5.4 (golive)** | S3 presigned + CloudFront OAC + Web Push (VAPID) + Helmet + Loki/Tempo |
| **v5.4 (prod-wireup)** | Terraform لـ Keycloak + IAM + S3 + ALB + GitHub Actions CI/CD |
| **v5.5** | **OIDC middleware كامل + تكامل نفاذ** (هوية وطنيّة سعوديّة) |

---

### v6.0 — التوأم الذكي

**ZIP:** `nusuj_v6_0_ai_twin.zip`
**المُضاف:**
- خدمة `/services/ai-twin/app.py`.
- Moran's I (spatial autocorrelation proxy).
- نقطة `/ai/twin/nowcast` (تنبُّؤ آنيّ).
- `twin_definitions.json` — KPIs توأم موازية للحقيقية.
- تكامل مع `routes.ai_twin.v60.js` في الـ API.

تفاصيل [`../architecture/AI_TWIN.md`](../architecture/AI_TWIN.md).

---

### v7.x — التكامل الوطني + ECS Fargate

| الإصدار | المضاف |
|---|---|
| **v7.0** | موصلات GASTAT (سكان) + Balady (تصاريح) + STAC (NDVI). ETL transforms: `gastat_to_kpi.py`, `balady_permits_to_kpi.py`. |
| **v7.5** | ACM/CloudFront+OAC + WAF + ALB/Route53 + Keycloak realm prod + Nafath docs + StoryMaps `quality_of_life`. |
| **v7.6** | **ECS Fargate template** كامل (4 خدمات: API, Admin, Citizen, AI-Twin) + Global+Regional WAF + ACM + OIDC middleware + GitHub Actions `deploy-ecs.yml`. |
| **v7.7** | **سكربتات Go-Live:** `go-live.sh`, `check-acm.sh`, `update-ecs.sh`, `bootstrap-keycloak.sh`, `seed-kpis.sh` + Go-Live Checklist + Rollback Plan. |

---

### v8.0 — الإصدار الموحَّد

**ZIP:** `nusuj_v8_0_full_release.zip` (49 ملفًا، 22.8 KB)
**المحتوى:** تجميع متناسق لكل ما سبق:
- Terraform v7.6 كاملًا (ECS + WAF + CloudFront + ACM + Route53).
- OIDC v5.5 + Keycloak realm + Nafath docs.
- موصلات v7.0 (GASTAT + Balady + STAC).
- AI Twin v6.0.
- PWA Citizen v5.3 + Observability v5.4.
- سكربتات v7.7 + Go-Live Checklist.

**نقطة الدخول:** `README_v8.md` + `golive.tfvars` + `Makefile`:
```bash
make init       # terraform init
make apply      # terraform apply -var-file=golive.tfvars
make realm      # bootstrap-keycloak.sh
make seed       # seed-kpis.sh
```

---

## الإصدارات «الميتة» (Deprecated)

كل إصدار قبل v8.0 يجب اعتباره **لقطة تاريخيّة** (snapshot)، لا للنشر الإنتاجي. النشر دائمًا من v8.0.

---

## التطوُّر بالأرقام

| المقياس | v1.0 | v2.3 | v4.7 | v8.0 |
|---|---|---|---|---|
| عدد الخدمات | 5 | 10 | 4 | 7+ |
| عدد نقاط النهاية | ~5 | ~50 | ~25 (OGC) | ~80 |
| عدد جداول DB | 2 | 4 | 5 (h3, embeddings, citizen) | 6+ |
| دعم OGC/STAC | لا | لا | كامل | كامل |
| دعم AI/ML | لا | DBSCAN/IForest | لا | Moran + Nowcast |
| Identity | لا | Keycloak | لا (in-memory) | OIDC + نفاذ |
| Production-ready | لا | لا | لا | نعم (بعد فحص أمني) |

---

*كل إصدار يُعلِّمنا شيئًا، وv8.0 هو خلاصة الدروس.*

</div>
