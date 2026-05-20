<div dir="rtl">

# دليل التوثيق

> **خريطة سريعة لكل ملفّات هذا المجلَّد.**

## 🎯 ابدأ هنا

- [`../README.md`](../README.md) — جذر المستودع، نقطة الانطلاق.

## 🏛 العمارة

| الملفّ | الوصف |
|---|---|
| [`architecture/OVERVIEW.md`](architecture/OVERVIEW.md) | نظرة عامّة على المنتج والقيمة |
| [`architecture/SYSTEM.md`](architecture/SYSTEM.md) | العمارة التقنيّة الكاملة |
| [`architecture/HOTSPOTS_H3.md`](architecture/HOTSPOTS_H3.md) | قلب التحليل المكاني (H3 + Gi\*) |
| [`architecture/AI_TWIN.md`](architecture/AI_TWIN.md) | طبقة الذكاء الاصطناعي |

## 📅 الإصدارات

| الملفّ | الوصف |
|---|---|
| [`versions/TIMELINE.md`](versions/TIMELINE.md) | السجلّ الزمني الكامل من v1 إلى v8 |

## 📡 API

| الملفّ | الوصف |
|---|---|
| [`api/REFERENCE.md`](api/REFERENCE.md) | مرجع كل نقاط النهاية |

## 🔒 الأمن

| الملفّ | الوصف |
|---|---|
| [`security/AUDIT.md`](security/AUDIT.md) | 61 ثغرة مرتَّبة بالشدّة |
| [`security/REMEDIATION_PLAN.md`](security/REMEDIATION_PLAN.md) | خطّة الإصلاح بالأولويّة |

## 🚀 النشر

| الملفّ | الوصف |
|---|---|
| [`deployment/PRODUCTION.md`](deployment/PRODUCTION.md) | دليل النشر الإنتاجي على AWS |

## 📚 المرجع

| الملفّ | الوصف |
|---|---|
| [`reference/DATA_MODEL.md`](reference/DATA_MODEL.md) | كل الجداول والعلاقات |
| [`reference/DATA_SOURCES.md`](reference/DATA_SOURCES.md) | 10 مصادر بيانات + تراخيصها |
| [`reference/STUDIOS.md`](reference/STUDIOS.md) | الاستديوهات العشرة وأوزانها |
| [`reference/FABRIC_INDEX.md`](reference/FABRIC_INDEX.md) | تفصيل مؤشِّر النسيج |
| [`reference/GLOSSARY.md`](reference/GLOSSARY.md) | معجم بالعربية والإنجليزيّة |

## 📦 الإصدارات Monorepo

| الملفّ | الإصدار |
|---|---|
| [`monorepos/v1.md`](monorepos/v1.md) | الأساس |
| [`monorepos/v1_1.md`](monorepos/v1_1.md) | خوارزميّات MCDA |
| [`monorepos/v1_2.md`](monorepos/v1_2.md) | OSRM + جغرافيا |
| [`monorepos/v2_1.md`](monorepos/v2_1.md) | الاستديوهات + Keycloak |
| [`monorepos/v2_2.md`](monorepos/v2_2.md) | IoT + Fabric Dashboard |
| [`monorepos/v2_3.md`](monorepos/v2_3.md) | H3 + Gi\* + 100 أداة |
| [`monorepos/v2_golive.md`](monorepos/v2_golive.md) | تحضير للإنتاج |
| [`monorepos/v3_1_pro.md`](monorepos/v3_1_pro.md) | BIM + Revit + Carto |
| [`monorepos/v3_2_bootstrap.md`](monorepos/v3_2_bootstrap.md) | موصلات البيانات المفتوحة |
| [`monorepos/v3_ui_full.md`](monorepos/v3_ui_full.md) | الواجهة الكاملة بالعربية |
| [`monorepos/v4.md`](monorepos/v4.md) | PG16 + pgvector + h3_cells |
| [`monorepos/v4_7.md`](monorepos/v4_7.md) | OGC + STAC + CQL2 |
| [`monorepos/zip_patches.md`](monorepos/zip_patches.md) | كل الـ ZIPs (v4.1 → v8.0) |

---

## 🧭 كيف تختار وثيقة؟

```
هل تريد فهم المنتج؟          → architecture/OVERVIEW.md
هل تريد فهم العمارة؟           → architecture/SYSTEM.md
هل تريد فهم تحليل البؤر؟        → architecture/HOTSPOTS_H3.md
هل تريد كتابة كود API؟          → api/REFERENCE.md
هل تريد نشر إنتاج؟              → deployment/PRODUCTION.md
هل تريد إصلاح ثغرة؟             → security/AUDIT.md
هل تريد فهم إصدار محدَّد؟        → monorepos/<version>.md
هل تريد معرفة مصطلح؟            → reference/GLOSSARY.md
```

</div>
