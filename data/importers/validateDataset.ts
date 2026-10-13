/**
 * Data Import Module — UrbanShield AI
 *
 * Validates and imports GeoJSON, CSV, and JSON datasets for Chandigarh.
 * Validates: source, date, location, licence, and geographic coverage.
 *
 * This is a client-side utility module. In production, heavy imports should
 * go through a Netlify Function or edge function with proper auth.
 */

export interface DatasetValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  recordCount: number;
  source?: string;
  dateField?: string;
  licence?: string;
  coverage?: string;
}

export interface ImportableRecord {
  [key: string]: unknown;
}

// Chandigarh bounding box for geographic validation
const CHD_BOUNDS = {
  latMin: 30.61, latMax: 30.82,
  lngMin: 76.65, lngMax: 76.90,
};

export function validateDataset(
  records: ImportableRecord[],
  options: { source?: string; licence?: string; dateField?: string; latField?: string; lngField?: string }
): DatasetValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (records.length === 0) {
    errors.push('Dataset contains no records');
    return { valid: false, errors, warnings, recordCount: 0 };
  }

  // Validate source
  if (!options.source) {
    warnings.push('No source specified — data origin is unknown');
  }

  // Validate licence
  if (!options.licence) {
    warnings.push('No licence specified — usage rights are unclear');
  }

  // Validate date field
  if (options.dateField) {
    const hasDate = records.some(r => r[options.dateField!]);
    if (!hasDate) {
      errors.push(`Date field "${options.dateField}" not found in any record`);
    }
  } else {
    warnings.push('No date field specified — temporal validity cannot be verified');
  }

  // Validate geographic coverage
  const latField = options.latField || 'lat';
  const lngField = options.lngField || 'lng';
  let inBounds = 0;
  let outOfBounds = 0;
  let missingGeo = 0;

  for (const r of records) {
    const lat = Number(r[latField]);
    const lng = Number(r[lngField]);
    if (isNaN(lat) || isNaN(lng)) {
      missingGeo++;
      continue;
    }
    if (lat >= CHD_BOUNDS.latMin && lat <= CHD_BOUNDS.latMax &&
        lng >= CHD_BOUNDS.lngMin && lng <= CHD_BOUNDS.lngMax) {
      inBounds++;
    } else {
      outOfBounds++;
    }
  }

  if (missingGeo === records.length) {
    warnings.push('No valid geographic coordinates found in dataset');
  } else if (outOfBounds > inBounds) {
    warnings.push(`${outOfBounds} records are outside Chandigarh bounds — may not be relevant`);
  }

  if (inBounds === 0 && missingGeo < records.length) {
    errors.push('All records with coordinates are outside Chandigarh geographic bounds');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    recordCount: records.length,
    source: options.source,
    dateField: options.dateField,
    licence: options.licence,
    coverage: 'Chandigarh, India',
  };
}

export function parseCSV(text: string): ImportableRecord[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const records: ImportableRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const record: ImportableRecord = {};
    for (let j = 0; j < headers.length && j < values.length; j++) {
      record[headers[j]] = values[j]?.trim();
    }
    records.push(record);
  }

  return records;
}

export function parseJSON(text: string): ImportableRecord[] {
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) return parsed;
  if (parsed.features && Array.isArray(parsed.features)) {
    // GeoJSON FeatureCollection
    return parsed.features.map((f: any) => ({
      ...f.properties,
      lat: f.geometry?.coordinates?.[1],
      lng: f.geometry?.coordinates?.[0],
    }));
  }
  if (parsed.data && Array.isArray(parsed.data)) return parsed.data;
  return [parsed];
}

export function parseGeoJSON(text: string): ImportableRecord[] {
  const geo = JSON.parse(text);
  if (geo.type === 'FeatureCollection' && Array.isArray(geo.features)) {
    return geo.features.map((f: any) => ({
      ...f.properties,
      lat: f.geometry?.coordinates?.[1],
      lng: f.geometry?.coordinates?.[0],
      geometry_type: f.geometry?.type,
    }));
  }
  if (geo.type === 'Feature') {
    return [{
      ...geo.properties,
      lat: geo.geometry?.coordinates?.[1],
      lng: geo.geometry?.coordinates?.[0],
    }];
  }
  return [];
}

export function detectFormat(fileName: string): 'geojson' | 'csv' | 'json' | 'unknown' {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.geojson') || lower.endsWith('.topojson')) return 'geojson';
  if (lower.endsWith('.csv')) return 'csv';
  if (lower.endsWith('.json')) return 'json';
  return 'unknown';
}

export async function importFile(file: File, options: {
  source?: string;
  licence?: string;
  dateField?: string;
  latField?: string;
  lngField?: string;
}): Promise<{ records: ImportableRecord[]; validation: DatasetValidationResult }> {
  const format = detectFormat(file.name);
  if (format === 'unknown') {
    return {
      records: [],
      validation: { valid: false, errors: ['Unsupported file format'], warnings: [], recordCount: 0 },
    };
  }

  const text = await file.text();
  let records: ImportableRecord[] = [];

  try {
    switch (format) {
      case 'csv': records = parseCSV(text); break;
      case 'json': records = parseJSON(text); break;
      case 'geojson': records = parseGeoJSON(text); break;
    }
  } catch (err: any) {
    return {
      records: [],
      validation: { valid: false, errors: [`Parse error: ${err.message}`], warnings: [], recordCount: 0 },
    };
  }

  const validation = validateDataset(records, options);
  return { records, validation };
}
