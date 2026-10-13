import type { PageKey } from '@/types';
import { SAMPLE_INCIDENTS } from '@/data/incidents';
import { SAMPLE_SECTOR_HEATMAP } from '@/data/analytics';
import { SAMPLE_CAMERAS, SAMPLE_PATROL_UNITS } from '@/data/cameras';
import { DATA_SOURCES } from '@/data/analytics';
import StatCard from '@/components/StatCard';
import IncidentCard from '@/components/IncidentCard';
import FadeIn from '@/components/FadeIn';
import PageHeader from '@/components/PageHeader';
import { DataSourceBanner } from '@/components/DataLabel';
import { RiskBadge } from '@/components/RiskBadge';
import { LayoutDashboard, AlertTriangle, Camera, Users, TrendingUp, Activity, ShieldCheck, ChevronRight, Clock } from 'lucide-react';
import ComplaintSection from '@/components/ComplaintSection';
import RouteSearchBar from '@/components/RouteSearchBar';

interface DashboardProps {
  onNavigate: (page: PageKey) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const totalIncidents = SAMPLE_INCIDENTS.length;
  const urgentCount = SAMPLE_INCIDENTS.filter(i => i.priority === 'urgent').length;
  const highCount = SAMPLE_INCIDENTS.filter(i => i.priority === 'high').length;
  const activeCameras = SAMPLE_CAMERAS.length;
  const availableUnits = SAMPLE_PATROL_UNITS.filter(u => u.status === 'available').length;
  const totalUnits = SAMPLE_PATROL_UNITS.length;

  const recentIncidents = [...SAMPLE_INCIDENTS]
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
    .slice(0, 5);

  const topSectors = [...SAMPLE_SECTOR_HEATMAP].sort((a, b) => b.incidentCount - a.incidentCount).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of urban safety incidents across Chandigarh sectors"
        icon={<LayoutDashboard className="h-5 w-5 text-cyan-400" />}
        dataBanner="All data shown is SAMPLE data for demonstration. Not real Chandigarh crime data. Historical data would come from data.gov.in and Chandigarh Administration publications."
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <FadeIn delay={0}>
          <StatCard label="Total Incidents" value={totalIncidents} icon={AlertTriangle} color="cyan" isSimulated onClick={() => onNavigate('control_room')} />
        </FadeIn>
        <FadeIn delay={0.05}>
          <StatCard label="Urgent Priority" value={urgentCount} icon={Activity} color="red" isSimulated onClick={() => onNavigate('control_room')} />
        </FadeIn>
        <FadeIn delay={0.1}>
          <StatCard label="High Priority" value={highCount} icon={TrendingUp} color="orange" isSimulated onClick={() => onNavigate('control_room')} />
        </FadeIn>
        <FadeIn delay={0.15}>
          <StatCard label="Active Cameras" value={activeCameras} icon={Camera} color="blue" onClick={() => onNavigate('camera_detection')} />
        </FadeIn>
      </div>

      {/* Route Search */}
      <div className="mt-6">
        <RouteSearchBar onNavigate={onNavigate} />
      </div>

      {/* Route Safety Feedback / Complaints */}
      <div className="mt-4">
        <ComplaintSection />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Recent Incidents */}
        <FadeIn delay={0.1} className="lg:col-span-2">
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <Clock className="h-4 w-4 text-cyan-400" /> Recent Alerts
              </h2>
              <button
                onClick={() => onNavigate('control_room')}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                View all <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-3">
              {recentIncidents.map(inc => (
                <IncidentCard key={inc.id} incident={inc} onClick={() => onNavigate('control_room')} />
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Sector Hotspots + Unit Status */}
        <FadeIn delay={0.15}>
          <div className="space-y-4">
            <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <TrendingUp className="h-4 w-4 text-cyan-400" /> Sector Hotspots
                </h2>
                <button
                  onClick={() => onNavigate('safety_map')}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                >
                  View map <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-2">
                {topSectors.map(s => (
                  <div key={s.sector} className="flex items-center justify-between rounded-lg bg-navy-800 px-3 py-2">
                    <span className="text-sm text-slate-600">{s.sector}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{s.incidentCount} incidents</span>
                      <RiskBadge category={s.riskLevel as any} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <Users className="h-4 w-4 text-cyan-400" /> Patrol Units
                </h2>
                <button
                  onClick={() => onNavigate('control_room')}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                >
                  View all <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-navy-800 px-3 py-2.5">
                <span className="text-sm text-slate-600">Available</span>
                <span className="text-lg font-bold text-green-400">{availableUnits}/{totalUnits}</span>
              </div>
              <div className="mt-2 space-y-1.5">
                {SAMPLE_PATROL_UNITS.map(u => (
                  <div key={u.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{u.unitName}</span>
                    <span className={`capitalize ${u.status === 'available' ? 'text-green-400' : u.status === 'dispatched' || u.status === 'en_route' ? 'text-orange-400' : 'text-slate-500'}`}>
                      {u.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Data Sources Summary */}
      <FadeIn delay={0.2} className="mt-4">
        <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <ShieldCheck className="h-4 w-4 text-cyan-400" /> Data Sources
          </h2>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {DATA_SOURCES.map(ds => (
              <div key={ds.id} className="rounded-lg border border-navy-700 bg-navy-800 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">{ds.name}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[9px] ${ds.isLive ? 'bg-green-500/10 text-green-400' : 'bg-slate-200/70 text-slate-500'}`}>
                    {ds.isLive ? 'LIVE' : 'HISTORICAL'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{ds.licence}</p>
                <p className="mt-0.5 text-[10px] text-slate-600">Updated: {ds.lastUpdated}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      <div className="mt-4">
        <DataSourceBanner message="UrbanShield AI is in DEMO MODE. All incidents, cameras, patrol units, and analytics are simulated for demonstration. No real surveillance or crime data is used." />
      </div>
    </div>
  );
}
