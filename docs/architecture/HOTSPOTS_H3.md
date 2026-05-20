<div dir="rtl">

# قلب التحليل المكاني: H3 + Getis-Ord Gi\*

> **«المدينة لا تُقاس بالمتوسِّط، بل بأين يتجمَّع الاختلاف.»**

هذه الوثيقة تشرح أهم عملية تحليليّة في نُسُج: كشف البؤر الساخنة/الباردة (Hot/Cold Spots) باستخدام تجميع H3 السداسي ومُقدِّر Getis-Ord Gi\*.

---

## 1. لماذا نحتاج إلى هذا؟

تخيَّل أنّ لديك خريطة مدينة فيها 5,000 حي، ولكل حيّ مؤشِّر «جودة نسيج» بين 0 و 1. السؤال:

> **هل توجد مناطق متجاورة كلّها مرتفعة المؤشِّر بشكل لافت إحصائيًّا؟ وأين؟**

المتوسِّط البسيط يخفي الإجابة. التَّلوين العادي (Choropleth) يُريك القيم لكن لا يُخبرك إن كانت «صدفة» أم «نمط». نحتاج إلى:

1. **تطبيع المقياس** — حتى تكون مقارنة المدن منصفة → نستخدم **H3**.
2. **اختبار إحصائي للتجاور** — هل قيمتي مع جيراني تشكِّل عنقدة دالّة؟ → نستخدم **Gi\***.

---

## 2. ما هو H3؟

**H3** هو نظام أوبر مفتوح المصدر لترميز سطح الأرض إلى **خلايا سداسيّة هرميّة** (Hexagonal Hierarchical Spatial Index).

### الخصائص

| الخاصيّة | القيمة |
|---|---|
| **شكل الخلية** | سداسيّ منتظم (هكسي) + 12 خماسيّ عند الأقطاب |
| **مستويات الدقّة** | 0 (أكبر) إلى 15 (أصغر) |
| **عدد الجيران** | 6 جيران (موحَّد، على عكس المربّعات) |
| **المسافة بين المركز والمركز** | متساوية لكل الجيران |
| **القابلية للهرميّة** | كل خلية = 7 خلايا أعلى دقّة (تقريبًا) |

### مقارنة الدقّات (تقريبيّة)

| `res` | متوسِّط الحافة | مساحة الخلية | الاستخدام النموذجي |
|---|---|---|---|
| 0 | 1107.71 كم | 4.25M كم² | قارّات |
| 4 | 19.0 كم | 1770 كم² | منطقة كبرى |
| 6 | 3.78 كم | 88 كم² | مدينة |
| **8** | **0.53 كم** | **0.74 كم²** | **حيّ (الافتراضي عندنا)** |
| 10 | 0.07 كم | 0.015 كم² | شارع |
| 12 | 0.0095 كم | 307 م² | مبنى |

في نُسُج، الدقّة الافتراضيّة `res=8` — تُعطي خلية بحجم حيّ تقريبًا، مناسبة لمعظم القرارات البلديّة.

### لماذا H3 وليس Grid مربّع؟

| المعيار | مربّعات | H3 سداسيّات |
|---|---|---|
| عدد الجيران | 4 (مباشر) أو 8 (مع القطر) | 6 (موحَّد) |
| المسافة للجيران | مختلفة (1 و √2) | موحَّدة |
| تشويه عند خط الاستواء | كبير | أقلّ بكثير |
| سهولة الهرميّة | جيدة | جيدة جدًا |
| أدوات النظام البيئي | كثيرة | ناضجة (h3-py, h3-js) |

---

## 3. تنفيذ H3 في نُسُج

### الكود — `/services/etl/tools/registry_100.py` (≈ السطر 314)

```python
@router.get("/h3_aggregate")
def h3_aggregate(res: int = 8, metric: str = "fabric_index"):
    # 1. اجلب مركز كل خلية مع المؤشِّر
    with db() as conn:
        rows = conn.execute("""
            SELECT uc.id,
                   ST_Y(ST_Centroid(uc.geom)) AS lat,
                   ST_X(ST_Centroid(uc.geom)) AS lon,
                   fi.efficiency, fi.resilience, fi.connectivity
            FROM urban_cells uc
            LEFT JOIN fabric_indicators fi ON fi.cell_id = uc.id
        """).fetchall()
    
    # 2. اربط كل خلية بهكس H3
    agg = {}
    for (cid, lat, lon, eff, res_v, con) in rows:
        v = _compute_metric(metric, eff, res_v, con)
        h = h3.geo_to_h3(lat, lon, int(res))
        if h not in agg:
            agg[h] = {"sum": 0.0, "n": 0}
        agg[h]["sum"] += v
        agg[h]["n"]   += 1
    
    # 3. حوِّل إلى GeoJSON
    features = []
    for h, stats in agg.items():
        boundary = h3.h3_to_geo_boundary(h, geo_json=True)
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [boundary + [boundary[0]]]
            },
            "properties": {
                "h3": h,
                "value": stats["sum"] / stats["n"],
                "n": stats["n"]
            }
        })
    
    return {"type": "FeatureCollection", "features": features}
```

### الاستخدام من الواجهة

```typescript
// apps/web/app/(routes)/dashboard/page.tsx
const r = await fetch(`${ETL}/tools/h3_aggregate?res=${res}&metric=${metric}`)
const layer = await r.json()
// رسم بـ GeoJSON على Leaflet بلون أخضر (#7cb305)
```

### مفتاح ضبط الدقّة

شريط الانزلاق في الواجهة يُحدِّد `res` بين 4 و 12. القاعدة:
- **مقارنة بين مدن:** `res=6` أو `res=7`.
- **تحليل أحياء:** `res=8` (الافتراضي).
- **تحليل شوارع:** `res=10`.
- **اعتمد قاعدة ≥ 30 ملاحظة لكل هكس** لتجنُّب الضوضاء الإحصائيّة.

---

## 4. ما هو Getis-Ord Gi\*؟

**Gi\*** (يُلفظ: «جي-آي-ستار») هو إحصاء **مكاني محلِّي** يقيس:

> **هل قيمة خليّة + جيرانها تختلف إحصائيًّا عن متوسِّط كل المنطقة؟**

### الصيغة

لكل خلية $i$:

$$
G_i^* = \frac{\sum_j w_{ij} x_j - \bar{x} \sum_j w_{ij}}{\sigma \sqrt{\frac{n \sum_j w_{ij}^2 - (\sum_j w_{ij})^2}{n-1}}}
$$

حيث:
- $x_j$ = قيمة الخلية $j$.
- $w_{ij}$ = وزن العلاقة بين $i$ و $j$ (1 إذا كانا جارَين، 0 إذا لا).
- $\bar{x}$ = المتوسِّط العامّ.
- $\sigma$ = الانحراف المعياري.
- $n$ = عدد الخلايا.

### النتيجة كرقم Z

| قيمة z | التصنيف | اللون في الخريطة |
|---|---|---|
| `z ≥ +1.96` | **بؤرة ساخنة** — تجمُّع قيم عالية ذو دلالة (α=5%) | 🔴 أحمر `#ff4d4f` |
| `z ≤ -1.96` | **بؤرة باردة** — تجمُّع قيم منخفضة ذو دلالة | 🔵 أزرق `#69c0ff` |
| `-1.96 < z < +1.96` | غير دالّ — عشوائي مكانيًّا | ⚫ رمادي |

> **ملاحظة:** يمكنك توسيع نقطة النهاية لتقبل عتبة `z_threshold` كمعامل (انظر مقترح الإصلاح رقم 7 في AUDIT).

---

## 5. تنفيذ Gi\* في نُسُج

### الكود — `/services/etl/tools/registry_100.py` (≈ السطر 256)

```python
@router.get("/gi_hotspots_geojson")
def gi_hotspots_geojson(metric: str = "fabric_index"):
    with db() as conn:
        # 1. اجلب الخلايا والمؤشِّرات
        rows = conn.execute("""
            SELECT uc.id, ST_AsGeoJSON(uc.geom),
                   fi.efficiency, fi.resilience, fi.connectivity
            FROM urban_cells uc
            LEFT JOIN fabric_indicators fi ON fi.cell_id = uc.id
        """).fetchall()
        
        # 2. اجلب علاقات الجوار (تلامس مكاني)
        nbors = conn.execute("""
            SELECT a.id AS src, b.id AS dst
            FROM urban_cells a
            JOIN urban_cells b
              ON a.id < b.id AND ST_Touches(a.geom, b.geom)
        """).fetchall()
    
    # 3. ابنِ قاموس الجوار وقاموس القيم
    neighbors = defaultdict(list)
    for (s, d) in nbors:
        neighbors[s].append(d)
        neighbors[d].append(s)
    
    values = {}
    for (cid, geom_json, eff, res_v, con) in rows:
        values[cid] = _compute_metric(metric, eff, res_v, con)
    
    # 4. احسب Gi* لكل خلية
    x = np.array(list(values.values()), dtype=float)
    mean = float(np.mean(x))
    sd = float(np.std(x) + 1e-12)  # تجنُّب القسمة على صفر
    
    features = []
    for (cid, geom_json, eff, res_v, con) in rows:
        s = sum(values[j] for j in neighbors[cid]) + values[cid]  # تتضمّن الخلية نفسها (لذا اسمه *star*)
        wi = len(neighbors[cid]) + 1
        z = (s - mean * wi) / (sd * (wi ** 0.5))
        cls = "hot"  if z >=  1.96 else \
              "cold" if z <= -1.96 else \
              "not_sig"
        features.append({
            "type": "Feature",
            "geometry": json.loads(geom_json),
            "properties": {"id": cid, "z": round(z, 3), "class": cls}
        })
    
    return {"type": "FeatureCollection", "features": features}
```

### الفرق بين Gi و Gi\*
- **Gi:** يحسب على جيران الخلية فقط (لا يشمل قيمتها).
- **Gi\*:** يشمل قيمة الخلية نفسها + جيرانها (لذا «النجمة»).

نُسُج يستخدم **Gi\*** (انظر السطر `s = sum(...) + values[cid]`).

---

## 6. مَن يُحدِّد علاقة الجوار؟

في نُسُج تُستخدم **علاقة التلامس المكاني** (`ST_Touches`) من PostGIS:

```sql
JOIN urban_cells b ON a.id < b.id AND ST_Touches(a.geom, b.geom)
```

أي: **خليتان متجاورتان إن كانت حدودهما تتلامس على الأقل عند نقطة**.

### بدائل لم تُعتمد:

| البديل | السبب في الاستبعاد |
|---|---|
| **K-Nearest Neighbors** | يتطلَّب اختيار `k`، حساس له |
| **مسافة محدَّدة (1km buffer)** | منحاز لمساحة الخلية |
| **جيران H3** | منطقيّ للخلايا H3 لكن ليس للمضلَّعات الإداريّة |

> **توصية مستقبليّة:** عند العمل على H3 hexagons، استخدِم `h3.k_ring(h, 1)` للحصول على جيران المرتبة الأولى — راجع مقترح الإصلاح في AUDIT.

---

## 7. كيف تُستخدم النتائج في الواقع؟

### 1. للأمانات
- «أمانة الرياض تجد بؤرة ساخنة لارتفاع شكاوى المرور في حيّ X. تُحوِّل ميزانية الإشارات إلى هناك.»

### 2. للوزارات
- «وزارة البلديات تكتشف بؤرة باردة من مؤشِّر الترابُط في منطقة جنوبيّة. تُعطي أولويّة لإنشاء طرق جديدة.»

### 3. للمواطن
- «المواطن يرى منطقته كبؤرة ساخنة لمشكلة بيئيّة، فيتأكَّد أنّ بلاغاته لم تكن صدفة فردية بل ظاهرة مكانيّة.»

---

## 8. عتبات ومحاذير

### الافتراضات
- **توزُّع طبيعي تقريبًا** للقيم → استخدام Z. إذا كان التوزُّع متطرِّفًا، فكِّر في تطبيع لوغاريتمي.
- **استقلاليّة الأخطاء** — قد لا تكون صحيحة في بيانات مكانيّة بطبيعتها (autocorrelation).
- **عدد ملاحظات كافٍ** — يُفضَّل n ≥ 30 على الأقل قبل أخذ نتائج Gi\* بجدّيّة.

### تنبيهات تنفيذيّة
- إذا كانت كل قيم `x` متساوية تقريبًا، فالـ `sd ≈ 0` ويُولِّد z مُبالَغ فيها رغم وجود الـ `+1e-12` epsilon. **اختبر بشرط `if sd < threshold: return "uniform"`**.
- تكلفة حسابيّة O(n × deg) — قد تكون بطيئة لـ 10K+ خلايا. **استخدم Caching (Redis أو @lru_cache بمدّة TTL)**.

---

## 9. مقارنة سريعة: Gi\* مقابل Moran's I

| الميزة | Moran's I | Getis-Ord Gi\* |
|---|---|---|
| **النطاق** | عالميّ (إحصاء واحد للخريطة) | محلِّي (إحصاء لكل خلية) |
| **يجيب على** | «هل هناك انحياز مكاني عام؟» | «أين بالضبط تجمُّع القيم؟» |
| **تصنيف الموقع** | لا | نعم (hot/cold/not_sig) |
| **نوع البؤرة** | لا يُميِّز ساخن من بارد | يميّز |

في نُسُج يتوفَّر الاثنان عبر:
- `POST /tools/moran_i` — Moran I العامّ.
- `GET /tools/gi_hotspots_geojson` — Gi\* المحلِّي.

---

## 10. مراجع نظريّة للمهتمّ

1. **Getis, A., & Ord, J. K. (1992).** *The analysis of spatial association by use of distance statistics.* Geographical Analysis, 24(3), 189–206.
2. **Anselin, L. (1995).** *Local indicators of spatial association — LISA.* Geographical Analysis, 27(2), 93–115.
3. **Uber Engineering (2018).** *H3: A Hexagonal Hierarchical Geospatial Indexing System.* `https://h3geo.org`.

---

*هذا هو قلب نُسُج. كل شيء آخر يُحيط بهذا.*

</div>
