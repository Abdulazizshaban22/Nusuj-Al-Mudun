
# NASIJ Tools SDK (Analytics Plug‑ins)

أضف أي خوارزمية تحليلية كـ Plug‑in داخل خدمة FastAPI بدون تعديل رئيسي.

## كيف تضيف أداة جديدة؟
1) أنشئ ملفًا في `services/etl/tools/mytool.py` يحوي دالة `register(app)`
2) داخل الدالة، عرّف الـ endpoint كما في المثال:
```python
# services/etl/tools/mytool.py
from fastapi import APIRouter
router = APIRouter(prefix='/tools', tags=['tools'])

@router.post('/mytool')
def mytool(payload: dict):
    # ... تحليل مخصص ...
    return {"ok": True, "result": 42}

def register(app):
    app.include_router(router)
```
3) في `services/etl/app.py` أضف في الأسفل:
```python
# auto-register tools (import if exists)
try:
    from tools import mytool as _mytool
    _mytool.register(app)
except Exception as ex:
    print('tools/mytool not loaded:', ex)
```

> الملكية الفكرية: جميع الأدوات التي تُطوَّر كـ plug‑ins ضمن المشروع تبقى ملكًا لنا (راجع بند التراخيص الداخلي).
