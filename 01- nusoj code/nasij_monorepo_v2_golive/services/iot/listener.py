
import os, json, time, ssl
import paho.mqtt.client as mqtt
import psycopg
from prometheus_client import Counter, start_http_server

MQTT_URL = os.getenv("MQTT_URL","mosquitto")
MQTT_PORT = int(os.getenv("MQTT_PORT","1883"))
MQTT_USERNAME = os.getenv("MQTT_USERNAME","nasij")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD","nasij")
DATABASE_URL = os.getenv("DATABASE_URL","postgresql://nasij:nasij@db:5432/nasij")

NEW_EVENTS = Counter('iot_events_total','IoT events ingested')

def db(): return psycopg.connect(DATABASE_URL)

def ensure_table():
    with db() as conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS iot_events(
            id SERIAL PRIMARY KEY, topic TEXT, payload JSONB, ts TIMESTAMP DEFAULT now(),
            geom geometry(Point,4326)
        )""")
        conn.commit()

def insert_event(topic, payload):
    geom = None
    try:
        lon = float(payload.get('lon')); lat = float(payload.get('lat'))
        geom = f"SRID=4326;POINT({lon} {lat})"
    except Exception:
        pass
    with db() as conn:
        conn.execute("INSERT INTO iot_events(topic,payload,geom) VALUES (%s,%s, ST_GeomFromText(%s))" if geom else "INSERT INTO iot_events(topic,payload) VALUES (%s,%s)",
                     (topic, json.dumps(payload), geom) if geom else (topic, json.dumps(payload)))
        conn.commit()

def on_connect(client, userdata, flags, rc, properties=None):
    print("MQTT connected", rc)
    client.subscribe("sensors/+/+")

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode('utf-8'))
    except Exception:
        payload = {"raw": msg.payload.decode('utf-8','ignore')}
    insert_event(msg.topic, payload); NEW_EVENTS.inc()

def main():
    start_http_server(9200)  # Prometheus
    ensure_table()
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    client.on_connect = on_connect; client.on_message = on_message
    client.connect(MQTT_URL, MQTT_PORT, 60)
    client.loop_forever()

if __name__ == "__main__":
    main()
