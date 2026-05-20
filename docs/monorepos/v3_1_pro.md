<div dir="rtl">

# nasij_pro_v3_1_enterprise — المستوى المؤسّسي

> **BIM + Revit + Carto + Cinematic + Marketplace. حين تتحوَّل نُسُج إلى منصّة استشاريّة كاملة.**

## الميزات الجديدة (5 خدمات)

### 1. BIM Gateway (`services/bim_gateway/`، :9115)
- استقبال IFC عبر `POST /bim/ingest`.
- تكامل Autodesk APS (Forge) للترجمة إلى SVF2.
- **IFC parsing نفسه لم يُنفَّذ بعد** (stub).

### 2. Carto Studio (`services/carto/`، :9105)
- 5 قوالب طباعة (A4_portrait, A3_landscape, ...).
- MapFish Print integration.
- `POST /carto/style` لرفع SLD.
- `POST /carto/print` لـ PDF.

### 3. Cinematic Export (`services/cinematic_export/`)
- نصوص Adobe ExtendScript لـ After Effects.
- شل سكربت لـ `aerender` (macOS فقط).
- قالب JSON للمشهد (resolution, fps, duration).

### 4. Marketplace (`services/marketplace/`، :9110)
- تثبيت Plugins من ZIP files.
- Manifest `nasij-plugin.json` ببنية:
  ```json
  {
    "id": "com.nasij.tools.2sfca-pro",
    "name": "2SFCA Pro",
    "version": "1.0.0",
    "engine": {"min": "3.0", "apis": ["etl", "carto"]},
    "entry": "plugin.py",
    "permissions": ["db.read"]
  }
  ```
- Sample plugin: `2sfca_pro.zip`.

### 5. Revit Addin (`clients/revit_addin/`)
- C# Plugin لـ Autodesk Revit.
- PushSelection command — يرسل selected element IDs إلى BIM Gateway.
- Manifest XML + DLL.

### Infrastructure (Terraform CloudFront)
- توزيع الأصول الثابتة عبر CDN.

## ثغرات حرجة

- 🔴 CORS مفتوح في كل خدمات (`allow_origins=["*"]`).
- 🔴 لا مصادقة على أي endpoint.
- 🔴 ZIP bomb في marketplace install (لا حدّ للحجم).
- 🟠 hardcoded `http://localhost:9115` في Revit Addin.
- 🟠 hardcoded `C:\NASIJ\Nasij.Revit.dll` كمسار DLL.
- 🟠 macOS-only للـ Cinematic.
- 🟠 unused imports (uuid, shutil, ...).
- 🟠 placeholder GUIDs.

## ملاحظات استراتيجيّة

هذا الإصدار يستهدف **عملاء استشاريِّين** (مكاتب تخطيط، شركات BIM). يجب فصله إلى Tier-1 مستقلّ بـ Pricing tier مختلف.

</div>
