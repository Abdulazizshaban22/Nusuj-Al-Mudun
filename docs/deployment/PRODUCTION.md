<div dir="rtl">

# دليل النشر الإنتاجي — Production Deployment

> **خطوات نشر نُسُج v8.0 إلى إنتاج AWS باستخدام Terraform + ECS Fargate + CloudFront + WAF.**

---

## 1. ما تحتاجه قبل البدء

### الحسابات
- ✅ حساب AWS مع صلاحيّات Administrator (للأوّل مرّة).
- ✅ نطاق DNS مسجَّل (مثل `nusuj.sa`).
- ✅ حساب Keycloak Realm جاهز (أو ستُنشئه عبر سكربت bootstrap).

### الأدوات المحلِّيّة
```bash
# تأكَّد من تثبيت:
terraform -v          # ≥ 1.5
aws --version         # ≥ 2.x
docker --version      # ≥ 24.x
kubectl version       # ≥ 1.27 (اختياري إن استخدمت EKS بدلاً من ECS)
node -v               # ≥ 20
python3 -V            # ≥ 3.11
```

### الـ ZIP المُعتمَد
`01- nusoj code/nusuj_v8_0_full_release.zip` (هذا فقط ما يجب نشره إلى الإنتاج).

---

## 2. خطوات النشر الكلِّيّة

```
┌──────────────────────────────────────────┐
│ 1. إعداد البيئة (env vars + secrets)      │
│ 2. بناء صور Docker ودفعها إلى ECR         │
│ 3. terraform init                         │
│ 4. terraform plan -var-file=golive.tfvars │
│ 5. terraform apply                        │
│ 6. bootstrap-keycloak.sh                  │
│ 7. seed-kpis.sh                           │
│ 8. check-acm.sh (التحقُّق من شهادات TLS)   │
│ 9. update-ecs.sh (نشر الإصدار الجديد)     │
│ 10. اختبارات Smoke + go-live.sh          │
└──────────────────────────────────────────┘
```

---

## 3. التفاصيل خطوة بخطوة

### 3.1 إعداد البيئة

#### استخرج الإصدار:
```bash
mkdir -p /opt/nusuj && cd /opt/nusuj
unzip /path/to/nusuj_v8_0_full_release.zip
ls -la
# يجب أن تجد: README_v8.md, Makefile, golive.tfvars, terraform/, services/, ...
```

#### املأ ملف `golive.tfvars`:
```hcl
# golive.tfvars
aws_region   = "me-central-1"   # الرياض
project      = "nusuj"
environment  = "prod"

domain_root  = "nusuj.sa"
admin_subdomain   = "admin"
citizen_subdomain = "citizen"
api_subdomain     = "api"
cdn_subdomain     = "cdn"

# Container Images (يجب أن تكون في ECR قبل apply)
api_image       = "123456789012.dkr.ecr.me-central-1.amazonaws.com/nusuj-api:v8.0.0"
admin_image     = "123456789012.dkr.ecr.me-central-1.amazonaws.com/nusuj-admin:v8.0.0"
citizen_image   = "123456789012.dkr.ecr.me-central-1.amazonaws.com/nusuj-citizen:v8.0.0"
ai_twin_image   = "123456789012.dkr.ecr.me-central-1.amazonaws.com/nusuj-ai-twin:v8.0.0"

# Database
db_instance_class = "db.r6g.large"
db_storage_gb     = 100
db_multi_az       = true

# Keycloak
keycloak_issuer = "https://auth.nusuj.sa/realms/nusuj"

# Tags
tags = {
  Project     = "Nusuj"
  Environment = "prod"
  Owner       = "ops-team@nusuj.sa"
  CostCenter  = "URB-001"
}
```

#### الأسرار (Secrets) — لا تضعها في tfvars:
```bash
# استخدم AWS Secrets Manager:
aws secretsmanager create-secret --name nusuj/prod/db-password \
  --secret-string "$(openssl rand -base64 32)"

aws secretsmanager create-secret --name nusuj/prod/nextauth-secret \
  --secret-string "$(openssl rand -base64 32)"

aws secretsmanager create-secret --name nusuj/prod/keycloak-admin \
  --secret-string "$(openssl rand -base64 32)"

aws secretsmanager create-secret --name nusuj/prod/mqtt-credentials \
  --secret-string '{"username":"iot_publisher","password":"'$(openssl rand -base64 24)'"}'
```

---

### 3.2 بناء صور Docker

#### إعداد ECR repositories:
```bash
for svc in api admin citizen ai-twin; do
  aws ecr create-repository --repository-name nusuj-$svc --region me-central-1
done
```

#### تسجيل دخول Docker:
```bash
aws ecr get-login-password --region me-central-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.me-central-1.amazonaws.com
```

#### بناء ودفع كل صورة:
```bash
# مثال للـ API:
cd services/api
docker build -t nusuj-api:v8.0.0 .
docker tag nusuj-api:v8.0.0 \
  123456789012.dkr.ecr.me-central-1.amazonaws.com/nusuj-api:v8.0.0
docker push \
  123456789012.dkr.ecr.me-central-1.amazonaws.com/nusuj-api:v8.0.0

# كرِّر لـ web-admin, web-citizen, ai-twin
```

---

### 3.3 Terraform: ابدأ الإطار

```bash
cd /opt/nusuj
make init
# يعمل: terraform init -backend-config=backend.hcl
```

أو يدويًّا:
```bash
terraform init \
  -backend-config="bucket=nusuj-tfstate-prod" \
  -backend-config="key=nusuj/prod/terraform.tfstate" \
  -backend-config="region=me-central-1" \
  -backend-config="dynamodb_table=nusuj-tflocks"
```

---

### 3.4 خطّ التَحقُّق ثم التطبيق

#### Plan:
```bash
terraform plan -var-file=golive.tfvars -out=tfplan
```

اقرأ الناتج بعناية. يجب أن يُنشئ:
- VPC + 3 Subnets (2 private، 1 public).
- ECS Cluster + 4 Services (api, admin, citizen, ai-twin).
- ALB مع Host-based routing.
- CloudFront Distribution + ACM Certificates.
- S3 Bucket (للأصول المواطن).
- RDS PostgreSQL (Multi-AZ).
- WAF: 2 Web ACLs (global لـ CloudFront + regional لـ ALB).
- IAM Roles.
- Route53 records.

#### Apply:
```bash
terraform apply tfplan
```

⚠️ **يستغرق 20-40 دقيقة** بسبب CloudFront و RDS و ACM validation.

---

### 3.5 إعداد Keycloak Realm

```bash
make realm
# يعمل: scripts/bootstrap-keycloak.sh
```

السكربت داخليًّا:
1. ينتظر Keycloak server يصبح ready.
2. يستورد `keycloak/realm-nusuj.json`.
3. يُنشئ Clients: `nusuj-admin`, `nusuj-citizen`.
4. يُنشئ Roles: `admin`, `municipality`, `analyst`, `citizen`.
5. يُخرج Client Secrets إلى AWS Secrets Manager.

**خطوة يدويّة بعد ذلك:**
- ادخل Keycloak Admin Console.
- اربط Realm `nusuj` بـ Nafath IdP (federation):
  - Identity Providers → Add provider → SAML/OIDC.
  - أدخِل metadata الخاصة بـ Nafath (من بوّابة المركز الوطني للمعلومات).

---

### 3.6 تعبئة مؤشّرات KPI الأوّليّة

```bash
make seed
# يعمل: scripts/seed-kpis.sh
```

السكربت:
1. يفتح اتّصال psql إلى RDS.
2. يُنفِّذ migrations من `db/migrations/V001-V010.sql`.
3. يستورد عيِّنة بيانات `urban_cells` للرياض (من sample Riyadh polygons).
4. يحقن بيانات أوّليّة في `fabric_indicators`.

---

### 3.7 التحقُّق من ACM Certificates

```bash
make check-acm
# يعمل: scripts/check-acm.sh
```

السكربت يتأكَّد من:
- ✅ شهادة CloudFront في `us-east-1` (إجباري لـ CloudFront).
- ✅ شهادة ALB في `me-central-1`.
- ✅ كل الشهادات في حالة `ISSUED` وليس `PENDING_VALIDATION`.

إن كانت `PENDING`، أضف DNS validation records في Route53 (Terraform يفعل ذلك تلقائيًّا، لكن قد يحتاج وقتًا للانتشار).

---

### 3.8 نشر الإصدار الجديد إلى ECS

```bash
make update-ecs
# يعمل: scripts/update-ecs.sh
```

السكربت لكل خدمة من الأربع:
1. يُحدِّث Task Definition بصورة الـ ECR الجديدة.
2. ينتظر `service stable` (rolling update مع health checks).
3. يتحقَّق من `runningCount == desiredCount`.

---

### 3.9 اختبارات الـ Smoke + Go-Live

```bash
make go-live
# يعمل: scripts/go-live.sh
```

السكربت يُجري:

#### اختبارات DNS:
```bash
dig admin.nusuj.sa
dig citizen.nusuj.sa
dig api.nusuj.sa
# يجب أن تُرجِع IP CloudFront/ALB صحيح
```

#### اختبارات TLS:
```bash
curl -sS https://api.nusuj.sa/health
# يجب أن يُرجِع {"ok": true, ...}

openssl s_client -connect api.nusuj.sa:443 -servername api.nusuj.sa < /dev/null
# يجب أن يُظهر شهادة صحيحة
```

#### اختبارات Auth:
```bash
# جلب JWT من Keycloak:
TOKEN=$(curl -s -X POST \
  "https://auth.nusuj.sa/realms/nusuj/protocol/openid-connect/token" \
  -d "grant_type=password" \
  -d "client_id=nusuj-admin" \
  -d "client_secret=$CLIENT_SECRET" \
  -d "username=admin@nusuj.sa" \
  -d "password=$ADMIN_PWD" | jq -r .access_token)

# استخدمه على API:
curl -H "Authorization: Bearer $TOKEN" https://api.nusuj.sa/admin/users
```

---

## 4. قائمة فحص الإطلاق (Go-Live Checklist)

من `nusuj_v7_7_golive_scripts.zip` (15 خطوة):

- [ ] 1. كل الأسرار في Secrets Manager وليس في tfvars.
- [ ] 2. Terraform state في S3 مع DynamoDB lock.
- [ ] 3. صور Docker مدفوعة إلى ECR بـ tag إصدار محدَّد (لا `latest`).
- [ ] 4. RDS Multi-AZ مفعَّل.
- [ ] 5. RDS snapshots اليوميّة مفعَّلة (retention ≥ 7 days).
- [ ] 6. CloudFront يستخدم ACM custom certificate (لا default).
- [ ] 7. WAF rules مفعَّلة (managed + rate limiting).
- [ ] 8. ALB Access Logs إلى S3.
- [ ] 9. CloudWatch Alarms لكل خدمة (CPU, Memory, Latency, Errors).
- [ ] 10. ECS auto-scaling مضبوط (min=2, max=10, target=70% CPU).
- [ ] 11. Keycloak realm-export.json مُحفَظ كنسخة احتياطية.
- [ ] 12. Nafath federation تمَّ اختباره (login flow كامل).
- [ ] 13. PWA manifest محدَّد بـ `https://citizen.nusuj.sa` (لا localhost).
- [ ] 14. Sentry / Datadog DSN معبّأ.
- [ ] 15. خطّة Rollback مُعتمَدة (انظر القسم 6).

---

## 5. مراقبة الإنتاج

### Prometheus + Grafana
```bash
# يُنشئها Terraform بالافتراض. الوصول:
https://grafana.nusuj.sa  # محمي بـ Keycloak
```

اللوحات:
- **Service Health:** CPU/Memory/Errors لكل ECS task.
- **API Latency:** p50/p90/p99 لكل endpoint.
- **Fabric Index Trends:** سلاسل زمنيّة لكل مدينة.
- **IoT Throughput:** أحداث/ثانية + إجمالي يومي.
- **Citizen Reports:** عدد البلاغات حسب الحالة.

### Logs (Loki + Tempo، v5.4+)
```bash
# Loki: structured JSON logs
# Tempo: distributed tracing
# الوصول: https://logs.nusuj.sa
```

### Alerts (AlertManager)
- 🔴 **P0:** API down ≥ 1 دقيقة.
- 🟠 **P1:** Latency p99 > 2s لـ 5 دقائق.
- 🟡 **P2:** Error rate > 1% لـ 15 دقيقة.
- 🟢 **Info:** نشر جديد، تغيُّر في AlarmState.

---

## 6. خطّة الـ Rollback

من `nusuj_v7_7_golive_scripts.zip/ROLLBACK_PLAN.md`:

### السيناريو 1: مشكلة في الـ API فقط
```bash
# ارجع إلى الإصدار السابق:
aws ecs update-service \
  --cluster nusuj-prod \
  --service nusuj-api \
  --task-definition nusuj-api:PREVIOUS_REVISION

# انتظر استقرار الخدمة:
aws ecs wait services-stable \
  --cluster nusuj-prod --services nusuj-api
```

### السيناريو 2: مشكلة في المخطّط (Schema)
```bash
# إن كان migration فشل:
flyway -url=jdbc:postgresql://... migrate -target=PREVIOUS_VERSION

# أو استرجاع من snapshot:
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier nusuj-prod-restored \
  --db-snapshot-identifier nusuj-prod-2026-05-19
```

### السيناريو 3: مشكلة في CloudFront
```bash
# عطِّل CloudFront و وجِّه DNS مباشرة إلى ALB:
aws cloudfront update-distribution \
  --id E2QWERTY \
  --distribution-config '{"Enabled": false, ...}'

# حدِّث Route53 ليُشير إلى ALB:
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123 \
  --change-batch '{"Changes": [{"Action": "UPSERT", ...}]}'
```

### السيناريو الأسوأ: انهيار كامل
```bash
# الـ Cold Standby في region آخر (إن وُجد):
# 1. غيِّر Route53 health check إلى region البديل.
# 2. roll back snapshot DB.
# 3. عطِّل region المعطَّب.
```

---

## 7. تكاليف تقديريّة (شهريّة، AWS me-central-1)

| المكوِّن | السعر التقريبي |
|---|---|
| ECS Fargate (4 خدمات × 2 task × 0.5 vCPU + 1 GB) | ~ $180 |
| RDS PostgreSQL r6g.large Multi-AZ + 100 GB | ~ $400 |
| ALB | ~ $25 |
| CloudFront (10 GB/شهر) | ~ $10 |
| Route53 hosted zone + queries | ~ $5 |
| S3 (50 GB + 1M requests) | ~ $5 |
| Secrets Manager (10 secrets) | ~ $5 |
| CloudWatch Logs + Metrics | ~ $50 |
| WAF (Global + Regional) | ~ $20 |
| Data Transfer | ~ $30 |
| **المجموع التقديري** | **~ $730/شهر** |

(يزيد مع الاستخدام الفعلي)

---

## 8. ما بعد الإطلاق

- 🗓 **اليوم 1-7:** متابعة 24/7. أيّ خطأ يصل P1 يُحرِّك ON-CALL.
- 🗓 **الأسبوع 2:** Retrospective داخلي على مشاكل الإطلاق.
- 🗓 **الشهر الأوّل:** زيارة Pen Tester خارجي.
- 🗓 **الشهر الثالث:** Compliance Audit لـ PDPL.
- 🗓 **الربع الأوّل:** أوّل Penetration Test كامل.

</div>
