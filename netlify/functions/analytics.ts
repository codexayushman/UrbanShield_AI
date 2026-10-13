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
        body: JSON.stringify({ error: 'Database not configured.' }),
      };
    }

    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const range = params.range || 'all';

      let query = supabase.from('incidents').select('reported_at, type, sector, priority, status');
      if (range === '2025') {
        query = query.gte('reported_at', '2025-01-01').lt('reported_at', '2026-01-01');
      } else if (range === '2024') {
        query = query.gte('reported_at', '2024-01-01').lt('reported_at', '2025-01-01');
      }

      const { data, error } = await query;
      if (error) throw error;

      // Aggregate by month
      const monthlyTrends: Record<string, number> = {};
      const typeBreakdown: Record<string, number> = {};
      const sectorCounts: Record<string, number> = {};

      for (const inc of data || []) {
        const month = (inc.reported_at || '').slice(0, 7);
        monthlyTrends[month] = (monthlyTrends[month] || 0) + 1;
        typeBreakdown[inc.type] = (typeBreakdown[inc.type] || 0) + 1;
        sectorCounts[inc.sector] = (sectorCounts[inc.sector] || 0) + 1;
      }

      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total: data?.length || 0,
          monthlyTrends,
          typeBreakdown,
          sectorCounts,
          range,
        }),
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
