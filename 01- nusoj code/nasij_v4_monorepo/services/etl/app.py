from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np

app = FastAPI(title="NASIJ ETL", version="4.0.0")

@app.get("/health")
def health():
    return {"status": "ok", "service": "etl"}

# نموذج مبسّط لمؤشر "Fabric" التجريبي
# يجمع ثلاث درجات (عمراني/بيئي/وصولية) ويعيد درجة معيارية 0..100
class FabricInput(BaseModel):
    morphology: float  # 0..1
    environment: float # 0..1
    accessibility: float # 0..1
    weights: tuple[float, float, float] = (0.4, 0.3, 0.3)

@app.post("/fabric/index")
def fabric_index(inp: FabricInput):
    w = np.array(inp.weights, dtype=float)
    x = np.array([inp.morphology, inp.environment, inp.accessibility], dtype=float)
    w = w / w.sum()
    score = float(np.clip((w * x).sum(), 0.0, 1.0)) * 100.0
    return {"fabric_index": round(score, 2), "weights": w.tolist()}

# نسخة ديمو جاهزة للاستخدام من الواجهة
@app.get("/fabric/demo")
def fabric_demo():
    x = np.array([0.62, 0.48, 0.71])  # قيم عشوائية للتجربة
    w = np.array([0.4, 0.3, 0.3])
    score = float(np.clip((w * x).sum(), 0.0, 1.0)) * 100.0
    return {"fabric_index": round(score, 2), "components": {"morphology":0.62,"environment":0.48,"accessibility":0.71}}