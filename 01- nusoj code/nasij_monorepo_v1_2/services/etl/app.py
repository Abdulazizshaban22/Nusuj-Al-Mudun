
import os, json, math, requests
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import numpy as np
from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response
import psycopg
from shapely.geometry import Point, MultiPoint, Polygon, mapping

DATABASE_URL = os.getenv("DATABASE_URL","postgresql://nasij:nasij@db:5432/nasij")
OSRM_BASE_URL = os.getenv("OSRM_BASE_URL","http://osrm:5000")

app = FastAPI(title="NASIJ ETL v1.2")
REQS = Counter('nasij_requests_total', 'Total NASIJ requests', ['endpoint'])

def db():
    return psycopg.connect(DATABASE_URL)

def fc_from_cells(rows):
    feats = []
    for r in rows:
        feats.append({
            "type":"Feature",
            "properties": { "id": r[0], "name": r[1], "efficiency": float(r[3]) if r[3] is not None else None,
                            "resilience": float(r[4]) if r[4] is not None else None, "connectivity": float(r[5]) if r[5] is not None else None },
            "geometry": json.loads(r[2]) if r[2] else None
        })
    return { "type":"FeatureCollection", "features": feats }

@app.get("/geo/cells")
def geo_cells():
    REQS.labels(endpoint="/geo/cells").inc()
    with db() as conn:
        rows = conn.execute("""
            SELECT uc.id, uc.name, ST_AsGeoJSON(uc.geom), fi.efficiency, fi.resilience, fi.connectivity
            FROM urban_cells uc
            LEFT JOIN fabric_indicators fi ON fi.cell_id = uc.id
            ORDER BY uc.id
        """).fetchall()
    return fc_from_cells(rows)

@app.get("/geo/cells_with_indicators")
def geo_cells_with_indicators():
    return geo_cells()

class UploadFeature(BaseModel):
    type: str
    properties: Dict[str, Any]
    geometry: Dict[str, Any]

class UploadFC(BaseModel):
    type: str
    features: List[UploadFeature]

@app.post("/upload/urban_cells")
def upload_urban_cells(fc: UploadFC):
    REQS.labels(endpoint="/upload/urban_cells").inc()
    inserted = 0
    with db() as conn:
        for f in fc.features:
            name = f.properties.get("name","cell")
            geom_json = json.dumps(f.geometry)
            conn.execute("""
                INSERT INTO urban_cells(name, geom) VALUES (%s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326))
            """, (name, geom_json))
            inserted += 1
        conn.commit()
    return {"ok": True, "inserted": inserted}

class AHPIn(BaseModel):
    pairwise: List[List[float]]
class AHPOut(BaseModel):
    weights: List[float]; lambda_max: float; CI: float; RI: float; CR: float; ok: bool
_RI = {1:0.00, 2:0.00, 3:0.58, 4:0.90, 5:1.12, 6:1.24, 7:1.32, 8:1.41, 9:1.45, 10:1.49}

@app.post("/algo/ahp", response_model=AHPOut)
def ahp(inp: AHPIn):
    REQS.labels(endpoint="/algo/ahp").inc()
    A = np.array(inp.pairwise, dtype=float)
    w, v = np.linalg.eig(A)
    i = int(np.argmax(w.real))
    lam = float(w.real[i])
    vec = np.abs(v[:, i].real)
    weights = (vec / vec.sum()).tolist()
    n = A.shape[0]; CI = (lam - n)/(n-1) if n>1 else 0.0
    RI = _RI.get(n, 1.49); CR = CI/RI if RI>0 else 0.0
    return AHPOut(weights=weights, lambda_max=lam, CI=CI, RI=RI, CR=CR, ok=CR<=0.1)

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
    X = np.array(inp.matrix, dtype=float)
    m, n = X.shape
    w = np.ones(n)/n if not inp.weights else np.array(inp.weights, dtype=float); w = w/w.sum()
    benefit = np.ones(n, dtype=bool) if inp.benefit is None else np.array(inp.benefit, dtype=bool)
    norm = np.sqrt((X**2).sum(axis=0)); R = X / (norm + 1e-12); V = R * w
    ideal_pos = np.array([V[:,j].max() if benefit[j] else V[:,j].min() for j in range(n)])
    ideal_neg = np.array([V[:,j].min() if benefit[j] else V[:,j].max() for j in range(n)])
    d_pos = np.sqrt(((V - ideal_pos)**2).sum(axis=1)); d_neg = np.sqrt(((V - ideal_neg)**2).sum(axis=1))
    scores = (d_neg / (d_pos + d_neg + 1e-12)).tolist()
    ranking = list(np.argsort(scores)[::-1].astype(int))
    return TOPSISOut(scores=scores, ranking=ranking)

@app.get("/deviation/score_from_indicators")
def deviation_score_from_indicators():
    REQS.labels(endpoint="/deviation/score_from_indicators").inc()
    with db() as conn:
        rows = conn.execute("SELECT efficiency, connectivity FROM fabric_indicators ORDER BY cell_id").fetchall()
    scores = []
    for r in rows:
        eff = float(r[0]) if r[0] is not None else 0.5
        connv = float(r[1]) if r[1] is not None else 0.5
        deviation = 1.0 - (0.6*eff + 0.4*connv)
        deviation = max(0.0, min(1.0, deviation))
        scores.append(deviation)
    return {"scores": scores}

class PairIn(BaseModel):
    red: List[float]; nir: List[float]
class NDVIOut(BaseModel):
    ndvi: List[float]
@app.post("/rs/ndvi", response_model=NDVIOut)
def ndvi(inp: PairIn):
    REQS.labels(endpoint="/rs/ndvi").inc()
    red = np.array(inp.red, dtype=float); nir = np.array(inp.nir, dtype=float)
    ndvi = (nir - red) / (nir + red + 1e-9)
    return {"ndvi": ndvi.tolist()}

class EVIIn(BaseModel):
    red: List[float]; nir: List[float]; blue: List[float]
    G: float = 2.5; C1: float = 6.0; C2: float = 7.5; L: float = 1.0
class EVIOut(BaseModel): 
    evi: List[float]
@app.post("/rs/evi", response_model=EVIOut)
def evi(inp: EVIIn):
    REQS.labels(endpoint="/rs/evi").inc()
    red = np.array(inp.red, dtype=float); nir = np.array(inp.nir, dtype=float); blue = np.array(inp.blue, dtype=float)
    evi = inp.G * ( (nir - red) / (nir + inp.C1*red + inp.C2*blue + inp.L + 1e-9) )
    return {"evi": evi.tolist()}

class SAVIIn(BaseModel):
    red: List[float]; nir: List[float]; L: float = 0.5
class SAVIOut(BaseModel): 
    savi: List[float]
@app.post("/rs/savi", response_model=SAVIOut)
def savi(inp: SAVIIn):
    REQS.labels(endpoint="/rs/savi").inc()
    red = np.array(inp.red, dtype=float); nir = np.array(inp.nir, dtype=float)
    savi = ((nir - red) / (nir + red + inp.L + 1e-9)) * (1 + inp.L)
    return {"savi": savi.tolist()}

class NDWIIn(BaseModel):
    green: List[float]; nir: List[float]
class NDWIOut(BaseModel): 
    ndwi: List[float]
@app.post("/rs/ndwi", response_model=NDWIOut)
def ndwi(inp: NDWIIn):
    REQS.labels(endpoint="/rs/ndwi").inc()
    green = np.array(inp.green, dtype=float); nir = np.array(inp.nir, dtype=float)
    ndwi = (green - nir) / (green + nir + 1e-9)
    return {"ndwi": ndwi.tolist()}

class ChangeDiffIn(BaseModel):
    a: List[float]; b: List[float]; threshold: float = 0.1
class ChangeDiffOut(BaseModel):
    diff: List[float]; changed: List[bool]; stats: Dict[str, float]
@app.post("/rs/change_diff", response_model=ChangeDiffOut)
def change_diff(inp: ChangeDiffIn):
    REQS.labels(endpoint="/rs/change_diff").inc()
    a = np.array(inp.a, dtype=float); b = np.array(inp.b, dtype=float)
    d = (b - a); changed = (np.abs(d) >= inp.threshold)
    stats = {"mean": float(d.mean()), "min": float(d.min()), "max": float(d.max()), "pct_changed": float(100*changed.mean())}
    return {"diff": d.tolist(), "changed": changed.tolist(), "stats": stats}

class LSTBTIn(BaseModel):
    radiance: List[float]; K1: float; K2: float
class LSTBTOut(BaseModel): 
    bt_kelvin: List[float]
@app.post("/rs/lst_bt", response_model=LSTBTOut)
def lst_bt(inp: LSTBTIn):
    REQS.labels(endpoint="/rs/lst_bt").inc()
    L = np.array(inp.radiance, dtype=float)
    bt = inp.K2 / np.log(inp.K1/(L + 1e-9) + 1.0)
    return {"bt_kelvin": bt.tolist()}

class IsoIn(BaseModel):
    origin: List[float] = Field(..., description="lon,lat")
    cutoff: int = 900
    grid_km: float = 5.0
    n: int = 200

def sample_points(lon, lat, grid_km=5.0, n=200):
    pts = []
    deg = grid_km / 111.32
    for i in range(n):
        x = lon + (np.random.rand()*2-1)*deg
        y = lat + (np.random.rand()*2-1)*deg
        pts.append([x,y])
    return pts

@app.post("/access/isochrone")
def isochrone(inp: IsoIn):
    REQS.labels(endpoint="/access/isochrone").inc()
    lon, lat = inp.origin
    pts = sample_points(lon, lat, grid_km=inp.grid_km, n=inp.n)
    durations = []
    chunk = 90
    for i in range(0, len(pts), chunk):
        subset = pts[i:i+chunk]
        coords = ";".join([f"{lon},{lat}"] + [f"{x},{y}" for x,y in subset])
        url = f"{OSRM_BASE_URL}/table/v1/driving/{coords}?sources=0&annotations=duration"
        r = requests.get(url, timeout=20)
        r.raise_for_status()
        J = r.json()
        arr = J.get("durations", [[]])
        if not arr: continue
        row0 = arr[0][1:]
        durations.extend(row0)
    reachable = [Point(p[0], p[1]) for p,d in zip(pts, durations) if (d is not None and d <= inp.cutoff)]
    if len(reachable) < 3:
        poly = Polygon()
    else:
        poly = MultiPoint(reachable).convex_hull
    feat = {"type":"Feature","properties":{"origin":inp.origin,"cutoff":inp.cutoff},"geometry":mapping(poly)}
    return {"type":"FeatureCollection","features":[feat]}

@app.get("/metrics")
def metrics():
    content = generate_latest()
    return Response(content=content, media_type=CONTENT_TYPE_LATEST)
