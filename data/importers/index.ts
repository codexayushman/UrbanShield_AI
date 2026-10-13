/**
 * Data Import Module — UrbanShield AI
 *
 * Validates and imports GeoJSON, CSV, and JSON datasets for Chandigarh.
 * Validates: source, date, location, licence, and geographic coverage.
 *
 * This module re-exports the client-side implementation. For server-side
 * bulk imports, use the Netlify Functions endpoints instead.
 */

export {
  validateDataset,
  parseCSV,
  parseJSON,
  parseGeoJSON,
  detectFormat,
  importFile,
} from './validateDataset';

export type {
  DatasetValidationResult,
  ImportableRecord,
} from './validateDataset';
