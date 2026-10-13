import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CHANDIGARH_CENTER, CHANDIGARH_DEFAULT_ZOOM, CHANDIGARH_BOUNDS, CHANDIGARH_BOUNDARY_POLYGON, CHANDIGARH_FACILITIES, DATA_ATTRIBUTIONS } from '@/config/chandigarh';
import { SAMPLE_INCIDENTS } from '@/data/incidents';
import { SAMPLE_SECTORS } from '@/data/sectors';
import { SAMPLE_CAMERAS, SAMPLE_PATROL_UNITS } from '@/data/cameras';
import type { GeoPoint } from '@/types';
import { MapPin } from 'lucide-react';

interface SafetyMapRef {
  map: L.Map;
  layers: { incidents: L.LayerGroup; facilities: L.LayerGroup; sectors: L.LayerGroup; cameras: L.LayerGroup; units: L.LayerGroup; boundary: L.LayerGroup };
}

interface SafetyMapComponentProps {
  showIncidents?: boolean;
  showFacilities?: boolean;
  showSectors?: boolean;
  showCameras?: boolean;
  showUnits?: boolean;
  showBoundary?: boolean;
  height?: string;
  className?: string;
}

export default function SafetyMapComponent({
  showIncidents = true,
  showFacilities = true,
  showSectors = false,
  showCameras = false,
  showUnits = false,
  showBoundary = true,
  height = '500px',
  className = '',
}: SafetyMapComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<SafetyMapRef | null>(null);
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

    const layers = {
      incidents: L.layerGroup().addTo(map),
      facilities: L.layerGroup().addTo(map),
      sectors: L.layerGroup().addTo(map),
      cameras: L.layerGroup().addTo(map),
      units: L.layerGroup().addTo(map),
      boundary: L.layerGroup().addTo(map),
    };

    mapRef.current = { map, layers };

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update layer visibility when props change
  useEffect(() => {
    const ref = mapRef.current;
    if (!ref) return;

    // Clear and rebuild layers
    ref.layers.incidents.clearLayers();
    ref.layers.facilities.clearLayers();
    ref.layers.sectors.clearLayers();
    ref.layers.cameras.clearLayers();
    ref.layers.units.clearLayers();
    ref.layers.boundary.clearLayers();

    if (showBoundary) {
      L.polygon(
        CHANDIGARH_BOUNDARY_POLYGON.map(p => [p.lat, p.lng]),
        { color: '#22d3ee', weight: 2, opacity: 0.5, fillColor: '#22d3ee', fillOpacity: 0.03, dashArray: '5, 5' }
      ).addTo(ref.layers.boundary);
    }

    if (showSectors) {
      const sectorColors: Record<string, string> = {
        'Low': '#22c55e',
        'Moderate': '#eab308',
        'High': '#f97316',
        'Very High': '#ef4444',
      };
      for (const s of SAMPLE_SECTORS) {
        L.polygon(
          s.polygon.map(p => [p.lat, p.lng]),
          { color: sectorColors[s.riskLevel] ?? '#22c55e', weight: 1, opacity: 0.6, fillColor: sectorColors[s.riskLevel] ?? '#22c55e', fillOpacity: 0.12 }
        ).bindPopup(`<strong>${s.name}</strong><br>Risk: ${s.riskLevel}<br>Incidents: ${s.incidentCount}`)
          .addTo(ref.layers.sectors);
      }
    }

    if (showIncidents) {
      const priorityIcons: Record<string, { color: string; icon: string }> = {
        urgent: { color: '#ef4444', icon: '!' },
        high: { color: '#f97316', icon: '!' },
        moderate: { color: '#eab308', icon: '•' },
        low: { color: '#22c55e', icon: '•' },
      };
      for (const inc of SAMPLE_INCIDENTS) {
        const cfg = priorityIcons[inc.priority] ?? priorityIcons.low;
        const marker = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background:${cfg.color};width:24px;height:24px;border-radius:50%;border:2px solid #ffffff;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${cfg.icon}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        L.marker([inc.location.lat, inc.location.lng], { icon: marker })
          .bindPopup(`<strong>${inc.title}</strong><br>${inc.sector} | ${inc.priority} priority<br>Risk: ${inc.riskCategory} (${inc.riskScore})<br>Status: ${inc.status.replace(/_/g, ' ')}<br><em style="color:#64748b">Sample data</em>`)
          .addTo(ref.layers.incidents);
      }
    }

    if (showFacilities) {
      const facIcons: Record<string, { color: string; label: string }> = {
        hospital: { color: '#ef4444', label: 'H' },
        police: { color: '#3b82f6', label: 'P' },
        fire: { color: '#f97316', label: 'F' },
        transit: { color: '#22d3ee', label: 'T' },
      };
      for (const f of CHANDIGARH_FACILITIES) {
        const cfg = facIcons[f.type] ?? facIcons.transit;
        const marker = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background:${cfg.color};width:22px;height:22px;border-radius:4px;border:2px solid #ffffff;display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${cfg.label}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        L.marker([f.location.lat, f.location.lng], { icon: marker })
          .bindPopup(`<strong>${f.name}</strong><br>Type: ${f.type}`)
          .addTo(ref.layers.facilities);
      }
    }

    if (showCameras) {
      for (const cam of SAMPLE_CAMERAS) {
        if (cam.status === 'normal') continue;
        const color = cam.status === 'flagged' ? '#ef4444' : cam.status === 'candidate_alert' ? '#eab308' : '#f97316';
        const marker = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background:${color};width:20px;height:20px;border-radius:50%;border:2px solid #ffffff;box-shadow:0 0 8px ${color}80;">${cam.status === 'flagged' ? '<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ' + color + ';animation:pulse-ring 2s infinite;"></div>' : ''}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        L.marker([cam.location.lat, cam.location.lng], { icon: marker })
          .bindPopup(`<strong>${cam.cameraName}</strong><br>${cam.detectionType.replace(/_/g, ' ')}<br>Confidence: ${cam.confidence}%<br><em style="color:#64748b">Simulated detection</em>`)
          .addTo(ref.layers.cameras);
      }
    }

    if (showUnits) {
      const unitIcons: Record<string, string> = {
        police: '#3b82f6',
        ambulance: '#ef4444',
        fire: '#f97316',
        municipal: '#22c55e',
      };
      for (const u of SAMPLE_PATROL_UNITS) {
        const color = unitIcons[u.type] ?? '#3b82f6';
        const marker = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background:${u.status === 'available' ? '#22c55e' : color};width:18px;height:18px;border-radius:3px;border:2px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        L.marker([u.location.lat, u.location.lng], { icon: marker })
          .bindPopup(`<strong>${u.unitName}</strong><br>Type: ${u.type}<br>Status: ${u.status.replace(/_/g, ' ')}`)
          .addTo(ref.layers.units);
      }
    }

    // Toggle layer visibility
    ref.map.removeLayer(ref.layers.incidents); if (showIncidents) ref.layers.incidents.addTo(ref.map);
    ref.map.removeLayer(ref.layers.facilities); if (showFacilities) ref.layers.facilities.addTo(ref.map);
    ref.map.removeLayer(ref.layers.sectors); if (showSectors) ref.layers.sectors.addTo(ref.map);
    ref.map.removeLayer(ref.layers.cameras); if (showCameras) ref.layers.cameras.addTo(ref.map);
    ref.map.removeLayer(ref.layers.units); if (showUnits) ref.layers.units.addTo(ref.map);
    ref.map.removeLayer(ref.layers.boundary); if (showBoundary) ref.layers.boundary.addTo(ref.map);

  }, [showIncidents, showFacilities, showSectors, showCameras, showUnits, showBoundary]);

  return (
    <div className="relative" style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} className={className} />
      {!mapActive && (
        <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center">
          <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-navy-600 bg-navy-900/90 px-4 py-2.5 text-xs font-medium text-slate-600 shadow-lg backdrop-blur-sm cursor-pointer hover:border-cyan-500/40"
               onClick={() => { if (mapRef.current) { mapRef.current.map.scrollWheelZoom.enable(); setMapActive(true); } }}>
            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            Click map to interact & zoom
          </div>
        </div>
      )}
    </div>
  );
}
