import { useState, useRef, useEffect } from 'react';
import FadeIn from '@/components/FadeIn';
import { RiskBadge } from '@/components/RiskBadge';
import RouteMap from '@/components/RouteMap';
import { searchSafeRoutesAsync, geocodeDestination, suggestDestinations, type RouteSearchResult } from '@/services/routeService';
import {
  MapPin,
  Search,
  Loader2,
  X,
  AlertTriangle,
  Navigation,
  Clock,
  Ruler,
  TrendingDown,
  Shield,
  ChevronRight,
  Play,
  ExternalLink,
} from 'lucide-react';
import type { PageKey } from '@/types';

interface RouteSearchBarProps {
  onNavigate: (page: PageKey) => void;
}

export default function RouteSearchBar({ onNavigate }: RouteSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<RouteSearchResult | null>(null);
  const [searchError, setSearchError] = useState('');
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
    setSearchResult(null);

    try {
      const result = await searchSafeRoutesAsync(searchQuery);
      if (!result) {
        const geo = geocodeDestination(searchQuery);
        setSearchError(
          geo.suggestions && geo.suggestions.length > 0
            ? `Destination not found. Try: ${geo.suggestions.slice(0, 5).join(', ')}`
            : 'Destination not found. Try searching for a sector (e.g. "Sector 17", "S17"), landmark (e.g. "PGIMER", "PGI", "Elante Mall"), or coordinates (lat, lng).'
        );
      } else {
        setSearchResult(result);
      }
    } catch {
      setSearchError('Unable to fetch route directions. Please try again.');
    }
    setIsSearching(false);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResult(null);
    setSearchError('');
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

  return (
    <FadeIn>
      <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Navigation className="h-4 w-4 text-cyan-400" /> Find Safe Route
        </h2>

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
                    onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(s); }}
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
        {!searchResult && !isSearching && !searchError && !showSuggestions && (
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

        {/* Loading state */}
        {isSearching && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-cyan-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Fetching road directions and analyzing safety...</span>
            </div>
            <div className="space-y-1.5">
              {['Fetching route from OpenStreetMap', 'Checking nearby incidents along route', 'Evaluating lighting and facility proximity', 'Selecting safest route recommendation'].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400/60" />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result summary */}
        {searchResult && (
          <div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2">
                <Shield className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800">AI Route Recommendation</h3>
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
                    Lowest risk of {searchResult.routes.length} routes
                  </span>
                </div>
              </div>
              <RiskBadge category={searchResult.recommendedRoute.riskCategory} score={searchResult.recommendedRoute.avgRiskScore} />
            </div>

            {/* Route map with directions */}
            <div className="mt-4">
              <RouteMap
                origin={searchResult.origin}
                destination={searchResult.destination.location!}
                destinationName={searchResult.destination.name!}
                routeCoords={searchResult.recommendedRoute.segments[0].coords}
                alternativeRoutes={searchResult.routes.slice(1).map(r => r.segments[0].coords)}
                height="320px"
              />
            </div>

            {/* Route options */}
            {searchResult.routes.length > 1 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-xs font-medium text-slate-600">{searchResult.routes.length} routes analyzed — showing safest in cyan, alternatives in gray</p>
              </div>
            )}

            {/* Actions */}
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
              <button
                onClick={() => onNavigate('safe_routes')}
                className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300"
              >
                View full route details <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
