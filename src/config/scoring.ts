import type { RiskCategory, RiskIndicator } from '@/types';

// Risk thresholds — demo values, not validated crime predictions
export const RISK_THRESHOLDS: { min: number; max: number; category: RiskCategory; color: string }[] = [
  { min: 0, max: 29, category: 'Low', color: '#22c55e' },
  { min: 30, max: 59, category: 'Moderate', color: '#eab308' },
  { min: 60, max: 79, category: 'High', color: '#f97316' },
  { min: 80, max: 100, category: 'Very High', color: '#ef4444' },
];

// Weighted risk indicators — interpretable and configurable
export const RISK_INDICATORS: RiskIndicator[] = [
  {
    key: 'incident_recency',
    label: 'Incident Recency',
    weight: 0.25,
    description: 'How recently the incident or pattern was observed. Recent events carry higher weight.',
  },
  {
    key: 'incident_frequency',
    label: 'Incident Frequency',
    weight: 0.20,
    description: 'Number of similar incidents near the same location within the review window. Accounts for duplicate reports.',
  },
  {
    key: 'incident_severity',
    label: 'Incident Severity',
    weight: 0.25,
    description: 'Base severity assigned by the incident type (e.g., emergency > road hazard).',
  },
  {
    key: 'lighting_quality',
    label: 'Lighting Quality',
    weight: 0.10,
    description: 'Presence of validated poor-lighting reports in the vicinity. Lower lighting increases risk.',
  },
  {
    key: 'facility_proximity',
    label: 'Facility Proximity',
    weight: 0.10,
    description: 'Distance to nearest hospital, police station, or fire station. Greater distance slightly increases risk.',
  },
  {
    key: 'verification_status',
    label: 'Verification Status',
    weight: 0.10,
    description: 'Whether the incident has been verified by authorities. Unverified reports lower confidence.',
  },
];

// Severity scores per incident type — configurable
export const INCIDENT_SEVERITY: Record<string, number> = {
  emergency: 95,
  altercation: 80,
  harassment: 75,
  theft: 65,
  repeated_incidents: 70,
  crowd_congestion: 50,
  road_hazard: 45,
  lighting_issue: 35,
  other: 30,
};

// Confidence adjustment based on source
export const SOURCE_CONFIDENCE: Record<string, number> = {
  police_log: 90,
  verified_citizen: 75,
  citizen_report: 55,
  camera_detection: 60,
  historical: 40,
  sample_data: 30,
};

export function getRiskCategory(score: number): RiskCategory {
  for (const t of RISK_THRESHOLDS) {
    if (score >= t.min && score <= t.max) return t.category;
  }
  return 'Low';
}

export function getRiskColor(score: number): string {
  for (const t of RISK_THRESHOLDS) {
    if (score >= t.min && score <= t.max) return t.color;
  }
  return '#22c55e';
}
