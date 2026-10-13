import type { SafeRoute } from '@/types';

// SAMPLE DATA — simulated safe route analysis.
// These routes use OpenStreetMap roads but the risk scores are illustrative.
// No route is guaranteed safe. Scores are demo thresholds, not predictions.

export const SAMPLE_ROUTES: SafeRoute[] = [
  {
    id: 'ROUTE-1',
    name: 'Sector 17 → Sector 22 (via Madhya Marg)',
    segments: [
      {
        name: 'Madhya Marg',
        coords: [
          { lat: 30.7414, lng: 76.7689 },
          { lat: 30.7362, lng: 76.7700 },
          { lat: 30.7300, lng: 76.7685 },
          { lat: 30.7262, lng: 76.7672 },
        ],
        riskScore: 35,
        riskCategory: 'Moderate',
        riskReasons: ['Moderate incident frequency along this corridor', 'Adequate lighting', 'Police station within 1 km'],
        distanceKm: 1.8,
        estimatedMinutes: 6,
      },
    ],
    totalDistanceKm: 1.8,
    totalMinutes: 6,
    avgRiskScore: 35,
    riskCategory: 'Moderate',
    indicators: ['Incident frequency (low)', 'Lighting (adequate)', 'Facility proximity (good)'],
    isSimulated: true,
  },
  {
    id: 'ROUTE-2',
    name: 'Sector 17 → Sector 22 (via inner Sector 15 lanes)',
    segments: [
      {
        name: 'Sector 15 inner lanes',
        coords: [
          { lat: 30.7414, lng: 76.7689 },
          { lat: 30.7375, lng: 76.7720 },
          { lat: 30.7330, lng: 76.7700 },
          { lat: 30.7280, lng: 76.7680 },
          { lat: 30.7262, lng: 76.7672 },
        ],
        riskScore: 55,
        riskCategory: 'Moderate',
        riskReasons: ['Poor lighting reported in inner lanes', 'Lower foot traffic at night', 'No nearby police station on this path'],
        distanceKm: 1.5,
        estimatedMinutes: 7,
      },
    ],
    totalDistanceKm: 1.5,
    totalMinutes: 7,
    avgRiskScore: 55,
    riskCategory: 'Moderate',
    indicators: ['Incident frequency (low)', 'Lighting (poor — validated reports)', 'Facility proximity (moderate)'],
    isSimulated: true,
  },
  {
    id: 'ROUTE-3',
    name: 'Sector 35 → Sector 17 (via Himalaya Marg)',
    segments: [
      {
        name: 'Himalaya Marg',
        coords: [
          { lat: 30.7056, lng: 76.7647 },
          { lat: 30.7120, lng: 76.7660 },
          { lat: 30.7200, lng: 76.7675 },
          { lat: 30.7300, lng: 76.7685 },
          { lat: 30.7414, lng: 76.7689 },
        ],
        riskScore: 65,
        riskCategory: 'High',
        riskReasons: ['Repeated theft reports near Sector 35', 'Higher incident frequency on this corridor', 'Moderate lighting'],
        distanceKm: 4.2,
        estimatedMinutes: 14,
      },
    ],
    totalDistanceKm: 4.2,
    totalMinutes: 14,
    avgRiskScore: 65,
    riskCategory: 'High',
    indicators: ['Incident frequency (high — pattern detected)', 'Lighting (moderate)', 'Facility proximity (moderate)'],
    isSimulated: true,
  },
  {
    id: 'ROUTE-4',
    name: 'PGIMER → Sector 17 (via Madhya Marg, well-lit)',
    segments: [
      {
        name: 'Madhya Marg (hospital route)',
        coords: [
          { lat: 30.7589, lng: 76.7893 },
          { lat: 30.7500, lng: 76.7820 },
          { lat: 30.7450, lng: 76.7750 },
          { lat: 30.7414, lng: 76.7689 },
        ],
        riskScore: 22,
        riskCategory: 'Low',
        riskReasons: ['Well-lit major road', 'Multiple facilities nearby (hospital, police, fire)', 'Low incident frequency'],
        distanceKm: 2.8,
        estimatedMinutes: 9,
      },
    ],
    totalDistanceKm: 2.8,
    totalMinutes: 9,
    avgRiskScore: 22,
    riskCategory: 'Low',
    indicators: ['Incident frequency (very low)', 'Lighting (good)', 'Facility proximity (excellent)'],
    isSimulated: true,
  },
];
