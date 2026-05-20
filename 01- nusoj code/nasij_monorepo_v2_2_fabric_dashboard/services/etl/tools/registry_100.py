
from fastapi import APIRouter, Body, Query
from typing import List, Dict, Any
import numpy as np, json, math, os
import psycopg

router = APIRouter(prefix="/tools", tags=["tools"])

CATALOG = [
  "2sfca",
  "e2sfca",
  "gravity_access",
  "cumulative_access",
  "idw",
  "kde",
  "moran_i",
  "local_moran",
  "getis_ord_gi_star",
  "spatial_lag",
  "lisa_clusters",
  "variogram_simple",
  "ripley_k",
  "spatial_entropy",
  "landuse_entropy",
  "simpson_diversity",
  "intersection_density",
  "street_length_density",
  "circuity_ratio",
  "closeness_centrality",
  "reach_centrality",
  "detour_index",
  "transit_access",
  "access_15min",
  "catchment_population",
  "isochrone_area",
  "access_inequality_gini",
  "green_ratio_ndvi",
  "evi_score",
  "savi_score",
  "ndwi_water",
  "heat_risk",
  "uhi_intensity",
  "cva_magnitude",
  "change_diff_stats",
  "heat_vulnerability",
  "flood_risk",
  "air_quality_exposure",
  "noise_exposure",
  "tree_canopy_gap",
  "pop_density",
  "jobs_density",
  "job_house_balance",
  "jobs_access_gravity",
  "education_access",
  "health_access_2sfca",
  "retail_access",
  "parks_access",
  "equity_index",
  "deprivation_index",
  "gini_income",
  "theil_t",
  "employment_entropy",
  "compactness",
  "elongation",
  "fractal_boxcount",
  "orientation_entropy",
  "porosity",
  "far_index",
  "coverage_ratio",
  "grid_orthogonality",
  "block_size_index",
  "connectivity_index",
  "heritage_proximity",
  "cultural_access",
  "harmony_score",
  "public_realm",
  "safety_risk",
  "crime_hotspots_gi",
  "gender_safety_proxy",
  "walkability_index",
  "bikeability_index",
  "response_time_coverage",
  "waste_access",
  "water_continuity",
  "outage_vulnerability",
  "pdpl_compliance",
  "infra_condition",
  "maintenance_risk",
  "sprawl_risk",
  "growth_rate",
  "infill_potential",
  "brownfield_score",
  "redevelopment_ahp",
  "tod_suitability",
  "viewshed_quality",
  "shadow_hours",
  "solar_potential",
  "wind_corridor",
  "green_corridor_continuity",
  "edge_expansion_index",
  "water_stress",
  "energy_peak_risk",
  "heatwave_shelter_access",
  "hospital_surge_access",
  "evac_time_estimate",
  "emergency_coverage_gaps",
  "custom_tool_98",
  "custom_tool_99",
  "custom_tool_100"
]

def _db():
    return psycopg.connect(os.getenv("DATABASE_URL","postgresql://nasij:nasij@db:5432/nasij"))

def _euclid(a,b):
    return ((a[0]-b[0])**2 + (a[1]-b[1])**2) ** 0.5

def _minmax(arr):
    a = np.array(arr, dtype=float); lo, hi = float(np.min(a)), float(np.max(a))
    if hi - lo < 1e-12: return [0.0 for _ in a]
    return ((a - lo) / (hi - lo)).tolist()

def _zscore(arr):
    a = np.array(arr, dtype=float); mu, sd = float(np.mean(a)), float(np.std(a) + 1e-12)
    return ((a - mu)/sd).tolist()

def algo_gravity(origins, dests, beta=1.5, cap_key='capacity'):
    scores=[]
    for o in origins:
        ox,oy = (o.get('x',o[0]), o.get('y',o[1]))
        s=0.0
        for d in dests:
            dx,dy = (d.get('x',d[0]), d.get('y',d[1]))
            cap = float(d.get(cap_key, d[2] if isinstance(d, (list,tuple)) and len(d)>2 else 1.0))
            dkm = max(1e-6, _euclid((ox,oy),(dx,dy)))*111.32
            s += cap / (dkm**beta)
        scores.append(s)
    return scores

def algo_2sfca(pop_points, fac_points, catch_km=5.0):
    ratios=[]
    for f in fac_points:
        fx,fy = (f.get('x',f[0]), f.get('y',f[1])); cap=float(f.get('capacity', f[2] if isinstance(f,(list,tuple)) and len(f)>2 else 1.0))
        pop_sum = 0.0
        for p in pop_points:
            px,py = (p.get('x',p[0]), p.get('y',p[1])); pop=float(p.get('pop', p[2] if isinstance(p,(list,tuple)) and len(p)>2 else 1.0))
            dkm = max(1e-6, _euclid((fx,fy),(px,py)))*111.32
            if dkm <= catch_km: pop_sum += pop
        ratios.append(cap/(pop_sum+1e-12))
    scores=[]
    for p in pop_points:
        px,py = (p.get('x',p[0]), p.get('y',p[1])); s=0.0
        for (f, R) in zip(fac_points, ratios):
            fx,fy = (f.get('x',f[0]), f.get('y',f[1]))
            dkm = max(1e-6, _euclid((fx,fy),(px,py)))*111.32
            if dkm <= catch_km: s += R
        scores.append(s)
    return scores

def algo_idw(points, query, power=2.0, max_km=5.0):
    out=[]; max_deg = max_km/111.32
    for q in query:
        qx,qy=(q.get('x',q[0]), q.get('y',q[1])); num=0.0; den=0.0
        for p in points:
            px,py=(p.get('x',p[0]), p.get('y',p[1])); v=float(p.get('v',p[2] if isinstance(p,(list,tuple)) and len(p)>2 else 0.0))
            d = _euclid((qx,qy),(px,py))
            if d<=max_deg and d>0:
                w = 1.0/(d**power)
                num += w*v; den += w
        out.append(num/(den+1e-12))
    return out

def algo_moran(values, neighbors):
    x = np.array(values, dtype=float); n=len(x); w=0; num=0; den=np.var(x)*n
    xbar = np.mean(x)
    for i, nbrs in enumerate(neighbors):
        for j in nbrs:
            num += (x[i]-xbar)*(x[j]-xbar); w += 1
    I = (n/w) * (num/(den+1e-12)) if w>0 else 0.0
    return float(I)

def algo_getis_star(values, neighbors):
    x = np.array(values, dtype=float); n=len(x); mean=float(np.mean(x)); sd=float(np.std(x)+1e-12)
    z=[]; 
    for i, nbrs in enumerate(neighbors):
        s = np.sum(x[nbrs]) + x[i]
        wi = len(nbrs)+1
        zi = (s - mean*wi) / (sd * (wi**0.5))
        z.append(float(zi))
    return z

@router.get("/catalog")
def catalog():
    return {"count": len(CATALOG), "tools": CATALOG}

@router.post("/gravity_access")
def api_gravity(payload: Dict[str, Any]):
    return {"scores": algo_gravity(payload.get("origins",[]), payload.get("dests",[]), payload.get("beta",1.5), payload.get("cap_key","capacity"))}

@router.post("/2sfca")
def api_2sfca(payload: Dict[str, Any]):
    return {"scores": algo_2sfca(payload.get("population",[]), payload.get("facilities",[]), payload.get("catch_km",5.0))}

@router.post("/idw")
def api_idw(payload: Dict[str, Any]):
    return {"values": algo_idw(payload.get("points",[]), payload.get("query",[]), payload.get("power",2.0), payload.get("max_km",5.0))}

@router.post("/moran_i")
def api_moran(payload: Dict[str, Any]):
    return {"I": algo_moran(payload.get("values",[]), payload.get("neighbors",[]))}

@router.post("/getis_ord_gi_star")
def api_gi(payload: Dict[str, Any]):
    return {"z": algo_getis_star(payload.get("values",[]), payload.get("neighbors",[]))}

@router.get("/choropleth")
def choropleth(metric: str = Query("deviation")):
    with _db() as conn:
        rows = conn.execute("SELECT uc.id, uc.name, ST_AsGeoJSON(uc.geom), fi.efficiency, fi.resilience, fi.connectivity FROM urban_cells uc LEFT JOIN fabric_indicators fi ON fi.cell_id=uc.id ORDER BY uc.id").fetchall()
    feats=[]
    for (cid,name,geom_json,eff,res,con) in rows:
        eff=float(eff or 0.6); res=float(res or 0.6); con=float(con or 0.6)
        if metric in ("fabric_index","fabric"):
            val = 100*(0.4*eff + 0.3*res + 0.3*con)
        elif metric in ("deviation","sprawl_risk"):
            val = 100*max(0.0, 1.0 - (0.6*eff + 0.4*con))
        elif metric == "connectivity":
            val = 100*con
        elif metric == "efficiency":
            val = 100*eff
        elif metric == "resilience":
            val = 100*res
        elif metric == "compactness":
            # approximate compactness from geometry area & perimeter
            try:
                import json as _json, math as _math
                g = _json.loads(geom_json) if geom_json else None
                if g and g.get("type") in ("Polygon","MultiPolygon"):
                    from shapely.geometry import shape as _shape
                    poly = _shape(g); A = float(poly.area); P = float(poly.length)
                    val = float( (4*_math.pi*A) / (P*P + 1e-12) ) * 100
                else:
                    val = None
            except Exception:
                val = None
        else:
            val = 100*(0.34*eff + 0.33*res + 0.33*con)
        feats.append({"type":"Feature","properties":{"id":cid,"name":name,"value":val}, "geometry": json.loads(geom_json) if geom_json else None})
    return {"type":"FeatureCollection","features":feats}

def register(app):
    app.include_router(router)
