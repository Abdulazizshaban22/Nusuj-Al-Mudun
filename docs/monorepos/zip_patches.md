<div dir="rtl">

# الترقيعات المضغوطة (ZIP Patches) v4.1 → v8.0

> **18 ملف ZIP يُمثِّل تطوُّر الإصدارات. كلّ ملفّ هو إصدار سابق + تغييرات.**

---

## القائمة الكاملة

| الإصدار | الملف | الحجم | الميزة الجوهريّة |
|---|---|---|---|
| v4.1 | `nasij_v4_1_monorepo.zip` | 11.4 KB | Foundation: NestJS + FastAPI + Next.js + Keycloak |
| v4.2 | `nasij_v4_2_monorepo.zip` | 13.5 KB | Open311 schema + Story Studio UI |
| v4.3 | `nasij_v4_3_monorepo.zip` | 14.5 KB | TOPSIS analytics + Story Maps |
| v4.4 | `nasij_v4_4_monorepo.zip` | 17.8 KB | **PDPL compliance** + Terraform scaffolding |
| v4.5 | `nasij_v4_5_monorepo.zip` | 9.9 KB | تركيز Terraform ECS/Fargate |
| v4.8 | `nasij_v4_8_monorepo.zip` | 7.4 KB | تبسيط إلى Express (9 ملفات فقط) |
| v4.9-min | `nusuj_v49_min.zip` | 2.1 KB | Prototype mini (4 ملفات) |
| v5.1 | `nusuj_v5_1_patch.zip` | 5.9 KB | STAC/OGC + CQL2 + Open311 ingest |
| v5.2 | `nusuj_v5_2_patch.zip` | 7.8 KB | KPI compute + Admin UI + Story Viewer |
| v5.3 | `nusuj_v5_3_patch.zip` | 8.3 KB | **Citizen PWA** كامل |
| v5.4-GL | `nusuj_v5_4_golive_patch.zip` | 9.0 KB | S3 presigned + Web Push + Helmet + Loki/Tempo |
| v5.4-PW | `nusuj_v5_4_prod_wireup.zip` | 7.8 KB | Terraform Keycloak + IAM + S3 + ALB + CI/CD |
| v5.5 | `nusuj_v5_5_identity_domains.zip` | 2.8 KB | **OIDC + Nafath** integration |
| v6.0 | `nusuj_v6_0_ai_twin.zip` | 1.7 KB | **AI Twin** service (Moran + Nowcast) |
| v7.0 | `nusuj_v7_0_integration.zip` | 1.7 KB | موصلات GASTAT + Balady + STAC |
| v7.5 | `nusuj_v7_5_prod_wireup2.zip` | 6.3 KB | CloudFront + WAF + Keycloak prod |
| v7.6 | `nusuj_v7_6_prod_wireup3.zip` | 7.1 KB | **ECS Fargate template كامل** + WAF |
| v7.7 | `nusuj_v7_7_golive_scripts.zip` | 4.8 KB | سكربتات go-live + checklist |
| **v8.0** | `nusuj_v8_0_full_release.zip` | 22.4 KB | **الإصدار الموحَّد الإنتاجي** |

---

## ملاحظة عن الفجوات

- **v4.6 و v4.7:** v4.7 موجود كمجلَّد منفصل (`nasij_v4_7_monorepo/`)، v4.6 غير موجود (لم يُصدَر).
- **v7.1-v7.4:** غير موجودة (لم تُصدَر). الانتقال مباشر v7.0 → v7.5.

---

## v8.0 — الإصدار الموحَّد

**المحتوى (49 ملفًا):**
- Terraform v7.6 كاملاً (ECS + WAF + CloudFront + ACM + Route53).
- OIDC v5.5 + Keycloak realm + Nafath docs.
- موصلات v7.0 (GASTAT + Balady + STAC).
- AI Twin v6.0.
- Citizen PWA v5.3 + Observability v5.4.
- سكربتات v7.7 + Go-Live Checklist + Rollback Plan.

**نقطة الدخول:**
```bash
unzip nusuj_v8_0_full_release.zip
cd nusuj_v8_0_full_release
cat README_v8.md          # نظرة عامّة
cat golive.tfvars         # املأ القيم
make init                 # terraform init
make apply                # terraform apply
make realm                # bootstrap-keycloak.sh
make seed                 # seed-kpis.sh
```

تفاصيل النشر في [`../deployment/PRODUCTION.md`](../deployment/PRODUCTION.md).

---

## استخراج ملفّ ZIP بأمان

```bash
# لا تستخرج إلى /tmp أو أيّ مكان عامّ:
mkdir -p ~/nusuj-extract/v8.0
cd ~/nusuj-extract/v8.0
unzip /path/to/nusuj_v8_0_full_release.zip

# تحقَّق من المحتوى قبل التشغيل:
ls -la
find . -type f -name "*.sh" -exec ls -la {} \;
```

---

## الفرق بين patch و monorepo

- **`*_monorepo.zip` (v4.1-v4.8):** نسخة كاملة قابلة للتشغيل مستقلَّة.
- **`*_patch.zip` (v5.1-v5.5):** مجموعة ملفّات تُضاف فوق نسخة سابقة.
- **`v7.6_prod_wireup3.zip`:** Terraform-only (لا يحوي صور Docker — يجب بناؤها قبل apply).
- **`v8.0_full_release.zip`:** كلّ شيء في مكان واحد.

</div>
