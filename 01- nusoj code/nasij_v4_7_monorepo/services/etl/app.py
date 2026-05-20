
from flask import Flask, request, jsonify
from datetime import datetime, timedelta
import numpy as np

events = []  # {h3index:str, value:float, ts: ISO8601}

app = Flask(__name__)

@app.get('/health')
def health():
    return {'status':'ok'}

@app.post('/alerts/events/add')
def add_event():
    d = request.get_json(force=True)
    events.append({'h3index': d['h3index'], 'value': float(d['value']), 'ts': d.get('ts') or datetime.utcnow().isoformat()})
    return {'ok': True, 'count': len(events)}

@app.post('/st/gi_star')
def gi_star():
    # Stub: wire PySAL + H3 in production (see README)
    data = request.get_json(force=True) or {}
    return jsonify({'since':'stub', 'ring': data.get('ring',1), 'window': data.get('window','7d'), 'results': []})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
