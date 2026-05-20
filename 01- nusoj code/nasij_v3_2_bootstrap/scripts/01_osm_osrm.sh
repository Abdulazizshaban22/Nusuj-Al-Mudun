
#!/usr/bin/env bash
set -euo pipefail
mkdir -p data
REGION="gcc-states"
# 1) Download OSM PBF (GCC states incl. Saudi Arabia) — Geofabrik
PBF_URL="https://download.geofabrik.de/asia/${REGION}-latest.osm.pbf"
echo "==> Downloading $PBF_URL"
wget -c "$PBF_URL" -O "data/${REGION}.osm.pbf"

# 2) Download Saudi boundary polygon (ADM0) — geoBoundaries (CC BY 4.0)
# You can switch to a different source if needed.
GB_URL="https://www.geoboundaries.org/gbRequest.html?ISO=SAU&ADM=ADM0"
echo "==> NOTE: geoBoundaries has dynamic links; if the below fails, open the URL above to copy the direct download URL."
# Attempt a typical direct path (may change); replace if needed:
# Example (adjust if 404): https://www.geoboundaries.org/data/geoBoundariesCGAZ/SAU/ADM0/geoBoundariesCGAZ_ADM0_SAU.geojson
curl -L -o data/sau_adm0.geojson "https://www.geoboundaries.org/data/geoBoundariesCGAZ/SAU/ADM0/geoBoundariesCGAZ_ADM0_SAU.geojson" || true

if [ ! -s data/sau_adm0.geojson ]; then
  echo "!! Could not fetch ADM0 GeoJSON automatically. Please download via the browser and place at data/sau_adm0.geojson"
  exit 1
fi

# 3) Extract Saudi Arabia from GCC PBF using the polygon
echo "==> Cutting Saudi Arabia extract with osmium"
osmium extract -p data/sau_adm0.geojson "data/${REGION}.osm.pbf" -o data/saudi.osm.pbf

# 4) Build OSRM (car profile)
echo "==> Building OSRM"
docker pull ghcr.io/project-osrm/osrm-backend:latest
docker run -t -v "$PWD/data:/data" ghcr.io/project-osrm/osrm-backend osrm-extract -p /opt/car.lua /data/saudi.osm.pbf
docker run -t -v "$PWD/data:/data" ghcr.io/project-osrm/osrm-backend osrm-partition /data/saudi.osrm
docker run -t -v "$PWD/data:/data" ghcr.io/project-osrm/osrm-backend osrm-customize /data/saudi.osrm

echo "==> OSRM ready. Run: docker run -it -p 5000:5000 -v $PWD/data:/data ghcr.io/project-osrm/osrm-backend osrm-routed --algorithm mld /data/saudi.osrm"
