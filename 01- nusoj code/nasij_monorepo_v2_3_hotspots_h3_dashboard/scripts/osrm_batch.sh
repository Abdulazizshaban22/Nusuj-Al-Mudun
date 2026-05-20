
#!/usr/bin/env bash
set -euo pipefail
DATA="${DATA_DIR:-./data/osrm}"
mkdir -p "$DATA"
BASE_PBF="$DATA/saudi-arabia-latest.osm.pbf"

if [ ! -f "$BASE_PBF" ]; then
  curl -L -o "$BASE_PBF" https://download.geofabrik.de/asia/saudi-arabia-latest.osm.pbf
fi

declare -A BBOX
BBOX["riyadh"]="46.38,24.33,47.10,25.10"
BBOX["jeddah"]="39.05,21.20,39.35,21.70"
BBOX["dammam"]="49.95,26.20,50.20,26.55"

for CITY in "${!BBOX[@]}"; do
  BB="${BBOX[$CITY]}"
  echo "==> Extract $CITY"
  docker run --rm -v "${PWD}/$DATA:/data" osmcode/osmium osmium extract -b "$BB" /data/saudi-arabia-latest.osm.pbf -o /data/$CITY.osm.pbf
  docker run --rm -v "${PWD}/$DATA:/data" ghcr.io/project-osrm/osrm-backend:v5.27.1 osrm-extract -p /opt/car.lua /data/$CITY.osm.pbf
  docker run --rm -v "${PWD}/$DATA:/data" ghcr.io/project-osrm/osrm-backend:v5.27.1 osrm-partition /data/$CITY.osrm
  docker run --rm -v "${PWD}/$DATA:/data" ghcr.io/project-osrm/osrm-backend:v5.27.1 osrm-customize /data/$CITY.osrm
  echo "Built OSRM data for $CITY at $DATA/$CITY.osrm"
done
