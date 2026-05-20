<div dir="rtl">

# nasij_v3_2_bootstrap — خطّ أنابيب البيانات المفتوحة

> **قبل أن نُحلِّل، يجب أن نمتلك البيانات. هذا الإصدار يُحضِّر السعوديّة بالكامل من OSM إلى OpenAQ.**

## ما يفعله

سكربت `01_osm_osrm.sh` ينفِّذ:
1. تنزيل `saudi-arabia-latest.osm.pbf` من Geofabrik.
2. استخراج boundary السعوديّة.
3. بناء OSRM index (extract + partition + customize).
4. تشغيل OSRM على :5000.

ووثائق 6 سكربتات إضافيّة (حُذِفت ملفّاتها، أُعيدت في [`../reference/DATA_SOURCES.md`](../reference/DATA_SOURCES.md)):
- WorldCover (ESA) — تصنيف الغطاء.
- WorldPop — كثافة السكان.
- MS Buildings — بصمات المباني.
- Copernicus DEM — الارتفاعات.
- OpenAQ — جودة الهواء.
- RCRC — بيانات أمانة الرياض.

## كيف تشغِّله

```bash
cd "01- nusoj code/nasij_v3_2_bootstrap/"
cp env.sample .env  # حدِّث POSTGIS_URL
make osrm           # تنزيل وبناء (~5-10 دقائق)
make run            # تشغيل OSRM
# اختبار:
curl "http://localhost:5000/route/v1/driving/46.6,24.7;46.8,24.8?overview=false"
```

## ثغرات

- 🔴 `POSTGIS_URL=postgres://nasij:pass@localhost:5432/nasij` في env.sample — credentials مسرَّبة.
- 🟠 لا retry logic إن فشل تنزيل PBF.
- 🟠 السكربت ليس idempotent بشكل كامل.

→ النسخة التالية: [`v3-ui-full`](v3_ui_full.md) للواجهة الكاملة.

</div>
