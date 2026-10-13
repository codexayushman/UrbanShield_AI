# Supabase Migrations — UrbanShield AI

Migrations are applied via the `mcp__supabase__apply_migration` tool, not via files on disk.

## Applied Migrations

1. **create_urbanshield_schema** — Creates all 10 tables with RLS policies
2. **seed_reference_data** — Seeds risk_indicators and data_sources

## Tables

| Table | Description |
|-------|-------------|
| `users` | Operator profiles (admin, operator, viewer) |
| `incidents` | Safety incidents with risk scores |
| `incident_evidence` | Evidence file metadata |
| `sector_boundaries` | Chandigarh sector GeoJSON polygons |
| `risk_indicators` | Configurable weighted scoring indicators |
| `camera_detections` | AI camera detection results |
| `patrol_units` | Police/ambulance/fire/municipal units |
| `trusted_contacts` | Citizen emergency contacts |
| `data_sources` | Registered open data sources |
| `audit_logs` | Immutable audit trail |

All tables have RLS enabled with `anon, authenticated` policies (demo/no-auth mode).
