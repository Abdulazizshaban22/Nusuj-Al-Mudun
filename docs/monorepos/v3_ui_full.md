<div dir="rtl">

# nasij_v3_ui_full — الواجهة الكاملة بالعربيّة

> **Next.js 14 + Tailwind + Framer Motion + Leaflet + dir="rtl". أوّل واجهة جدّيّة.**

## التقنيّات

- **Next.js 14.2** (App Router).
- **React 18.3**.
- **TailwindCSS 3.4** + dark theme.
- **Framer Motion 12** للأنميشن.
- **Leaflet 1.9 + react-leaflet 4.2**.
- **NextAuth 4.24 + Keycloak provider**.
- **dir="rtl"** افتراضي.

## الصفحات

| Route | الغرض |
|---|---|
| `/` | Hero + animation "المدينة كنسيج حيّ" |
| `/dashboard` | لوحة كاملة (metric + Gi* + H3 + InsightPanel) |
| `/admin` | إدارة (محمي) |
| `/insights` | توليد تقارير AR/EN |
| `/iot/live` | تجميع H3 آني (تحديث 8 ثوان) |
| `/studio/sim` | 10 سيناريوهات |

## ثغرات حرجة

- 🔴 **SessionProvider معرَّف لكن غير مدمج في root layout** — useSession يُرجع undefined.
- 🔴 **NEXTAUTH_SECRET fallback** = `"please-change"`.
- 🔴 **KEYCLOAK_URL fallback** = `"http://localhost:8081"`.
- 🟠 TypeScript `strict: false` + `as any` casts كثيرة.
- 🟠 لا حماية CSRF على POST/PUT.
- 🟠 لا error handling في fetch chains.

## إصلاحات سريعة

أهمّ إصلاح: تعديل `app/layout.tsx`:
```typescript
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

→ النسخة التالية: [`v4`](v4.md).

</div>
