<div dir="rtl">

# المعجم — Glossary

> **مصطلحات نُسُج بالعربية والإنجليزية. مُرتَّب أبجديًّا بالعربية.**

---

## أ

| المصطلح | English | الشرح |
|---|---|---|
| **إيزوكرون** | Isochrone | مضلَّع يضمّ كل النقاط التي يمكن الوصول إليها من نقطة معيَّنة خلال زمن محدَّد (مثلًا 15 دقيقة). يُحسَب عبر OSRM. |
| **إيكيتي** | Equity | مقياس عدالة توزيع الموارد. مؤشِّرات: Gini, Theil, Deprivation Index. |
| **استشعار عن بُعد** | Remote Sensing | استخراج معلومات عن المدينة من صور الأقمار الصناعية. مؤشِّرات في نُسُج: NDVI, EVI, SAVI, NDWI, LST_BT, CVA. |
| **استديو** | Studio | مجموعة مؤشِّرات وأوزان لمجال تخطيطي محدَّد (نقل، خضرة، تراث...). نُسُج فيه 10 استديوهات. |
| **AHP** | Analytic Hierarchy Process | طريقة لاستخراج أوزان من مصفوفة مقارنات زوجيّة. يحسب نسبة اتساق (CR) للتحقُّق. |
| **APS** | Autodesk Platform Services | منصّة Autodesk السحابيّة (سابقًا Forge) لمعالجة نماذج CAD/BIM. تُترجم IFC إلى SVF2. |

## ب

| المصطلح | English | الشرح |
|---|---|---|
| **بؤرة ساخنة** | Hot Spot | عنقدة مكانيّة لقيم مرتفعة ذات دلالة إحصائيّة (z ≥ 1.96). |
| **بؤرة باردة** | Cold Spot | عنقدة مكانيّة لقيم منخفضة ذات دلالة إحصائيّة (z ≤ -1.96). |
| **BIM** | Building Information Modeling | نمذجة المعلومات الإنشائية. صيغة مفتوحة: IFC. |
| **Balady** | بلدي | منصّة أمانات المدن السعوديّة لتراخيص البناء. نُسُج يُكامِل معها في v7.0. |

## ت

| المصطلح | English | الشرح |
|---|---|---|
| **توأم رقمي** | Digital Twin | نسخة رقميّة محاكِيّة من الواقع المادّي. |
| **توأم ذكي** | AI Twin | توأم رقمي يُضيف ابتلاع تدفُّقات وتنبُّؤ شبه فوري. خدمة `ai-twin` في نُسُج. |
| **TOPSIS** | Technique for Order Preference by Similarity to Ideal Solution | طريقة قرار متعدِّد المعايير لترتيب البدائل بحسب القرب من المثالي والبُعد عن الأسوأ. |
| **TOD** | Transit-Oriented Development | التطوير الحضري المرتكز على النقل العامّ. أداة `tod_suitability` في الكتالوج. |

## ث

| المصطلح | English | الشرح |
|---|---|---|
| **ثبات الإحداثيّات** | SRID = 4326 | نظام الإحداثيّات WGS84 (مرجع كروي). كل البيانات في نُسُج تُخزَّن بهذا. |

## ج

| المصطلح | English | الشرح |
|---|---|---|
| **جاذبية** | Gravity Model | نموذج وصوليّة يحسب تدفُّقات بين مناطق بصيغة `T = O·D·f(d)`. أداة `gravity_access`. |

## ح

| المصطلح | English | الشرح |
|---|---|---|
| **حوكمة** | Governance | مجموعة المعايير والقرارات الإداريّة. استديو Governance يستخدم أوزانًا متساوية لـ eff/res/con. |

## خ

| المصطلح | English | الشرح |
|---|---|---|
| **خَلِيَّة حضرية** | Urban Cell | وحدة التحليل المكاني — مضلَّع إداري عادةً (حيّ، قطاع). جدول `urban_cells`. |
| **خصوصيّة (PDPL)** | Personal Data Protection Law | نظام حماية البيانات الشخصيّة السعودي. متطلَّبات: تشفير PII، حقّ الحذف، سجلّ تدقيق. |

## د

| المصطلح | English | الشرح |
|---|---|---|
| **DBSCAN** | Density-Based Spatial Clustering | عنقدة مكانيّة بكثافة دون عدد مُسبَق. مفيدة لاكتشاف الـ outliers الجغرافية. |
| **DEM** | Digital Elevation Model | نموذج الارتفاع الرقمي. نُسُج يستخدم Copernicus GLO-30 (دقّة 30م). |

## ر

| المصطلح | English | الشرح |
|---|---|---|
| **ربط** | Connectivity | البُعد الثالث للنسيج. كثافة الشبكات وسهولة الوصول. |
| **رصيف الحدث** | Event Stream | تدفُّق MQTT من الحسّاسات إلى `iot-listener`. |

## س

| المصطلح | English | الشرح |
|---|---|---|
| **سداسي H3** | H3 Hexagon | خليّة من نظام Uber للترميز السداسي الهرمي. الافتراضي في نُسُج: `res=8` (~530م حافة). |
| **STAC** | SpatioTemporal Asset Catalog | معيار مفتوح لفهرسة الأصول المكانيّة–الزمنيّة (صور أقمار، نماذج). |

## ش

| المصطلح | English | الشرح |
|---|---|---|
| **شفافية** | Transparency | متطلَّب PDPL: المواطن يعلم بماذا تُستخدم بياناته. |

## ص

| المصطلح | English | الشرح |
|---|---|---|
| **صورة فضائيّة** | Satellite Imagery | بيانات أقمار صناعيّة (Sentinel-2, Landsat) تُحوَّل إلى مؤشِّرات مثل NDVI. |

## ض

| المصطلح | English | الشرح |
|---|---|---|
| **ضغط مروري** | Traffic Pressure | عدد المركبات لكل دقيقة لكل خلية. يُستوحى من Open311 / Loop Detectors. |

## ط

| المصطلح | English | الشرح |
|---|---|---|
| **طوبولوجيا حضريّة** | Urban Topology | كيف تتّصل الخلايا. تُستخدم في تعريف الجوار لـ Gi\* و Moran. |

## ع

| المصطلح | English | الشرح |
|---|---|---|
| **عَنقدة** | Clustering | تجميع نقاط أو خلايا متشابهة. خوارزميّات: DBSCAN, K-Means, Hierarchical. |
| **OAC** | Origin Access Control | ضبط وصول S3 من CloudFront فقط. v5.4+. |
| **OGC API Features** | OGC API Features | معيار REST لاسترجاع ميزات جغرافيّة. نُسُج يدعمها كاملاً في v4.7. |
| **OIDC** | OpenID Connect | معيار مصادقة فوق OAuth 2.0. نُسُج يستخدمه عبر Keycloak. |
| **Open311** | Open311 | معيار مفتوح لبلاغات المواطنين البلديّة (حُفر، إشارات معطَّلة، تَلَوُّث...). |
| **OSM** | OpenStreetMap | خريطة العالم المفتوحة. مصدر بيانات OSRM. |
| **OSRM** | Open Source Routing Machine | محرِّك التوجيه. نُسُج يستخدمه لـ isochrones. |

## غ

| المصطلح | English | الشرح |
|---|---|---|
| **غطاء أرضي** | Land Cover | تصنيف سطح الأرض (مبنى، حديقة، طريق...). نُسُج يستورده من ESA WorldCover. |

## ف

| المصطلح | English | الشرح |
|---|---|---|
| **Fabric Index** | مؤشِّر النسيج | الناتج الموزون من efficiency, resilience, connectivity. صيغة: `100·(0.4·eff + 0.3·res + 0.3·con)`. |
| **FAR** | Floor Area Ratio | معامل البناء (الكثافة). أداة في الكتالوج. |

## ق

| المصطلح | English | الشرح |
|---|---|---|
| **قياسي مفتوح** | Open Standard | مثل OGC, STAC, GeoJSON, MQTT, OIDC — جميعها تُستخدم في نُسُج. |

## ك

| المصطلح | English | الشرح |
|---|---|---|
| **كفاءة** | Efficiency | البُعد الأول للنسيج. استغلال الموارد، الكثافة، التنوُّع. |
| **Keycloak** | Keycloak | نظام مفتوح المصدر للهوية والوصول. v26 في نُسُج. |
| **KPI** | Key Performance Indicator | مؤشِّر أداء رئيس. ثلاثة في نُسُج: Fabric Index, Sprawl Risk, Harmony. |

## ل

| المصطلح | English | الشرح |
|---|---|---|
| **لوحة Grafana** | Grafana Dashboard | شاشة عرض مرئيّة لقياسات Prometheus + PostgreSQL. |
| **LST** | Land Surface Temperature | درجة سطح الأرض من باند حراري. نقطة نهاية `/rs/lst_bt`. |

## م

| المصطلح | English | الشرح |
|---|---|---|
| **متّجه AI** | AI Embedding | تمثيل عددي عالي الأبعاد للمعنى. نُسُج: 384-dim (multilingual-e5-small). |
| **محاكاة** | Simulation | تشغيل سيناريو افتراضي لرؤية أثره على المؤشِّرات. 10 سيناريوهات في `/sim/run`. |
| **مرونة** | Resilience | البُعد الثاني للنسيج. القدرة على التكيُّف والتعافي. |
| **Moran's I** | Moran's I | إحصاء عامّ للترابُط المكاني. هل البيانات متجمِّعة أم عشوائيّة؟ |
| **MapFish** | MapFish Print | محرِّك طباعة الخرائط في Carto Studio (v3.1-pro). |

## ن

| المصطلح | English | الشرح |
|---|---|---|
| **نسج** | Fabric | جودة البنية العمرانية ثلاثيّة الأبعاد. اسم المنصّة. |
| **نَفاذ** | Nafath | منصّة الهوية الرقميّة الموحَّدة في المملكة العربية السعودية. تُكامِل مع Keycloak عبر federation. |
| **Nowcast** | Nowcast | تنبُّؤ شبه فوري (0–1 ساعة). جوهر AI Twin. |
| **NDVI** | Normalized Difference Vegetation Index | مؤشِّر صحة النباتات من صور الأقمار. الصيغة: `(NIR - RED) / (NIR + RED)`. |
| **NDWI** | Normalized Difference Water Index | مؤشِّر المسطَّحات المائية. الصيغة: `(GREEN - NIR) / (GREEN + NIR)`. |

## هـ

| المصطلح | English | الشرح |
|---|---|---|
| **هَكسي** | Hexagon | شكل سداسي. وحدة H3 الافتراضية. |
| **Harmony** | تناغم | KPI. صيغة: `100·(0.5·res + 0.5·con)`. يقيس انسجام المرونة والترابُط. |

## و

| المصطلح | English | الشرح |
|---|---|---|
| **WAF** | Web Application Firewall | جدار حماية تطبيقات الويب. نُسُج في v7.5+: AWS WAF عند CloudFront و ALB. |
| **WorldCover** | ESA WorldCover | بيانات الغطاء الأرضي بدقّة 10م من وكالة الفضاء الأوروبية. |
| **WorldPop** | WorldPop | بيانات كثافة السكان العالمية بدقّة 100م. |

## ي

| المصطلح | English | الشرح |
|---|---|---|
| **يقظة (Observability)** | Observability | القدرة على فهم سلوك النظام من خلال الـ logs والـ metrics والـ traces. أدوات نُسُج: Prometheus + Grafana + Loki + Tempo. |

---

## رموز رياضيّة

| الرمز | الاسم | السياق |
|---|---|---|
| $z$ | Z-score | الناتج المُعيَّر لـ Gi\* و Moran. |
| $\alpha$ | مستوى الدلالة | عادةً 0.05 → z critical = ±1.96. |
| $w_{ij}$ | وزن الجار | 1 لو i و j جاران، 0 إن لم يكونا. |
| $\bar{x}$ | المتوسِّط | متوسِّط المؤشِّر عبر كل الخلايا. |
| $\sigma$ | الانحراف المعياري | تشتُّت المؤشِّر. |

---

## اختصارات بقَيدِها الكامل

| Acronym | الكامل |
|---|---|
| 2SFCA | Two-Step Floating Catchment Area |
| AHP | Analytic Hierarchy Process |
| ALB | Application Load Balancer (AWS) |
| API | Application Programming Interface |
| APS | Autodesk Platform Services |
| BIM | Building Information Modeling |
| CDN | Content Delivery Network |
| COG | Cloud-Optimized GeoTIFF |
| CORS | Cross-Origin Resource Sharing |
| CQL2 | Common Query Language v2 (OGC) |
| CR | Consistency Ratio (AHP) |
| CRS | Coordinate Reference System |
| CVA | Change Vector Analysis |
| DBSCAN | Density-Based Spatial Clustering of Applications with Noise |
| DEM | Digital Elevation Model |
| DSR | Data Subject Rights |
| ECS | Elastic Container Service (AWS) |
| EVI | Enhanced Vegetation Index |
| Fargate | AWS managed compute for ECS |
| FAR | Floor Area Ratio |
| GASTAT | General Authority for Statistics (الهيئة العامة للإحصاء) |
| GeoJSON | Geographic JSON |
| Gi\* | Getis-Ord Gi star |
| GUI | Graphical User Interface |
| H3 | Uber's Hexagonal Hierarchical Index |
| HSTS | HTTP Strict Transport Security |
| IaC | Infrastructure as Code |
| IFC | Industry Foundation Classes (BIM) |
| IoT | Internet of Things |
| JWKS | JSON Web Key Set |
| JWT | JSON Web Token |
| KPI | Key Performance Indicator |
| LST | Land Surface Temperature |
| LSTM | Long Short-Term Memory (neural network) |
| MQTT | Message Queuing Telemetry Transport |
| MVT | Mapbox Vector Tile |
| NDVI | Normalized Difference Vegetation Index |
| NDWI | Normalized Difference Water Index |
| NIR | Near Infrared |
| OAC | Origin Access Control |
| OGC | Open Geospatial Consortium |
| OIDC | OpenID Connect |
| OSM | OpenStreetMap |
| OSRM | Open Source Routing Machine |
| PBF | Protocol Buffer Format (OSM) |
| PDPL | Personal Data Protection Law (السعودي) |
| PII | Personally Identifiable Information |
| pgvector | Postgres extension for vector similarity |
| PostGIS | Postgres spatial extension |
| PWA | Progressive Web App |
| RBAC | Role-Based Access Control |
| RCRC | Royal Commission for Riyadh City |
| RTL | Right-to-Left (text direction) |
| SAVI | Soil-Adjusted Vegetation Index |
| SLD | Styled Layer Descriptor (OGC) |
| SSO | Single Sign-On |
| STAC | SpatioTemporal Asset Catalog |
| SVF2 | Autodesk Streaming Viewable Format 2 |
| TLS | Transport Layer Security |
| TOPSIS | Technique for Order Preference by Similarity to Ideal Solution |
| TOD | Transit-Oriented Development |
| TS | TypeScript |
| VAPID | Voluntary Application Server Identification (Web Push) |
| WAF | Web Application Firewall |
| WGS84 | World Geodetic System 1984 (SRID 4326) |
| WKT | Well-Known Text (geometry format) |

</div>
