
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
import os, json, uuid, shutil, tempfile, requests

def make_app(name="service"):
    app = FastAPI(title=f"NASIJ {name}")
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
    return app

app = make_app("Carto Studio")

STYLES_ROOT = os.environ.get("STYLES_ROOT","/tmp/styles")
os.makedirs(STYLES_ROOT, exist_ok=True)

MAPFISH_URL = os.environ.get("MAPFISH_URL","http://mapfish:8080/print/")
LAYOUTS = [
    {"id":"A4_portrait","pageSize":"A4","orientation":"portrait"},
    {"id":"A3_landscape","pageSize":"A3","orientation":"landscape"},
    {"id":"A2_landscape","pageSize":"A2","orientation":"landscape"},
    {"id":"Poster_A1","pageSize":"A1","orientation":"portrait"},
    {"id":"Report_A4","pageSize":"A4","orientation":"portrait"}
]

@app.get("/carto/layouts")
def layouts():
    return {"layouts": LAYOUTS}

@app.post("/carto/style")
async def upload_style(name: str = Form(...), file: UploadFile = File(...)):
    # Save SLD/SE as-is (basic validation can be added)
    if not name.endswith(".sld"): name = name + ".sld"
    path = os.path.join(STYLES_ROOT, name)
    with open(path,"wb") as f: f.write(await file.read())
    return {"ok": True, "style": name, "path": path}

@app.post("/carto/print")
async def print_map(spec: str = Form(...)):
    """Proxy a MapFish Print spec (JSON string) to MapFish server and return the redirect to PDF."""
    try:
        payload = json.loads(spec)
    except Exception:
        raise HTTPException(400, "Invalid JSON spec")
    url = MAPFISH_URL.rstrip('/') + "/create.json"
    r = requests.post(url, json=payload, timeout=60)
    if r.status_code!=200:
        raise HTTPException(r.status_code, f"MapFish error: {r.text[:200]}")
    return JSONResponse(r.json())
