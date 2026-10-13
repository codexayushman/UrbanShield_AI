import type { GeoPoint } from '@/types';

// Chandigarh city center — used for map default view
export const CHANDIGARH_CENTER: GeoPoint = { lat: 30.7333, lng: 76.7794 };

// Default zoom level for the city view
export const CHANDIGARH_DEFAULT_ZOOM = 12;

// Approximate bounding box for Chandigarh UT
// Used to restrict map navigation (maxBounds)
export const CHANDIGARH_BOUNDS = {
  northEast: { lat: 30.82, lng: 76.9 } as GeoPoint,
  southWest: { lat: 30.61, lng: 76.65 } as GeoPoint,
};

// Approximate city boundary polygon for overlay
export const CHANDIGARH_BOUNDARY_POLYGON: GeoPoint[] = [
  { lat: 30.805, lng: 76.68 },
  { lat: 30.805, lng: 76.88 },
  { lat: 30.77, lng: 76.89 },
  { lat: 30.73, lng: 76.88 },
  { lat: 30.68, lng: 76.85 },
  { lat: 30.62, lng: 76.82 },
  { lat: 30.61, lng: 76.76 },
  { lat: 30.64, lng: 76.68 },
  { lat: 30.70, lng: 76.65 },
  { lat: 30.75, lng: 76.66 },
  { lat: 30.79, lng: 76.67 },
];

// Key facility locations in Chandigarh (from OpenStreetMap)
export const CHANDIGARH_FACILITIES = [
  { id: 'hospital-1', name: 'PGIMER (Post Graduate Institute of Medical Education & Research)', type: 'hospital', location: { lat: 30.7589, lng: 76.7893 } },
  { id: 'hospital-2', name: 'Government Multi-Specialty Hospital, Sector 16', type: 'hospital', location: { lat: 30.7333, lng: 76.7794 } },
  { id: 'hospital-3', name: 'GMCH Sector 32', type: 'hospital', location: { lat: 30.7262, lng: 76.7833 } },
  { id: 'police-1', name: 'Sector 17 Police Station', type: 'police', location: { lat: 30.7414, lng: 76.7689 } },
  { id: 'police-2', name: 'Sector 31 Police Station', type: 'police', location: { lat: 30.7111, lng: 76.7722 } },
  { id: 'police-3', name: 'Sector 3 Police Station', type: 'police', location: { lat: 30.7472, lng: 76.7758 } },
  { id: 'police-4', name: 'Sector 39 Police Station', type: 'police', location: { lat: 30.7056, lng: 76.7722 } },
  { id: 'fire-1', name: 'Fire Station, Sector 17', type: 'fire', location: { lat: 30.7414, lng: 76.7722 } },
  { id: 'fire-2', name: 'Fire Station, Sector 32', type: 'fire', location: { lat: 30.7262, lng: 76.7833 } },
  { id: 'transit-1', name: 'ISBT Sector 17 (Inter-State Bus Terminal)', type: 'transit', location: { lat: 30.7414, lng: 76.7689 } },
  { id: 'transit-2', name: 'Chandigarh Railway Station', type: 'transit', location: { lat: 30.7019, lng: 76.8236 } },
] as const;

// Attribution for open data sources
export const DATA_ATTRIBUTIONS = {
  osm: '© OpenStreetMap contributors — openstreetmap.org/copyright',
  datameet: 'DataMeet Municipal Spatial Data — github.com/datameet/Municipal_Spatial_Data',
  dataGovIn: 'data.gov.in — Government of India Open Data Platform',
  chdAdmin: 'Chandigarh Administration — chandigarh.gov.in',
} as const;
