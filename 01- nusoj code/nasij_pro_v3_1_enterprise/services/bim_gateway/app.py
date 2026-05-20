
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
import os, json, uuid, shutil, tempfile, requests

def make_app(name="service"):
    app = FastAPI(title=f"NASIJ {name}")
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
    return app

from fastapi import UploadFile, File, Form
from fastapi.responses import JSONResponse
import base64

app = make_app("BIM Gateway")

APS_CLIENT_ID = os.environ.get("APS_CLIENT_ID","")
APS_CLIENT_SECRET = os.environ.get("APS_CLIENT_SECRET","")
APS_BUCKET = os.environ.get("APS_BUCKET","nasij-bucket")

@app.post("/bim/ingest")
async def ingest_ifc(file: UploadFile = File(...)):
    # dummy metadata extraction placeholder
    content = await file.read()
    size = len(content)
    # In real flow: parse IFC header/entities and push features to PostGIS (not done here)
    return {"ok": True, "filename": file.filename, "size": size, "entities_est": 0}

@app.post("/bim/aps/translate")
async def aps_translate(urn: str = Form(...)):
    """Stub for APS Model Derivative translate job."""
    # Normally call APS /modelderivative/v2/designdata/job with urn+formats
    return {"ok": True, "submitted": True, "urn": urn, "target":"svf2"}

@app.get("/bim/aps/status")
def aps_status(urn: str):
    # Placeholder
    return {"urn": urn, "status":"inprogress"}
