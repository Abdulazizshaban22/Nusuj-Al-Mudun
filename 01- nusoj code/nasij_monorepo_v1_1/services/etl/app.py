from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional
import numpy as np
import pandas as pd
from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response
from math import log

app = FastAPI(title="NASIJ ETL / Algorithms")

REQS = Counter('nasij_requests_total', 'Total NASIJ requests', ['endpoint'])

# ---------- AHP ----------
class AHPIn(BaseModel):
    pairwise: List[List[float]] = Field(..., description="n x n positive reciprocal matrix")

class AHPOut(BaseModel):
    weights: List[float]
    lambda_max: float
    CI: float
    RI: float
    CR: float
    ok: bool

# Saaty RI table (n=1..10)
_RI = {1:0.00, 2:0.00, 3:0.58, 4:0.90, 5:1.12, 6:1.24, 7:1.32, 8:1.41, 9:1.45, 10:1.49}

@app.post("/algo/ahp", response_model=AHPOut)
def ahp(inp: AHPIn):
    REQS.labels(endpoint="/algo/ahp").inc()
    A = np.array(inp.pairwise, dtype=float)
    assert A.shape[0] == A.shape[1], "Matrix must be square"
    # Principal eigenvector method
    w, v = np.linalg.eig(A)
    idx = np.argmax(w.real)
    lambda_max = float(w.real[idx])
    vec = np.abs(v[:, idx].real)
    weights = (vec / vec.sum()).tolist()
    n = A.shape[0]
    CI = (lambda_max - n) / (n - 1) if n > 1 else 0.0
    RI = _RI.get(n, 1.49)  # default to n=10 RI if larger
    CR = CI / RI if RI > 0 else 0.0
    ok = CR <= 0.1
    return AHPOut(weights=weights, lambda_max=lambda_max, CI=CI, RI=RI, CR=CR, ok=ok)

# ---------- TOPSIS ----------
class TOPSISIn(BaseModel):
    matrix: List[List[float]]
    weights: Optional[List[float]] = None
    benefit: Optional[List[bool]] = None

class TOPSISOut(BaseModel):
    scores: List[float]
    ranking: List[int]

@app.post("/algo/topsis", response_model=TOPSISOut)
def topsis(inp: TOPSISIn):
    REQS.labels(endpoint="/algo/topsis").inc()
    X = np.array(inp.matrix, dtype=float)  # m alternatives x n criteria
    m, n = X.shape
    # weights
    if inp.weights is None:
        w = np.ones(n) / n
    else:
        w = np.array(inp.weights, dtype=float)
        w = w / w.sum()
    # benefit flags
    if inp.benefit is None:
        benefit = np.ones(n, dtype=bool)
    else:
        benefit = np.array(inp.benefit, dtype=bool)

    # normalize
    norm = np.sqrt((X**2).sum(axis=0))
    R = X / norm
    V = R * w  # weighted normalized

    ideal_pos = np.array([V[:,j].max() if benefit[j] else V[:,j].min() for j in range(n)])
    ideal_neg = np.array([V[:,j].min() if benefit[j] else V[:,j].max() for j in range(n)])

    d_pos = np.sqrt(((V - ideal_pos)**2).sum(axis=1))
    d_neg = np.sqrt(((V - ideal_neg)**2).sum(axis=1))

    scores = (d_neg / (d_pos + d_neg)).tolist()
    ranking = list(np.argsort(scores)[::-1].astype(int))  # high to low
    return TOPSISOut(scores=scores, ranking=ranking)

# ---------- DBSCAN ----------
from sklearn.cluster import DBSCAN
class DBSCANIn(BaseModel):
    X: List[List[float]]
    eps: float = 0.5
    min_samples: int = 5
class DBSCANOut(BaseModel):
    labels: List[int]

@app.post("/algo/dbscan", response_model=DBSCANOut)
def dbscan_run(inp: DBSCANIn):
    REQS.labels(endpoint="/algo/dbscan").inc()
    X = np.array(inp.X, dtype=float)
    labels = DBSCAN(eps=inp.eps, min_samples=inp.min_samples).fit_predict(X)
    return DBSCANOut(labels=labels.tolist())

# ---------- Isolation Forest ----------
from sklearn.ensemble import IsolationForest
class IFIn(BaseModel):
    X: List[List[float]]
    contamination: float = 0.1
class IFOut(BaseModel):
    scores: List[float]
    labels: List[int]

@app.post("/algo/isolation-forest", response_model=IFOut)
def isolation_forest(inp: IFIn):
    REQS.labels(endpoint="/algo/isolation-forest").inc()
    X = np.array(inp.X, dtype=float)
    clf = IsolationForest(contamination=inp.contamination, random_state=42).fit(X)
    scores = (-clf.decision_function(X)).tolist()
    labels = clf.predict(X).tolist()  # 1 inlier, -1 outlier
    return IFOut(scores=scores, labels=labels)

# ---------- Remote Sensing ----------
class NDVIIn(BaseModel):
    red: List[float]
    nir: List[float]
class NDVIOut(BaseModel):
    ndvi: List[float]

@app.post("/rs/ndvi", response_model=NDVIOut)
def ndvi(inp: NDVIIn):
    REQS.labels(endpoint="/rs/ndvi").inc()
    red = np.array(inp.red, dtype=float)
    nir = np.array(inp.nir, dtype=float)
    ndvi = (nir - red) / (nir + red + 1e-9)
    return NDVIOut(ndvi=ndvi.tolist())

class LSTBTIn(BaseModel):
    radiance: List[float]
    K1: float
    K2: float
class LSTBTOut(BaseModel):
    bt_kelvin: List[float]

@app.post("/rs/lst_bt", response_model=LSTBTOut)
def lst_bt(inp: LSTBTIn):
    \"\"\"Brightness Temperature (simplified Planck inversion).
    BT(K) = K2 / ln(K1 / L + 1)
    User supplies sensor-specific K1, K2 (e.g., Landsat TIRS constants).
    \"\"\"
    REQS.labels(endpoint="/rs/lst_bt").inc()
    L = np.array(inp.radiance, dtype=float)
    bt = inp.K2 / np.log(inp.K1 / (L + 1e-9) + 1.0)
    return LSTBTOut(bt_kelvin=bt.tolist())

# ---------- Metrics ----------
@app.get("/metrics")
def metrics():
    content = generate_latest()
    return Response(content=content, media_type=CONTENT_TYPE_LATEST)
