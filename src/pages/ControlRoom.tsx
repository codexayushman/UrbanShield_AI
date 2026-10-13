import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/FadeIn';
import IncidentCard from '@/components/IncidentCard';
import { RiskBadge, PriorityBadge } from '@/components/RiskBadge';
import { DataSourceBanner } from '@/components/DataLabel';
import { SAMPLE_INCIDENTS } from '@/data/incidents';
import { SAMPLE_PATROL_UNITS } from '@/data/cameras';
import { Monitor, Filter, ClipboardList, Users, FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { Incident, IncidentStatus, Priority } from '@/types';

export default function ControlRoom() {
  const [incidents, setIncidents] = useState<Incident[]>(SAMPLE_INCIDENTS);
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | 'all'>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const filteredIncidents = incidents.filter(i =>
    (filterPriority === 'all' || i.priority === filterPriority) &&
    (filterStatus === 'all' || i.status === filterStatus)
  );

  const updateStatus = (id: string, status: IncidentStatus) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    setSelectedIncident(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  const updatePriority = (id: string, priority: Priority) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, priority } : i));
    setSelectedIncident(prev => prev?.id === id ? { ...prev, priority } : prev);
  };

  const auditLog = [
    { id: 'AUD-001', action: 'Incident INC-006 priority set to urgent', user: 'Control Room Operator', timestamp: '5 min ago' },
    { id: 'AUD-002', action: 'Patrol Unit Bravo dispatched to INC-006', user: 'Control Room Operator', timestamp: '5 min ago' },
    { id: 'AUD-003', action: 'Incident INC-001 verified by Municipal Team Alpha', user: 'Municipal Team Alpha', timestamp: '2h ago' },
    { id: 'AUD-004', action: 'Incident INC-008 status changed to verified', user: 'Sector 22 Police', timestamp: '1d ago' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Control Room"
        description="Review incidents, adjust priorities, track patrol units, and maintain audit history"
        icon={<Monitor className="h-5 w-5 text-cyan-400" />}
        dataBanner="All incidents and patrol units are SAMPLE data for demonstration. Audit log is illustrative."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Incident list with filters */}
        <FadeIn className="lg:col-span-1">
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-800">Filters</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-slate-500">Priority</label>
                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value as Priority | 'all')}
                  className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-slate-600 focus:outline-none"
                >
                  <option value="all">All priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="moderate">Moderate</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Status</label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as IncidentStatus | 'all')}
                  className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-slate-600 focus:outline-none"
                >
                  <option value="all">All statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">{filteredIncidents.length} incidents</p>
          </div>

          <div className="mt-4 space-y-2">
            {filteredIncidents.map(inc => (
              <IncidentCard
                key={inc.id}
                incident={inc}
                onClick={() => setSelectedIncident(inc)}
              />
            ))}
          </div>
        </FadeIn>

        {/* Detail panel + Audit log + Units */}
        <FadeIn delay={0.05} className="lg:col-span-2">
          <div className="space-y-4">
            {/* Selected incident detail */}
            {selectedIncident ? (
              <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded bg-navy-700 px-2 py-0.5 text-[10px] font-medium text-cyan-400">{selectedIncident.id}</span>
                    <h2 className="mt-1.5 text-lg font-bold text-slate-800">{selectedIncident.title}</h2>
                  </div>
                  <PriorityBadge priority={selectedIncident.priority} />
                </div>

                <p className="mt-2 text-sm text-slate-500">{selectedIncident.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-navy-800 p-2.5">
                    <p className="text-[10px] text-slate-500">Sector</p>
                    <p className="text-sm font-medium text-slate-600">{selectedIncident.sector}</p>
                  </div>
                  <div className="rounded-lg bg-navy-800 p-2.5">
                    <p className="text-[10px] text-slate-500">Source</p>
                    <p className="text-sm font-medium text-slate-600 capitalize">{selectedIncident.source.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="rounded-lg bg-navy-800 p-2.5">
                    <p className="text-[10px] text-slate-500">Confidence</p>
                    <p className="text-sm font-medium text-slate-600">{selectedIncident.confidence}%</p>
                  </div>
                  <div className="rounded-lg bg-navy-800 p-2.5">
                    <p className="text-[10px] text-slate-500">Evidence</p>
                    <p className="text-sm font-medium text-slate-600">{selectedIncident.evidenceCount} items</p>
                  </div>
                </div>

                {/* Risk assessment */}
                <div className="mt-4 rounded-lg border border-navy-700 bg-navy-800 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-slate-600">Risk Assessment</span>
                    <RiskBadge category={selectedIncident.riskCategory} score={selectedIncident.riskScore} />
                  </div>
                  <ul className="mt-2 space-y-1">
                    {selectedIncident.riskReasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-500">
                        <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" /> {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Controls */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">Adjust Priority</label>
                    <select
                      value={selectedIncident.priority}
                      onChange={e => updatePriority(selectedIncident.id, e.target.value as Priority)}
                      className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-slate-600 focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">Update Status</label>
                    <select
                      value={selectedIncident.status}
                      onChange={e => updateStatus(selectedIncident.id, e.target.value as IncidentStatus)}
                      className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-slate-600 focus:outline-none"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>
                </div>

                {/* Patrol recommendation */}
                <div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                  <p className="text-xs font-semibold text-cyan-400">Simulated Response Recommendation</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedIncident.priority === 'urgent'
                      ? 'Dispatch nearest available patrol unit immediately. Notify Chandigarh Police control room (100). Track until unit arrives on scene.'
                      : selectedIncident.priority === 'high'
                      ? 'Assign to next available patrol unit for priority review. Monitor for escalation.'
                      : 'Queue for standard review cycle. Assign municipal team if infrastructure-related.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-navy-700 bg-navy-850 p-8 text-center">
                <ClipboardList className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                <p className="text-sm text-slate-500">Select an incident from the list to view details</p>
              </div>
            )}

            {/* Patrol units */}
            <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Users className="h-4 w-4 text-cyan-400" /> Patrol Units
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {SAMPLE_PATROL_UNITS.map(u => (
                  <div key={u.id} className="rounded-lg border border-navy-700 bg-navy-800 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">{u.unitName}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] capitalize ${
                        u.status === 'available' ? 'bg-green-500/10 text-green-400' :
                        u.status === 'dispatched' || u.status === 'en_route' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-slate-500/10 text-slate-500'
                      }`}>{u.status.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 capitalize">{u.type}</p>
                    {u.assignedIncidentId && <p className="mt-0.5 text-[10px] text-cyan-400">Assigned: {u.assignedIncidentId}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Audit log */}
            <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FileText className="h-4 w-4 text-cyan-400" /> Audit History
              </h2>
              <div className="space-y-2">
                {auditLog.map(entry => (
                  <div key={entry.id} className="flex items-start gap-3 rounded-lg bg-navy-800 px-3 py-2.5">
                    <div className="mt-0.5 rounded-full bg-cyan-500/20 p-1">
                      <CheckCircle2 className="h-3 w-3 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-600">{entry.action}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-600">
                        <span>{entry.user}</span>
                        <Clock className="h-2.5 w-2.5" />
                        <span>{entry.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      <div className="mt-4">
        <DataSourceBanner message="Control room operations are simulated. Priority adjustments and status changes are stored in-memory only and reset on page reload. Production deployment requires Supabase backend with authenticated operator accounts." />
      </div>
    </div>
  );
}
