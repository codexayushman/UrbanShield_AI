import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/FadeIn';
import { DataSourceBanner } from '@/components/DataLabel';
import { SAMPLE_CAMERAS } from '@/data/cameras';
import { Camera, Video, AlertTriangle, CheckCircle2, Eye, Loader2, PlayCircle, Info } from 'lucide-react';
import type { CameraDetection } from '@/types';

const statusConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  normal: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'Normal' },
  candidate_alert: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Candidate Alert' },
  flagged: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Flagged' },
  reviewing: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Under Review' },
};

const detectionLabels: Record<string, string> = {
  crowd_density: 'Crowd Density Analysis',
  rapid_movement: 'Rapid Movement Detection',
  loitering: 'Loitering Detection',
  normal: 'Normal Monitoring',
  object_detection: 'Object Detection',
};

export default function CameraDetection() {
  const [selectedCam, setSelectedCam] = useState<CameraDetection>(SAMPLE_CAMERAS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setHasResult(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasResult(true);
    }, 2500);
  };

  const alertCameras = SAMPLE_CAMERAS.filter(c => c.status !== 'normal');

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="AI Camera Detection"
        description="Simulated video analysis for crowd density, movement patterns, and anomaly detection across Chandigarh cameras"
        icon={<Camera className="h-5 w-5 text-cyan-400" />}
        dataBanner="ALL camera detections are SIMULATED. No real surveillance footage is used. This interface demonstrates how AI model outputs would appear. Real model integration requires authorized access and ethical review."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Camera list */}
        <FadeIn className="lg:col-span-1">
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Camera Network ({SAMPLE_CAMERAS.length})</h2>
            <div className="space-y-2">
              {SAMPLE_CAMERAS.map(cam => {
                const cfg = statusConfig[cam.status] ?? statusConfig.normal;
                return (
                  <button
                    key={cam.id}
                    onClick={() => { setSelectedCam(cam); setHasResult(false); }}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      selectedCam.id === cam.id ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-navy-700 bg-navy-800 hover:border-navy-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-slate-600">{cam.cameraName}</span>
                      <span className={`rounded border px-1.5 py-0.5 text-[9px] ${cfg.bg} ${cfg.color} ${cfg.border}`}>{cfg.label}</span>
                    </div>
                    <span className="mt-1 block text-[10px] text-slate-500">{cam.cameraId}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* Camera detail / video player */}
        <FadeIn delay={0.05} className="lg:col-span-2">
          <div className="space-y-4">
            {/* Video area */}
            <div className="rounded-xl border border-navy-700 bg-navy-850 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">{selectedCam.cameraName}</h2>
                  <p className="text-xs text-slate-500">{selectedCam.cameraId} | {detectionLabels[selectedCam.detectionType]}</p>
                </div>
                <span className={`rounded border px-2 py-0.5 text-xs ${statusConfig[selectedCam.status]?.bg} ${statusConfig[selectedCam.status]?.color} ${statusConfig[selectedCam.status]?.border}`}>
                  {statusConfig[selectedCam.status]?.label}
                </span>
              </div>

              {/* Simulated video frame */}
              <div className="relative aspect-video rounded-lg border border-navy-600 bg-gradient-to-br from-navy-800 to-navy-900 overflow-hidden">
                {/* Grid overlay to simulate camera view */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'linear-gradient(#22d3ee22 1px, transparent 1px), linear-gradient(90deg, #22d3ee22 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }} />

                {/* Scanning animation */}
                {isAnalyzing && (
                  <div className="absolute inset-x-0 h-0.5 bg-cyan-400/60 shadow-lg shadow-cyan-400/50"
                    style={{ top: '0%', animation: 'scan 2.5s linear', animationName: 'scanDown' }} />
                )}

                <style>{`
                  @keyframes scanDown { from { top: 0%; } to { top: 100%; } }
                `}</style>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
                      <p className="text-sm text-cyan-400">Running AI analysis...</p>
                      <p className="text-xs text-slate-500">Model: CrowdDensityNet v2.1 (Simulated)</p>
                    </>
                  ) : hasResult ? (
                    <>
                      <div className={`rounded-full border-2 p-3 ${selectedCam.status === 'normal' ? 'border-green-400' : selectedCam.status === 'flagged' ? 'border-red-400' : 'border-yellow-400'}`}>
                        {selectedCam.status === 'normal' ? <CheckCircle2 className="h-8 w-8 text-green-400" /> : <AlertTriangle className="h-8 w-8 text-yellow-400" />}
                      </div>
                      <p className="text-sm font-medium text-slate-600">{detectionLabels[selectedCam.detectionType]}</p>
                      <p className="text-xs text-slate-500">Confidence: {selectedCam.confidence}% | SIMULATED RESULT</p>
                    </>
                  ) : (
                    <>
                      <Video className="h-10 w-10 text-slate-600" />
                      <p className="text-sm text-slate-500">Sample video feed — click below to run analysis</p>
                    </>
                  )}
                </div>

                {/* Camera label overlay */}
                <div className="absolute left-3 top-3 rounded bg-black/50 px-2 py-1 text-[10px] text-slate-600 backdrop-blur-sm">
                  {selectedCam.cameraId} | SIMULATED FEED
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-all hover:bg-cyan-500/20 disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                  {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
                </button>
                <button
                  className="flex items-center gap-2 rounded-lg border border-navy-600 bg-navy-800 px-4 py-2 text-sm text-slate-500 hover:bg-navy-700"
                >
                  <Eye className="h-4 w-4" /> View Live (Demo)
                </button>
              </div>
            </div>

            {/* Detection result detail */}
            {hasResult && (
              <FadeIn>
                <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Info className="h-4 w-4 text-cyan-400" /> Detection Details
                  </h2>
                  <p className="text-sm text-slate-600">{selectedCam.description}</p>

                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-navy-800 p-3 text-center">
                      <p className="text-2xl font-bold text-slate-800">{selectedCam.confidence}%</p>
                      <p className="text-xs text-slate-500">Confidence</p>
                    </div>
                    <div className="rounded-lg bg-navy-800 p-3 text-center">
                      <p className="text-2xl font-bold text-slate-800">{detectionLabels[selectedCam.detectionType].split(' ')[0]}</p>
                      <p className="text-xs text-slate-500">Detection Type</p>
                    </div>
                    <div className="rounded-lg bg-navy-800 p-3 text-center">
                      <p className="text-2xl font-bold text-slate-800">{statusConfig[selectedCam.status]?.label}</p>
                      <p className="text-xs text-slate-500">Status</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                    <p className="text-xs text-yellow-400/80">
                      <strong>SIMULATED DETECTION:</strong> This result was generated for demonstration. It does NOT represent real model output. {selectedCam.status === 'flagged' && 'Violence is NOT confirmed — flagging indicates unusual patterns requiring human review.'}
                    </p>
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Active alerts summary */}
            <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <AlertTriangle className="h-4 w-4 text-orange-400" /> Active Camera Alerts ({alertCameras.length})
              </h2>
              <div className="space-y-2">
                {alertCameras.map(cam => (
                  <div key={cam.id} className="flex items-center justify-between rounded-lg bg-navy-800 px-3 py-2">
                    <div>
                      <span className="text-sm text-slate-600">{cam.cameraName}</span>
                      <p className="text-xs text-slate-500">{detectionLabels[cam.detectionType]} | {cam.confidence}% confidence</p>
                    </div>
                    <span className={`rounded border px-2 py-0.5 text-xs ${statusConfig[cam.status]?.bg} ${statusConfig[cam.status]?.color} ${statusConfig[cam.status]?.border}`}>
                      {statusConfig[cam.status]?.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      <div className="mt-4">
        <DataSourceBanner message="The model integration interface is separate from the simulated demo. Real deployment requires authorized camera access, an approved AI model, ethical review, and compliance with privacy regulations. Detections must NEVER be treated as confirmed events without human verification." />
      </div>
    </div>
  );
}
