
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS urban_cells (
  id SERIAL PRIMARY KEY,
  name TEXT,
  geom GEOGRAPHY(POLYGON, 4326)
);

CREATE TABLE IF NOT EXISTS fabric_indicators (
  id SERIAL PRIMARY KEY,
  cell_id INT REFERENCES urban_cells(id),
  efficiency NUMERIC,
  resilience NUMERIC,
  connectivity NUMERIC,
  computed_at TIMESTAMP DEFAULT now()
);
