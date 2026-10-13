// UrbanShield AI — Shared TypeScript Types

export type Priority = 'low' | 'moderate' | 'high' | 'urgent';

export type IncidentType =
  | 'road_hazard'
  | 'crowd_congestion'
  | 'altercation'
  | 'lighting_issue'
  | 'repeated_incidents'
  | 'emergency'
  | 'theft'
  | 'harassment'
  | 'other';

export type IncidentStatus =
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'unverified'
  | 'resolved'
  | 'dismissed';

export type DataSource = 'citizen_report' | 'camera_detection' | 'police_log' | 'sample_data' | 'historical';

export type RiskCategory = 'Low' | 'Moderate' | 'High' | 'Very High';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: Priority;
  location: GeoPoint;
  sector: string;
  reportedAt: string; // ISO timestamp
  source: DataSource;
  isSimulated: boolean;
  evidenceCount: number;
  riskScore: number;
  riskCategory: RiskCategory;
  riskReasons: string[];
  confidence: number; // 0-100
  assignedUnit?: string;
}

export interface RiskIndicator {
  key: string;
  label: string;
  weight: number; // 0-1
  description: string;
}

export interface RiskScoreResult {
  score: number;
  category: RiskCategory;
  reasons: string[];
  confidence: number;
  indicators: { key: string; label: string; value: number; contribution: number }[];
}

export interface SectorBoundary {
  id: string;
  name: string;
  polygon: GeoPoint[];
  riskLevel: RiskCategory;
  incidentCount: number;
}

export interface CameraDetection {
  id: string;
  cameraId: string;
  cameraName: string;
  location: GeoPoint;
  detectionType: 'crowd_density' | 'rapid_movement' | 'loitering' | 'normal' | 'object_detection';
  confidence: number;
  detectedAt: string;
  isSimulated: boolean;
  status: 'normal' | 'candidate_alert' | 'flagged' | 'reviewing';
  description: string;
}

export interface PatrolUnit {
  id: string;
  unitName: string;
  type: 'police' | 'ambulance' | 'fire' | 'municipal';
  location: GeoPoint;
  status: 'available' | 'dispatched' | 'en_route' | 'on_scene' | 'offline';
  assignedIncidentId?: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface RouteSegment {
  name: string;
  coords: GeoPoint[];
  riskScore: number;
  riskCategory: RiskCategory;
  riskReasons: string[];
  distanceKm: number;
  estimatedMinutes: number;
}

export interface SafeRoute {
  id: string;
  name: string;
  segments: RouteSegment[];
  totalDistanceKm: number;
  totalMinutes: number;
  avgRiskScore: number;
  riskCategory: RiskCategory;
  indicators: string[];
  isSimulated: boolean;
}

export interface AnalyticsDataPoint {
  label: string;
  value: number;
  source: DataSource;
  date: string;
  isSimulated: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  description: string;
  changes: { indicator: string; improvement: number }[];
  projectedRiskReduction: number;
  isSimulated: boolean;
}

export type PageKey =
  | 'dashboard'
  | 'safety_map'
  | 'safe_routes'
  | 'incident_reporting'
  | 'camera_detection'
  | 'control_room'
  | 'safety_assistant'
  | 'analytics'
  | 'what_if_simulator'
  | 'settings';
