<div dir="rtl">

# نُسُج المُدُن — Nusuj Al-Mudun

> **«المدينة كنسيج حيٍّ يتنفّس، نقرأ خيوطه ونعالج تفتُّقاتِه قبل أن تتمزّق.»**

منصة الذكاء العمراني الشاملة للمملكة العربية السعودية — تقيس جودة النسيج الحضري، وتكشف البؤر الساخنة، وتُحاكي السيناريوهات، وتُمكِّن المواطن من المشاركة في صناعة قراره العمراني.

---

## ما هو نُسُج؟

**نُسُج** (بالإنجليزية: *Nusuj*، وفي بعض النسخ المبكرة: *Nasij*) هو **توأم رقمي للمدن** (Urban Digital Twin) يعتمد على ثلاثيّة قياسية موزونة:

| البُعد | الرمز | المعنى | الوزن في مؤشر النسيج |
|---|---|---|---|
| **الكفاءة** | `efficiency` | استغلال الموارد، التراصّ العمراني، التنوع الوظيفي | 0.4 |
| **المرونة** | `resilience` | القدرة على التكيُّف والتعافي بعد الأزمات | 0.3 |
| **الترابُط** | `connectivity` | كثافة الشبكات وسهولة الوصول | 0.3 |

من هذه الأبعاد الثلاثة يُشتقّ:
- **مؤشر النسيج** (Fabric Index) = `100 × (0.4·eff + 0.3·res + 0.3·con)`
- **خطر الزحف** (Sprawl Risk) = `100 × max(0, 0.7 − 0.5·con)`
- **التناغم** (Harmony) = `100 × (0.5·res + 0.5·con)`

ومنها تُبنى **10 استديوهات تخصُّصية** و**100 أداة تحليلية** و**10 سيناريوهات محاكاة**.

---

## بنية المستودع

```
Nusuj-Al-Mudun/
├── 01- nusoj code/                  # كل النسخ الكوديّة (19 إصدار)
│   ├── nasij_monorepo_v1/           # الأساس: NestJS + FastAPI + Next.js
│   ├── nasij_monorepo_v1_1/         # AHP/TOPSIS + الاستشعار عن بُعد
│   ├── nasij_monorepo_v1_2/         # الواجهة الجغرافية + OSRM
│   ├── nasij_monorepo_v2_1_admin_studios/   # 10 استديوهات + Keycloak
│   ├── nasij_monorepo_v2_2_fabric_dashboard/ # IoT + MQTT + لوحات Grafana
│   ├── nasij_monorepo_v2_3_hotspots_h3_dashboard/ # H3 + Getis-Ord Gi*
│   ├── nasij_monorepo_v2_golive/    # التجهيز للإنتاج
│   ├── nasij_pro_v3_1_enterprise/   # المستوى المؤسسي: BIM + Revit + Carto
│   ├── nasij_v3_2_bootstrap/        # خط أنابيب بيانات الجغرافيا المفتوحة
│   ├── nasij_v3_ui_full/            # واجهة Next.js كاملة بالعربية (RTL)
│   ├── nasij_v4_monorepo/           # PostGIS + pgvector + H3
│   ├── nasij_v4_7_monorepo/         # OGC/STAC + CQL2
│   ├── nasij_v4_*.zip               # ترقيعات v4.1–v4.8
│   ├── nusuj_v5_*.zip               # PWA المواطن + KPI + OIDC + نفاذ
│   ├── nusuj_v6_0_ai_twin.zip       # التوأم الذكي (Moran + Nowcast)
│   ├── nusuj_v7_*.zip               # موصلات GASTAT/Balady/STAC + ECS Fargate
│   └── nusuj_v8_0_full_release.zip  # الإصدار الموحَّد للإطلاق
│
└── docs/                            # هذا التوثيق
    ├── architecture/                # العمارة العامة وتطوُّرها
    ├── versions/                    # السجلّ الزمني وما يميِّز كل إصدار
    ├── api/                         # مرجع نقاط النهاية
    ├── security/                    # المراجعة الأمنية ومسار التصحيح
    ├── deployment/                  # التشغيل والإنتاج
    ├── reference/                   # نموذج البيانات والمعجم
    └── monorepos/                   # وثيقة موجزة لكل إصدار
```

---

## ابدأ من هنا

### حسب الدور

| من أنت؟ | ابدأ بهذه الوثيقة |
|---|---|
| **مدير منتج / صاحب قرار** | [`docs/architecture/OVERVIEW.md`](docs/architecture/OVERVIEW.md) — نظرة عامة على المنتج والقيمة |
| **مهندس معماري** | [`docs/architecture/SYSTEM.md`](docs/architecture/SYSTEM.md) — العمارة الكاملة بالتشعُّبات |
| **مطوِّر خلفي** | [`docs/api/REFERENCE.md`](docs/api/REFERENCE.md) — كل نقاط النهاية |
| **مطوِّر واجهة** | [`docs/monorepos/v3_ui_full.md`](docs/monorepos/v3_ui_full.md) + [`docs/api/REFERENCE.md`](docs/api/REFERENCE.md) |
| **مهندس بيانات** | [`docs/reference/DATA_MODEL.md`](docs/reference/DATA_MODEL.md) — الجداول والمؤشرات |
| **مهندس DevOps** | [`docs/deployment/PRODUCTION.md`](docs/deployment/PRODUCTION.md) — خطوات الإطلاق |
| **مدقِّق أمني** | [`docs/security/AUDIT.md`](docs/security/AUDIT.md) — كل الثغرات بالتفصيل |

### حسب السؤال

- **«ما الفرق بين النسخ؟»** → [`docs/versions/TIMELINE.md`](docs/versions/TIMELINE.md)
- **«كيف يعمل كشف البؤر الساخنة؟»** → [`docs/architecture/HOTSPOTS_H3.md`](docs/architecture/HOTSPOTS_H3.md)
- **«ما معنى استديو؟»** → [`docs/reference/STUDIOS.md`](docs/reference/STUDIOS.md)
- **«كيف يُحسَب مؤشر النسيج؟»** → [`docs/reference/FABRIC_INDEX.md`](docs/reference/FABRIC_INDEX.md)
- **«كل المصطلحات بالعربية والإنجليزية»** → [`docs/reference/GLOSSARY.md`](docs/reference/GLOSSARY.md)

---

## السجلّ الزمني المختصر

```
v1.0      → الهيكل العظمي (NestJS + FastAPI + Next.js + PostGIS)
v1.1      → خوارزميات القرار (AHP, TOPSIS) + مؤشرات الاستشعار (NDVI, EVI, SAVI, NDWI)
v1.2      → الواجهة الجغرافية (Leaflet, OSRM, isochrones)
v2.1      → الاستديوهات العشرة + هوية Keycloak
v2.2      → لوحة النسيج التفاعلية + إنترنت الأشياء (MQTT)
v2.3      → سداسيات H3 + بؤر Getis-Ord Gi* + 100 أداة تحليلية
v2-golive → التحضير للإنتاج
v3.1-pro  → المستوى المؤسسي (BIM/Revit/Carto/Cinematic)
v3.2      → موصلات البيانات المفتوحة (OSM, WorldCover, WorldPop, MS Buildings, DEM, OpenAQ, RCRC)
v3-ui     → واجهة Next.js كاملة بالعربية مع RTL
v4.x      → إعادة هيكلة (PostgreSQL 16, pgvector, H3 خلايا، ECS/Fargate)
v4.7      → معايير OGC API Features + STAC + CQL2
v5.1-5.5  → ترقيعات: STAC، KPI، PWA المواطن، الأمن، النفاذ (هوية)
v6.0      → التوأم الذكي (Moran I + Nowcast)
v7.0-7.7  → موصلات GASTAT/Balady + WAF + ECS Fargate + سكربتات الإطلاق
v8.0      → الإصدار الموحَّد للإنتاج
```

التفاصيل الكاملة في [`docs/versions/TIMELINE.md`](docs/versions/TIMELINE.md).

---

## حالة المشروع

> **تنبيه مهم:** هذا المستودع يحتوي على **سلسلة تطوُّر زمنية** للمشروع (19 إصدار + 19 أرشيف مضغوط). كل إصدار هو **لقطة في وقت محدَّد** وليس فرعًا حيًّا. للنشر إلى الإنتاج اعتمد دائمًا على [`nusuj_v8_0_full_release.zip`](01-%20nusoj%20code/nusuj_v8_0_full_release.zip) ووثيقة [`docs/deployment/PRODUCTION.md`](docs/deployment/PRODUCTION.md).

| الجانب | الحالة |
|---|---|
| **اكتمال الميزات** | ★★★★★ — كل الميزات الأساسية موجودة في v8.0 |
| **جودة الكود** | ★★★☆☆ — نظيف لكن يحتاج اختبارات وحدويّة |
| **العمارة** | ★★★★☆ — تصميم خدمات مصغَّرة سليم |
| **الأمن** | ★★☆☆☆ — يحتاج تصلية قبل الإنتاج (انظر [`docs/security/AUDIT.md`](docs/security/AUDIT.md)) |
| **التشغيل** | ★★★☆☆ — السكربتات في v7.7 جيدة لكن تحتاج نُسخًا احتياطية |
| **التوثيق** | ★★★★★ — هذه الجولة الجديدة من التوثيق الشاملة |

---

## التراخيص ومصادر البيانات

المشروع يدمج بيانات من مصادر مفتوحة (انظر [`docs/reference/DATA_SOURCES.md`](docs/reference/DATA_SOURCES.md)):

| المصدر | الترخيص | الاستخدام |
|---|---|---|
| OpenStreetMap (Geofabrik) | ODbL | شبكة الطرق + OSRM |
| ESA WorldCover 10m | CC BY 4.0 | تصنيف الغطاء الأرضي |
| WorldPop Global | CC BY 4.0 | كثافة السكان (100م) |
| Microsoft Building Footprints | ODbL | بصمات المباني |
| Copernicus DEM (GLO-30) | Public Domain | الارتفاعات |
| OpenAQ | CC BY 4.0 | جودة الهواء |
| GASTAT (الهيئة العامة للإحصاء) | حسب الترخيص الحكومي | الإحصاءات السكانية |
| Balady (أمانات البلديات) | حسب الترخيص الحكومي | تصاريح البناء |

---

## اللغة والاتجاه

المشروع **ثنائي اللغة** بشكل أصيل:
- الواجهة الأمامية تُقدَّم بـ `dir="rtl"` افتراضيًا.
- مفاهيم المنتج بالعربية، المراجع التقنية بالإنجليزية.
- التوثيق (هذا) يلتزم بنفس النمط.

---

## مساهمة وإنتاج

- المراجعة الأمنية الكاملة: [`docs/security/AUDIT.md`](docs/security/AUDIT.md) (61 ثغرة موزَّعة على أربعة مستويات).
- خارطة الإصلاح الأولوية: [`docs/security/REMEDIATION_PLAN.md`](docs/security/REMEDIATION_PLAN.md).
- دليل المساهمة وأسلوب الكود سيُضاف لاحقًا.

---

*وثيقة جذر هذا المستودع — آخر تحديث: 2026-05-20.*

</div>
