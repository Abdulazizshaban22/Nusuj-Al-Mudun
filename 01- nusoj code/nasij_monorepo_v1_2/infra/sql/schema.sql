CREATE EXTENSION IF NOT EXISTS postgis;
DROP TABLE IF EXISTS fabric_indicators;
DROP TABLE IF EXISTS urban_cells;
CREATE TABLE urban_cells ( id SERIAL PRIMARY KEY, name TEXT, geom geometry(Polygon,4326) );
CREATE TABLE fabric_indicators ( id SERIAL PRIMARY KEY, cell_id INT REFERENCES urban_cells(id), efficiency NUMERIC, resilience NUMERIC, connectivity NUMERIC, computed_at TIMESTAMP DEFAULT now() );
