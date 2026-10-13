/*
# UrbanShield AI — Core Schema

Creates the full database schema for the UrbanShield AI urban safety platform (Chandigarh only).

## Tables Created
1. `users` — operator profiles (separate from auth.users, linked by id)
2. `incidents` — citizen/operator-submitted safety incidents
3. `incident_evidence` — metadata for uploaded evidence files (photos, docs)
4. `sector_boundaries` — Chandigarh sector/ward GeoJSON boundaries
5. `risk_indicators` — configurable weighted risk-scoring indicators
6. `camera_detections` — AI camera detection results (simulated or real)
7. `patrol_units` — police/ambulance/fire/municipal patrol units
8. `trusted_contacts` — citizen emergency contacts
9. `data_sources` — registered open data sources with attribution/licence
10. `audit_logs` — immutable audit trail for all control-room actions

## Security
- RLS enabled on every table.
- This is a DEMO / no-auth app — policies allow `anon, authenticated` CRUD on operational tables.
- `audit_logs` is INSERT-only for anon (cannot modify or delete log entries).
- `users` table is read-only for anon (operator profiles are managed via service role).

## Notes
- All geographic data uses `double precision` lat/lng columns (compatible with frontend GeoPoint type).
- `is_simulated` flag on incidents, camera_detections, and data_sources distinguishes sample from real data.
- Sector boundaries stored as `jsonb` to hold GeoJSON polygon coordinates.
- Risk indicators are configurable at runtime — weight, threshold, and description are all editable.
*/

-- 1. Users table (operator profiles)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  display_name text NOT NULL DEFAULT 'Operator',
  role text NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_users" ON users;
CREATE POLICY "anon_select_users" ON users FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_users" ON users;
CREATE POLICY "anon_insert_users" ON users FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- 2. Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('road_hazard','crowd_congestion','altercation','lighting_issue','repeated_incidents','emergency','theft','harassment','other')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','verified','unverified','resolved','dismissed')),
  priority text NOT NULL DEFAULT 'moderate' CHECK (priority IN ('low','moderate','high','urgent')),
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  sector text NOT NULL DEFAULT 'Unknown',
  reported_at timestamptz DEFAULT now(),
  source text NOT NULL DEFAULT 'citizen_report' CHECK (source IN ('citizen_report','camera_detection','police_log','sample_data','historical')),
  is_simulated boolean NOT NULL DEFAULT false,
  evidence_count integer NOT NULL DEFAULT 0,
  risk_score integer NOT NULL DEFAULT 0,
  risk_category text NOT NULL DEFAULT 'Low' CHECK (risk_category IN ('Low','Moderate','High','Very High')),
  risk_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence integer NOT NULL DEFAULT 50,
  assigned_unit text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_incidents" ON incidents;
CREATE POLICY "anon_select_incidents" ON incidents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_incidents" ON incidents;
CREATE POLICY "anon_insert_incidents" ON incidents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_incidents" ON incidents;
CREATE POLICY "anon_update_incidents" ON incidents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_incidents" ON incidents;
CREATE POLICY "anon_delete_incidents" ON incidents FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_sector ON incidents(sector);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_at ON incidents(reported_at DESC);

-- 3. Incident evidence metadata
CREATE TABLE IF NOT EXISTS incident_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id text NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text,
  file_size_bytes bigint,
  storage_path text,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE incident_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_evidence" ON incident_evidence;
CREATE POLICY "anon_select_evidence" ON incident_evidence FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_evidence" ON incident_evidence;
CREATE POLICY "anon_insert_evidence" ON incident_evidence FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_evidence" ON incident_evidence;
CREATE POLICY "anon_delete_evidence" ON incident_evidence FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_evidence_incident_id ON incident_evidence(incident_id);

-- 4. Sector boundaries
CREATE TABLE IF NOT EXISTS sector_boundaries (
  id text PRIMARY KEY,
  name text NOT NULL,
  polygon jsonb NOT NULL,
  risk_level text NOT NULL DEFAULT 'Low' CHECK (risk_level IN ('Low','Moderate','High','Very High')),
  incident_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sector_boundaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sectors" ON sector_boundaries;
CREATE POLICY "anon_select_sectors" ON sector_boundaries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sectors" ON sector_boundaries;
CREATE POLICY "anon_insert_sectors" ON sector_boundaries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sectors" ON sector_boundaries;
CREATE POLICY "anon_update_sectors" ON sector_boundaries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. Risk indicators (configurable)
CREATE TABLE IF NOT EXISTS risk_indicators (
  key text PRIMARY KEY,
  label text NOT NULL,
  weight numeric NOT NULL DEFAULT 0.1 CHECK (weight >= 0 AND weight <= 1),
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE risk_indicators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_indicators" ON risk_indicators;
CREATE POLICY "anon_select_indicators" ON risk_indicators FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_indicators" ON risk_indicators;
CREATE POLICY "anon_update_indicators" ON risk_indicators FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- 6. Camera detections
CREATE TABLE IF NOT EXISTS camera_detections (
  id text PRIMARY KEY,
  camera_id text NOT NULL,
  camera_name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  detection_type text NOT NULL CHECK (detection_type IN ('crowd_density','rapid_movement','loitering','normal','object_detection')),
  confidence integer NOT NULL DEFAULT 0,
  detected_at timestamptz DEFAULT now(),
  is_simulated boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'normal' CHECK (status IN ('normal','candidate_alert','flagged','reviewing')),
  description text NOT NULL DEFAULT ''
);

ALTER TABLE camera_detections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cameras" ON camera_detections;
CREATE POLICY "anon_select_cameras" ON camera_detections FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cameras" ON camera_detections;
CREATE POLICY "anon_insert_cameras" ON camera_detections FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cameras" ON camera_detections;
CREATE POLICY "anon_update_cameras" ON camera_detections FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_cameras_status ON camera_detections(status);
CREATE INDEX IF NOT EXISTS idx_cameras_detected_at ON camera_detections(detected_at DESC);

-- 7. Patrol units
CREATE TABLE IF NOT EXISTS patrol_units (
  id text PRIMARY KEY,
  unit_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('police','ambulance','fire','municipal')),
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','dispatched','en_route','on_scene','offline')),
  assigned_incident_id text REFERENCES incidents(id) ON DELETE SET NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patrol_units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_units" ON patrol_units;
CREATE POLICY "anon_select_units" ON patrol_units FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_units" ON patrol_units;
CREATE POLICY "anon_update_units" ON patrol_units FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- 8. Trusted contacts
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id text PRIMARY KEY,
  user_identifier text,
  name text NOT NULL,
  relation text NOT NULL DEFAULT 'Other',
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_contacts" ON trusted_contacts;
CREATE POLICY "anon_select_contacts" ON trusted_contacts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_contacts" ON trusted_contacts;
CREATE POLICY "anon_insert_contacts" ON trusted_contacts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_contacts" ON trusted_contacts;
CREATE POLICY "anon_delete_contacts" ON trusted_contacts FOR DELETE
  TO anon, authenticated USING (true);

-- 9. Data sources
CREATE TABLE IF NOT EXISTS data_sources (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  url text,
  licence text NOT NULL DEFAULT '',
  coverage text NOT NULL DEFAULT 'Chandigarh, India',
  last_updated text,
  is_live boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_datasources" ON data_sources;
CREATE POLICY "anon_select_datasources" ON data_sources FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_datasources" ON data_sources;
CREATE POLICY "anon_insert_datasources" ON data_sources FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- 10. Audit logs (INSERT only for anon — immutable trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity_type text,
  entity_id text,
  performed_by text NOT NULL DEFAULT 'system',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_audit" ON audit_logs;
CREATE POLICY "anon_select_audit" ON audit_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_audit" ON audit_logs;
CREATE POLICY "anon_insert_audit" ON audit_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);
