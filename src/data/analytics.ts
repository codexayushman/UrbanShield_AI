import type { AnalyticsDataPoint } from '@/types';

// SAMPLE DATA — illustrative analytics for demonstration.
// Historical data would come from data.gov.in or Chandigarh Administration publications.
// These are NOT real crime statistics.

export const SAMPLE_TRENDS: AnalyticsDataPoint[] = [
  { label: 'Jan', value: 45, source: 'sample_data', date: '2025-01', isSimulated: true },
  { label: 'Feb', value: 38, source: 'sample_data', date: '2025-02', isSimulated: true },
  { label: 'Mar', value: 52, source: 'sample_data', date: '2025-03', isSimulated: true },
  { label: 'Apr', value: 41, source: 'sample_data', date: '2025-04', isSimulated: true },
  { label: 'May', value: 48, source: 'sample_data', date: '2025-05', isSimulated: true },
  { label: 'Jun', value: 55, source: 'sample_data', date: '2025-06', isSimulated: true },
  { label: 'Jul', value: 62, source: 'sample_data', date: '2025-07', isSimulated: true },
  { label: 'Aug', value: 50, source: 'sample_data', date: '2025-08', isSimulated: true },
  { label: 'Sep', value: 44, source: 'sample_data', date: '2025-09', isSimulated: true },
  { label: 'Oct', value: 39, source: 'sample_data', date: '2025-10', isSimulated: true },
];

export const SAMPLE_INCIDENT_TYPE_BREAKDOWN: AnalyticsDataPoint[] = [
  { label: 'Road Hazard', value: 28, source: 'sample_data', date: '2025', isSimulated: true },
  { label: 'Theft', value: 22, source: 'sample_data', date: '2025', isSimulated: true },
  { label: 'Lighting Issue', value: 18, source: 'sample_data', date: '2025', isSimulated: true },
  { label: 'Crowd Congestion', value: 12, source: 'sample_data', date: '5', isSimulated: true },
  { label: 'Harassment', value: 8, source: 'sample_data', date: '2025', isSimulated: true },
  { label: 'Other', value: 6, source: 'sample_data', date: '2025', isSimulated: true },
];

export const SAMPLE_SECTOR_HEATMAP: { sector: string; incidentCount: number; riskLevel: string }[] = [
  { sector: 'Sector 17', incidentCount: 14, riskLevel: 'Moderate' },
  { sector: 'Sector 22', incidentCount: 11, riskLevel: 'Moderate' },
  { sector: 'Sector 35', incidentCount: 19, riskLevel: 'High' },
  { sector: 'Sector 8', incidentCount: 8, riskLevel: 'High' },
  { sector: 'Sector 15', incidentCount: 5, riskLevel: 'Low' },
  { sector: 'Sector 26', incidentCount: 7, riskLevel: 'Very High' },
  { sector: 'Sector 12', incidentCount: 4, riskLevel: 'Low' },
  { sector: 'Industrial Area', incidentCount: 6, riskLevel: 'Moderate' },
];

export const DATA_SOURCES = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    description: 'Roads, paths, hospitals, police stations, public facilities',
    url: 'https://www.openstreetmap.org/copyright',
    licence: 'ODbL (Open Database License)',
    coverage: 'Chandigarh, India',
    lastUpdated: '2025-09',
    isLive: true,
  },
  {
    id: 'datameet',
    name: 'DataMeet Municipal Spatial Data',
    description: 'Chandigarh sector/ward boundaries (GeoJSON)',
    url: 'https://github.com/datameet/Municipal_Spatial_Data',
    licence: 'CC BY-SA 2.5 IN',
    coverage: 'Chandigarh, India',
    lastUpdated: '2024-06',
    isLive: false,
  },
  {
    id: 'dataGovIn',
    name: 'data.gov.in — Chandigarh Crime Data',
    description: 'Historical crime statistics from Government of India Open Data Platform',
    url: 'https://data.gov.in',
    licence: 'Government Open Data License (GODL-India)',
    coverage: 'Chandigarh, India',
    lastUpdated: '2024-03',
    isLive: false,
  },
  {
    id: 'chdAdmin',
    name: 'Chandigarh Administration Statistical Publications',
    description: 'Official statistical publications from Chandigarh Administration',
    url: 'https://chandigarh.gov.in',
    licence: 'Government of India',
    coverage: 'Chandigarh, India',
    lastUpdated: '2024-01',
    isLive: false,
  },
  {
    id: 'sample',
    name: 'Sample / Demo Data (UrbanShield AI)',
    description: 'Illustrative sample data for demonstration purposes. Not real-world crime data.',
    url: '',
    licence: 'Demo — not for production use',
    coverage: 'Chandigarh (illustrative)',
    lastUpdated: '2025-10',
    isLive: false,
  },
];
