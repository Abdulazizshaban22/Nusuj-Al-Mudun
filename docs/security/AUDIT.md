<div dir="rtl">

# المراجعة الأمنية الشاملة — Security Audit

> **تجميع كامل ومُرتَّب لكل الثغرات المُكتشَفة من 10 خبراء راجعوا الإصدارات. الأولوية حسب الشدّة والاستغلال السهل.**

**تاريخ المراجعة:** 2026-05-20
**عدد الإصدارات المراجَعة:** 19
**عدد الثغرات المُكتشَفة:** 61 موزَّعة على 4 مستويات

---

## 1. ملخّص تنفيذي

| المستوى | العدد | المعنى |
|---|---|---|
| 🔴 **CRITICAL** | 14 | استغلال فوريّ مع تأثير واسع — يجب الإصلاح قبل أيّ نشر |
| 🟠 **HIGH** | 20 | استغلال نسبيًّا سهل أو تأثير كبير — إصلاح في أوّل أسبوع |
| 🟡 **MEDIUM** | 18 | استغلال يحتاج شروطًا أو تأثير محدود — إصلاح قبل المنتج |
| 🟢 **LOW** | 9 | إزعاج تقني أو ممارسة سيّئة — في دورة التحسين |

> **التقييم العامّ:** المنصّة **ليست جاهزة للإنتاج** قبل معالجة الـ CRITICAL على الأقلّ (14 ثغرة).

---

## 2. الثغرات الحرجة (CRITICAL) 🔴

### SEC-C-01: كلمات مرور افتراضيّة محشورة في الكود
**الإصدارات المتأثِّرة:** v2.1, v2.2, v2.3, v2-golive, v4 (كل النسخ التي تحتوي docker-compose).
**الملفات:**
- `infra/docker-compose.yml` — `GF_SECURITY_ADMIN_PASSWORD=admin` (Grafana).
- `infra/docker-compose.yml` — `KEYCLOAK_ADMIN_PASSWORD=admin` (Keycloak).
- `.env.example` — `POSTGRES_PASSWORD=nasij`, `MQTT_PASSWORD=nasij`.
- `services/iot/listener.py` (السطر 10) — `MQTT_PASSWORD = os.getenv("MQTT_PASSWORD","nasij")` — افتراضي ضعيف.
- `services/etl/app.py` (السطر 12) — `DATABASE_URL = os.getenv(..., "postgresql://nasij:nasij@db:5432/nasij")`.
- `infra/mosquitto/mosquitto.conf` (v4) — `allow_anonymous true`.

**الاستغلال:** الوصول للمستويات الإدارية والـ DB والـ MQTT بكلمات مرور معلومة عالميًّا.

**الإصلاح (مقترح):**
```yaml
# docker-compose.yml — استخدم Docker secrets أو env file خارجي
secrets:
  grafana_admin_password:
    file: ./secrets/grafana_admin_password.txt
services:
  grafana:
    environment:
      - GF_SECURITY_ADMIN_PASSWORD__FILE=/run/secrets/grafana_admin_password
    secrets:
      - grafana_admin_password
```
وعلى مستوى تطبيقي:
```python
# listener.py
MQTT_PASSWORD = os.environ["MQTT_PASSWORD"]  # ❗ يرمي خطأ إن لم تُحدَّد
```

---

### SEC-C-02: NextAuth Secret Fallback ضعيف
**الإصدارات:** v2.1, v2.2, v2.3, v3-ui-full.
**الموقع:** `apps/web/app/api/auth/[...nextauth]/route.ts` السطر ~30
```typescript
secret: process.env.NEXTAUTH_SECRET || "please-change"
```

**الاستغلال:** عند نشر بدون `NEXTAUTH_SECRET`، المهاجم يستطيع توقيع Sessions مزوَّرة.

**الإصلاح:**
```typescript
const secret = process.env.NEXTAUTH_SECRET;
if (!secret) throw new Error("NEXTAUTH_SECRET is required");
export const authOptions = { secret, /* ... */ };
```

---

### SEC-C-03: لا حماية على Admin API
**الإصدارات:** v2.1, v2.2, v2.3, v2-golive (كل النسخ قبل v5.5).
**الموقع:** `services/api/src/users.controller.ts`
- `GET /admin/users` — يكشف كل المستخدمين بدون JWT.
- `POST /admin/users` — يُنشئ مستخدمًا بدون مصادقة.
- `PUT /admin/users/:id/role` — يرفع أيّ مستخدم إلى `admin`.

**Proof of Concept:**
```bash
curl -X POST http://localhost:8088/admin/users \
  -H "Content-Type: application/json" \
  -d '{"email":"attacker@evil.com","name":"Att","role":"admin"}'
```

**الإصلاح:**
```typescript
// users.controller.ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/users')
export class UsersController {
  // ...
}
```
وتنفيذ `JwtAuthGuard` يتحقّق من JWKS الصادر من Keycloak.

---

### SEC-C-04: CORS مفتوح للجميع (`cors: true`)
**الإصدارات:** كل النسخ قبل v8.0.
**الموقع:** `services/api/src/main.ts`
```typescript
const app = await NestFactory.create(AppModule, { cors: true })
```

**الاستغلال:** أيّ موقع يستطيع استدعاء API الإدارة من المتصفِّح (مع دمج CSRF).

**الإصلاح:**
```typescript
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);
if (allowedOrigins.length === 0) throw new Error("ALLOWED_ORIGINS required");
const app = await NestFactory.create(AppModule, {
  cors: { origin: allowedOrigins, credentials: true }
});
```

---

### SEC-C-05: MQTT بلا مصادقة (anonymous=true)
**الإصدار:** v4 و v4.7.
**الموقع:** `infra/mosquitto/mosquitto.conf`
```
listener 1883
allow_anonymous true
```

**الاستغلال:** أيّ عميل MQTT يتّصل بدون اعتماد، ينشر بيانات مزوَّرة على `sensors/+/+`.

**الإصلاح:**
```
listener 1883
allow_anonymous false
password_file /mosquitto/config/passwords
acl_file /mosquitto/config/acl

# في ملف acl:
user iot_publisher
topic write sensors/#
user iot_listener
topic read sensors/#
```
وتفعيل TLS:
```
listener 8883
cafile /mosquitto/certs/ca.crt
certfile /mosquitto/certs/server.crt
keyfile /mosquitto/certs/server.key
require_certificate true
```

---

### SEC-C-06: ZIP Bomb في Marketplace
**الإصدار:** v3.1-pro.
**الموقع:** `services/marketplace/app.py` (السطر ~43)
```python
async def install_plugin(file: UploadFile = File(...)):
    data = await file.read()              # ❗ بلا حدّ
    with open(os.path.join(dest, "upload.zip"), "wb") as f: f.write(data)
    with zipfile.ZipFile(os.path.join(dest, "upload.zip")) as zf:
        zf.extractall(dest)                # ❗ بلا تحقُّق من الحجم النهائي
```

**الاستغلال:** ملف ZIP بـ 1MB يتمدَّد إلى 100GB → استنزاف القرص.

**الإصلاح:**
```python
MAX_ZIP_SIZE = 50 * 1024 * 1024          # 50 MB
MAX_EXTRACTED_SIZE = 500 * 1024 * 1024   # 500 MB

async def install_plugin(file: UploadFile = File(...)):
    data = await file.read()
    if len(data) > MAX_ZIP_SIZE:
        raise HTTPException(413, "ZIP too large")
    
    total = 0
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        for info in zf.infolist():
            total += info.file_size
            if total > MAX_EXTRACTED_SIZE:
                raise HTTPException(413, "Extracted content too large")
        zf.extractall(dest)
```

---

### SEC-C-07: Hardcoded Keycloak URL Fallback إلى localhost
**الإصدارات:** v2.1, v3-ui-full.
**الموقع:** `apps/web/app/api/auth/[...nextauth]/route.ts` السطر ~10
```typescript
issuer: (process.env.KEYCLOAK_URL || "http://localhost:8081") + ...
```

**الاستغلال:** نشر إنتاجي يبقى يربط بـ HTTP localhost لو لم تُحدَّد البيئة.

**الإصلاح:**
```typescript
const keycloakUrl = process.env.KEYCLOAK_URL;
if (!keycloakUrl) throw new Error("KEYCLOAK_URL is required");
if (!keycloakUrl.startsWith("https://")) {
  console.warn("⚠️ KEYCLOAK_URL is not HTTPS — only acceptable in dev");
}
```

---

### SEC-C-08: SessionProvider غير مدمج في root layout
**الإصدار:** v3-ui-full.
**الموقع:** `apps/web/app/layout.tsx`
- المكوِّن `SessionProvider` معرَّف في `providers/SessionProvider.tsx`.
- **لكن لا يُستخدَم في root layout.**
- `useSession()` في صفحة `/admin` يُرجِع `null` بشكل غير متوقَّع.

**النتيجة:** صلاحيات المستخدم لا تُحفَظ بين الـ navigations، وأخطر: قد تظنّ الواجهة أنّ المستخدم غير مُسجَّل عندما هو فعليًّا كذلك (و العكس).

**الإصلاح:**
```typescript
// apps/web/app/layout.tsx
import SessionProvider from './providers/SessionProvider';
export default function RootLayout({ children }) {
  return (
    <html dir="rtl">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

---

### SEC-C-09: مخطّط جداول DB ينفُّذ DROP TABLE في كل startup
**الإصدار:** v1.2.
**الموقع:** `infra/sql/schema.sql`
```sql
DROP TABLE IF EXISTS fabric_indicators;
DROP TABLE IF EXISTS urban_cells;
CREATE TABLE urban_cells (...);
```

**الاستغلال:** فقدان البيانات عند كل docker-compose down ثم up.

**الإصلاح:** استبدال بـ migration system (Alembic/Flyway/Sqitch) أو نمط idempotent بدون DROP:
```sql
CREATE TABLE IF NOT EXISTS urban_cells (...);
-- التحديثات تُعالَج كـ ALTER TABLE
```

---

### SEC-C-10: لا تحقُّق من نطاق H3 resolution
**الإصدارات:** v2.3, v8.0.
**الموقع:** `services/etl/tools/registry_100.py` (السطر ~315)
```python
@router.get("/h3_aggregate")
def h3_aggregate(res: int = 8, metric: str = "fabric_index"):
    h = h3.geo_to_h3(lat, lon, int(res))  # ❗ بلا تحقُّق
```

**الاستغلال:**
- `?res=999` → استثناء داخلي ينكشف للمستخدم.
- `?res=0` → استعلام مفرط الحجم (هكس واحد للعالم).
- `?res=-1` → سلوك غير محدَّد.

**الإصلاح:**
```python
@router.get("/h3_aggregate")
def h3_aggregate(res: int = Query(8, ge=0, le=15),
                 metric: str = Query("fabric_index", regex="^[a-z_]+$")):
    # ...
```

---

### SEC-C-11: PDPL Compliance ضعيفة
**الإصدارات:** v4.4 (بدأ الاهتمام) ولكن غير مكتمل في v8.0.
**الفجوة:**
- لا توجد آلية لـ **DSR** (Data Subject Rights) — حقّ المواطن في حذف بياناته.
- لا توجد سجلّات تدقيق (audit logs) لمن قرأ بيانات بلاغات المواطنين.
- لا توجد آليّة لتشفير بيانات شخصيّة في الـ DB (PII at-rest encryption).

**الإصلاح:**
- جدول `audit_log` لكل عمليّة قراءة/كتابة على `urban.citizen_reports`.
- نقطة نهاية `DELETE /citizen/me` تُمسح كل بياناته.
- استخدام `pgcrypto` لحقول حسّاسة (national_id, phone).

---

### SEC-C-12: JWT decoding بدون التحقُّق من التوقيع
**الإصدارات:** v2.1, v2.2, v2.3, v3-ui-full.
**الموقع:** `apps/web/app/api/auth/[...nextauth]/route.ts` السطر ~14-23
```typescript
async jwt({ token, account }) {
  try {
    const at = account?.access_token;
    if (at) {
      const body = JSON.parse(Buffer.from(at.split('.')[1], 'base64').toString());
      const roles = body?.realm_access?.roles || [];
      token.roles = roles;
    }
  } catch {}
  return token;
}
```

**التهديد:** الكود يفكّ ترميز Base64 بدون التحقُّق من التوقيع. إن أُهملت طبقات التحقُّق الداخلية في NextAuth، يستطيع المهاجم تزوير الأدوار.

**الإصلاح:** استخدام `jsonwebtoken.verify()` بمفتاح JWKS من Keycloak:
```typescript
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({ jwksUri: `${KEYCLOAK_URL}/realms/${realm}/protocol/openid-connect/certs` });

async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) reject(err); else resolve(decoded);
    });
  });
}
```

---

### SEC-C-13: JWT validation default-disabled في v4.7
**الإصدار:** v4.7.
**الموقع:** `services/api/src/index.ts` السطر ~23
- `VERIFY_JWT=false` افتراضيًّا.
- إذا `KEYCLOAK_ISSUER` أو `KEYCLOAK_JWKS_URL` فارغين، يُتجاوز التحقُّق صامتًا.

**الإصلاح:**
```typescript
const verifyJwt = process.env.VERIFY_JWT === 'true';
if (process.env.NODE_ENV === 'production' && !verifyJwt) {
  throw new Error('VERIFY_JWT must be true in production');
}
```

---

### SEC-C-14: مفاتيح Keycloak Realm محشورة صلبًا
**الإصدارات:** v7.5, v8.0.
**الموقع:** `keycloak/realm-nusuj.json`
- `client_id`, `client_secret`, `redirect_uris` كلها قيم ثابتة.

**التهديد:** نشر متعدِّد البيئات (dev/stage/prod) باستخدام نفس الـ realm.json يُعرِّض الـ secrets.

**الإصلاح:** قوالب Terraform/Helm تُولِّد الـ realm.json حسب البيئة، أو استخدام Keycloak Provider Configuration via environment variables.

---

## 3. الثغرات العالية (HIGH) 🟠

### SEC-H-01: لا فهارس مكانيّة على iot_events
**الإصدارات:** كل النسخ.
**الموقع:** `infra/sql/schema.sql`
```sql
CREATE TABLE iot_events (..., geom geometry(Point, 4326));  -- ❗ بدون GIST index
```
**التأثير:** عند 1M+ سجلّ، استعلامات الجوار تتحوَّل إلى Full Table Scan.
**الإصلاح:**
```sql
CREATE INDEX idx_iot_events_geom ON iot_events USING GIST(geom);
CREATE INDEX idx_iot_events_ts ON iot_events(ts DESC);
```

### SEC-H-02: تخزين iot_events غير مُحدَّد المدّة
**التأثير:** القرص يمتلئ تدريجيًّا.
**الإصلاح:**
```sql
-- Partitioning بالشهر
CREATE TABLE iot_events (
  /* ... */
) PARTITION BY RANGE (ts);
CREATE TABLE iot_events_2026_05 PARTITION OF iot_events
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
-- + cron job: DELETE FROM iot_events WHERE ts < NOW() - INTERVAL '180 days'
```

### SEC-H-03: schema.sql ل v2.3 يستعلم عن أعمدة غير موجودة
**الإصدار:** v2.3.
**الموقع:** `infra/grafana/provisioning/dashboards/fabric_city.json` يستخدم:
- `urban_cells.city` ← غير موجود.
- جدول `gi_hotspots` ← غير موجود.
- `urban_cells.access_15min` ← غير موجود.
**الإصلاح:** migration إضافي:
```sql
ALTER TABLE urban_cells ADD COLUMN city TEXT DEFAULT 'Unknown';
ALTER TABLE urban_cells ADD COLUMN access_15min BOOLEAN DEFAULT NULL;
CREATE MATERIALIZED VIEW gi_hotspots AS
SELECT id, z, class, city FROM /* استعلام من /tools/gi_hotspots_geojson */;
```

### SEC-H-04: لا تحقُّق من Role enum في `PUT /admin/users/:id/role`
**الإصدار:** v2.x.
**الإصلاح:**
```typescript
const VALID_ROLES = ['admin', 'analyst', 'municipality', 'citizen', 'viewer'];
@Put(':id/role')
async setRole(@Param('id') id: string, @Body() { role }: { role: string }) {
  if (!VALID_ROLES.includes(role)) throw new BadRequestException('Invalid role');
  // ...
}
```

### SEC-H-05: لا حدّ لحجم الـ MQTT payload
**الإصدار:** v2.2, v2.3, v2-golive.
**الموقع:** `services/iot/listener.py`
**الإصلاح:**
```python
MAX_PAYLOAD = 64 * 1024  # 64 KB
def on_message(client, userdata, msg):
    if len(msg.payload) > MAX_PAYLOAD:
        logger.warning(f"Dropping oversized payload on {msg.topic}")
        return
    # ...
```

### SEC-H-06: لا Connection Pooling للـ DB
**التأثير:** ETL يفتح اتصالًا جديدًا لكل طلب → استنزاف max_connections.
**الإصلاح:**
```python
from psycopg_pool import ConnectionPool
pool = ConnectionPool(DATABASE_URL, min_size=2, max_size=20)
def db(): return pool.connection()
```

### SEC-H-07: لا حماية CSRF على POST/PUT
**الإصدارات:** v2.x, v3-ui.
**الإصلاح:** NextAuth يولِّد CSRF token تلقائيًّا — يجب استخدامه:
```typescript
const csrfToken = await getCsrfToken();
fetch(url, { method: 'POST', headers: { 'X-CSRF-Token': csrfToken }, ... });
```

### SEC-H-08: لا Healthcheck للـ Docker Services
**التأثير:** خدمات تبدأ قبل جاهزيّة DB → فشل صامت.
**الإصلاح:**
```yaml
services:
  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER"]
      interval: 5s
      retries: 10
  api:
    depends_on:
      db:
        condition: service_healthy
```

### SEC-H-09: لا Restart Policy
**الإصلاح:** أضف `restart: on-failure:5` لكل خدمة في docker-compose.

### SEC-H-10: dev mode في Dockerfile للـ Web
**الموقع:** `apps/web/Dockerfile` — `CMD ["npm","run","dev"]`.
**الإصلاح:**
```dockerfile
RUN npm run build
CMD ["npm","run","start"]
```

### SEC-H-11: hardcoded localhost في Revit Addin
**الموقع:** `clients/revit_addin/Nasij.Revit.cs` السطر 22.
**الإصلاح:** قراءة من Windows Registry أو ملف config:
```csharp
var endpoint = Environment.GetEnvironmentVariable("NASIJ_BIM_GATEWAY")
            ?? "https://api.nusuj.sa/bim";
```

### SEC-H-12: لا Spatial Index على urban_cells.geom
**الإصلاح:**
```sql
CREATE INDEX idx_urban_cells_geom ON urban_cells USING GIST(geom);
```

### SEC-H-13: TypeScript strict=false في v4.7 و v3-ui
**الإصلاح:** اضبط `"strict": true` في tsconfig وأصلح الأخطاء التي تظهر.

### SEC-H-14: BBox validation ضعيف في OGC endpoints
**الموقع:** `services/api/src/index.ts` السطر ~28-30.
**الإصلاح:**
```typescript
function parseBBox(s: string): number[] {
  const parts = s.split(',').map(Number);
  if (![4, 6].includes(parts.length)) throw new Error('BBox must have 4 or 6 values');
  if (parts.some(isNaN)) throw new Error('BBox values must be numbers');
  const [minX, minY, maxX, maxY] = parts.length === 4 ? parts : [parts[0], parts[1], parts[3], parts[4]];
  if (minX >= maxX || minY >= maxY) throw new Error('BBox: min must be < max');
  return parts;
}
```

### SEC-H-15: parseCQL2 يقبل أسماء حقول بنقاط (مهرَّب)
**الإصلاح:** whitelist لأسماء الحقول الصالحة فقط.

### SEC-H-16: inDatetimeRange يُرجِع true عند خطأ التحليل
**الإصلاح:**
```typescript
function inDatetimeRange(ts: string, range: string): boolean {
  try {
    // التحقُّق الفعلي
    return /* logic */;
  } catch (e) {
    return false;  // ❗ كان true
  }
}
```

### SEC-H-17: لا Foreign Key على embeddings.entity_id
**الإصلاح:**
```sql
ALTER TABLE urban.embeddings 
  ADD COLUMN entity_id BIGINT NOT NULL,
  ADD CONSTRAINT fk_embeddings_entity 
  CHECK (entity_type IN ('cell', 'report', 'permit'));
-- مع جدول إضافي للتحقُّق المتعدِّد
```

### SEC-H-18: NOT NULL مفقود على حقول حسّاسة
**الإصلاح:**
```sql
ALTER TABLE urban.citizen_reports 
  ALTER COLUMN kind SET NOT NULL,
  ALTER COLUMN geom SET NOT NULL;
```

### SEC-H-19: ETL OSRM call بلا retry
**الإصلاح:**
```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, max=10))
def call_osrm(url):
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    return r.json()
```

### SEC-H-20: Mosquitto لا يطبِّق TLS
**الإصلاح:** انظر SEC-C-05 أعلاه.

---

## 4. الثغرات المتوسِّطة (MEDIUM) 🟡

| ID | المختصر | الموقع | الإصلاح |
|---|---|---|---|
| SEC-M-01 | لا Caching على ETL endpoints | كل ETL | Redis أو @lru_cache(maxsize=128, ttl=60) |
| SEC-M-02 | لا Pagination على `/geo/cells_with_indicators` | ETL | أضف limit/offset |
| SEC-M-03 | Prometheus بلا alert rules | Prometheus config | أنشئ rules.yml لـ CPU/Memory/Latency |
| SEC-M-04 | لا monitoring لـ database | Prometheus | أضف postgres_exporter |
| SEC-M-05 | Keycloak `start-dev` (لا persistence) | docker-compose | استخدم `start --hostname=...` |
| SEC-M-06 | بدون security headers في Caddy | Caddyfile | أضف HSTS, CSP, X-Frame-Options |
| SEC-M-07 | لا rate limiting في Caddy/ALB | Caddyfile | أضف `rate_limit` directive |
| SEC-M-08 | لا backups استراتيجية | docker-compose | أضف cron pg_dump إلى S3 |
| SEC-M-09 | لا log rotation | كل الخدمات | استخدم logrotate أو journald |
| SEC-M-10 | iot listener: silent exception | listener.py:44 | log errors بدلاً من pass |
| SEC-M-11 | unrestricted CORS في BIM Gateway | bim_gateway/app.py:9 | حدِّد origins |
| SEC-M-12 | path traversal جزئي في marketplace sanitize | marketplace/app.py:40 | regex أصرم + os.path.normpath check |
| SEC-M-13 | manifest validation ضعيف | marketplace/app.py:22 | JSON schema validation |
| SEC-M-14 | hardcoded DLL path في Revit | Nasij.Revit.addin:5 | configurable installer |
| SEC-M-15 | UnicaCloudFront يستخدم default cert | terraform/cloudfront/main.tf:16 | استخدم ACM custom certificate |
| SEC-M-16 | متغيّر APS_CLIENT_SECRET بدون validation | bim_gateway/app.py:18 | تحقُّق عند startup |
| SEC-M-17 | لا integrity check على plugin ZIPs | marketplace | أضف signature verification |
| SEC-M-18 | لا API rate limits | كل الخدمات | slowapi (FastAPI) / @nestjs/throttler |

---

## 5. الثغرات المنخفضة (LOW) 🟢

| ID | المختصر | التوصية |
|---|---|---|
| SEC-L-01 | unused imports (uuid, shutil, ...) في bim_gateway | تنظيف |
| SEC-L-02 | placeholder GUIDs في Revit Addin | استبدال بـ unique IDs |
| SEC-L-03 | weak shell globbing في render.sh | hardcode AE version |
| SEC-L-04 | hardcoded Riyadh coordinates | محرَّك إعدادات بالمدن |
| SEC-L-05 | minified code in src files | استخدم prettier |
| SEC-L-06 | metric naming inconsistency (eff/efficiency) | اعتمد طويلة |
| SEC-L-07 | unused dependencies (axios, recharts) في v3-ui | حذف |
| SEC-L-08 | OSRM batch script ليس idempotent | trap errors + retry |
| SEC-L-09 | License `proprietary` في STAC غير قياسي | استخدم SPDX |

---

## 6. أولويّة الإصلاح (Remediation Plan)

### الأسبوع 1 (مطلوب قبل أيّ deployment)
- [ ] SEC-C-01: تشفير كل passwords من secrets manager.
- [ ] SEC-C-02: NEXTAUTH_SECRET الزامي.
- [ ] SEC-C-03: JWT guards على Admin API.
- [ ] SEC-C-04: CORS allowlist.
- [ ] SEC-C-05: MQTT auth + TLS.
- [ ] SEC-C-06: ZIP bomb protection.

### الأسبوع 2
- [ ] SEC-C-07 إلى SEC-C-14.
- [ ] SEC-H-01 إلى SEC-H-10 (الأهمّ منها).

### الأسبوع 3-4
- [ ] باقي HIGH.
- [ ] MEDIUM ذات الأثر العالي على الأداء (SEC-M-01, SEC-M-02, SEC-M-08).

### قبل الإصدار التالي
- [ ] كل LOW + مراجعة بـ pen-test خارجي.

---

## 7. أدوات يُنصح بدمجها

| الأداة | الغرض |
|---|---|
| **Trivy** | فحص حاويات Docker للثغرات المعروفة |
| **Snyk** | فحص dependencies للـ npm و pip |
| **OWASP ZAP** | فحص ديناميكي للـ web app |
| **Bandit** | static analysis للـ Python |
| **eslint-plugin-security** | static analysis للـ JS/TS |
| **TruffleHog** | بحث عن secrets مسرَّبة في git history |

---

## 8. ملاحظات ختامية

- هذه المراجعة **شاملة لكن ليست نهائية** — تجدر مراجعة جهة أمنيّة مستقلَّة (CERT-SA أو مزوِّد خاص) قبل الإطلاق الرسمي.
- المراجعة ركَّزت على **OWASP Top 10 (2021)** + **PDPL (نظام حماية البيانات الشخصيّة السعودي)** + **CIS Docker Benchmark**.
- بعد إصلاح كل CRITICAL و HIGH، يُنصَح بإجراء **Pen Test** خارجي على بيئة staging.

</div>
