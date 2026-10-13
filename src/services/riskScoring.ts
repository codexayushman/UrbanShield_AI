import type { Incident, RiskScoreResult, GeoPoint } from '@/types';
import {
  RISK_INDICATORS,
  INCIDENT_SEVERITY,
  getRiskCategory,
} from '@/config/scoring';
import { CHANDIGARH_FACILITIES } from '@/config/chandigarh';

// Haversine distance in km
function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nearestFacilityDistanceKm(point: GeoPoint): number {
  let min = Infinity;
  for (const f of CHANDIGARH_FACILITIES) {
    const d = distanceKm(point, f.location);
    if (d < min) min = d;
  }
  return min;
}

/**
 * Transparent, configurable risk-scoring engine.
 * Uses interpretable weighted indicators. Every score includes
 * the contributing indicators, confidence, and explanations.
 *
 * These are DEMO thresholds — not validated Chandigarh crime predictions.
 */
export function calculateRiskScore(
  incident: Pick<Incident, 'type' | 'location' | 'status' | 'source' | 'reportedAt'>,
  nearbyIncidentCount = 1,
): RiskScoreResult {
  const now = Date.now();
  const reported = new Date(incident.reportedAt).getTime();
  const hoursAgo = (now - reported) / (1000 * 60 * 60);

  // Indicator 1: Recency — newer = higher score (0-100)
  const recencyScore = Math.max(0, 100 - hoursAgo * 2);

  // Indicator 2: Frequency — more nearby incidents = higher
  const frequencyScore = Math.min(100, nearbyIncidentCount * 20);

  // Indicator 3: Severity by type
  const severityScore = INCIDENT_SEVERITY[incident.type] ?? 30;

  // Indicator 4: Lighting — placeholder, assume moderate (no real lighting dataset)
  const lightingScore = 50; // neutral default

  // Indicator 5: Facility proximity — farther = slightly higher risk
  const facilityDist = nearestFacilityDistanceKm(incident.location);
  const proximityScore = Math.min(100, facilityDist * 15);

  // Indicator 6: Verification status
  const verificationScore =
    incident.status === 'verified' ? 90 :
    incident.status === 'unverified' ? 35 :
    incident.status === 'under_review' ? 60 :
    50;

  const indicatorValues: Record<string, number> = {
    incident_recency: recencyScore,
    incident_frequency: frequencyScore,
    incident_severity: severityScore,
    lighting_quality: lightingScore,
    facility_proximity: proximityScore,
    verification_status: verificationScore,
  };

  let totalScore = 0;
  const indicatorResults: RiskScoreResult['indicators'] = [];

  for (const ind of RISK_INDICATORS) {
    const value = indicatorValues[ind.key] ?? 0;
    const contribution = value * ind.weight;
    totalScore += contribution;
    indicatorResults.push({ key: ind.key, label: ind.label, value: Math.round(value), contribution: Math.round(contribution) });
  }

  totalScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  // Confidence: weighted by source reliability and verification
  const sourceConfidence: Record<string, number> = {
    police_log: 90,
    camera_detection: 60,
    citizen_report: 55,
    historical: 40,
    sample_data: 30,
  };
  let confidence = sourceConfidence[incident.source] ?? 50;
  if (incident.status === 'verified') confidence = Math.min(100, confidence + 15);
  if (incident.status === 'unverified') confidence = Math.max(10, confidence - 20);

  // Reasons — human-readable explanation
  const reasons: string[] = [];
  if (hoursAgo < 1) reasons.push('Incident occurred within the last hour');
  else if (hoursAgo < 6) reasons.push(`Incident occurred ${Math.round(hoursAgo)} hours ago`);
  else reasons.push(`Incident occurred ${Math.round(hoursAgo / 24)} days ago`);

  if (nearbyIncidentCount > 2) reasons.push(`${nearbyIncidentCount} similar reports near this location (possible pattern)`);
  if (severityScore >= 70) reasons.push(`${incident.type.replace(/_/g, ' ')} is a high-severity incident type`);
  if (facilityDist > 3) reasons.push(`Nearest facility is ${facilityDist.toFixed(1)} km away`);
  if (incident.status === 'unverified') reasons.push('Report is unverified — confidence is reduced');

  return {
    score: totalScore,
    category: getRiskCategory(totalScore),
    reasons,
    confidence,
    indicators: indicatorResults,
  };
}
