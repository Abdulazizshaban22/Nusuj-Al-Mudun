
# NUSUJ (نُسُج) — v4.7

## الجديد في v4.7
- **محددات مكانية إضافية**: `contains | touches | overlaps | disjoint` ضمن `/ogc/query/spatial`.
- **CQL2-JSON**: دعم `filter-lang=cql2-json` بالإضافة إلى CQL2 النصّي.
- **STAC API**: `GET /stac`, `GET /stac/collections`, `POST /stac/search` (بحث زمان/مكان).
- **Gi***: تفعيل المسار `POST /st/gi_star` (جاهز لربط PySAL + H3 في بيئة الإنتاج).
- **OIDC/JWKS**: تمكين تحقق JWT اختياريًا عبر `VERIFY_JWT=true`.

> يحتفظ هذا الإصدار بكل قدرات v4.5 وv4.6 ويضيف مواصفات OGC/STAC الأوسع.
