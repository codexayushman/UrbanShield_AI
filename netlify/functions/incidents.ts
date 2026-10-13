import { createClient } from '@supabase/supabase-js';
import type { Handler } from '@netlify/functions';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
        body: JSON.stringify({ error: 'Database not configured. Running in demo mode.' }),
      };
    }

    const method = event.httpMethod;
    const pathParts = (event.path || '').split('/').filter(Boolean);
    const incidentId = pathParts[pathParts.length - 1];

    // GET /incidents — list with optional filters
    if (method === 'GET') {
      let query = supabase.from('incidents').select('*').order('reported_at', { ascending: false });
      const params = event.queryStringParameters || {};
      if (params.priority && params.priority !== 'all') query = query.eq('priority', params.priority);
      if (params.status && params.status !== 'all') query = query.eq('status', params.status);
      if (params.sector && params.sector !== 'all') query = query.eq('sector', params.sector);

      const { data, error } = await query;
      if (error) throw error;
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      };
    }

    // POST /incidents — create new incident
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (!body.title || !body.type || !body.lat || !body.lng) {
        return {
          statusCode: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Missing required fields: title, type, lat, lng' }),
        };
      }

      // Validate location within Chandigarh bounds
      if (body.lat < 30.61 || body.lat > 30.82 || body.lng < 76.65 || body.lng > 76.9) {
        return {
          statusCode: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Location must be within Chandigarh boundary (30.61-30.82 N, 76.65-76.90 E)' }),
        };
      }

      const incidentId = `INC-${Math.floor(Math.random() * 9000 + 1000)}`;
      const { data, error } = await supabase.from('incidents').insert({
        id: incidentId,
        type: body.type,
        title: body.title,
        description: body.description || '',
        sector: body.sector || 'Unknown',
        lat: body.lat,
        lng: body.lng,
        source: body.source || 'citizen_report',
        is_simulated: body.is_simulated ?? false,
        risk_score: body.risk_score || 0,
        risk_category: body.risk_category || 'Low',
        risk_reasons: JSON.stringify(body.risk_reasons || []),
        confidence: body.confidence || 50,
      }).select().single();

      if (error) throw error;

      // Write audit log
      await supabase.from('audit_logs').insert({
        action: `Incident ${incidentId} created`,
        entity_type: 'incident',
        entity_id: incidentId,
        performed_by: body.reported_by || 'citizen',
      });

      return {
        statusCode: 201,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      };
    }

    // PUT /incidents/:id — update status/priority
    if (method === 'PUT' && incidentId) {
      const body = JSON.parse(event.body || '{}');
      const updates: Record<string, any> = {};
      if (body.status) updates.status = body.status;
      if (body.priority) updates.priority = body.priority;
      if (body.assigned_unit) updates.assigned_unit = body.assigned_unit;

      const { data, error } = await supabase.from('incidents').update(updates).eq('id', incidentId).select().single();
      if (error) throw error;

      // Write audit log
      await supabase.from('audit_logs').insert({
        action: `Incident ${incidentId} updated: ${Object.keys(updates).join(', ')}`,
        entity_type: 'incident',
        entity_id: incidentId,
        performed_by: body.performed_by || 'operator',
      });

      return {
        statusCode: 200,
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
      body: JSON.stringify({ error: err.message || 'Internal server error' }),
    };
  }
};
