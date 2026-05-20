# نسج — Nusuj Studio
## وثيقة المنتج التأسيسية الشاملة
### برنامج مستقل لفهم وتصميم النسيج المكاني عبر المقاييس

**الإصدار:** v0.1  
**الحالة:** Product Doctrine + Engineering Blueprint  
**اللغة:** العربية  
**النطاق:** من قطعة أرض وفيلا إلى مشروع معماري، مجمع، بلوك، مجاورة، حي، مدينة، وريف.  
**الطموح:** بناء برنامج مستقل متخصص في فهم وتصميم وتحليل النسيج المكاني، وليس منصة ويب عادية أو GIS عام.

---

## 00. ملخص تنفيذي

**نسج** هو برنامج مستقل لفهم وتصميم وتحليل النسيج المكاني عبر المقاييس.  
لا يبدأ كمنصة SaaS عامة، ولا كنسخة مقلدة من ArcGIS أو AutoCAD أو Revit. يبدأ كبرنامج متخصص في نقطة عميقة لا تغطيها الأدوات الحالية بشكل كافٍ:

> فهم العلاقة بين التصميم والسياق:  
> الأرض، المبنى، الواجهة، الشارع، البلوك، المجاورة، الحي، المدينة، والريف.

نسج يجب أن يعرف:
- هذا شارع.
- هذا طريق.
- هذا محور.
- هذا رصيف.
- هذه واجهة.
- هذه قطعة.
- هذا مبنى.
- هذه كتلة.
- هذا بلوك.
- هذه مجاورة.
- هذا حي.
- هذا نسيج متماسك.
- هذا نسيج مفكك.
- هذه حافة عمرانية.
- هذا تمدد غير صحي.
- هذا مشروع يقتل الواجهة.
- هذا تصميم يحسن العلاقة مع الشارع.
- هذه فرصة ربط.
- هذه فرصة تطوير.

البرنامج لا يعرض طبقات فقط، بل يبني **نموذج فهم** للمدينة والمشروع، ثم يشخص، يقترح، يحاكي، يقارن، ويصدر تقريرًا.

---

## 01. عقيدة المنتج

### 01.1 ما هو نسج؟

نسج هو:

> **Design Fabric Intelligence Software**  
> برنامج مستقل لفهم وتصميم النسيج المكاني عبر كل المقاييس.

هو برنامج يجلس بين:
- GIS
- CAD
- BIM
- Urban Design
- Planning Analytics
- AI Agents
- Report/Evidence Systems

ويحوّل البيانات والتصميم إلى نموذج نسيج قابل للتحليل والقرار.

### 01.2 ما ليس هو نسج؟

نسج ليس:
- GIS عام مثل ArcGIS/QGIS.
- CAD عام مثل AutoCAD.
- BIM عام مثل Revit.
- أداة تصيير مثل 3ds Max.
- Dashboard عام.
- منصة إدارة مشاريع.
- Chatbot تخطيطي.
- برنامج خرائط فقط.
- مولد صور أو 3D فقط.

### 01.3 ما هو الفرق الجوهري؟

الأدوات الحالية غالبًا ترى المدينة عبر منظور واحد:
- ArcGIS يرىها كطبقات مكانية.
- AutoCAD يراها كخطوط ورسومات.
- Revit يراها كمباني وعناصر BIM.
- 3ds Max يراها كمشهد بصري.
- CityEngine يراها كنموذج توليدي/إجرائي.

نسج يجب أن يراها كـ **نسيج مكاني حي**:
- علاقات.
- مقاييس.
- واجهات.
- حركة.
- خصوصية.
- كثافة.
- فراغ عام.
- سياق.
- أثر تصميمي.
- قابلية تنفيذ.

---

## 02. الفجوة السوقية

### 02.1 واقع العمل الحالي

المعماري والمخطط ومصمم الحضري يعملون عادة بين عدة برامج:

1. GIS للبيانات.
2. CAD للرسم.
3. BIM للمبنى.
4. Excel للمؤشرات.
5. 3D software للتصور.
6. InDesign/PowerPoint للتقرير.
7. كتابة يدوية لتفسير النتائج.

المشكلة:
- التحليل مشتت.
- العلاقة بين المقياس المعماري والمقياس الحضري ضعيفة.
- لا يوجد برنامج يفهم “النسيج”.
- لا توجد أداة واحدة تقول: هذا التصميم جيد لأنه يحسن النسيج، أو سيئ لأنه يقطع الواجهة أو يضعف المشاة.
- السيناريوهات تقارن غالبًا يدويًا.
- التقرير لا يرتبط دائمًا بالبيانات والمنهجية.

### 02.2 الفجوة التي يملؤها نسج

نسج يغطي منطقة بين الأدوات:

```text
GIS        → أين الأشياء؟
CAD        → كيف نرسمها؟
BIM        → ما عناصر المبنى؟
3D         → كيف تبدو بصريًا؟
Nusuj      → كيف تؤثر على النسيج المكاني؟ وهل التصميم صحيح؟
```

### 02.3 التمركز السوقي

نسج يمكن أن يبدأ في السعودية والمنطقة العربية لأن:
- المدن تنمو بسرعة.
- مشاريع التطوير الحضري ضخمة.
- الأدلة العمرانية والهوية المكانية أصبحت مهمة.
- البلديات وهيئات التطوير تحتاج قرارات قابلة للقياس.
- المكاتب تحتاج أداة أسرع من الجمع اليدوي بين GIS/CAD/BIM.
- هناك فجوة في أدوات عربية/محلية تفهم المجاورة، الحي، الشارع، والخصوصية والواجهة.

---

## 03. المستخدمون

### 03.1 المستخدم الأساسي

1. مخطط عمراني.
2. مصمم حضري.
3. معماري يعمل على مشاريع مرتبطة بالسياق.
4. مكتب استشاري.
5. مطور عقاري.
6. جهة حكومية/بلدية/هيئة تطوير.
7. فريق كود عمراني أو هوية عمرانية.
8. باحث في العمران والريف والنمو الحضري.

### 03.2 حالات الاستخدام

#### فيلا / قطعة أرض
- تحليل الأرض والشارع والخصوصية.
- اقتراح تموضع الكتلة.
- تقييم المدخل والسور والمواقف.
- فهم العلاقة مع الجوار.

#### مشروع معماري
- تقييم علاقة المبنى بالشارع.
- تقييم الواجهة النشطة/الميتة.
- تحليل المواقف والخدمات.
- قياس أثر التصميم على المشاة والفراغ العام.

#### مجمع
- تحليل الحركة الداخلية.
- المداخل والبوابات.
- النفاذية.
- أثر الحافة على الشوارع المحيطة.
- public/private balance.

#### بلوك
- تحليل حجم البلوك والنفاذية.
- القطع والواجهات.
- فرص إعادة التقسيم أو الدمج.
- تحسين الحركة.

#### مجاورة
- مركز المجاورة.
- خدمات المشاة.
- المدرسة، المسجد، الحديقة.
- walkability.
- gaps.

#### حي
- قراءة النسيج.
- الحركة والخدمات.
- فرص التطوير.
- السيناريوهات.
- التمدد والتفكك.

#### مدينة
- النمو والتمدد.
- الحواف العمرانية.
- المراكز والمحاور.
- سيناريوهات التوسع.
- sprawl risk.

#### ريف / قرية
- نمط التجمع.
- علاقة القرية بالتضاريس والوادي والزراعة.
- حماية الطابع.
- السياحة الريفية.
- نمو حساس.

---

## 04. المقاييس — Scale System

نسج يجب أن يفهم المشروع حسب مقياسه.

### Scale 01 — Plot / قطعة أرض

**الكائنات:**
- Plot Boundary
- Setbacks
- Neighboring Plots
- Street Frontages
- Entrance
- Parking
- Fence
- Yard
- Massing Envelope

**الأسئلة:**
- أين أفضل مدخل؟
- أين أفضل كتلة؟
- هل الخصوصية جيدة؟
- هل المواقف تضر الواجهة؟
- هل السور يقتل الشارع؟
- هل اتجاه الشمس والرياح مؤثر؟

**المخرجات:**
- Site Intelligence Report
- Privacy Review
- Orientation & Massing Recommendation
- Street Relationship Score

---

### Scale 02 — Building / مبنى

**الكائنات:**
- Footprint
- Massing
- Entrances
- Services
- Parking
- Frontage
- Ground Floor Use
- Height
- Setback

**الأسئلة:**
- هل المبنى يحترم scale الجوار؟
- هل الواجهة نشطة؟
- هل المدخل واضح؟
- هل المواقف تفصل المشروع عن الشارع؟
- هل الكتلة تخلق ظلًا جيدًا أو فراغًا سيئًا؟

**المخرجات:**
- Architectural Context Fit Report
- Frontage Activation Report
- Access & Parking Review
- Massing Impact Review

---

### Scale 03 — Compound / مجمع

**الكائنات:**
- Gates
- Internal Streets
- Units
- Amenities
- Service Access
- Edges
- Private/Public Zones

**الأسئلة:**
- هل المجمع مغلق بطريقة تضر النسيج؟
- هل له نفاذية؟
- هل مداخله صحيحة؟
- هل حافته مع الشارع حية أم ميتة؟

**المخرجات:**
- Internal Fabric Report
- Gate & Movement Analysis
- Edge Impact Report

---

### Scale 04 — Block / بلوك

**الكائنات:**
- Block
- Parcels
- Buildings
- Frontages
- Internal Access
- Street Edges

**الأسئلة:**
- هل البلوك كبير؟
- هل قابل للمشي؟
- هل يمكن تقسيمه أو فتح رابط؟
- هل واجهاته ميتة؟

**المخرجات:**
- Block Permeability Report
- Parcel Grain Analysis
- Redevelopment Potential

---

### Scale 05 — Neighborhood / مجاورة

**الكائنات:**
- Local Streets
- Services
- Park
- School
- Mosque
- Center
- Pedestrian Routes
- Edges

**الأسئلة:**
- هل المجاورة تخدم نفسها مشيًا؟
- هل لها مركز؟
- هل طرقها محلية وصالحة للمشاة؟
- أين نقص الخدمات؟

**المخرجات:**
- Neighborhood Fabric Diagnosis
- 5/10/15-minute Accessibility
- Service Gap Report

---

### Scale 06 — District / حي

**الكائنات:**
- Neighborhoods
- Corridors
- Centers
- Land Use
- Density
- Public Realm
- Mobility Network

**الأسئلة:**
- هل الحي متماسك؟
- أين الانقطاعات؟
- أين فرص الربط؟
- أين فرص التطوير؟
- هل فيه تمدد أو تفكك؟

**المخرجات:**
- District Fabric Report
- Urban Repair Strategy
- Scenario Comparison

---

### Scale 07 — City / مدينة

**الكائنات:**
- Growth Edges
- Centers
- Corridors
- Districts
- Rural-Urban Interface
- Mobility Systems

**الأسئلة:**
- كيف تنمو المدينة؟
- أين التمدد العشوائي؟
- أين نوجه النمو؟
- كيف نحافظ على المراكز؟
- كيف نقلل car dependency؟

**المخرجات:**
- Growth Pattern Report
- Sprawl Risk Map
- City Scenario Report

---

### Scale 08 — Rural / ريف

**الكائنات:**
- Village Cluster
- Agricultural Patches
- Wadis
- Rural Roads
- Terrain
- Tourism Nodes
- Natural Edges

**الأسئلة:**
- كيف ينمو الريف دون فقدان طابعه؟
- كيف نحمي الأودية والزراعة؟
- أين يمكن تطوير السياحة؟
- كيف نحسن الوصول دون تشويه النسيج؟

**المخرجات:**
- Rural Fabric Report
- Village Growth Strategy
- Landscape-Sensitive Development Report

---

## 05. Urban / Design Ontology

### 05.1 الكائنات الأساسية

```yaml
Objects:
  - Plot
  - Parcel
  - Building
  - Massing
  - Entrance
  - Fence
  - Yard
  - Parking
  - Frontage
  - Sidewalk
  - Street
  - Road
  - Corridor
  - Intersection
  - Crossing
  - Block
  - PublicSpace
  - LandscapePatch
  - ServiceNode
  - Neighborhood
  - District
  - CityEdge
  - RuralCluster
  - Valley
  - AgriculturalPatch
```

### 05.2 العلاقات

```yaml
Relations:
  - Building sits_on Plot
  - Plot fronts Street
  - Frontage activates Sidewalk
  - Street connects Intersections
  - Block contains Parcels
  - Parcel contains Building
  - Neighborhood contains Blocks
  - District contains Neighborhoods
  - City expands_along Corridor
  - RuralCluster relates_to Valley
  - PublicSpace serves Neighborhood
```

### 05.3 الفرق بين Street وRoad

| العنصر | التعريف |
|---|---|
| Street | فراغ عام حضري، له واجهات ومشاة وأنشطة وعلاقة مباشرة بالمباني |
| Road | بنية حركة غالبًا أسرع وأعلى رتبة وقد تعمل كحاجز |
| Corridor | محور يجمع حركة ونشاط وتطوير وفراغ عام |
| Alley / Sikah | مسار صغير/محلي وقد يحمل هوية مكانية |
| Service Road | طريق خدمة، يؤثر على المداخل والمواقف |

### 05.4 الفرق بين Parcel وPlot

| العنصر | التعريف |
|---|---|
| Parcel | قطعة ضمن نظام ملكيات/تقسيم حضري |
| Plot | أرض مشروع محددة للدراسة أو التصميم |
| Lot Assembly | دمج قطع لأغراض التطوير |
| Site | السياق الكامل للمشروع، أوسع من حدود الأرض |

---

## 06. دورة العمل الرئيسية

```text
Start Project
→ Select Scale
→ Import Context
→ Clean & Validate
→ Classify Objects
→ Build Fabric Model
→ Diagnose
→ Generate Scenario
→ Simulate
→ Compare
→ Review with AI Agents
→ Export
```

### 06.1 Start Project

المستخدم يختار:
- نوع المشروع.
- المقياس.
- المدينة.
- نظام الإحداثيات.
- الهدف.

### 06.2 Import Context

يدعم:
- GeoJSON
- Shapefile
- KML
- GeoPackage
- OSM
- CSV
- IFC لاحقًا
- DXF/DWG لاحقًا
- Raster/DEM لاحقًا

### 06.3 Clean & Validate

يفحص:
- CRS mismatch
- invalid geometry
- gaps
- overlaps
- dangling roads
- missing attributes
- duplicate features
- buildings outside plot/parcels
- roads not split at intersections

### 06.4 Classify Objects

يصنف:
- street types
- blocks
- parcels
- frontages
- public spaces
- service nodes
- district edges
- rural clusters

### 06.5 Build Fabric Model

يبني:
- Spatial Graph
- Street Network
- Block System
- Parcel-Building Relations
- Frontage System
- Service Catchments
- Scenario Baseline

### 06.6 Diagnose

ينتج:
- problems
- opportunities
- risk zones
- weak edges
- missing links
- service gaps
- design warnings

### 06.7 Scenario

التدخلات:
- Add Street Link
- Remove Barrier
- Change Land Use
- Add Public Space
- Increase Density
- Adjust Massing
- Open Entrance
- Improve Frontage
- Add Shade Corridor
- Split Block
- Merge Parcels

### 06.8 Simulate & Compare

يعيد حساب المؤشرات:
- before
- after
- delta
- trade-offs
- recommendation

### 06.9 Export

- PDF
- PPTX لاحقًا
- GeoJSON
- GeoPackage
- CSV
- `.nsj`

---

## 07. المحركات — Engines

### 07.1 Design Fabric Kernel

النواة الأم.

**المهام:**
- إدارة الكائنات.
- إدارة العلاقات.
- إدارة المقاييس.
- تحويل layers إلى objects.
- حساب العلاقات بين المبنى والسياق.
- حفظ النتائج في Project Model.

---

### 07.2 Scale Classifier Engine

يعرف مقياس الدراسة:
- Plot
- Building
- Compound
- Block
- Neighborhood
- District
- City
- Rural

ويختار الأدوات والمؤشرات المناسبة.

---

### 07.3 Geometry & Topology Engine

**المهام:**
- validate geometry
- fix invalid polygons
- split road intersections
- snap close nodes
- detect overlaps
- detect gaps
- generate blocks from road network
- spatial joins

---

### 07.4 Street Network Engine

**المؤشرات:**
- intersection density
- link-node ratio
- average segment length
- dead-end ratio
- centrality
- directness
- walk reach
- severance
- barrier effect

---

### 07.5 Block Engine

**المؤشرات:**
- block area
- block length
- block compactness
- perimeter
- access points
- internal permeability
- superblock detection
- fragmentation

---

### 07.6 Parcel Engine

**المؤشرات:**
- area
- frontage
- depth
- ratio
- buildability
- coverage
- FAR potential
- merge/split potential

---

### 07.7 Frontage & Edge Engine

**المؤشرات:**
- active frontage ratio
- blank wall risk
- setback effect
- parking edge effect
- transparency potential
- shaded frontage
- service frontage
- residential privacy frontage

---

### 07.8 Site Intelligence Engine

للمشاريع الصغيرة والعمارة.

**يحسب:**
- orientation
- sun exposure
- privacy
- entrance logic
- parking impact
- massing envelope
- street relationship
- neighbor sensitivity
- yard quality

---

### 07.9 Architectural Context Engine

يربط التصميم المعماري بالسياق.

**يفحص:**
- footprint vs plot
- massing vs street
- entrance position
- active edge
- parking separation
- height compatibility
- shadow impact
- frontage quality

---

### 07.10 Accessibility Engine

**يحسب:**
- 5/10/15 minute walksheds
- nearest services
- underserved areas
- catchment population
- service gap
- access equity
- route directness

---

### 07.11 Land Use Mix Engine

**يحسب:**
- land-use entropy
- mono-use zones
- jobs-housing balance
- service mix
- activity distribution
- missing functions

---

### 07.12 Sprawl & Growth Engine

**يحسب:**
- low-density expansion
- leapfrog growth
- edge fragmentation
- disconnected expansion
- infrastructure inefficiency
- car dependency risk
- rural-urban conflict

---

### 07.13 Rural Fabric Engine

**يحسب:**
- village cluster pattern
- farm-road relation
- wadi sensitivity
- rural access
- tourism potential
- settlement growth risk
- landscape preservation score

---

### 07.14 Code & Guideline Engine

يدعم rule packs:
- municipal codes
- FAR
- setbacks
- heights
- coverage
- parking
- frontage rules
- public realm rules
- Saudi urban identity rules
- Jeddah/Riyadh/Makkah packs

---

### 07.15 Scenario Engine

ينشئ سيناريوهات:
- design intervention
- urban repair
- density change
- land-use change
- edge improvement
- street connection
- public space upgrade

ويحسب:
- impact
- trade-offs
- compliance
- recommendation

---

### 07.16 Generative Design Engine

توليد مقترحات تخطيطية وتصميمية:

- massing option
- frontage option
- block split
- street link
- public realm intervention
- service placement
- rural growth boundary

**مهم:** هذا المحرك لا يقرر وحده. يقدم مقترحات قابلة للمراجعة.

---

### 07.17 Report & Evidence Engine

ينتج:
- methodology
- data sources
- maps
- indicators
- diagnosis
- scenarios
- recommendation
- appendix
- evidence table

---

## 08. وكلاء الذكاء الاصطناعي

### 08.1 Data Doctor Agent

**المهمة:** فحص البيانات وتنظيفها.

**أمثلة:**
- “لديك 42 طريقًا غير متصل بالشبكة.”
- “هذه المباني خارج حدود القطع.”
- “نظام الإحداثيات غير مناسب.”
- “أقترح snap tolerance = 0.5m.”

---

### 08.2 Urban Object Classifier Agent

**المهمة:** تصنيف الكائنات.

**يفهم:**
- شارع محلي.
- طريق رئيسي.
- محور.
- واجهة.
- ساحة.
- مجاورة.
- edge.
- block.

---

### 08.3 Site Agent

**المقياس:** قطعة/فيلا.

**يفحص:**
- الخصوصية.
- المدخل.
- الكتلة.
- الحوش.
- المواقف.
- العلاقة مع الشارع.
- الشمس والرياح.

---

### 08.4 Architectural Context Agent

**المقياس:** مبنى/مشروع.

**يفحص:**
- علاقة المبنى بالنسيج.
- الواجهة.
- المدخل.
- الظل.
- الارتفاع.
- التوافق مع الجوار.

---

### 08.5 Fabric Diagnosis Agent

**المقياس:** بلوك/مجاورة/حي.

**يفحص:**
- ضعف الاتصال.
- كبر البلوكات.
- ضعف الخدمات.
- ضعف المشاة.
- الواجهات الميتة.
- الفراغ العام.

---

### 08.6 Scenario Generator Agent

يقترح:
- conservative scenario
- pedestrian-first scenario
- density scenario
- public realm scenario
- rural-sensitive scenario
- anti-sprawl scenario

---

### 08.7 Code Compliance Agent

يفحص:
- هل السيناريو متوافق؟
- أين المخالفة؟
- ما التعديل؟
- هل يحتاج استثناء؟

---

### 08.8 Design Critic Agent

ينقد التصميم:

- قوي/ضعيف.
- أثره على النسيج.
- نقاط الخلل.
- التعديلات المطلوبة.

---

### 08.9 Report Agent

يكتب التقرير من:
- البيانات.
- المؤشرات.
- الخرائط.
- السيناريوهات.
- المخرجات.

ولا يحق له اختراع معلومات غير موجودة.

---

### 08.10 Planning Memory Agent

ذاكرة نسج:

- نماذج أحياء.
- حلول سابقة.
- typologies.
- rule packs.
- أمثلة سياقية.
- lessons learned.

---

## 09. الواجهات والشاشات

### 09.1 Project Launcher

**الهدف:** بداية واضحة.

**المحتوى:**
- New Project
- Open `.nsj`
- Recent Projects
- Templates:
  - Villa / Plot Review
  - Building Context Review
  - Compound Fabric Review
  - Neighborhood Diagnosis
  - District Scenario
  - City Growth
  - Rural Fabric

---

### 09.2 Scale Selector

يسأل:

```text
ما مقياس المشروع؟
[قطعة/فيلا] [مبنى] [مجمع] [بلوك] [مجاورة] [حي] [مدينة] [ريف]
```

بناءً عليه تتغير الأدوات.

---

### 09.3 Import Studio

**الأقسام:**
- Boundary
- Streets/Roads
- Parcels
- Buildings
- Land Use
- POIs
- Public Spaces
- Topography
- BIM/CAD لاحقًا

**كل Layer يعرض:**
- file type
- feature count
- geometry type
- CRS
- quality status
- missing fields

---

### 09.4 Data Doctor

جدول:

| المشكلة | الموقع | الخطورة | الإصلاح المقترح | إجراء |
|---|---|---|---|---|

---

### 09.5 Fabric Understanding Screen

تعرض “ما فهمه البرنامج”:

```text
Detected:
- 1 project boundary
- 124 street segments
- 37 intersections
- 18 blocks
- 256 parcels
- 142 buildings
- 62 street frontages
- 4 service clusters
- 3 pedestrian gaps
- 2 major barriers
```

---

### 09.6 Map Canvas

الخريطة الأساسية:

- layer tree.
- analysis overlays.
- scenario toggle.
- object selection.
- drawing tools.
- measurements.
- compare slider.
- inspector.

---

### 09.7 Object Inspector

إذا ضغط على شارع:

- type.
- length.
- network role.
- pedestrian score.
- frontage score.
- barrier effect.
- recommendations.

إذا ضغط على مبنى:

- footprint.
- height.
- frontage relation.
- entrance.
- parking.
- context score.
- recommendations.

إذا ضغط على بلوك:

- area.
- permeability.
- parcel grain.
- access points.
- intervention options.

---

### 09.8 Diagnosis Dashboard

لوحة مؤشرات:

- Fabric Score
- Walkability
- Connectivity
- Block Health
- Frontage Quality
- Service Access
- Sprawl Risk
- Code Compliance

---

### 09.9 Scenario Studio

أدوات:
- duplicate baseline.
- draw intervention.
- change land use.
- add link.
- adjust massing.
- run simulation.
- compare.

---

### 09.10 AI Planning Room

غرفة ذكاء اصطناعي منظمة:

- Diagnoses
- Questions
- Suggested Scenarios
- Code Review
- Report Drafts
- Design Critique

---

### 09.11 Report Builder

أقسام:

- Executive Summary
- Context
- Data
- Methodology
- Fabric Diagnosis
- Scenarios
- Recommendation
- Maps
- Appendix
- Export

---

## 10. صيغ الملفات

### 10.1 ملف نسج

```text
.nsj
```

### 10.2 البنية الداخلية

```text
manifest.json
project.duckdb
layers/
  streets.geoparquet
  parcels.geoparquet
  buildings.geoparquet
  landuse.geoparquet
styles/
scenarios/
analysis/
reports/
attachments/
```

### 10.3 لماذا ملف مستقل؟

- يعمل offline.
- سهل النقل.
- يمكن أرشفته.
- يثبت أنه software وليس web SaaS فقط.
- يمكن مزامنته cloud لاحقًا.

---

## 11. المعمارية التقنية

### 11.1 الخيار العام

نسج يبدأ كـ **Desktop-first software** مع cloud optional.

### 11.2 البنية

```text
Nusuj Studio
├─ Desktop App
│  ├─ Tauri/Electron
│  ├─ Map Canvas
│  ├─ Inspector
│  └─ Scenario UI
├─ Local Engine
│  ├─ Design Fabric Kernel
│  ├─ Geometry Engine
│  ├─ Street Graph Engine
│  ├─ Scenario Engine
│  └─ Report Engine
├─ AI Agent Runtime
│  ├─ Data Doctor
│  ├─ Site Agent
│  ├─ Fabric Agent
│  └─ Report Agent
├─ Optional Cloud
│  ├─ Team Sync
│  ├─ Organization Library
│  ├─ License Management
│  └─ Shared Reports
└─ Plugin SDK
   ├─ Indicators
   ├─ Rule Packs
   ├─ Reports
   └─ Import/Export
```

### 11.3 التقنية المقترحة

**Desktop**
- Tauri أو Electron.

**Map**
- MapLibre GL.
- deck.gl.
- WebGL.

**Spatial/Analysis**
- Python.
- GeoPandas.
- Shapely.
- NetworkX.
- OSMnx.
- Rasterio.
- scikit-learn.
- DuckDB Spatial.
- PostGIS للنسخة cloud/enterprise.

**Storage**
- Local: DuckDB/SQLite + GeoParquet.
- Cloud: PostgreSQL/PostGIS.
- Package: `.nsj`.

**Reports**
- HTML to PDF.
- map snapshots.
- structured appendix.

**AI**
- LLM + tool calling.
- RAG on planning methods.
- controlled agents.
- human approval for changes.

---

## 12. نموذج البيانات

### 12.1 Core

```yaml
Workspace:
  id
  name
  owner

Project:
  id
  name
  scale
  city
  coordinate_system
  boundary
  created_at

Layer:
  id
  project_id
  name
  type
  geometry_type
  crs
  source
  status

Feature:
  id
  layer_id
  geometry
  attributes
```

### 12.2 Fabric Objects

```yaml
Street:
  id
  geometry
  type
  hierarchy
  width
  speed
  pedestrian_score
  barrier_score

Block:
  id
  geometry
  area
  perimeter
  compactness
  permeability

Parcel:
  id
  geometry
  area
  frontage
  depth
  land_use

Building:
  id
  footprint
  height
  use
  frontage_relation
  entrance_location

Frontage:
  id
  geometry
  street_id
  building_id
  active_score
  shade_score
  edge_type
```

### 12.3 Scenario

```yaml
Scenario:
  id
  project_id
  name
  parent_scenario_id
  status

ScenarioChange:
  id
  scenario_id
  type
  target_object
  geometry_before
  geometry_after
  attributes_before
  attributes_after

ScenarioResult:
  id
  scenario_id
  indicator
  baseline_value
  scenario_value
  delta
```

### 12.4 AI

```yaml
AgentRun:
  id
  project_id
  agent_type
  input
  tools_used
  output
  confidence
  approval_status

AgentRecommendation:
  id
  agent_run_id
  target_object
  recommendation
  reason
  evidence
  status
```

---

## 13. المؤشرات الأساسية

### Plot / Building

- orientation score
- privacy score
- entrance clarity
- parking impact
- street relationship
- frontage activation
- setback quality
- massing fit

### Street / Block

- intersection density
- link-node ratio
- dead-end ratio
- average segment length
- block area
- block permeability
- frontage continuity
- active frontage ratio

### Neighborhood / District

- walkability
- service accessibility
- land-use mix
- public space access
- connectivity
- edge fragmentation
- center strength
- sprawl risk

### City / Rural

- growth direction
- expansion efficiency
- rural sensitivity
- agricultural impact
- settlement compactness
- infrastructure burden

---

## 14. مخرجات حسب المقياس

### فيلا / قطعة

- Site Intelligence Report
- Privacy & Orientation Review
- Massing Envelope Sheet
- Street Relation Score
- Design Recommendations

### مبنى

- Context Fit Report
- Frontage Report
- Access/Parking Review
- Code Compliance Summary

### مجمع

- Internal Fabric Report
- Gate Analysis
- Edge Impact Review

### بلوك

- Block Health Report
- Parcel Grain Analysis
- Permeability Recommendations

### مجاورة

- Neighborhood Fabric Diagnosis
- Service Gap Map
- Walkability Report

### حي

- District Diagnosis
- Scenario Comparison
- Urban Repair Strategy

### مدينة

- Growth Pattern Report
- Sprawl Risk Analysis
- Expansion Scenario

### ريف

- Rural Fabric Report
- Village Growth Strategy
- Landscape-Sensitive Development Review

---

## 15. MVP المقترح

### 15.1 اسم MVP

**Nusuj Studio Alpha — Fabric Understanding**

### 15.2 المقاييس المدعومة

1. Plot / Villa
2. Building
3. Neighborhood

### 15.3 الوظائف

- إنشاء مشروع.
- فتح/حفظ `.nsj`.
- استيراد GeoJSON.
- عرض خريطة.
- Data Doctor.
- Object classification.
- Street graph.
- Block extraction.
- Plot/building context analysis.
- أول 8 مؤشرات.
- Scenario بسيط.
- AI diagnosis.
- PDF report.

### 15.4 لا يدخل في MVP

- 3D كامل.
- DWG/RVT native.
- BIM editing.
- traffic simulation.
- collaboration.
- marketplace.
- cloud sync.
- advanced rendering.

---

## 16. Roadmap

### أول 2 أسبوع

- Product Doctrine.
- Ontology.
- Data model.
- UI study.
- `.nsj` spec.
- Repo clean.

### أول 30 يوم

- Desktop shell.
- Import GeoJSON.
- Map canvas.
- Layer manager.
- Data Doctor basic.
- Project file.
- First indicators.

### 60 يوم

- Street network engine.
- Block engine.
- Plot analysis.
- Building context analysis.
- AI Data Doctor.
- Fabric Diagnosis Agent.

### 90 يوم

- Scenario engine.
- Before/After comparison.
- Report engine.
- Demo على فيلا + مبنى + مجاورة.

### 6 أشهر

- Code engine.
- Rural engine basic.
- Frontage engine.
- Rule packs.
- Plugin SDK draft.

### 12 شهر

- Nusuj Studio 1.0.
- Desktop stable.
- AI agents stable.
- Project file stable.
- Report packs.
- Saudi context datasets.
- Enterprise cloud optional.

---

## 17. إعادة بناء المستودع

### الوضع الحالي

المستودع الحالي يحتوي:
- placeholders.
- stubs.
- fake API values.
- weak DB schema.
- unsafe Docker patterns.
- no stable runtime.

### القرار

نحوّله إلى archive، ونبني core جديد.

### الهيكل الجديد

```text
nusuj/
  docs/
    product/
    methods/
    architecture/
    ui/
  apps/
    studio-desktop/
  services/
    analysis-api/
    report-renderer/
  packages/
    design-fabric-kernel/
    spatial-kernel/
    file-format/
    indicators/
    ai-agents/
    ui/
  tests/
  infra/
```

### أول ملفات

```text
NUSUJ_PRODUCT_DOCTRINE.md
NUSUJ_SCALE_ONTOLOGY.md
NUSUJ_OBJECT_MODEL.md
NUSUJ_ENGINE_ARCHITECTURE.md
NUSUJ_AGENT_SYSTEM.md
NUSUJ_UI_STUDY.md
NUSUJ_MVP_SPEC.md
```

---

## 18. معايير الجودة

أي ميزة لا تقبل إلا إذا:

- لها تعريف في ontology.
- لها data model.
- لها UI.
- لها test.
- تحفظ في `.nsj`.
- تدخل في report.
- لا تعتمد على fake/stub.
- لها method documentation.
- تعمل offline على sample project.

---

## 19. نماذج سيناريوهات

### سيناريو فيلا

**المشكلة:** المدخل يواجه شارعًا سريعًا، السور طويل ومغلق، المواقف على الواجهة.  
**اقتراح نسج:** نقل المدخل، تخفيف السور، خلق frontage أخف، تغيير موقف السيارات.  
**المخرج:** Site Review + Before/After score.

### سيناريو مبنى تجاري

**المشكلة:** مواقف أمامية تقطع المشاة.  
**اقتراح نسج:** نقل المواقف للخلف، فتح واجهة، تظليل الرصيف.  
**المخرج:** Frontage Activation Report.

### سيناريو مجاورة

**المشكلة:** خدمات بعيدة وبلوكات كبيرة.  
**اقتراح نسج:** رابط مشاة + مساحة عامة + خدمات محلية.  
**المخرج:** Walkability delta + Service access improvement.

### سيناريو مدينة

**المشكلة:** تمدد منخفض الكثافة على الحافة.  
**اقتراح نسج:** growth boundary + center strengthening + service-oriented expansion.  
**المخرج:** Sprawl Risk Report.

---

## 20. الخلاصة

نسج يجب أن يكون:

> برنامجًا مستقلًا لفهم وتصميم النسيج المكاني بدقة.

ليس محدودًا بالمدينة.  
وليس محدودًا بالعمارة.  
هو يربطهما.

**من فيلا إلى مدينة.**  
**من قطعة إلى حي.**  
**من شارع إلى نسيج.**  
**من تصميم إلى أثر.**

القلب الحقيقي:

```text
Design Fabric Kernel
+ Urban Ontology
+ Spatial Engines
+ AI Agents
+ Scenario Engine
+ Report Engine
```

إذا بنينا هذا بصرامة، يصبح نسج فئة جديدة:  
**برنامج يقرأ ويصمم النسيج المكاني، وليس مجرد أداة خرائط أو رسم.**

---

## 21. مراجع ومعايير مرجعية للدراسة

- ArcGIS Pro: معيار قوي للـ Desktop GIS و2D/3D والتحليل.
- ArcGIS Urban: مرجع مهم لإدارة الخطط والمشاريع والنمو الحضري.
- CityEngine: مرجع مهم للتوليد الإجرائي للمدن.
- IFC / buildingSMART: مرجع مهم لربط نسج بعالم BIM والعمارة.
- GeoPackage / OGC: مرجع مهم لصيغ الملفات المكانية.
- PostGIS: مرجع مهم لمحركات البيانات المكانية.
- QGIS: مرجع مهم للـ GIS المفتوح والمكونات.
- OSMnx / cityseer: مرجع مهم لتحليل شبكات الشوارع والنسيج على مقياس المشاة.
