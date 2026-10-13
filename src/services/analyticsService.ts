import { supabase, isSupabaseConfigured } from './supabaseClient';
import { SAMPLE_TRENDS, SAMPLE_INCIDENT_TYPE_BREAKDOWN, SAMPLE_SECTOR_HEATMAP, DATA_SOURCES } from '@/data/analytics';

export async function getTrends() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('incidents').select('reported_at, type, sector');
    if (!error && data && data.length > 0) {
      // Could aggregate from real data here
    }
  }
  return SAMPLE_TRENDS;
}

export async function getIncidentTypeBreakdown() {
  return SAMPLE_INCIDENT_TYPE_BREAKDOWN;
}

export async function getSectorHeatmap() {
  return SAMPLE_SECTOR_HEATMAP;
}

export async function getDataSources() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('data_sources').select('*');
    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        url: d.url,
        licence: d.licence,
        coverage: d.coverage,
        lastUpdated: d.last_updated,
        isLive: d.is_live,
      }));
    }
  }
  return DATA_SOURCES;
}
