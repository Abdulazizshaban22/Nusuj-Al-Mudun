
.PHONY: osrm run clean

DATA := data
OSM_REGION := gcc-states
PBF := $(DATA)/$(OSM_REGION).osm.pbf
SA_POLY := $(DATA)/sau_adm0.geojson
SA_PBF := $(DATA)/saudi.osm.pbf
OSRM := $(DATA)/saudi.osrm

osrm: scripts/01_osm_osrm.sh
	bash $<

run:
	docker run -it -p 5000:5000 -v $(PWD)/data:/data ghcr.io/project-osrm/osrm-backend osrm-routed --algorithm mld /data/saudi.osrm

clean:
	rm -rf $(DATA)/*.osrm* $(DATA)/*.pbf
