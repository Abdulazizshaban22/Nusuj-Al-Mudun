<div dir="rtl">

# خطّة الإصلاح — Remediation Plan

> **خارطة تنفيذية موجزة لإغلاق الثغرات المكتشفة في [`AUDIT.md`](AUDIT.md).**

---

## المبدأ التوجيهي

```
لا يُطلَق إلى الإنتاج قبل إغلاق كل CRITICAL
لا يُفتَح للجمهور قبل إغلاق ≥80% من HIGH
لا تُعتبر منصّة ناضجة قبل إغلاق ≥80% من MEDIUM
```

---

## الموجة الأولى — قبل أيّ نشر (14 ثغرة CRITICAL)

| # | الثغرة | المالك المقترَح | الجهد التقديري | تابع |
|---|---|---|---|---|
| 1 | SEC-C-01 hardcoded passwords | DevOps | 2 أيام | إعداد AWS Secrets Manager أو HashiCorp Vault |
| 2 | SEC-C-02 NextAuth secret | Backend | 1 ساعة | إضافة assertion في route.ts |
| 3 | SEC-C-03 Admin API بلا حماية | Backend | 3 أيام | NestJS Guards + JwtStrategy |
| 4 | SEC-C-04 CORS مفتوح | Backend | 2 ساعات | env var + validation |
| 5 | SEC-C-05 MQTT anonymous | DevOps | 1 يوم | password file + TLS certs |
| 6 | SEC-C-06 ZIP bomb | Backend | 4 ساعات | حدود حجم + extract iteratively |
| 7 | SEC-C-07 Keycloak URL fallback | Backend | 1 ساعة | حذف الـ default |
| 8 | SEC-C-08 SessionProvider missing | Frontend | 2 ساعات | تعديل root layout |
| 9 | SEC-C-09 DROP TABLE | DBA | 1 يوم | تبنّي Flyway/Alembic |
| 10 | SEC-C-10 H3 res unbounded | Backend | 1 ساعة | Pydantic Query validation |
| 11 | SEC-C-11 PDPL gaps | Lead + Legal | 1 أسبوع | جدول audit + DSR endpoint |
| 12 | SEC-C-12 JWT verify | Backend | 1 يوم | jwks-rsa integration |
| 13 | SEC-C-13 VERIFY_JWT=false default | Backend | 30 دقيقة | enforce في prod |
| 14 | SEC-C-14 Keycloak realm secrets | DevOps | 1 يوم | terraform vars per env |

**المجموع التقديري:** ~3 أسابيع لفريق من 2 مهندس backend + 1 frontend + 1 DevOps + 1 DBA + 1 قانوني.

---

## الموجة الثانية — قبل الفتح للجمهور (20 ثغرة HIGH)

```
الأسبوع 4: SEC-H-01 إلى SEC-H-05  (الفهارس، الإبقاء، Roles)
الأسبوع 5: SEC-H-06 إلى SEC-H-10  (Pooling, CSRF, Healthchecks)
الأسبوع 6: SEC-H-11 إلى SEC-H-15  (Revit, Indexes, TS strict)
الأسبوع 7: SEC-H-16 إلى SEC-H-20  (Datetime, FK, NOT NULL, retry, MQTT TLS)
```

---

## الموجة الثالثة — قبل إعلان المنصّة ناضجة (18 ثغرة MEDIUM)

```
الشهر الثاني: SEC-M-01 إلى SEC-M-09 (Performance + Monitoring)
الشهر الثالث: SEC-M-10 إلى SEC-M-18 (Hardening + Rate Limiting)
```

---

## الموجة الرابعة — تنظيف ومتانة (9 ثغرات LOW)

في دورة التحسين المستمرّ، أيّ Sprint يأخذ 2-3 منها.

---

## مصفوفة الأولوية × الجهد

```
                        تأثير عالٍ                    تأثير منخفض
       ┌──────────────────────────┬──────────────────────────┐
جهد    │ SEC-C-03 (JWT guards)     │ SEC-L-01 (unused imports)  │
منخفض  │ SEC-C-02 (NextAuth)        │ SEC-L-06 (naming)          │
       │ SEC-C-04 (CORS)            │ SEC-L-07 (deps)            │
       │ SEC-C-10 (H3 res)          │                            │
       │ SEC-C-07 (Keycloak url)    │                            │
       ├──────────────────────────┼──────────────────────────┤
جهد    │ SEC-C-01 (secrets mgmt)    │ SEC-M-15 (CloudFront cert)│
عالٍ    │ SEC-C-05 (MQTT auth+TLS)   │ SEC-M-04 (DB monitoring)   │
       │ SEC-C-11 (PDPL)            │ SEC-L-08 (OSRM script)     │
       │ SEC-H-08 (Healthchecks)     │                            │
       │ SEC-M-01 (Caching)         │                            │
       └──────────────────────────┴──────────────────────────┘
```

**اعمل أولًا من ربع «جهد منخفض × تأثير عالٍ» — Quick Wins.**

---

## وحدات اختبار يجب إضافتها

| الوحدة | يكشف |
|---|---|
| `test_jwt_guards.py` | يضمن SEC-C-03 لا يرتدّ |
| `test_h3_resolution_bounds.py` | يضمن SEC-C-10 |
| `test_zip_extraction_limit.py` | يضمن SEC-C-06 |
| `test_role_enum_validation.py` | يضمن SEC-H-04 |
| `test_cors_allowlist.py` | يضمن SEC-C-04 |

---

## مراجعة بعد كل موجة

- **بعد الموجة 1:** مراجعة داخلية، اختبارات تكاملية كاملة.
- **بعد الموجة 2:** Pen Test خارجي على staging.
- **بعد الموجة 3:** Compliance Audit لـ PDPL.
- **بعد الموجة 4:** Bug Bounty Program عند الاستقرار.

---

## ميزانية تقديرية (لفريق صغير)

| البند | التكلفة الشهريّة |
|---|---|
| فريق 5 مهندسين × 3 أشهر | (حسب أجور المنطقة) |
| Pen Test خارجي | ~ 50,000 ر.س |
| Compliance Audit | ~ 30,000 ر.س |
| Bug Bounty (سنة أولى) | ~ 100,000 ر.س |
| Trivy/Snyk/SonarQube licenses | ~ 1,000 $/شهر |

---

## مؤشّرات النجاح (Success Metrics)

- **Vulnerability Mean Time to Resolution (MTTR):** أقل من 7 أيام للـ CRITICAL.
- **Test Coverage:** ≥ 70% على الـ API الإدارية.
- **CSPM Score:** A أو أعلى على AWS Config.
- **Zero P0 incidents** في 90 يومًا بعد الإصلاح.

</div>
