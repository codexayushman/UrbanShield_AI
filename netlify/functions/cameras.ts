import { createClient } from '@supabase/supabase-js';
import type { Handler } from '@netlify/functions';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    if (!supabase) {
      return {
        statusCode: 503,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Database not configured.' }),
      };
    }

    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase.from('camera_detections').select('*').order('detected_at', { ascending: false });
      if (error) throw error;
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (!body.camera_id || !body.detection_type) {
        return {
          statusCode: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Missing required fields: camera_id, detection_type' }),
        };
      }

      const { data, error } = await supabase.from('camera_detections').insert({
        id: `CAM-${Math.floor(Math.random() * 9000 + 1000)}`,
        camera_id: body.camera_id,
        camera_name: body.camera_name || body.camera_id,
        lat: body.lat,
        lng: body.lng,
        detection_type: body.detection_type,
        confidence: body.confidence || 0,
        is_simulated: body.is_simulated ?? true,
        status: body.status || 'candidate_alert',
        description: body.description || '',
      }).select().single();

      if (error) throw error;
      return {
        statusCode: 201,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      };
    }

    return {
      statusCode: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
