
import os, json, math, requests
from fastapi import FastAPI, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import numpy as np
from shapely.geometry import Point, MultiPoint, Polygon, mapping
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response
import psycopg

DATABASE_URL = os.getenv("DATABASE_URL","postgresql://nasij:nasij@db:5432/nasij")
OSRM_BASE_URL = os.getenv("OSRM_BASE_URL","http://osrm:5000")

app = FastAPI(title="NASIJ ETL v2")
REQS = Counter('nasij_requests_total', 'Total NASIJ requests', ['endpoint'])
LAT = Histogram('nasij_req_seconds','Latency seconds',['endpoint'])

def db(): return psycopg.connect(DATABASE_URL)

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

@app.get("/geo/cells_with_indicators")
def geo_cells_with_indicators():
    REQS.labels(endpoint="/geo/cells_with_indicators").inc()
    with LAT.labels(endpoint="/geo/cells_with_indicators").time():
        with db() as conn:
            rows = conn.execute("""
                SELECT uc.id, uc.name, ST_AsGeoJSON(uc.geom), fi.efficiency, fi.resilience, fi.connectivity
                FROM urban_cells uc LEFT JOIN fabric_indicators fi ON fi.cell_id = uc.id
                ORDER BY uc.id
            """).fetchall()
    return fc_from_cells(rows)

# ---------- AHP/TOPSIS ----------
class AHPIn(BaseModel): pairwise: List[List[float]]
class AHPOut(BaseModel): weights: List[float]; lambda_max: float; CI: float; RI: float; CR: float; ok: bool
_RI = {1:0.00, 2:0.00, 3:0.58, 4:0.90, 5:1.12, 6:1.24, 7:1.32, 8:1.41, 9:1.45, 10:1.49}

@app.post("/algo/ahp", response_model=AHPOut)
def ahp(inp: AHPIn):
    REQS.labels(endpoint="/algo/ahp").inc()
    A = np.array(inp.pairwise, dtype=float)
    w, v = np.linalg.eig(A); i = int(np.argmax(w.real))
    lam = float(w.real[i]); vec = np.abs(v[:, i].real)
    weights = (vec / vec.sum()).tolist()
    n = A.shape[0]; CI = (lam - n)/(n-1) if n>1 else 0.0
    RI = _RI.get(n, 1.49); CR = CI/RI if RI>0 else 0.0
    return AHPOut(weights=weights, lambda_max=lam, CI=CI, RI=RI, CR=CR, ok=CR<=0.1)

class TOPSISIn(BaseModel): matrix: List[List[float]]; weights: Optional[List[float]] = None; benefit: Optional[List[bool]] = None
class TOPSISOut(BaseModel): scores: List[float]; ranking: List[int]

@app.post("/algo/topsis", response_model=TOPSISOut)
def topsis(inp: TOPSISIn):
    REQS.labels(endpoint="/algo/topsis").inc()
    X = np.array(inp.matrix, dtype=float); m, n = X.shape
    w = np.ones(n)/n if not inp.weights else np.array(inp.weights, dtype=float); w = w/w.sum()
    benefit = np.ones(n, dtype=bool) if inp.benefit is None else np.array(inp.benefit, dtype=bool)
    norm = np.sqrt((X**2).sum(axis=0)); V = (X / (norm + 1e-12)) * w
    ideal_pos = np.array([V[:,j].max() if benefit[j] else V[:,j].min() for j in range(n)])
    ideal_neg = np.array([V[:,j].min() if benefit[j] else V[:,j].max() for j in range(n)])
    d_pos = np.sqrt(((V - ideal_pos)**2).sum(axis=1)); d_neg = np.sqrt(((V - ideal_neg)**2).sum(axis=1))
    scores = (d_neg / (d_pos + d_neg + 1e-12)).tolist(); ranking = list(np.argsort(scores)[::-1].astype(int))
    return TOPSISOut(scores=scores, ranking=ranking)

# ---------- RS indices + Change Detection ----------
class Pair(BaseModel): a: List[float]; b: List[float]
class NDVIIn(BaseModel): red: List[float]; nir: List[float]
class EVIIn(BaseModel): red: List[float]; nir: List[float]; blue: List[float]; G: float = 2.5; C1: float = 6.0; C2: float = 7.5; L: float = 1.0
class SAVIIn(BaseModel): red: List[float]; nir: List[float]; L: float = 0.5
class NDWIIn(BaseModel): green: List[float]; nir: List[float]
class LSTBTIn(BaseModel): radiance: List[float]; K1: float; K2: float

@app.post("/rs/ndvi")
def ndvi(i: NDVIIn): REQS.labels(endpoint="/rs/ndvi").inc(); r=np.array(i.red); n=np.array(i.nir); return {"ndvi": ((n-r)/(n+r+1e-9)).tolist()}
@app.post("/rs/evi")
def evi(i: EVIIn): REQS.labels(endpoint="/rs/evi").inc(); r=np.array(i.red); n=np.array(i.nir); b=np.array(i.blue); return {"evi": (i.G*((n-r)/(n+i.C1*r+i.C2*b+i.L+1e-9))).tolist()}
@app.post("/rs/savi")
def savi(i: SAVIIn): REQS.labels(endpoint="/rs/savi").inc(); r=np.array(i.red); n=np.array(i.nir); return {"savi": (((n-r)/(n+r+i.L+1e-9))*(1+i.L)).tolist()}
@app.post("/rs/ndwi")
def ndwi(i: NDWIIn): REQS.labels(endpoint="/rs/ndwi").inc(); g=np.array(i.green); n=np.array(i.nir); return {"ndwi": ((g-n)/(g+n+1e-9)).tolist()}
@app.post("/rs/lst_bt")
def lst_bt(i: LSTBTIn): REQS.labels(endpoint="/rs/lst_bt").inc(); L=np.array(i.radiance,dtype=float); bt=i.K2/np.log(i.K1/(L+1e-9)+1.0); return {"bt_kelvin": bt.tolist()}

class CVAIn(BaseModel): x1: List[float]; x2: List[float]; y1: List[float]; y2: List[float]
@app.post("/rs/cva")
def cva(i: CVAIn):
    """Simple Change Vector Analysis magnitude and direction for two bands/features."""
    REQS.labels(endpoint="/rs/cva").inc()
    x1, x2, y1, y2 = [np.array(a, dtype=float) for a in (i.x1,i.x2,i.y1,i.y2)]
    dx, dy = (x2-x1), (y2-y1); mag = np.sqrt(dx*dx + dy*dy); ang = np.degrees(np.arctan2(dy,dx))
    return {"magnitude": mag.tolist(), "angle_deg": ang.tolist()}

# ---------- Deviation & Growth ----------
@app.get("/deviation/score_from_indicators")
def deviation_score_from_indicators():
    REQS.labels(endpoint="/deviation/score_from_indicators").inc()
    with db() as conn:
        rows = conn.execute("SELECT efficiency, connectivity FROM fabric_indicators ORDER BY cell_id").fetchall()
    scores=[]; 
    for r in rows:
        eff=float(r[0]) if r[0] is not None else 0.5; con=float(r[1]) if r[1] is not None else 0.5
        v=1.0-(0.6*eff+0.4*con); scores.append(max(0.0,min(1.0,v)))
    return {"scores": scores}

from sklearn.cluster import DBSCAN, IsolationForest

class PointsIn(BaseModel): points: List[List[float]] = Field(..., description="[[lon,lat,feat1,feat2,...], ...]"); eps: float = 0.01; min_samples: int = 5
@app.post("/algo/dbscan")
def algo_dbscan(i: PointsIn):
    REQS.labels(endpoint="/algo/dbscan").inc()
    X = np.array(i.points, dtype=float)
    clustering = DBSCAN(eps=i.eps, min_samples=i.min_samples).fit(X[:, :2])  # spatial clustering on lon/lat
    return {"labels": clustering.labels_.tolist(), "core_sample_indices": getattr(clustering,'core_sample_indices_',[]).tolist() if hasattr(clustering,'core_sample_indices_') else []}

class IFIn(BaseModel): X: List[List[float]]; contamination: float = 0.05
@app.post("/algo/iforest")
def algo_iforest(i: IFIn):
    REQS.labels(endpoint="/algo/iforest").inc()
    X=np.array(i.X,dtype=float); clf=IsolationForest(contamination=i.contamination, random_state=42).fit(X)
    scores=(-clf.score_samples(X)).tolist(); labels = (np.array(clf.predict(X))==-1).astype(int).tolist()
    return {"anomaly_scores": scores, "is_anomaly": labels}

# ---------- OSRM Isochrone (convex hull of reachable) ----------
class IsoIn(BaseModel): origin: List[float]; cutoff: int = 900; grid_km: float = 5.0; n: int = 200
def sample_points(lon, lat, grid_km=5.0, n=200):
    deg = grid_km / 111.32; rng=np.random.default_rng(123)
    return [[lon + (rng.random()*2-1)*deg, lat + (rng.random()*2-1)*deg] for _ in range(n)]

@app.post("/access/isochrone")
def isochrone(i: IsoIn):
    REQS.labels(endpoint="/access/isochrone").inc()
    lon, lat = i.origin; pts = sample_points(lon, lat, i.grid_km, i.n); durations = []; chunk=90
    for k in range(0,len(pts),chunk):
        subset = pts[k:k+chunk]
        coords = ";".join([f"{lon},{lat}"] + [f"{x},{y}" for x,y in subset])
        url = f"{OSRM_BASE_URL}/table/v1/driving/{coords}?sources=0&annotations=duration"
        J=requests.get(url,timeout=20).json(); row0 = (J.get("durations", [[]]) or [[]])[0][1:]; durations.extend(row0)
    reachable=[Point(p[0],p[1]) for p,d in zip(pts,durations) if (d is not None and d <= i.cutoff)]
    poly = Polygon() if len(reachable)<3 else MultiPoint(reachable).convex_hull
    return {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"origin":i.origin,"cutoff":i.cutoff},"geometry":mapping(poly)}]}

# ---------- KPI & Growth Hotspots (toy) ----------
@app.get("/kpi/summary")
def kpi_summary():
    REQS.labels(endpoint="/kpi/summary").inc()
    # toy KPI based on indicator aggregates (replace with real analytics later)
    with db() as conn:
        rows = conn.execute("SELECT efficiency, resilience, connectivity FROM fabric_indicators").fetchall()
    arr = np.array([[float(a or 0.6), float(b or 0.6), float(c or 0.6)] for a,b,c in rows]) if rows else np.zeros((1,3))
    fabric_index = float(100 * (0.4*arr[:,0].mean() + 0.3*arr[:,1].mean() + 0.3*arr[:,2].mean()))
    sprawl_risk = float(max(0.0, 100*(0.7 - 0.5*arr[:,2].mean())))  # lower connectivity => higher risk
    harmony = float(100*(0.5*arr[:,1].mean() + 0.5*arr[:,2].mean()))
    return {"fabric_index":fabric_index, "sprawl_risk":sprawl_risk, "harmony":harmony}

@app.get("/growth/hotspots")
def growth_hotspots():
    REQS.labels(endpoint="/growth/hotspots").inc()
    # toy: returns centroids of low-connectivity/high-deviation cells
    with db() as conn:
        rows = conn.execute("SELECT ST_AsGeoJSON(ST_Centroid(geom)), COALESCE(ci.connectivity,0.5) FROM urban_cells uc LEFT JOIN fabric_indicators ci ON ci.cell_id=uc.id").fetchall()
    feats=[]
    for j,(pt_json, connv) in enumerate(rows):
        connv=float(connv); score=max(0.0,1.0-connv)
        props={"score":score,"id":j+1}
        geom=json.loads(pt_json) if pt_json else None
        feats.append({"type":"Feature","properties":props,"geometry":geom})
    return {"type":"FeatureCollection","features":feats}

# ---------- OGC API - Features (Core-like) ----------
@app.get("/ogc/")
def ogc_root():
    return {"links":[{"href":"/ogc/collections","rel":"data","type":"application/json","title":"Collections"}]}

@app.get("/ogc/collections")
def ogc_collections():
    REQS.labels(endpoint="/ogc/collections").inc()
    cols=[{"id":"urban_cells","title":"Urban Cells","itemType":"feature","links":[{"href":"/ogc/collections/urban_cells/items","rel":"items"}]},
          {"id":"fabric_indicators_view","title":"Fabric Indicators (join)","itemType":"feature","links":[{"href":"/ogc/collections/fabric_indicators_view/items","rel":"items"}]}]
    return {"collections": cols }

@app.get("/ogc/collections/{cid}/items")
def ogc_items(cid: str, limit: int = Query(100, ge=1, le=10000), offset: int = Query(0, ge=0)):
    REQS.labels(endpoint="/ogc/items").inc()
    with db() as conn:
        if cid == "urban_cells":
            rows = conn.execute("""SELECT id, name, ST_AsGeoJSON(geom) FROM urban_cells ORDER BY id LIMIT %s OFFSET %s""", (limit, offset)).fetchall()
            feats = [{"type":"Feature","properties":{"id":r[0],"name":r[1]}, "geometry": json.loads(r[2]) if r[2] else None} for r in rows]
        else:
            rows = conn.execute("""SELECT uc.id, uc.name, fi.efficiency, fi.resilience, fi.connectivity, ST_AsGeoJSON(uc.geom)
                                     FROM urban_cells uc LEFT JOIN fabric_indicators fi ON fi.cell_id=uc.id
                                     ORDER BY uc.id LIMIT %s OFFSET %s""", (limit, offset)).fetchall()
            feats = [{"type":"Feature","properties":{"id":r[0],"name":r[1],"efficiency":float(r[2]) if r[2] is not None else None,
                                                    "resilience":float(r[3]) if r[3] is not None else None,
                                                    "connectivity":float(r[4]) if r[4] is not None else None},
                      "geometry": json.loads(r[5]) if r[5] else None} for r in rows]
    return {"type":"FeatureCollection","features":feats}

@app.get("/metrics")
def metrics():
    content = generate_latest()
    return Response(content=content, media_type=CONTENT_TYPE_LATEST)
