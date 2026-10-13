import type { SafeRoute, RouteSegment, GeoPoint, RiskCategory } from '@/types';
import { SAMPLE_INCIDENTS } from '@/data/incidents';
import { CHANDIGARH_FACILITIES, CHANDIGARH_CENTER } from '@/config/chandigarh';
import { getRiskCategory } from '@/config/scoring';

// Haversine distance in km
function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Known Chandigarh landmarks for geocoding user search queries
const LANDMARKS: { name: string; aliases: string[]; location: GeoPoint }[] = [
  { name: 'Sector 17 Plaza', aliases: ['sector 17', 's17', '17', 'plaza', 'sector 17 plaza', 'sec 17'], location: { lat: 30.7414, lng: 76.7689 } },
  { name: 'Sector 22', aliases: ['sector 22', 's22', '22', 'sec 22'], location: { lat: 30.7262, lng: 76.7672 } },
  { name: 'Sector 35', aliases: ['sector 35', 's35', '35', 'sec 35'], location: { lat: 30.7056, lng: 76.7647 } },
  { name: 'Sector 8', aliases: ['sector 8', 's8', '8', 'sec 8'], location: { lat: 30.7472, lng: 76.7758 } },
  { name: 'Sector 15', aliases: ['sector 15', 's15', '15', 'sec 15'], location: { lat: 30.7358, lng: 76.7722 } },
  { name: 'Sector 26', aliases: ['sector 26', 's26', '26', 'sec 26'], location: { lat: 30.7308, lng: 76.7858 } },
  { name: 'Sector 12', aliases: ['sector 12', 's12', '12', 'sec 12'], location: { lat: 30.7393, lng: 76.7825 } },
  { name: 'Sector 3', aliases: ['sector 3', 's3', '3', 'sec 3'], location: { lat: 30.7472, lng: 76.7758 } },
  { name: 'Sector 31', aliases: ['sector 31', 's31', '31', 'sec 31'], location: { lat: 30.7111, lng: 76.7722 } },
  { name: 'Sector 39', aliases: ['sector 39', 's39', '39', 'sec 39'], location: { lat: 30.7056, lng: 76.7722 } },
  { name: 'PGIMER', aliases: ['pgimer', 'pgi', 'hospital', 'pgimer hospital'], location: { lat: 30.7589, lng: 76.7893 } },
  { name: 'GMCH Sector 32', aliases: ['gmch', 'sector 32', 's32', '32', 'gmch 32', 'sec 32'], location: { lat: 30.7262, lng: 76.7833 } },
  { name: 'GMSH Sector 16', aliases: ['sector 16', 's16', '16', 'gmsh', 'government hospital', 'sec 16'], location: { lat: 30.7333, lng: 76.7794 } },
  { name: 'Elante Mall', aliases: ['elante', 'elante mall', 'mall'], location: { lat: 30.7036, lng: 76.8028 } },
  { name: 'ISBT Sector 17', aliases: ['isbt', 'bus stand', 'bus terminal', 'isbt 17'], location: { lat: 30.7414, lng: 76.7689 } },
  { name: 'Chandigarh Railway Station', aliases: ['railway', 'railway station', 'train station', 'crs'], location: { lat: 30.7019, lng: 76.8236 } },
  { name: 'Industrial Area', aliases: ['industrial', 'industrial area', 'ia'], location: { lat: 30.7036, lng: 76.8028 } },
  { name: 'Rock Garden', aliases: ['rock garden', 'rock', 'rg'], location: { lat: 30.7525, lng: 76.7694 } },
  { name: 'Sukhna Lake', aliases: ['sukhna', 'sukhna lake', 'lake', 'sl'], location: { lat: 30.7428, lng: 76.8189 } },
  { name: 'Panjab University', aliases: ['pu', 'panjab university', 'university', 'punjab university', 'puchd'], location: { lat: 30.7610, lng: 76.7647 } },
  { name: 'Sector 43', aliases: ['sector 43', 's43', '43', 'sec 43'], location: { lat: 30.7186, lng: 76.7694 } },
  { name: 'Sector 19', aliases: ['sector 19', 's19', '19', 'sec 19'], location: { lat: 30.7333, lng: 76.7722 } },
  { name: 'Sector 20', aliases: ['sector 20', 's20', '20', 'sec 20'], location: { lat: 30.7290, lng: 76.7730 } },
  { name: 'Sector 21', aliases: ['sector 21', 's21', '21', 'sec 21'], location: { lat: 30.7270, lng: 76.7700 } },
  { name: 'Sector 23', aliases: ['sector 23', 's23', '23', 'sec 23'], location: { lat: 30.7250, lng: 76.7650 } },
  { name: 'Sector 24', aliases: ['sector 24', 's24', '24', 'sec 24'], location: { lat: 30.7300, lng: 76.7820 } },
  { name: 'Sector 28', aliases: ['sector 28', 's28', '28', 'sec 28'], location: { lat: 30.7200, lng: 76.7800 } },
  { name: 'Sector 29', aliases: ['sector 29', 's29', '29', 'sec 29'], location: { lat: 30.7150, lng: 76.7800 } },
  { name: 'Sector 33', aliases: ['sector 33', 's33', '33', 'sec 33'], location: { lat: 30.7180, lng: 76.7760 } },
  { name: 'Sector 34', aliases: ['sector 34', 's34', '34', 'sec 34'], location: { lat: 30.7120, lng: 76.7720 } },
  { name: 'Sector 36', aliases: ['sector 36', 's36', '36', 'sec 36'], location: { lat: 30.7080, lng: 76.7700 } },
  { name: 'Sector 37', aliases: ['sector 37', 's37', '37', 'sec 37'], location: { lat: 30.7060, lng: 76.7690 } },
  { name: 'Sector 38', aliases: ['sector 38', 's38', '38', 'sec 38'], location: { lat: 30.7060, lng: 76.7710 } },
  { name: 'Sector 40', aliases: ['sector 40', 's40', '40', 'sec 40'], location: { lat: 30.7040, lng: 76.7690 } },
  { name: 'Sector 41', aliases: ['sector 41', 's41', '41', 'sec 41'], location: { lat: 30.7030, lng: 76.7680 } },
  { name: 'Sector 42', aliases: ['sector 42', 's42', '42', 'sec 42'], location: { lat: 30.7020, lng: 76.7670 } },
  { name: 'Sector 44', aliases: ['sector 44', 's44', '44', 'sec 44'], location: { lat: 30.7170, lng: 76.7680 } },
  { name: 'Sector 45', aliases: ['sector 45', 's45', '45', 'sec 45'], location: { lat: 30.7160, lng: 76.7670 } },
  { name: 'Sector 46', aliases: ['sector 46', 's46', '46', 'sec 46'], location: { lat: 30.7140, lng: 76.7660 } },
  { name: 'Sector 47', aliases: ['sector 47', 's47', '47', 'sec 47'], location: { lat: 30.7130, lng: 76.7650 } },
  { name: 'Sector 48', aliases: ['sector 48', 's48', '48', 'sec 48'], location: { lat: 30.7120, lng: 76.7640 } },
  { name: 'Sector 49', aliases: ['sector 49', 's49', '49', 'sec 49'], location: { lat: 30.7110, lng: 76.7630 } },
  { name: 'Sector 7', aliases: ['sector 7', 's7', '7', 'sec 7'], location: { lat: 30.7480, lng: 76.7760 } },
  { name: 'Sector 9', aliases: ['sector 9', 's9', '9', 'sec 9'], location: { lat: 30.7460, lng: 76.7770 } },
  { name: 'Sector 10', aliases: ['sector 10', 's10', '10', 'sec 10'], location: { lat: 30.7440, lng: 76.7760 } },
  { name: 'Sector 11', aliases: ['sector 11', 's11', '11', 'sec 11'], location: { lat: 30.7420, lng: 76.7780 } },
  { name: 'Sector 14', aliases: ['sector 14', 's14', '14', 'sec 14'], location: { lat: 30.7370, lng: 76.7730 } },
  { name: 'Sector 18', aliases: ['sector 18', 's18', '18', 'sec 18'], location: { lat: 30.7320, lng: 76.7710 } },
  { name: 'Airport', aliases: ['airport', 'chandigarh airport', 'ixc'], location: { lat: 30.6735, lng: 76.7875 } },
  { name: 'Sector 5', aliases: ['sector 5', 's5', '5', 'sec 5'], location: { lat: 30.7485, lng: 76.7745 } },
  { name: 'Sector 6', aliases: ['sector 6', 's6', '6', 'sec 6'], location: { lat: 30.7482, lng: 76.7765 } },
  { name: 'Sector 27', aliases: ['sector 27', 's27', '27', 'sec 27'], location: { lat: 30.7295, lng: 76.7845 } },
  { name: 'Sector 30', aliases: ['sector 30', 's30', '30', 'sec 30'], location: { lat: 30.7135, lng: 76.7750 } },
];

export interface GeocodeResult {
  found: boolean;
  location?: GeoPoint;
  name?: string;
  suggestions?: string[];
}

export function geocodeDestination(query: string): GeocodeResult {
  const lower = query.toLowerCase().trim();
  if (!lower) return { found: false, suggestions: [] };

  for (const landmark of LANDMARKS) {
    if (landmark.aliases.some(a => lower === a || lower === a.trim())) {
      return { found: true, location: landmark.location, name: landmark.name };
    }
  }

  for (const landmark of LANDMARKS) {
    if (landmark.aliases.some(a => lower.includes(a) || a.includes(lower))) {
      return { found: true, location: landmark.location, name: landmark.name };
    }
  }

  const coordMatch = lower.match(/(-?\d+\.?\d*)[, ]+(-?\d+\.?\d*)/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (lat >= 30.61 && lat <= 30.82 && lng >= 76.65 && lng <= 76.9) {
      return { found: true, location: { lat, lng }, name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})` };
    }
  }

  const suggestions = LANDMARKS.slice(0, 8).map(l => l.name);
  return { found: false, suggestions };
}

// Return matching suggestions as user types (supports short forms like "s17", "sec 22", "pgi")
export function suggestDestinations(query: string): string[] {
  const lower = query.toLowerCase().trim();
  if (!lower) return [];
  const matches: string[] = [];
  const seen = new Set<string>();
  for (const landmark of LANDMARKS) {
    if (matches.length >= 8) break;
    const isMatch = landmark.aliases.some(
      a => a === lower || a.startsWith(lower) || (lower.length >= 2 && a.includes(lower))
    );
    if (isMatch && !seen.has(landmark.name)) {
      seen.add(landmark.name);
      matches.push(landmark.name);
    }
  }
  return matches;
}

// Count incidents near a point within a radius (km)
function countNearbyIncidents(point: GeoPoint, radiusKm: number) {
  let count = 0;
  let maxSeverity = 0;
  const nearby: typeof SAMPLE_INCIDENTS = [];
  for (const inc of SAMPLE_INCIDENTS) {
    const d = distanceKm(point, inc.location);
    if (d <= radiusKm) {
      count++;
      nearby.push(inc);
      if (inc.riskScore > maxSeverity) maxSeverity = inc.riskScore;
    }
  }
  return { count, maxSeverity, nearby };
}

function nearestFacilityDistanceKm(point: GeoPoint): number {
  let min = Infinity;
  for (const f of CHANDIGARH_FACILITIES) {
    const d = distanceKm(point, f.location);
    if (d < min) min = d;
  }
  return min;
}

// --- OSRM routing (real road-following paths) ---

const OSRM_BASE = 'https://router.project-osrm.org';

interface OsrmRoute {
  coords: GeoPoint[];
  distanceKm: number;
  durationMin: number;
}

async function fetchOsrmRoute(
  origin: GeoPoint,
  dest: GeoPoint,
  profile: 'driving' | 'walking' = 'driving'
): Promise<OsrmRoute | null> {
  // OSRM expects lng,lat order
  const coordStr = `${origin.lng},${origin.lat};${dest.lng},${dest.lat}`;
  const url = `${OSRM_BASE}/route/v1/${profile}/${coordStr}?overview=full&geometries=geojson&alternatives=true`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    const coords: GeoPoint[] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => ({ lat, lng })
    );
    return {
      coords,
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
    };
  } catch {
    return null;
  }
}

async function fetchOsrmAlternatives(
  origin: GeoPoint,
  dest: GeoPoint,
  profile: 'driving' | 'walking' = 'driving'
): Promise<OsrmRoute[]> {
  const coordStr = `${origin.lng},${origin.lat};${dest.lng},${dest.lat}`;
  const url = `${OSRM_BASE}/route/v1/${profile}/${coordStr}?overview=full&geometries=geojson&alternatives=true&steps=false`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.routes || data.routes.length === 0) return [];

    return data.routes.map((route: { geometry: { coordinates: [number, number][] }; distance: number; duration: number }) => ({
      coords: route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => ({ lat, lng })
      ),
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
    }));
  } catch {
    return [];
  }
}

// Fallback: straight-line path for when OSRM is unreachable
function fallbackPath(origin: GeoPoint, dest: GeoPoint): GeoPoint[] {
  const dist = distanceKm(origin, dest);
  const numPoints = Math.max(8, Math.round(dist * 4));
  const points: GeoPoint[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    points.push({
      lat: origin.lat + (dest.lat - origin.lat) * t,
      lng: origin.lng + (dest.lng - origin.lng) * t,
    });
  }
  return points;
}

interface RouteCandidate {
  name: string;
  coords: GeoPoint[];
  distanceKm: number;
  durationMin: number;
  pathType: 'fastest' | 'alternative' | 'walking';
}

function scoreRouteCandidate(candidate: RouteCandidate): SafeRoute {
  const reasons: string[] = [];
  const incidentReasons: string[] = [];
  let maxRisk = 0;
  let totalNearbyIncidents = 0;

  const checkRadius = 0.4;

  // Sample every Nth point to avoid over-counting on dense road geometries
  const step = Math.max(1, Math.floor(candidate.coords.length / 30));
  for (let i = 0; i < candidate.coords.length; i += step) {
    const { count, maxSeverity } = countNearbyIncidents(candidate.coords[i], checkRadius);
    totalNearbyIncidents += count;
    if (maxSeverity > maxRisk) maxRisk = maxSeverity;
  }

  const incidentsPerKm = totalNearbyIncidents / Math.max(0.1, candidate.distanceKm);
  const incidentScore = Math.min(100, Math.round(incidentsPerKm * 25));

  const midPoint = candidate.coords[Math.floor(candidate.coords.length / 2)];
  const facilityDist = nearestFacilityDistanceKm(midPoint);
  const facilityScore = Math.min(100, Math.round(facilityDist * 15));

  let pathTypeScore = 50;
  let pathTypeLabel = '';
  if (candidate.pathType === 'fastest') {
    pathTypeScore = 35;
    pathTypeLabel = 'Fastest road route';
    reasons.push('Fastest route via road network — typically follows major roads with better lighting');
  } else if (candidate.pathType === 'alternative') {
    pathTypeScore = 45;
    pathTypeLabel = 'Alternative road route';
    reasons.push('Alternative road route — may pass through different sectors');
  } else {
    pathTypeScore = 60;
    pathTypeLabel = 'Walking route';
    reasons.push('Walking route — uses paths and inner roads, may have reduced lighting at night');
  }

  const compositeScore = Math.round(
    incidentScore * 0.40 + pathTypeScore * 0.25 + facilityScore * 0.15 + maxRisk * 0.20
  );

  const category = getRiskCategory(compositeScore);

  if (totalNearbyIncidents === 0) {
    incidentReasons.push('No active incidents detected near this route');
  } else {
    incidentReasons.push(`${totalNearbyIncidents} incident(s) detected within ${checkRadius * 1000}m of the route`);
    if (maxRisk >= 60) incidentReasons.push(`High-severity incident (score ${maxRisk}) detected near the path`);
  }

  if (facilityDist < 1) {
    reasons.push(`Emergency facility within ${facilityDist.toFixed(1)} km of route midpoint`);
  } else if (facilityDist > 3) {
    reasons.push(`Nearest facility is ${facilityDist.toFixed(1)} km away — reduced emergency access`);
  } else {
    reasons.push(`Nearest facility is ${facilityDist.toFixed(1)} km from route midpoint`);
  }

  if (incidentsPerKm > 2) {
    reasons.push(`High incident density: ${incidentsPerKm.toFixed(1)} per km`);
  } else if (incidentsPerKm < 0.5) {
    reasons.push('Low incident density along this route');
  }

  const allReasons = [...reasons, ...incidentReasons];
  const estimatedMinutes = Math.max(3, Math.round(candidate.durationMin || (candidate.distanceKm / 25) * 60));

  const indicators = [
    `Incident density (${incidentsPerKm < 0.5 ? 'low' : incidentsPerKm < 2 ? 'moderate' : 'high'})`,
    `Path type (${pathTypeLabel})`,
    `Facility proximity (${facilityDist < 1 ? 'good' : facilityDist < 3 ? 'moderate' : 'distant'})`,
  ];

  const segment: RouteSegment = {
    name: candidate.name,
    coords: candidate.coords,
    riskScore: compositeScore,
    riskCategory: category,
    riskReasons: allReasons,
    distanceKm: Math.round(candidate.distanceKm * 10) / 10,
    estimatedMinutes,
  };

  return {
    id: `ROUTE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    name: candidate.name,
    segments: [segment],
    totalDistanceKm: segment.distanceKm,
    totalMinutes: estimatedMinutes,
    avgRiskScore: compositeScore,
    riskCategory: category,
    indicators,
    isSimulated: true,
  };
}

export interface RouteSearchResult {
  routes: SafeRoute[];
  recommendedRoute: SafeRoute;
  destination: GeocodeResult;
  origin: GeoPoint;
  isSimulated: boolean;
}

// Synchronous fallback (used by pages that haven't been converted to async yet)
export function searchSafeRoutes(
  query: string,
  origin: GeoPoint = CHANDIGARH_CENTER
): RouteSearchResult | null {
  const destination = geocodeDestination(query);
  if (!destination.found || !destination.location) {
    return null;
  }

  const directDist = distanceKm(origin, destination.location);
  const coords = fallbackPath(origin, destination.location);

  const candidate: RouteCandidate = {
    name: 'Route (offline estimate)',
    coords,
    distanceKm: directDist,
    durationMin: (directDist / 25) * 60,
    pathType: 'fastest',
  };

  const route = scoreRouteCandidate(candidate);

  return {
    routes: [route],
    recommendedRoute: route,
    destination,
    origin,
    isSimulated: true,
  };
}

// Async version that uses OSRM for real road-following routes
export async function searchSafeRoutesAsync(
  query: string,
  origin: GeoPoint = CHANDIGARH_CENTER
): Promise<RouteSearchResult | null> {
  const destination = geocodeDestination(query);
  if (!destination.found || !destination.location) {
    return null;
  }

  const osrmRoutes = await fetchOsrmAlternatives(origin, destination.location, 'driving');

  let candidates: RouteCandidate[];

  if (osrmRoutes.length > 0) {
    candidates = osrmRoutes.map((r, idx) => ({
      name: idx === 0 ? 'Fastest route (road network)' : `Alternative route ${idx}`,
      coords: r.coords,
      distanceKm: r.distanceKm,
      durationMin: r.durationMin,
      pathType: idx === 0 ? 'fastest' as const : 'alternative' as const,
    }));

    // Also fetch a walking route as an additional option
    const walking = await fetchOsrmRoute(origin, destination.location, 'walking');
    if (walking && walking.coords.length > 1) {
      candidates.push({
        name: 'Walking route (paths & inner roads)',
        coords: walking.coords,
        distanceKm: walking.distanceKm,
        durationMin: walking.durationMin,
        pathType: 'walking' as const,
      });
    }
  } else {
    // Fallback to straight-line if OSRM is unreachable
    const directDist = distanceKm(origin, destination.location);
    candidates = [{
      name: 'Route (offline estimate)',
      coords: fallbackPath(origin, destination.location),
      distanceKm: directDist,
      durationMin: (directDist / 25) * 60,
      pathType: 'fastest',
    }];
  }

  const scoredRoutes = candidates.map(scoreRouteCandidate);
  scoredRoutes.sort((a, b) => a.avgRiskScore - b.avgRiskScore);

  return {
    routes: scoredRoutes,
    recommendedRoute: scoredRoutes[0],
    destination,
    origin,
    isSimulated: true,
  };
}
