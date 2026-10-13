import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CHANDIGARH_CENTER, CHANDIGARH_DEFAULT_ZOOM, CHANDIGARH_BOUNDS, DATA_ATTRIBUTIONS } from '@/config/chandigarh';
import type { GeoPoint } from '@/types';
import { MapPin } from 'lucide-react';

interface RouteMapProps {
  origin: GeoPoint;
  destination: GeoPoint;
  destinationName: string;
  routeCoords: GeoPoint[];
  alternativeRoutes?: GeoPoint[][];
  height?: string;
}

export default function RouteMap({
  origin,
  destination,
  destinationName,
  routeCoords,
  alternativeRoutes = [],
  height = '320px',
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapActive, setMapActive] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [CHANDIGARH_CENTER.lat, CHANDIGARH_CENTER.lng],
      zoom: CHANDIGARH_DEFAULT_ZOOM,
      maxBounds: [
        [CHANDIGARH_BOUNDS.southWest.lat, CHANDIGARH_BOUNDS.southWest.lng],
        [CHANDIGARH_BOUNDS.northEast.lat, CHANDIGARH_BOUNDS.northEast.lng],
      ],
      maxBoundsViscosity: 0.8,
      minZoom: 11,
      maxZoom: 18,
      attributionControl: true,
      scrollWheelZoom: false,
    });

    map.on('click', () => { map.scrollWheelZoom.enable(); setMapActive(true); });
    map.on('mouseout', () => { map.scrollWheelZoom.disable(); setMapActive(false); });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: DATA_ATTRIBUTIONS.osm,
      maxZoom: 19,
    }).addTo(map);

    routeLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
      routeLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = routeLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // Draw alternative routes (dashed, muted)
    alternativeRoutes.forEach((coords, idx) => {
      if (coords.length < 2) return;
      L.polyline(
        coords.map(p => [p.lat, p.lng]),
        {
          color: '#64748b',
          weight: 3,
          opacity: 0.4,
          dashArray: '8, 6',
        }
      ).addTo(layer);
    });

    // Draw recommended route (solid, cyan)
    if (routeCoords.length >= 2) {
      L.polyline(
        routeCoords.map(p => [p.lat, p.lng]),
        {
          color: '#22d3ee',
          weight: 5,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round',
        }
      ).addTo(layer);
    }

    // Origin marker (green circle with "A")
    const originIcon = L.divIcon({
      className: 'route-marker',
      html: `<div style="background:#22c55e;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);"><span style="transform:rotate(45deg);color:white;font-size:13px;font-weight:bold;">A</span></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
    L.marker([origin.lat, origin.lng], { icon: originIcon })
      .bindPopup('<strong>Your Location</strong><br>Chandigarh Center')
      .addTo(layer);

    // Destination marker (red circle with "B")
    const destIcon = L.divIcon({
      className: 'route-marker',
      html: `<div style="background:#ef4444;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);"><span style="transform:rotate(45deg);color:white;font-size:13px;font-weight:bold;">B</span></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
    L.marker([destination.lat, destination.lng], { icon: destIcon })
      .bindPopup(`<strong>${destinationName}</strong><br>Destination`)
      .addTo(layer);

    // Fit map bounds to show entire route
    const allPoints = [origin, destination, ...routeCoords];
    const bounds = L.latLngBounds(allPoints.map(p => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [50, 50] });
    setTimeout(() => map.invalidateSize(), 50);
  }, [origin, destination, destinationName, routeCoords, alternativeRoutes]);

  return (
    <div className="relative" style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      {!mapActive && (
        <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center">
          <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-navy-600 bg-navy-900/90 px-4 py-2.5 text-xs font-medium text-slate-600 shadow-lg backdrop-blur-sm cursor-pointer hover:border-cyan-500/40"
               onClick={() => { if (mapRef.current) { mapRef.current.scrollWheelZoom.enable(); setMapActive(true); } }}>
            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            Click map to interact & zoom
          </div>
        </div>
      )}
    </div>
  );
}
