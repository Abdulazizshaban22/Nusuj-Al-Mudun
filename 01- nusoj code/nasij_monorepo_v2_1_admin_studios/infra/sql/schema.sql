
CREATE EXTENSION IF NOT EXISTS postgis;
DROP TABLE IF EXISTS fabric_indicators;
DROP TABLE IF EXISTS urban_cells;
CREATE TABLE urban_cells ( id SERIAL PRIMARY KEY, name TEXT, geom geometry(Polygon,4326) );
CREATE TABLE fabric_indicators ( id SERIAL PRIMARY KEY, cell_id INT REFERENCES urban_cells(id), efficiency NUMERIC, resilience NUMERIC, connectivity NUMERIC, computed_at TIMESTAMP DEFAULT now() );
-- IoT events
CREATE TABLE IF NOT EXISTS iot_events( id SERIAL PRIMARY KEY, topic TEXT, payload JSONB, ts TIMESTAMP DEFAULT now(), geom geometry(Point,4326) );


-- Admin users & roles (RBAC)
CREATE TABLE IF NOT EXISTS admin_users(
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer', -- 'admin' | 'viewer'
  created_at TIMESTAMP DEFAULT now()
);
