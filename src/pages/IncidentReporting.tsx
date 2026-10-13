import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/FadeIn';
import { RiskBadge } from '@/components/RiskBadge';
import { DataSourceBanner } from '@/components/DataLabel';
import { calculateRiskScore } from '@/services/riskScoring';
import { SAMPLE_INCIDENTS } from '@/data/incidents';
import { FileWarning, MapPin, Upload, Send, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import type { IncidentType, Priority, RiskScoreResult } from '@/types';

const incidentTypes: { value: IncidentType; label: string }[] = [
  { value: 'road_hazard', label: 'Road Hazard' },
  { value: 'crowd_congestion', label: 'Crowd Congestion' },
  { value: 'altercation', label: 'Possible Altercation' },
  { value: 'lighting_issue', label: 'Lighting Issue' },
  { value: 'theft', label: 'Theft' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'other', label: 'Other' },
];

const chandigarhSectors = [
  'Sector 1', 'Sector 3', 'Sector 8', 'Sector 11', 'Sector 12', 'Sector 15',
  'Sector 17', 'Sector 19', 'Sector 22', 'Sector 26', 'Sector 31', 'Sector 35',
  'Sector 37', 'Sector 39', 'Sector 43', 'Industrial Area', 'Manimajra', 'Other',
];

export default function IncidentReporting() {
  const [type, setType] = useState<IncidentType>('road_hazard');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('Sector 17');
  const [lat, setLat] = useState('30.7333');
  const [lng, setLng] = useState('76.7794');
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ id: string; risk: RiskScoreResult } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || latNum < 30.61 || latNum > 30.82) newErrors.lat = 'Latitude must be within Chandigarh (30.61-30.82)';
    if (isNaN(lngNum) || lngNum < 76.65 || lngNum > 76.9) newErrors.lng = 'Longitude must be within Chandigarh (76.65-76.90)';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const risk = calculateRiskScore({
      type,
      location: { lat: latNum, lng: lngNum },
      status: 'submitted',
      source: 'citizen_report',
      reportedAt: new Date().toISOString(),
    });

    const priority: Priority = risk.score >= 80 ? 'urgent' : risk.score >= 60 ? 'high' : risk.score >= 30 ? 'moderate' : 'low';
    const id = `INC-${Math.floor(Math.random() * 9000 + 1000)}`;

    setSubmitResult({ id, risk });
    setSubmitted(true);
  };

  const reset = () => {
    setTitle('');
    setDescription('');
    setSector('Sector 17');
    setLat('30.7333');
    setLng('76.7794');
    setEvidenceFiles([]);
    setSubmitted(false);
    setSubmitResult(null);
    setErrors({});
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidenceFiles(Array.from(e.target.files).map(f => f.name));
    }
  };

  if (submitted && submitResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Incident Reporting"
          description="Submit a safety incident with location and optional evidence"
          icon={<FileWarning className="h-5 w-5 text-cyan-400" />}
        />
        <FadeIn>
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-400" />
            <h2 className="text-xl font-bold text-slate-800">Report Submitted Successfully</h2>
            <p className="mt-1 text-sm text-slate-500">Tracking ID: <span className="font-mono text-cyan-400">{submitResult.id}</span></p>

            <div className="mt-4 rounded-lg border border-navy-700 bg-navy-850 p-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Risk Assessment</span>
                <RiskBadge category={submitResult.risk.category} score={submitResult.risk.score} />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-500">Confidence:</span>
                <span className="text-xs font-medium text-slate-600">{submitResult.risk.confidence}%</span>
              </div>

              <div className="mt-3">
                <p className="mb-1 text-xs font-semibold uppercase text-slate-600">Reasons</p>
                <ul className="space-y-1">
                  {submitResult.risk.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-500">
                      <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" /> {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3">
                <p className="mb-1 text-xs font-semibold uppercase text-slate-600">Contributing Indicators</p>
                <div className="space-y-1">
                  {submitResult.risk.indicators.map(ind => (
                    <div key={ind.key} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{ind.label}</span>
                      <span className="text-slate-500">Value: {ind.value} | Contribution: {ind.contribution}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-navy-800 p-2.5">
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-cyan-400">Recommended next step:</span>{' '}
                  {submitResult.risk.score >= 80
                    ? 'High priority — simulated dispatch recommendation: send nearest patrol unit and notify control room.'
                    : submitResult.risk.score >= 60
                    ? 'Flag for priority review by the control room team.'
                    : submitResult.risk.score >= 30
                    ? 'Queue for review during next operational cycle.'
                    : 'Log for municipal inspection and trend tracking.'}
                </p>
              </div>

              <p className="mt-3 text-[10px] text-slate-600">
                This is a DEMO submission. No real report has been filed. Risk scores are illustrative demo thresholds.
              </p>
            </div>

            <button
              onClick={reset}
              className="mt-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20"
            >
              Submit Another Report
            </button>
          </div>
        </FadeIn>
      </div>
    );
  }

  const recentReports = SAMPLE_INCIDENTS.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Incident Reporting"
        description="Submit a safety incident with location details and optional evidence upload"
        icon={<FileWarning className="h-5 w-5 text-cyan-400" />}
        dataBanner="Reports submitted in demo mode are not sent to any real authority. For real emergencies, call 100 (Police) or 108 (Ambulance)."
      />

      <FadeIn>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
              <div className="space-y-4">
                {/* Incident type */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">Incident Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as IncidentType)}
                    className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2.5 text-sm text-slate-600 focus:border-cyan-500/50 focus:outline-none"
                  >
                    {incidentTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">Title <span className="text-red-400">*</span></label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Brief title describing the incident"
                    className={`w-full rounded-lg border bg-navy-800 px-3 py-2.5 text-sm text-slate-600 placeholder-slate-600 focus:outline-none ${errors.title ? 'border-red-500/50' : 'border-navy-600 focus:border-cyan-500/50'}`}
                  />
                  {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">Description <span className="text-red-400">*</span></label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe what happened, when, and any relevant details"
                    rows={4}
                    className={`w-full rounded-lg border bg-navy-800 px-3 py-2.5 text-sm text-slate-600 placeholder-slate-600 focus:outline-none ${errors.description ? 'border-red-500/50' : 'border-navy-600 focus:border-cyan-500/50'}`}
                  />
                  {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description}</p>}
                </div>

                {/* Sector + Location */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600">Sector</label>
                    <select
                      value={sector}
                      onChange={e => setSector(e.target.value)}
                      className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2.5 text-sm text-slate-600 focus:border-cyan-500/50 focus:outline-none"
                    >
                      {chandigarhSectors.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-600">Latitude</label>
                      <input
                        value={lat}
                        onChange={e => setLat(e.target.value)}
                        className={`w-full rounded-lg border bg-navy-800 px-2 py-2.5 text-sm text-slate-600 focus:outline-none ${errors.lat ? 'border-red-500/50' : 'border-navy-600 focus:border-cyan-500/50'}`}
                      />
                      {errors.lat && <p className="mt-0.5 text-xs text-red-400">{errors.lat}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-600">Longitude</label>
                      <input
                        value={lng}
                        onChange={e => setLng(e.target.value)}
                        className={`w-full rounded-lg border bg-navy-800 px-2 py-2.5 text-sm text-slate-600 focus:outline-none ${errors.lng ? 'border-red-500/50' : 'border-navy-600 focus:border-cyan-500/50'}`}
                      />
                      {errors.lng && <p className="mt-0.5 text-xs text-red-400">{errors.lng}</p>}
                    </div>
                  </div>
                </div>

                {/* Evidence upload */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">Evidence Upload (Optional)</label>
                  <div className="rounded-lg border border-dashed border-navy-600 bg-navy-800/50 p-4">
                    <input type="file" multiple onChange={handleFiles} className="hidden" id="evidence-upload" />
                    <label htmlFor="evidence-upload" className="flex cursor-pointer flex-col items-center gap-2 text-center">
                      <Upload className="h-6 w-6 text-slate-500" />
                      <span className="text-xs text-slate-500">Click to upload photos or documents</span>
                    </label>
                  </div>
                  {evidenceFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {evidenceFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 rounded bg-navy-800 px-2 py-1.5 text-xs text-slate-600">
                          <CheckCircle2 className="h-3 w-3 text-green-400" /> {f}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 py-3 text-sm font-semibold text-cyan-400 transition-all hover:bg-cyan-500/30"
                >
                  <Send className="h-4 w-4" /> Submit Report
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-navy-700 bg-navy-850 p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <AlertTriangle className="h-4 w-4 text-red-400" /> Emergency?
              </h2>
              <p className="text-xs text-slate-500">If this is a real emergency, do NOT rely on this app. Call immediately:</p>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between rounded bg-navy-800 px-3 py-1.5">
                  <span className="text-xs text-slate-600">Police</span>
                  <span className="font-mono text-sm font-bold text-red-400">100</span>
                </div>
                <div className="flex items-center justify-between rounded bg-navy-800 px-3 py-1.5">
                  <span className="text-xs text-slate-600">Ambulance</span>
                  <span className="font-mono text-sm font-bold text-red-400">108</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-navy-700 bg-navy-850 p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MapPin className="h-4 w-4 text-cyan-400" /> Recent Reports
              </h2>
              <div className="space-y-2">
                {recentReports.map(r => (
                  <div key={r.id} className="rounded-lg bg-navy-800 px-3 py-2">
                    <span className="text-[10px] text-cyan-400">{r.id}</span>
                    <p className="truncate text-xs text-slate-600">{r.title}</p>
                    <div className="mt-1"><RiskBadge category={r.riskCategory} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="mt-4">
        <DataSourceBanner message="This form is for demonstration only. No real reports are filed or transmitted. Location is validated against Chandigarh's bounding box." />
      </div>
    </div>
  );
}
