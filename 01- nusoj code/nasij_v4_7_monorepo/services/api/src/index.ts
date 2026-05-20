
import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const app = express();
app.use(bodyParser.json());

// --- Config ---
const VERIFY_JWT = String(process.env.VERIFY_JWT||'false').toLowerCase()==='true';
const KEYCLOAK_ISSUER = process.env.KEYCLOAK_ISSUER||'';
const JWKS_URI = process.env.KEYCLOAK_JWKS_URL||'';

// --- In-memory stores ---
type Feature = { id:string; type:'Feature'; geometry:any; properties:any; created_at:string; };
type Open311 = { service_request_id:string; status:string; service_code?:string; lat?:number; lon?:number; requested_datetime:string; attributes?:any; };
const features: Feature[] = [];
const open311: Open311[] = [];

// --- JWT middleware (optional) ---
let client:any=null;
if (VERIFY_JWT && JWKS_URI) client = jwksClient({ jwksUri: JWKS_URI });
function getKey(header:any, cb:any){ if(!client) return cb(new Error('no-jwks')); client.getSigningKey(header.kid,(e:any,k:any)=>{ if(e) return cb(e); cb(null, k.getPublicKey()); }); }
function verifyJWT(req:any,res:any,next:any){ if(!VERIFY_JWT) return next(); const auth=req.headers.authorization||''; const token=auth.startsWith('Bearer ')?auth.slice(7):null; if(!token) return res.status(401).json({error:'Missing Bearer token'}); jwt.verify(token, getKey, {algorithms:['RS256'], issuer: KEYCLOAK_ISSUER}, (err:any, dec:any)=>{ if(err) return res.status(401).json({error:'Invalid JWT', detail:err.message}); req.user=dec; next(); }); }

// --- Helpers ---
function parseBBox(s:string){ const p=s.split(',').map(Number); if(![4,6].includes(p.length)||p.some(isNaN)) return null; return p; }
function pointInBBox(pt:[number,number], b:number[]){ return pt[0]>=b[0] && pt[1]>=b[1] && pt[0]<=b[2] && pt[1]<=b[3]; }
function inDatetimeRange(ts:string, dstr?:string){ if(!dstr) return true; try{ if(dstr.includes('/')){ const [a,b]=dstr.split('/'); const t=+new Date(ts); const t0=a?+new Date(a):-Infinity; const t1=b?+new Date(b):Infinity; return t>=t0 && t<=t1; } else { const t=+new Date(ts), d=+new Date(dstr); return Math.abs(t-d)<=12*3600*1000; } }catch{ return true; } }

// CQL2-text
function parseCQL2(filter:string){ const tokens=filter.split(/\s+AND\s+/i); const clauses = tokens.map(tok=>{ const m = tok.trim().match(/^([A-Za-z0-9_.-]+)\s*(=|!=|>=|<=|>|<)\s*(.+)$/); if(!m) return null; let [,key,op,raw]=m; raw=raw.trim(); let isStr=false; if(raw.startsWith(\"'\")&&raw.endsWith(\"'\")){ raw=raw.slice(1,-1); isStr=true; } else if(isNaN(Number(raw))) { isStr=true; } return {key,op,value:isStr?raw:Number(raw),isString:isStr}; }).filter(Boolean) as any[]; return clauses; }
// CQL2-JSON (basic)
function parseCQL2JSON(obj:any){ // expects {op:'and', args:[{op:'=', args:[{property:'score'}, 0.7]} ...]}
  function evalClause(o:any, rec:any):boolean{
    if(!o) return true;
    const op = String(o.op||'').toLowerCase();
    if(op==='and' || op==='or'){
      const parts = (o.args||[]).map((x:any)=>evalClause(x,rec));
      return op==='and' ? parts.every(Boolean) : parts.some(Boolean);
    }
    if(op==='='||op==='!='||op==='>'||op==='<'||op==='>='||op==='<=' ){
      const [left,right] = o.args||[];
      const key = left?.property;
      const v = rec[key] ?? rec?.properties?.[key];
      const L = (typeof right==='string' && isNaN(Number(right))) ? String(v) : Number(v);
      const R = (typeof right==='string' && isNaN(Number(right))) ? String(right) : Number(right);
      switch(op){ case '=':return L===R; case '!=':return L!==R; case '>':return L>R; case '<':return L<R; case '>=':return L>=R; case '<=':return L<=R; }
    }
    return true;
  }
  return (rec:any)=>evalClause(obj, rec);
}

// Spatial helpers (simplified)
function pointInPolygon(pt:[number,number], poly:number[][]){ let x=pt[0], y=pt[1], inside=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const xi=poly[i][0], yi=poly[i][1]; const xj=poly[j][0], yj=poly[j][1]; const intersect=((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/((yj-yi)||1e-12)+xi); if(intersect) inside=!inside; } return inside; }
function pointWithinGeom(pt:[number,number], g:any):boolean{ if(!g) return false; if(g.type==='Polygon') return pointInPolygon(pt,g.coordinates[0]); if(g.type==='MultiPolygon') return g.coordinates.some((poly:any)=>pointInPolygon(pt,poly[0])); if(g.type==='Point') return (g.coordinates[0]===pt[0] && g.coordinates[1]===pt[1]); return false; }
function pointIntersectsGeom(pt:[number,number], g:any):boolean{ return pointWithinGeom(pt,g); } // simplified
function pointTouchesGeom(pt:[number,number], g:any):boolean{ // naive edge proximity check (demo only)
  if(g.type==='Polygon'){ const ring=g.coordinates[0]; for(let i=0;i<ring.length-1;i++){ const a=ring[i], b=ring[i+1]; const cross = Math.abs((b[1]-a[1])*(pt[0]-a[0]) - (b[0]-a[0])*(pt[1]-a[1])); if(cross<1e-12) return true; } }
  return false;
}
function pointDisjointGeom(pt:[number,number], g:any):boolean{ return !pointIntersectsGeom(pt,g); }
function pointOverlapsGeom(pt:[number,number], g:any):boolean{ return pointWithinGeom(pt,g); } // same as within for point

// ---- OGC Collections ----
app.get('/ogc/collections', (_req,res)=>res.json({links:[], collections:[{id:'features',itemType:'feature',title:'General Features',extent:{}},{id:'open311_requests',itemType:'record',title:'Open311 Service Requests',extent:{}}]}));

// ---- Items Endpoints ----
app.get('/ogc/collections/features/items', (req,res)=>{
  const bboxParam=req.query.bbox as string|undefined;
  const bboxCrs=req.query['bbox-crs'] as string|undefined;
  const datetimeParam=req.query.datetime as string|undefined;
  const filter=req.query.filter as string|undefined;
  const filterLang=req.query['filter-lang'] as string|undefined;
  const limit=Math.min(parseInt((req.query.limit as string)||'100'),1000);

  if (bboxCrs && !/4326|CRS84/i.test(bboxCrs)) return res.status(400).json({error:'Only CRS84/EPSG:4326 supported.'});

  let items=features.filter(f=>{
    let ok=true;
    if(bboxParam){ const bbox=parseBBox(bboxParam); if(bbox && f.geometry?.type==='Point'){ ok = ok && pointInBBox(f.geometry.coordinates as [number,number], bbox); } }
    ok = ok && inDatetimeRange(f.created_at, datetimeParam);
    if(filter){ if(!filterLang || /cql2-text/i.test(String(filterLang))){ const clauses=parseCQL2(filter); ok = ok && clauses.every(c=>{ const v = (f as any)[c.key] ?? (f as any)?.properties?.[c.key]; if(v===undefined) return false; const L=c.isString?String(v):Number(v); const R=c.value; switch(c.op){case '=':return L===R;case '!=':return L!==R;case '>':return L>R;case '<':return L<R;case '>=':return L>=R;case '<=':return L<=R; default:return false;} }); } }
    return ok;
  });

  res.json({type:'FeatureCollection', features: items.slice(0,limit)});
});

app.get('/ogc/collections/open311_requests/items', (req,res)=>{
  const datetimeParam=req.query.datetime as string|undefined;
  const filter=req.query.filter as string|undefined;
  const filterLang=req.query['filter-lang'] as string|undefined;
  const limit=Math.min(parseInt((req.query.limit as string)||'100'),1000);

  let rows = open311.filter(r=>{
    let ok=true;
    ok = ok && inDatetimeRange(r.requested_datetime, datetimeParam);
    if(filter){ if(!filterLang || /cql2-text/i.test(String(filterLang))){ const clauses=parseCQL2(filter); ok = ok && clauses.every(c=>{ const v=(r as any)[c.key]; if(v===undefined) return false; const L=c.isString?String(v):Number(v); const R=c.value; switch(c.op){case '=':return L===R;case '!=':return L!==R;case '>':return L>R;case '<':return L<R;case '>=':return L>=R;case '<=':return L<=R; default:return false;} }); } }
    return ok;
  });
  const items = (rows as any[]).slice(0,limit).map(r=>({ type:'Feature', geometry: (r.lat!=null&&r.lon!=null)?{type:'Point',coordinates:[r.lon,r.lat]}:null, properties:r, created_at:r.requested_datetime }));
  res.json({type:'FeatureCollection', features: items});
});

// ---- Spatial Query with extra predicates + CQL2-JSON ----
app.post('/ogc/query/spatial', verifyJWT, (req,res)=>{
  const { collection, predicate, geometry, datetime, filter, filterLang, filterJson } = req.body||{};
  if(!collection || !predicate || !geometry) return res.status(400).json({error:'collection, predicate, geometry required'});
  const items = (collection==='open311_requests') ?
    (open311 as any[]).map(r=>({ type:'Feature', geometry:(r.lat!=null&&r.lon!=null)?{type:'Point',coordinates:[r.lon,r.lat]}:null, properties:r, created_at:r.requested_datetime })) :
    (features as any[]);

  const clauses = (filter && (!filterLang || /cql2-text/i.test(String(filterLang)))) ? parseCQL2(filter) : null;
  const jsonPredicate = filterJson ? parseCQL2JSON(filterJson) : null;

  const out:any[] = [];
  for(const f of items){
    if(!inDatetimeRange(f.created_at, datetime)) continue;
    if(clauses && !clauses.every((c:any)=>{ const v=(f as any)[c.key]??(f as any)?.properties?.[c.key]; if(v===undefined) return false; const L=c.isString?String(v):Number(v); const R=c.value; switch(c.op){case '=':return L===R;case '!=':return L!==R;case '>':return L>R;case '<':return L<R;case '>=':return L>=R;case '<=':return L<=R; default:return false;} })) continue;
    if(jsonPredicate && !jsonPredicate(f)) continue;

    const g = f.geometry; if(!g) continue;
    if(g.type==='Point'){
      const pt = g.coordinates as [number,number];
      let keep=false;
      switch(String(predicate).toLowerCase()){
        case 'within': keep = pointWithinGeom(pt, geometry); break;
        case 'intersects': keep = pointIntersectsGeom(pt, geometry); break;
        case 'contains': keep = (geometry.type==='Point' ? (geometry.coordinates[0]===pt[0] && geometry.coordinates[1]===pt[1]) : false); break;
        case 'touches': keep = pointTouchesGeom(pt, geometry); break;
        case 'overlaps': keep = pointOverlapsGeom(pt, geometry); break;
        case 'disjoint': keep = pointDisjointGeom(pt, geometry); break;
        default: keep=false;
      }
      if(keep) out.push(f);
    }
  }
  res.json({ type:'FeatureCollection', features: out });
});

// ---- STAC API (skeleton + search) ----
const STAC_CATALOG = { stac_version:'1.0.0', type:'Catalog', id:'nusuj', description:'NUSUJ STAC Catalog', links:[] };
const STAC_COLLECTIONS:any = [{
  stac_version:'1.0.0', type:'Collection', id:'urban-indicators', description:'Urban indicators rasters (e.g., LST, NDVI)',
  extent:{ spatial:{ bbox:[[35,16,55,33]] }, temporal:{ interval:[['2020-01-01T00:00:00Z', null]] } }, license:'proprietary'
}];
const STAC_ITEMS:any = [{
  stac_version:'1.0.0', type:'Feature', id:'ndvi-2025-10',
  geometry:{type:'Polygon',coordinates:[[[35,16],[55,16],[55,33],[35,33],[35,16]]]}, bbox:[35,16,55,33],
  properties:{ datetime:'2025-10-01T00:00:00Z' }, collection:'urban-indicators',
  assets:{ cog:{ href:'s3://bucket/path/ndvi-2025-10.tif', type:'image/tiff; application=geotiff; profile=cloud-optimized'} }
}];

app.get('/stac', (_req,res)=>res.json(STAC_CATALOG));
app.get('/stac/collections', (_req,res)=>res.json({collections: STAC_COLLECTIONS}));
app.post('/stac/search', (req,res)=>{
  const { collections, datetime, bbox } = req.body||{};
  let items = STAC_ITEMS;
  if (collections && Array.isArray(collections)) items = items.filter(i=>collections.includes(i.collection));
  if (datetime){ items = items.filter(i=>{ const ts = +new Date(i.properties.datetime); if(String(datetime).includes('/')){ const [a,b]=String(datetime).split('/'); const t0=a?+new Date(a):-Infinity, t1=b?+new Date(b):Infinity; return ts>=t0 && ts<=t1; } return Math.abs(ts - (+new Date(datetime)))<=12*3600*1000; }); }
  if (bbox){ const b=bbox.map((n:number)=>Number(n)); items = items.filter(i=> i.bbox[0]>=b[0] && i.bbox[1]>=b[1] && i.bbox[2]<=b[2] && i.bbox[3]<=b[3]); }
  res.json({ type:'FeatureCollection', features: items });
});

// ---- Ingest + Open311 + Health ----
app.post('/geojson/ingest', (req,res)=>{
  const fc=req.body;
  if(!fc || fc.type!=='FeatureCollection' || !Array.isArray(fc.features)) return res.status(400).json({error:'Expected FeatureCollection'});
  const now=new Date().toISOString();
  for(const f of fc.features){
    features.push({ id: (f.id||Math.random().toString(36).slice(2)), type:'Feature', geometry:f.geometry, properties:f.properties||{}, created_at: now });
  }
  res.json({ok:true, inserted: fc.features.length});
});
app.post('/open311/requests', (req,res)=>{
  const r=req.body;
  const obj:Open311={ service_request_id:r.service_request_id||Math.random().toString(36).slice(2), status:r.status||'open', service_code:r.service_code, lat:r.lat, lon:r.lon, requested_datetime:r.requested_datetime||new Date().toISOString(), attributes:r.attributes||{} };
  open311.push(obj); res.json(obj);
});
app.get('/health', (_req,res)=>res.json({status:'ok', ts:new Date().toISOString()}));

const PORT = parseInt(process.env.PORT||'4000',10);
app.listen(PORT, ()=>console.log(`API listening on :${PORT}`));
