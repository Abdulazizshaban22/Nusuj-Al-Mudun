
INSERT INTO urban_cells (name, geom) VALUES
('Cell North', ST_GeomFromText('POLYGON((46.60 24.80, 46.80 24.80, 46.80 24.70, 46.60 24.70, 46.60 24.80))',4326)),
('Cell Center', ST_GeomFromText('POLYGON((46.60 24.75, 46.75 24.75, 46.75 24.65, 46.60 24.65, 46.60 24.75))',4326)),
('Cell South', ST_GeomFromText('POLYGON((46.60 24.70, 46.80 24.70, 46.80 24.60, 46.60 24.60, 46.60 24.70))',4326));
INSERT INTO fabric_indicators (cell_id, efficiency, resilience, connectivity) VALUES
(1,0.72,0.81,0.65),(2,0.55,0.76,0.58),(3,0.40,0.60,0.45);
