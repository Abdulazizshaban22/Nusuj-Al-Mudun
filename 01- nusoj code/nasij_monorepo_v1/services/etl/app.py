from fastapi import FastAPI
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST, Counter
from starlette.responses import Response

app = FastAPI(title="NASIJ ETL")

REQUESTS = Counter('nasij_etl_requests_total', 'Total ETL requests', ['endpoint'])

@app.get("/ingest")
def ingest():
    REQUESTS.labels(endpoint="/ingest").inc()
    return {"ok": True, "message": "stub ingestion"}

@app.get("/metrics")
def metrics():
    content = generate_latest()
    return Response(content=content, media_type=CONTENT_TYPE_LATEST)
