import { RiskBadge, PriorityBadge } from './RiskBadge';
import type { Incident } from '@/types';
import { MapPin, Clock, FileText, AlertCircle } from 'lucide-react';

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const statusColors: Record<string, string> = {
  submitted: 'text-slate-600 bg-slate-500/10 border-slate-400/40',
  under_review: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  verified: 'text-green-400 bg-green-500/10 border-green-500/30',
  unverified: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  resolved: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  dismissed: 'text-slate-500 bg-slate-500/10 border-slate-400/40',
};

const typeLabels: Record<string, string> = {
  road_hazard: 'Road Hazard',
  crowd_congestion: 'Crowd Congestion',
  altercation: 'Possible Altercation',
  lighting_issue: 'Lighting Issue',
  repeated_incidents: 'Repeated Incidents',
  emergency: 'Emergency',
  theft: 'Theft',
  harassment: 'Harassment',
  other: 'Other',
};

export default function IncidentCard({ incident, onClick }: { incident: Incident; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-navy-700 bg-navy-850 p-4 transition-all hover:border-cyan-500/40 hover:bg-navy-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-navy-700 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
              {incident.id}
            </span>
            <span className="text-xs text-slate-500">{typeLabels[incident.type] ?? incident.type}</span>
            {incident.isSimulated && (
              <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[9px] text-slate-500">SAMPLE</span>
            )}
          </div>
          <h3 className="mt-1.5 truncate text-sm font-medium text-slate-800">{incident.title}</h3>
        </div>
        <PriorityBadge priority={incident.priority} />
      </div>

      <p className="mt-2 line-clamp-2 text-xs text-slate-500">{incident.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {incident.sector}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {formatTimeAgo(incident.reportedAt)}
        </span>
        <span className="flex items-center gap-1">
          <FileText className="h-3 w-3" /> {incident.evidenceCount} evidence
        </span>
        <span className={`rounded border px-1.5 py-0.5 capitalize ${statusColors[incident.status] ?? statusColors.submitted}`}>
          {incident.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <RiskBadge category={incident.riskCategory} score={incident.riskScore} />
        <span className="text-[10px] text-slate-600">Confidence: {incident.confidence}%</span>
      </div>
    </div>
  );
}
