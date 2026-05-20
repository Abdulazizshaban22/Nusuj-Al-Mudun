
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
import os, json, uuid, shutil, tempfile, requests

def make_app(name="service"):
    app = FastAPI(title=f"NASIJ {name}")
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
    return app

from fastapi import UploadFile, File, Form
import zipfile, json, importlib.util, types, re

app = make_app("Marketplace")
PLUGINS_DIR = os.environ.get("PLUGINS_DIR","/tmp/plugins")
os.makedirs(PLUGINS_DIR, exist_ok=True)

def load_manifest(zf: zipfile.ZipFile):
    try:
        with zf.open("nasij-plugin.json") as f:
            return json.loads(f.read().decode("utf-8"))
    except Exception as ex:
        raise HTTPException(400, f"Missing/invalid nasij-plugin.json: {ex}")

def sanitize(name:str)->str:
    return re.sub(r'[^a-zA-Z0-9_.-]+', '_', name)

@app.get("/plugins")
def list_plugins():
    items=[]
    for d in os.listdir(PLUGINS_DIR):
        man = os.path.join(PLUGINS_DIR,d,"nasij-plugin.json")
        if os.path.isfile(man):
            items.append(json.load(open(man)))
    return {"count": len(items), "items": items}

@app.post("/plugins/install")
async def install_plugin(file: UploadFile = File(...)):
    name = sanitize(file.filename.replace(".zip",""))
    dest = os.path.join(PLUGINS_DIR, name)
    os.makedirs(dest, exist_ok=True)
    data = await file.read()
    with open(os.path.join(dest, "upload.zip"),"wb") as f: f.write(data)
    with zipfile.ZipFile(os.path.join(dest,"upload.zip")) as zf:
        man = load_manifest(zf)
        zf.extractall(dest)
    return {"ok": True, "id": man.get("id"), "name": man.get("name"), "dir": dest}

@app.post("/plugins/uninstall")
async def uninstall_plugin(id: str = Form(...)):
    # Find plugin folder by id in manifest
    for d in os.listdir(PLUGINS_DIR):
        man = os.path.join(PLUGINS_DIR,d,"nasij-plugin.json")
        if os.path.isfile(man) and json.load(open(man)).get("id")==id:
            shutil.rmtree(os.path.join(PLUGINS_DIR,d), ignore_errors=True)
            return {"ok": True}
    raise HTTPException(404, "Plugin not found")
