import { supabase, isSupabaseConfigured } from './supabaseClient';
import { SAMPLE_CAMERAS, SAMPLE_PATROL_UNITS } from '@/data/cameras';
import type { CameraDetection, PatrolUnit } from '@/types';

export async function getCameras(): Promise<CameraDetection[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('camera_detections').select('*').order('detected_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        cameraId: d.camera_id,
        cameraName: d.camera_name,
        location: { lat: d.lat, lng: d.lng },
        detectionType: d.detection_type,
        confidence: d.confidence,
        detectedAt: d.detected_at,
        isSimulated: d.is_simulated,
        status: d.status,
        description: d.description,
      }));
    }
  }
  return SAMPLE_CAMERAS;
}

export async function getPatrolUnits(): Promise<PatrolUnit[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('patrol_units').select('*');
    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        unitName: d.unit_name,
        type: d.type,
        location: { lat: d.lat, lng: d.lng },
        status: d.status,
        assignedIncidentId: d.assigned_incident_id || undefined,
      }));
    }
  }
  return SAMPLE_PATROL_UNITS;
}
