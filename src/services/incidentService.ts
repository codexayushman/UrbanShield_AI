import { supabase, isSupabaseConfigured } from './supabaseClient';
import { SAMPLE_INCIDENTS } from '@/data/incidents';
import { calculateRiskScore } from '@/services/riskScoring';
import { getRiskCategory } from '@/config/scoring';
import type { Incident, IncidentType, GeoPoint } from '@/types';

export interface CreateIncidentInput {
  type: IncidentType;
  title: string;
  description: string;
  sector: string;
  location: GeoPoint;
  source?: string;
  isSimulated?: boolean;
}

export async function createIncident(input: CreateIncidentInput): Promise<Incident | null> {
  const risk = calculateRiskScore({
    type: input.type,
    location: input.location,
    status: 'submitted',
    source: (input.source as any) || 'citizen_report',
    reportedAt: new Date().toISOString(),
  });

  const priority = risk.score >= 80 ? 'urgent' : risk.score >= 60 ? 'high' : risk.score >= 30 ? 'moderate' : 'low';
  const id = `INC-${Math.floor(Math.random() * 9000 + 1000)}`;

  const incident: Incident = {
    id,
    type: input.type,
    title: input.title,
    description: input.description,
    status: 'submitted',
    priority: priority as any,
    location: input.location,
    sector: input.sector,
    reportedAt: new Date().toISOString(),
    source: (input.source as any) || 'citizen_report',
    isSimulated: input.isSimulated ?? true,
    evidenceCount: 0,
    riskScore: risk.score,
    riskCategory: risk.category,
    riskReasons: risk.reasons,
    confidence: risk.confidence,
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('incidents').insert({
      id: incident.id,
      type: incident.type,
      title: incident.title,
      description: incident.description,
      status: incident.status,
      priority: incident.priority,
      lat: incident.location.lat,
      lng: incident.location.lng,
      sector: incident.sector,
      source: incident.source,
      is_simulated: incident.isSimulated,
      evidence_count: incident.evidenceCount,
      risk_score: incident.riskScore,
      risk_category: incident.riskCategory,
      risk_reasons: JSON.stringify(incident.riskReasons),
      confidence: incident.confidence,
    });
    if (error) {
      console.error('Supabase insert failed, using local data:', error.message);
    }
  }

  return incident;
}

export async function listIncidents(filters?: {
  priority?: string;
  status?: string;
  sector?: string;
}): Promise<Incident[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('incidents').select('*').order('reported_at', { ascending: false });
    if (filters?.priority && filters.priority !== 'all') query = query.eq('priority', filters.priority);
    if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters?.sector && filters.sector !== 'all') query = query.eq('sector', filters.sector);

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map(mapDbIncident);
    }
  }
  return SAMPLE_INCIDENTS.filter(i =>
    (!filters?.priority || filters.priority === 'all' || i.priority === filters.priority) &&
    (!filters?.status || filters.status === 'all' || i.status === filters.status) &&
    (!filters?.sector || filters.sector === 'all' || i.sector === filters.sector)
  );
}

export async function updateIncidentStatus(id: string, status: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('incidents').update({ status }).eq('id', id);
    if (error) {
      console.error('Supabase update failed:', error.message);
      return false;
    }
  }
  return true;
}

export async function updateIncidentPriority(id: string, priority: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('incidents').update({ priority }).eq('id', id);
    if (error) {
      console.error('Supabase update failed:', error.message);
      return false;
    }
  }
  return true;
}

function mapDbIncident(row: any): Incident {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description || '',
    status: row.status,
    priority: row.priority,
    location: { lat: row.lat, lng: row.lng },
    sector: row.sector,
    reportedAt: row.reported_at,
    source: row.source,
    isSimulated: row.is_simulated,
    evidenceCount: row.evidence_count || 0,
    riskScore: row.risk_score || 0,
    riskCategory: row.risk_category || 'Low',
    riskReasons: typeof row.risk_reasons === 'string' ? JSON.parse(row.risk_reasons) : row.risk_reasons || [],
    confidence: row.confidence || 50,
    assignedUnit: row.assigned_unit || undefined,
  };
}
