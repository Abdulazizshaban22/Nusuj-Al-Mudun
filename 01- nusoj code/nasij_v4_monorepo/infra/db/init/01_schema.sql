CREATE SCHEMA IF NOT EXISTS urban;

-- خلايا H3 (لاحقًا: نحسبها خارجياً ونُدخلها هنا)
CREATE TABLE IF NOT EXISTS urban.h3_cells (
  id BIGSERIAL PRIMARY KEY,
  h3index TEXT UNIQUE,
  centroid geometry(POINT, 4326),
  props JSONB DEFAULT '{}'::jsonb
);

-- ملاحظات المواطنين
CREATE TABLE IF NOT EXISTS urban.citizen_reports (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT,
  geom geometry(GEOMETRY, 4326),
  props JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- متجهات للذكاء
CREATE TABLE IF NOT EXISTS urban.embeddings (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT,
  entity_id BIGINT,
  vector vector(384)
);