import { useState, useRef, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/FadeIn';
import { RiskBadge } from '@/components/RiskBadge';
import { DataSourceBanner } from '@/components/DataLabel';
import SafetyMapComponent from '@/components/SafetyMapComponent';
import { SAMPLE_ROUTES } from '@/data/routes';
import { searchSafeRoutesAsync, geocodeDestination, suggestDestinations, type RouteSearchResult } from '@/services/routeService';
import RouteMap from '@/components/RouteMap';
import {
  Route as RouteIcon,
  MapPin,
  Clock,
  Ruler,
  Info,
  AlertTriangle,
  Search,
  Navigation,
  Loader2,
  CheckCircle2,
  Shield,
  TrendingDown,
  X,
  Play,
  ExternalLink,
} from 'lucide-react';
import type { SafeRoute } from '@/types';

export default function SafeRoutes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<RouteSearchResult | null>(null);
  const [searchError, setSearchError] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<SafeRoute>(SAMPLE_ROUTES[0]);
  const [showResults, setShowResults] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      const results = suggestDestinations(searchQuery);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    setIsSearching(true);
    setSearchError('');
    setShowResults(false);

    try {
      const result = await searchSafeRoutesAsync(searchQuery);
      if (!result) {
        const geo = geocodeDestination(searchQuery);
        setSearchError(
          geo.suggestions && geo.suggestions.length > 0
            ? `Destination not found. Try: ${geo.suggestions.slice(0, 5).join(', ')}`
            : 'Destination not found. Try searching for a sector (e.g. "Sector 17"), landmark (e.g. "PGIMER", "Elante Mall"), or coordinates (lat, lng).'
        );
        setIsSearching(false);
        return;
      }
      setSearchResult(result);
      setSelectedRoute(result.recommendedRoute);
      setShowResults(true);
    } catch {
      setSearchError('Unable to fetch route directions. Please try again.');
    }
    setIsSearching(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResult(null);
    setShowResults(false);
    setSearchError('');
    setSelectedRoute(SAMPLE_ROUTES[0]);
    setNavigating(false);
  };

  const handleStartNavigation = () => {
    if (!searchResult) return;
    setNavigating(true);
    const dest = searchResult.destination.location!;
    const origin = searchResult.origin;
    const url = `https://www.openstreetmap.org/directions?from=${origin.lat},${origin.lng}&to=${dest.lat},${dest.lng}`;
    window.open(url, '_blank');
  };

  const popularDestinations = ['Sector 17 Plaza', 'PGIMER', 'Elante Mall', 'Sector 35', 'Sukhna Lake', 'Panjab University'];

  const allRoutes = showResults && searchResult ? searchResult.routes : SAMPLE_ROUTES;
  const routeLabel = showResults ? 'AI-Analyzed Routes' : 'Available Routes';

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Safe Routes"
        description="Enter your destination to analyze threat roads and get the safest route recommendation across Chandigarh."
        icon={<RouteIcon className="h-5 w-5 text-cyan-400" />}
        dataBanner="Route risk scores are SAMPLE estimates using demo thresholds (Low 0-29, Moderate 30-59, High 60-79, Very High 80-100). No route is guaranteed safe. Roads from OpenStreetMap."
      />

      {/* Search bar */}
      <FadeIn>
        <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                onBlur={() => { blurTimeoutRef.current = setTimeout(() => setShowSuggestions(false), 150); }}
                placeholder="Enter destination (e.g. S17, Sec 22, PGI, Elante, or lat,lng)"
                className="w-full rounded-lg border border-navy-600 bg-navy-800 py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Autocomplete dropdown */}
              {showSuggestions && (
                <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border border-navy-600 bg-navy-900 shadow-xl">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onMouseDown={(e) => { e.preventDefault(); setSearchQuery(s); setShowSuggestions(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-navy-800 hover:text-cyan-400"
                    >
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-cyan-400/60" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 px-5 py-2.5 text-sm font-semibold text-cyan-400 transition-all hover:bg-cyan-500/30 disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {isSearching ? 'Analyzing...' : 'Find Safest Route'}
            </button>
          </div>

          {/* Popular destinations */}
          {!showResults && !isSearching && !showSuggestions && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Popular:</span>
              {popularDestinations.map(dest => (
                <button
                  key={dest}
                  onClick={() => { setSearchQuery(dest); }}
                  className="rounded-lg border border-navy-600 bg-navy-800 px-2.5 py-1 text-xs text-slate-500 hover:border-cyan-500/30 hover:text-cyan-400"
                >
                  {dest}
                </button>
              ))}
            </div>
          )}

          {/* Search error */}
          {searchError && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Search loading state */}
          {isSearching && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-cyan-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing route threats and incident patterns...</span>
              </div>
              <div className="space-y-1.5">
                {['Checking nearby incidents along route corridors', 'Evaluating lighting and facility proximity', 'Comparing multiple path options', 'Selecting safest route recommendation'].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400/60" />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </FadeIn>

      {/* AI Recommendation banner */}
      {showResults && searchResult && (
        <FadeIn delay={0.1}>
          <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2">
                <Shield className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-800">AI Route Recommendation</h2>
                  <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[9px] font-medium text-cyan-400">SIMULATED</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Destination: <span className="font-medium text-slate-800">{searchResult.destination.name}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Recommended: <span className="text-cyan-400">{searchResult.recommendedRoute.name}</span>
                  {' — '}Risk score {searchResult.recommendedRoute.avgRiskScore} ({searchResult.recommendedRoute.riskCategory})
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Ruler className="h-3 w-3 text-cyan-400" />
                    {searchResult.recommendedRoute.totalDistanceKm} km
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <Clock className="h-3 w-3 text-cyan-400" />
                    {searchResult.recommendedRoute.totalMinutes} min
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <TrendingDown className="h-3 w-3 text-green-400" />
                    Lowest risk of {searchResult.routes.length} routes analyzed
                  </span>
                </div>
              </div>
              <RiskBadge category={searchResult.recommendedRoute.riskCategory} score={searchResult.recommendedRoute.avgRiskScore} />
            </div>

            {/* Start Navigation button */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={handleStartNavigation}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                  navigating
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'bg-cyan-500 border border-cyan-400 text-white hover:scale-105 shadow-lg shadow-cyan-500/30'
                }`}
              >
                <Play className="h-4 w-4" />
                {navigating ? 'Navigation Started' : 'Start Navigation'}
              </button>
              {navigating && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <ExternalLink className="h-3 w-3" />
                  Opened in OpenStreetMap
                </span>
              )}
            </div>
          </div>
        </FadeIn>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Route list */}
        <FadeIn className="lg:col-span-1">
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              {showResults ? <Navigation className="h-4 w-4 text-cyan-400" /> : <RouteIcon className="h-4 w-4 text-cyan-400" />}
              {routeLabel}
              {showResults && searchResult && (
                <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[9px] text-cyan-400">{searchResult.routes.length} found</span>
              )}
            </h2>
            <div className="space-y-2">
              {allRoutes.map((r, idx) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoute(r)}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    selectedRoute.id === r.id
                      ? 'border-cyan-500/40 bg-cyan-500/5'
                      : 'border-navy-700 bg-navy-800 hover:border-navy-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {showResults && idx === 0 && (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-400" />
                      )}
                      <span className="truncate text-sm font-medium text-slate-600">{r.name}</span>
                    </div>
                    {r.isSimulated && <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[9px] text-slate-500 shrink-0">SAMPLE</span>}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Ruler className="h-3 w-3" /> {r.totalDistanceKm} km</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {r.totalMinutes} min</span>
                  </div>
                  <div className="mt-2">
                    <RiskBadge category={r.riskCategory} score={r.avgRiskScore} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Route detail */}
        <FadeIn delay={0.05} className="lg:col-span-2">
          <div className="space-y-4">
            {/* Map */}
            <div className="rounded-xl border border-navy-700 bg-navy-850 p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-800">{selectedRoute.name}</h2>
              {showResults && searchResult ? (
                <RouteMap
                  origin={searchResult.origin}
                  destination={searchResult.destination.location!}
                  destinationName={searchResult.destination.name!}
                  routeCoords={selectedRoute.segments[0].coords}
                  alternativeRoutes={searchResult.routes.filter(r => r.id !== selectedRoute.id).map(r => r.segments[0].coords)}
                  height="300px"
                />
              ) : (
                <SafetyMapComponent
                  showIncidents={true}
                  showFacilities={true}
                  showSectors={false}
                  showBoundary={true}
                  height="300px"
                />
              )}
            </div>

            {/* Route comparison */}
            <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-800">Route Analysis</h2>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-navy-800 p-3 text-center">
                  <Ruler className="mx-auto mb-1 h-4 w-4 text-cyan-400" />
                  <p className="text-2xl font-bold text-slate-800">{selectedRoute.totalDistanceKm}</p>
                  <p className="text-xs text-slate-500">km total</p>
                </div>
                <div className="rounded-lg bg-navy-800 p-3 text-center">
                  <Clock className="mx-auto mb-1 h-4 w-4 text-cyan-400" />
                  <p className="text-2xl font-bold text-slate-800">{selectedRoute.totalMinutes}</p>
                  <p className="text-xs text-slate-500">minutes est.</p>
                </div>
                <div className="rounded-lg bg-navy-800 p-3 text-center">
                  <AlertTriangle className="mx-auto mb-1 h-4 w-4 text-cyan-400" />
                  <p className="text-2xl font-bold text-slate-800">{selectedRoute.avgRiskScore}</p>
                  <p className="text-xs text-slate-500">avg risk score</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-medium text-slate-600">Risk Indicators Used</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedRoute.indicators.map(ind => (
                    <span key={ind} className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-1.5 text-xs text-slate-500">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="mb-2 text-sm font-medium text-slate-600">Segment Breakdown</h3>
                <div className="space-y-2">
                  {selectedRoute.segments.map((seg, i) => (
                    <div key={i} className="rounded-lg border border-navy-700 bg-navy-800 p-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="h-3.5 w-3.5 text-cyan-400" /> {seg.name}
                        </span>
                        <RiskBadge category={seg.riskCategory} score={seg.riskScore} />
                      </div>
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
                        <span>{seg.distanceKm} km</span>
                        <span>{seg.estimatedMinutes} min</span>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {seg.riskReasons.map((r, j) => (
                          <li key={j} className="flex items-start gap-1.5 text-xs text-slate-500">
                            <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" /> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Route comparison table */}
              {showResults && searchResult && searchResult.routes.length > 1 && (
                <div className="mt-4">
                  <h3 className="mb-2 text-sm font-medium text-slate-600">Route Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-navy-600 text-slate-500">
                          <th className="py-2 pr-3 text-left font-medium">Route</th>
                          <th className="py-2 px-3 text-right font-medium">Distance</th>
                          <th className="py-2 px-3 text-right font-medium">Time</th>
                          <th className="py-2 px-3 text-right font-medium">Risk</th>
                          <th className="py-2 pl-3 text-left font-medium">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResult.routes.map((r, idx) => (
                          <tr
                            key={r.id}
                            className={`border-b border-navy-700 ${idx === 0 ? 'bg-green-500/5' : ''}`}
                          >
                            <td className="py-2 pr-3 text-slate-600">
                              {idx === 0 && <CheckCircle2 className="mr-1 inline h-3 w-3 text-green-400" />}
                              {r.name}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-500">{r.totalDistanceKm} km</td>
                            <td className="py-2 px-3 text-right text-slate-500">{r.totalMinutes} min</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-800">{r.avgRiskScore}</td>
                            <td className="py-2 pl-3"><RiskBadge category={r.riskCategory} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <DataSourceBanner message="Route risk scores are illustrative demo values generated by analyzing sample incident proximity. They are NOT predictions and do not guarantee safety. Real implementation would integrate live incident data, OSM road routing, and validated safety indicators." />
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
