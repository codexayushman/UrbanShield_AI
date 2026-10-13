/*
# Seed initial risk indicators and data sources

1. Inserts the 6 default risk-scoring indicators with their weights and descriptions.
2. Inserts the registered open data sources with attribution/licence metadata.
These are reference/config tables — seeded once, editable thereafter via the UI.
All INSERTs use ON CONFLICT DO NOTHING for idempotency.
*/

INSERT INTO risk_indicators (key, label, weight, description) VALUES
  ('incident_recency', 'Incident Recency', 0.25, 'How recently the incident or pattern was observed. Recent events carry higher weight.'),
  ('incident_frequency', 'Incident Frequency', 0.20, 'Number of similar incidents near the same location within the review window. Accounts for duplicate reports.'),
  ('incident_severity', 'Incident Severity', 0.25, 'Base severity assigned by the incident type (e.g., emergency > road hazard).'),
  ('lighting_quality', 'Lighting Quality', 0.10, 'Presence of validated poor-lighting reports in the vicinity. Lower lighting increases risk.'),
  ('facility_proximity', 'Facility Proximity', 0.10, 'Distance to nearest hospital, police station, or fire station. Greater distance slightly increases risk.'),
  ('verification_status', 'Verification Status', 0.10, 'Whether the incident has been verified by authorities. Unverified reports lower confidence.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO data_sources (id, name, description, url, licence, coverage, last_updated, is_live) VALUES
  ('osm', 'OpenStreetMap', 'Roads, paths, hospitals, police stations, public facilities', 'https://www.openstreetmap.org/copyright', 'ODbL (Open Database License)', 'Chandigarh, India', '2025-09', true),
  ('datameet', 'DataMeet Municipal Spatial Data', 'Chandigarh sector/ward boundaries (GeoJSON)', 'https://github.com/datameet/Municipal_Spatial_Data', 'CC BY-SA 2.5 IN', 'Chandigarh, India', '2024-06', false),
  ('dataGovIn', 'data.gov.in — Chandigarh Crime Data', 'Historical crime statistics from Government of India Open Data Platform', 'https://data.gov.in', 'Government Open Data License (GODL-India)', 'Chandigarh, India', '2024-03', false),
  ('chdAdmin', 'Chandigarh Administration Statistical Publications', 'Official statistical publications from Chandigarh Administration', 'https://chandigarh.gov.in', 'Government of India', 'Chandigarh, India', '2024-01', false),
  ('sample', 'Sample / Demo Data (UrbanShield AI)', 'Illustrative sample data for demonstration purposes. Not real-world crime data.', '', 'Demo — not for production use', 'Chandigarh (illustrative)', '2025-10', false)
ON CONFLICT (id) DO NOTHING;
