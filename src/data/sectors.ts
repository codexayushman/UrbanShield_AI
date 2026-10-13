import type { SectorBoundary } from '@/types';

// SAMPLE DATA — Chandigarh sector boundaries are approximated for demo purposes.
// For production, load real GeoJSON from the DataMeet Municipal Spatial Data repository.
// github.com/datameet/Municipal_Spatial_Data

export const SAMPLE_SECTORS: SectorBoundary[] = [
  {
    id: 'sec-1',
    name: 'Sector 17',
    polygon: [
      { lat: 30.747, lng: 76.763 },
      { lat: 30.747, lng: 76.775 },
      { lat: 30.736, lng: 76.775 },
      { lat: 30.736, lng: 76.763 },
    ],
    riskLevel: 'Moderate',
    incidentCount: 3,
  },
  {
    id: 'sec-2',
    name: 'Sector 22',
    polygon: [
      { lat: 30.732, lng: 76.760 },
      { lat: 30.732, lng: 76.772 },
      { lat: 30.720, lng: 76.772 },
      { lat: 30.720, lng: 76.760 },
    ],
    riskLevel: 'Moderate',
    incidentCount: 4,
  },
  {
    id: 'sec-3',
    name: 'Sector 35',
    polygon: [
      { lat: 30.711, lng: 76.758 },
      { lat: 30.711, lng: 76.770 },
      { lat: 30.700, lng: 76.770 },
      { lat: 30.700, lng: 76.758 },
    ],
    riskLevel: 'High',
    incidentCount: 7,
  },
  {
    id: 'sec-4',
    name: 'Sector 8',
    polygon: [
      { lat: 30.753, lng: 76.770 },
      { lat: 30.753, lng: 76.782 },
      { lat: 30.742, lng: 76.782 },
      { lat: 30.742, lng: 76.770 },
    ],
    riskLevel: 'High',
    incidentCount: 2,
  },
  {
    id: 'sec-5',
    name: 'Sector 15',
    polygon: [
      { lat: 30.741, lng: 76.766 },
      { lat: 30.741, lng: 76.778 },
      { lat: 30.730, lng: 76.778 },
      { lat: 30.730, lng: 76.766 },
    ],
    riskLevel: 'Low',
    incidentCount: 1,
  },
  {
    id: 'sec-6',
    name: 'Sector 26',
    polygon: [
      { lat: 30.736, lng: 76.780 },
      { lat: 30.736, lng: 76.792 },
      { lat: 30.725, lng: 76.792 },
      { lat: 30.725, lng: 76.780 },
    ],
    riskLevel: 'Very High',
    incidentCount: 1,
  },
  {
    id: 'sec-7',
    name: 'Sector 12',
    polygon: [
      { lat: 30.745, lng: 76.776 },
      { lat: 30.745, lng: 76.790 },
      { lat: 30.733, lng: 76.790 },
      { lat: 30.733, lng: 76.776 },
    ],
    riskLevel: 'Low',
    incidentCount: 1,
  },
  {
    id: 'sec-8',
    name: 'Industrial Area',
    polygon: [
      { lat: 30.710, lng: 76.795 },
      { lat: 30.710, lng: 76.815 },
      { lat: 30.698, lng: 76.815 },
      { lat: 30.698, lng: 76.795 },
    ],
    riskLevel: 'Moderate',
    incidentCount: 1,
  },
];
