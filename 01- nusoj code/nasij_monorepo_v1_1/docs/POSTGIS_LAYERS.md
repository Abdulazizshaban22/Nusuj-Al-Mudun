# Importing Layers to PostGIS

## Option A — Using `psql` (GeoJSON/WKT/WKB already prepared)
```bash
psql "$DATABASE_URL" -c "\copy public.my_layer (id, name, geom) FROM 'my_layer.wkt' CSV"
```

## Option B — Using `ogr2ogr` (Shapefile/GeoPackage to PostGIS)
```bash
ogr2ogr -f "PostgreSQL" "$DATABASE_URL" my.shp -nln public.my_layer -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=geom
```

## Serve as Vector Tiles via `pg_tileserv`
- Ensure container is running with `DATABASE_URL`.
- Browse: `http://localhost:7800` → find `public.my_layer`
- TileJSON: `http://localhost:7800/public.my_layer.json`
- Tiles: `http://localhost:7800/public.my_layer/{z}/{x}/{y}.mvt`
