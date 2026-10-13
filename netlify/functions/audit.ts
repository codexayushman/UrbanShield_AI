import { createClient } from '@supabase/supabase-js';
import type { Handler } from '@netlify/functions';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
      const params = event.queryStringParameters || {};
      let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (params.entity_id) query = query.eq('entity_id', params.entity_id);
      if (params.entity_type) query = query.eq('entity_type', params.entity_type);

      const { data, error } = await query;
      if (error) throw error;
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (!body.action) {
        return {
          statusCode: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Missing required field: action' }),
        };
      }

      const { data, error } = await supabase.from('audit_logs').insert({
        action: body.action,
        entity_type: body.entity_type || null,
        entity_id: body.entity_id || null,
        performed_by: body.performed_by || 'system',
        metadata: body.metadata || {},
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
