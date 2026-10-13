# UrbanShield AI

**A hackathon-ready urban safety platform for Chandigarh, India.**

UrbanShield AI is a comprehensive urban safety platform that combines an interactive Chandigarh map, explainable threat assessment, incident management, AI camera detection simulation, and analytics — all with a premium dark-themed interface.

## Features

- **Dashboard** — Real-time overview of incidents, priority counts, patrol units, and sector hotspots
- **Chandigarh Safety Map** — Interactive Leaflet/OpenStreetMap map restricted to Chandigarh boundary with incident, facility, sector, camera, and patrol unit layers
- **Safe Routes** — Compare routes by distance and estimated risk with explainable indicators
- **Incident Reporting** — Validated form with location, evidence upload, and immediate risk assessment
- **AI Camera Detection** — Simulated video analysis for crowd density, movement patterns, and anomaly detection
- **Control Room** — Incident review, priority/status adjustment, audit history, and patrol recommendations
- **Safety Assistant** — AI-powered emergency guidance chat with trusted-contact management
- **Analytics** — Historical trends with source/date filters and data source attribution
- **What-If Simulator** — Model hypothetical improvements to lighting, facilities, patrols, and road maintenance
- **Settings** — Notifications, accessibility, language, map preferences, and system info

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Motion (Framer Motion), Leaflet
- **Backend:** Netlify Functions (TypeScript), Supabase/PostgreSQL
- **Map Data:** OpenStreetMap
- **Icons:** Lucide React

## Project Structure

```
urbanshield-ai/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Individual page components
│   ├── layouts/       # Sidebar and app layout
│   ├── services/      # API and database clients
│   ├── types/         # Shared TypeScript types
│   ├── data/          # Clearly labelled demo fixtures
│   └── config/        # City boundary, map, and scoring config
├── netlify/functions/ # Backend API endpoints
├── supabase/migrations/ # Database schema and migrations
├── data/importers/    # Dataset validation and import scripts
├── public/            # Static assets
├── .env.example
├── netlify.toml
└── package.json
```

## Local Setup

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd urbanshield-ai
   npm install
   ```

2. **Environment variables:**
   ```bash
   cp .env.example .env
   # Add your Supabase credentials (or skip — app runs in demo mode)
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Database Setup

The Supabase database schema is applied via migrations. The schema includes:

- `users` — Operator profiles
- `incidents` — Safety incidents with risk scores
- `incident_evidence` — Evidence file metadata
- `sector_boundaries` — Chandigarh sector GeoJSON
- `risk_indicators` — Configurable weighted scoring indicators
- `camera_detections` — AI camera detection results
- `patrol_units` — Police/ambulance/fire/municipal units
- `trusted_contacts` — Citizen emergency contacts
- `data_sources` — Registered open data sources
- `audit_logs` — Immutable audit trail

All tables have RLS enabled. In demo mode (no credentials), the app uses local sample data.

## API Documentation

### Netlify Functions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/incidents` | GET | List incidents (filters: priority, status, sector) |
| `/api/incidents` | POST | Create a new incident |
| `/api/incidents/:id` | PUT | Update incident status/priority |
| `/api/analytics` | GET | Get aggregated analytics (filter: range) |
| `/api/cameras` | GET | List camera detections |
| `/api/cameras` | POST | Create a camera detection record |
| `/api/audit` | GET | List audit log entries |
| `/api/audit` | POST | Create an audit log entry |
| `/api/data-sources` | GET | List registered data sources |
| `/api/data-sources` | POST | Register a new data source |

## Risk Scoring Engine

The threat assessment uses 6 interpretable weighted indicators:

1. **Incident Recency** (25%) — How recently the incident occurred
2. **Incident Severity** (25%) — Base severity by incident type
3. **Incident Frequency** (20%) — Nearby similar incidents
4. **Lighting Quality** (10%) — Validated poor-lighting reports
5. **Facility Proximity** (10%) — Distance to nearest hospital/police/fire
6. **Verification Status** (10%) — Whether verified by authorities

Risk categories: Low (0-29), Moderate (30-59), High (60-79), Very High (80-100).

**These are DEMO thresholds — not validated Chandigarh crime predictions.**

## Data Sources

| Source | Type | Licence |
|--------|------|---------|
| OpenStreetMap | Live | ODbL |
| DataMeet Municipal Spatial Data | Historical | CC BY-SA 2.5 IN |
| data.gov.in | Historical | GODL-India |
| Chandigarh Administration | Historical | Government of India |
| UrbanShield AI Sample | Demo | Not for production |

All sample data is clearly labelled with "SAMPLE" badges and data source banners.

## Deployment

1. Push to GitHub
2. Connect repo to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set environment variables in Netlify dashboard
6. Deploy

The `netlify.toml` file configures SPA fallback and Functions automatically.

## Important Notes

- **Demo Mode:** The app works without credentials using clearly labelled sample data
- **No Real Surveillance:** All camera detections are simulated
- **Privacy First:** Risk scoring never uses protected personal characteristics
- **Not Predictions:** Risk scores are illustrative demo thresholds, not validated predictions
- **Chandigarh Only:** Map navigation is restricted to Chandigarh's geographic boundary

## License

Demo project for hackathon/educational purposes.
