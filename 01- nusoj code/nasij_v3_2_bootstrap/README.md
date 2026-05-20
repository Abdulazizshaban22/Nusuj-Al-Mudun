
# NASIJ v3.2 — Production Bootstrap (Riyadh / Saudi Arabia)
This pack gives you **scripts + structure** to fetch open data, prep OSRM, and prime NASIJ services.

> Generated: 2025-10-21T09:12:56.543822Z

## What you get
- `scripts/01_osm_osrm.sh` — download GCC OSM, cut Saudi polygon, prep OSRM (Docker).
- `scripts/02_worldcover_notes.md` — how to fetch ESA WorldCover 10m (tiles & EE).
- `scripts/03_worldpop_notes.md` — links for WorldPop 100m counts.
- `scripts/04_ms_buildings_notes.md` — Microsoft Global Building Footprints.
- `scripts/05_dem_notes.md` — Copernicus DEM GLO-30 sources.
- `scripts/06_openaq_notes.md` — OpenAQ API for air quality (Riyadh).
- `scripts/07_rcrc_links.md` — RCRC Open Data pointers (metro lines, etc.).
- `Makefile` — convenience targets.
- `env.sample` — endpoints & versions.
- `SOURCES.md` — all dataset links and licenses (CC BY / ODbL, etc.).

## Prereqs
- Docker, wget, osmium-tool.

## Quickstart
```bash
make osrm   # downloads OSM (GCC) + geoBoundaries SAU polygon, extracts KSA, builds OSRM
make run    # runs osrm-routed on :5000
```
