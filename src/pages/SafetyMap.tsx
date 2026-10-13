import { useState } from 'react';
import SafetyMapComponent from '@/components/SafetyMapComponent';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/FadeIn';
import { DataSourceBanner } from '@/components/DataLabel';
import { Map as MapIcon, AlertTriangle, Building2, Camera, Users, Grid3x3 } from 'lucide-react';

export default function SafetyMap() {
  const [showIncidents, setShowIncidents] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showSectors, setShowSectors] = useState(false);
  const [showCameras, setShowCameras] = useState(false);
  const [showUnits, setShowUnits] = useState(false);

  const layers = [
    { key: 'incidents', label: 'Incidents', icon: AlertTriangle, state: showIncidents, setState: setShowIncidents, color: 'text-red-400' },
    { key: 'facilities', label: 'Facilities', icon: Building2, state: showFacilities, setState: setShowFacilities, color: 'text-cyan-400' },
    { key: 'sectors', label: 'Sector Risk', icon: Grid3x3, state: showSectors, setState: setShowSectors, color: 'text-yellow-400' },
    { key: 'cameras', label: 'Cameras', icon: Camera, state: showCameras, setState: setShowCameras, color: 'text-orange-400' },
    { key: 'units', label: 'Patrol Units', icon: Users, state: showUnits, setState: setShowUnits, color: 'text-blue-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Chandigarh Safety Map"
        description="Interactive map of Chandigarh with incidents, facilities, sector risk overlays, cameras, and patrol units"
        icon={<MapIcon className="h-5 w-5 text-cyan-400" />}
        dataBanner="Map data from OpenStreetMap. Sector boundaries are approximate for demo — production would use DataMeet Municipal Spatial Data. All incidents are SAMPLE data."
      />

      <FadeIn>
        <div className="grid gap-4 lg:grid-cols-4">
          {/* Layer controls */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-navy-700 bg-navy-850 p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-800">Map Layers</h2>
              <div className="space-y-2">
                {layers.map(l => {
                  const Icon = l.icon;
                  return (
                    <button
                      key={l.key}
                      onClick={() => l.setState(!l.state)}
                      className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                        l.state
                          ? 'border-navy-600 bg-navy-800 text-slate-600'
                          : 'border-transparent bg-transparent text-slate-500 hover:bg-navy-800/50'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${l.state ? l.color : 'text-slate-600'}`} />
                      <span className="flex-1 text-left">{l.label}</span>
                      <div className={`h-4 w-7 rounded-full transition-colors ${l.state ? 'bg-cyan-500/40' : 'bg-navy-700'}`}>
                        <div className={`h-3 w-3 rounded-full bg-white transition-transform mt-0.5 ${l.state ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-navy-700 pt-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-600">Legend</h3>
                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-400" /> Urgent / High</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-yellow-400" /> Moderate</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-green-400" /> Low</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-blue-400" /> Police</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-red-400" /> Hospital</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-orange-400" /> Fire</div>
                </div>
              </div>

              <div className="mt-4 border-t border-navy-700 pt-4">
                <p className="text-[10px] text-slate-600">
                  Map navigation is restricted to Chandigarh's geographic boundary. OpenStreetMap provides roads, paths, and facilities.
                </p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <SafetyMapComponent
              showIncidents={showIncidents}
              showFacilities={showFacilities}
              showSectors={showSectors}
              showCameras={showCameras}
              showUnits={showUnits}
              showBoundary={true}
              height="600px"
            />
          </div>
        </div>
      </FadeIn>

      <div className="mt-4">
        <DataSourceBanner message="Sector boundaries shown are approximate for demo. Real boundaries should be loaded from the DataMeet Municipal Spatial Data repository (github.com/datameet/Municipal_Spatial_Data)." />
      </div>
    </div>
  );
}
