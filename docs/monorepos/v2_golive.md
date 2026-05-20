<div dir="rtl">

# nasij_monorepo_v2_golive — تحضير للإنتاج (لكن غير ناضج)

> **«golive» في الاسم، لكن الأمن لا يلبِّي تعريف الإنتاج.**

## ما أُضيف على v2.3

- **Caddy** كـ reverse proxy مع TLS تلقائي عبر ACME.
- توحيد كل الخدمات في docker-compose واحد.

## ما ينقص للإنتاج فعلًا

| المعيار | الحالة |
|---|---|
| TLS | ⚠️ في Caddy لكن لا HSTS |
| Authentication | ❌ Keycloak موجود، لكن غير مدمج في API |
| Secrets Management | ❌ كل شيء في .env.example و docker-compose |
| Healthchecks | ❌ لا توجد |
| Restart Policies | ❌ لا توجد |
| Rate Limiting | ❌ لا في API ولا في Caddy |
| Backups | ❌ لا strategy |
| Monitoring Alerts | ❌ Prometheus بلا rules |
| Graceful Shutdown | ❌ لا handlers لـ SIGTERM |

**يفشل 9 من 14 معيار**. التقييم الكامل في [`../security/AUDIT.md`](../security/AUDIT.md).

## استخدام مقترَح

استعراض هيكل الإنتاج فقط. **لا تشغِّله مباشرة على الإنترنت العامّ**. الإنتاج الحقيقي يبدأ من v8.0.

→ النسخة التالية: [`v3.1-pro`](v3_1_pro.md) للمستوى المؤسّسي.

</div>
