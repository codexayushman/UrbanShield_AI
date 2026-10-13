import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/services/supabaseClient';
import { submitComplaint, fetchComplaints, type RouteComplaint } from '@/services/complaintService';
import {
  MessageSquareWarning,
  ThumbsUp,
  ThumbsDown,
  Camera,
  Video,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  ImageIcon,
  MapPin,
  Send,
  History,
  AlertCircle,
} from 'lucide-react';
import FadeIn from '@/components/FadeIn';

interface MediaPreview {
  url: string;
  file: File;
  type: 'image' | 'video';
}

export default function ComplaintSection() {
  const [routeName, setRouteName] = useState('');
  const [destination, setDestination] = useState('');
  const [feedback, setFeedback] = useState<'safe' | 'unsafe' | ''>('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [sector, setSector] = useState('');
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [complaints, setComplaints] = useState<RouteComplaint[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const camStreamRef = useRef<MediaStream | null>(null);
  const videoElRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const loadComplaints = useCallback(async () => {
    const data = await fetchComplaints(10);
    setComplaints(data);
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, expectedType: 'image' | 'video') => {
    const files = e.target.files;
    if (!files) return;
    addFiles(Array.from(files), expectedType);
    e.target.value = '';
  };

  const addFiles = (files: File[], expectedType: 'image' | 'video') => {
    const newPreviews: MediaPreview[] = [];
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        setSubmitError(`File "${file.name}" exceeds 50MB limit.`);
        continue;
      }
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) continue;
      if (expectedType === 'image' && !isImage) continue;
      if (expectedType === 'video' && !isVideo) continue;
      newPreviews.push({
        url: URL.createObjectURL(file),
        file,
        type: isImage ? 'image' : 'video',
      });
    }
    setMediaPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
    setMediaPreviews(prev => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const startCamera = async (mode: 'photo' | 'video') => {
    setSubmitError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: mode === 'video',
      });
      camStreamRef.current = stream;
      setCameraMode(mode);
      setCameraActive(true);
      if (videoElRef.current) {
        videoElRef.current.srcObject = stream;
        videoElRef.current.play();
      }
    } catch {
      setSubmitError('Unable to access camera. Please check browser permissions or use the upload option instead.');
    }
  };

  const stopCamera = () => {
    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach(t => t.stop());
      camStreamRef.current = null;
    }
    setCameraActive(false);
    setIsRecording(false);
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
  };

  const capturePhoto = () => {
    if (!videoElRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoElRef.current.videoWidth;
    canvas.height = videoElRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoElRef.current, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      addFiles([file], 'image');
      stopCamera();
    }, 'image/jpeg', 0.85);
  };

  const startRecording = () => {
    if (!camStreamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(camStreamRef.current, { mimeType: 'video/webm' });
    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const file = new File([blob], `camera-video-${Date.now()}.webm`, { type: 'video/webm' });
      addFiles([file], 'video');
      stopCamera();
    };
    recorder.start();
    recorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    setSubmitError('');
    setSubmitSuccess(false);

    if (!feedback) {
      setSubmitError('Please select whether the route was safe or unsafe.');
      return;
    }
    if (!routeName.trim()) {
      setSubmitError('Please enter the route name.');
      return;
    }
    if (!destination.trim()) {
      setSubmitError('Please enter your destination.');
      return;
    }

    setIsSubmitting(true);
    const result = await submitComplaint({
      routeName: routeName.trim(),
      destination: destination.trim(),
      feedback: feedback as 'safe' | 'unsafe',
      description: description.trim(),
      sector: sector.trim() || undefined,
      reporterName: reporterName.trim() || undefined,
      mediaFiles: mediaPreviews.map(m => m.file),
    });
    setIsSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error || 'Failed to submit complaint.');
      return;
    }

    setSubmitSuccess(true);
    setRouteName('');
    setDestination('');
    setFeedback('');
    setDescription('');
    setReporterName('');
    setSector('');
    mediaPreviews.forEach(m => URL.revokeObjectURL(m.url));
    setMediaPreviews([]);
    loadComplaints();

    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const resetForm = () => {
    stopCamera();
    setRouteName('');
    setDestination('');
    setFeedback('');
    setDescription('');
    setReporterName('');
    setSector('');
    mediaPreviews.forEach(m => URL.revokeObjectURL(m.url));
    setMediaPreviews([]);
    setSubmitError('');
    setSubmitSuccess(false);
  };

  const feedbackColor = (fb: string) => fb === 'safe' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20';
  const statusColor = (status: string) => {
    if (status === 'resolved') return 'text-green-400 bg-green-500/10';
    if (status === 'under_review') return 'text-yellow-400 bg-yellow-500/10';
    if (status === 'dismissed') return 'text-slate-500 bg-slate-200/70';
    return 'text-cyan-400 bg-cyan-500/10';
  };

  return (
    <FadeIn delay={0.25}>
      <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <MessageSquareWarning className="h-4 w-4 text-cyan-400" /> Route Safety Feedback
        </h2>
        <p className="mb-4 text-xs text-slate-500">
          Was the suggested route actually safe? Share your experience to help improve route recommendations. You can attach photos or videos as evidence.
        </p>

        {!isSupabaseConfigured && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            Database is not configured. Complaints cannot be saved. Add Supabase credentials to enable this feature.
          </div>
        )}

        {/* Success message */}
        {submitSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Thank you! Your feedback has been submitted successfully.
          </div>
        )}

        {/* Error message */}
        {submitError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Feedback toggle */}
        <div className="mb-4">
          <label className="mb-2 block text-xs font-medium text-slate-600">Your Experience</label>
          <div className="flex gap-3">
            <button
              onClick={() => setFeedback('safe')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${
                feedback === 'safe'
                  ? 'border-green-500/40 bg-green-500/10 text-green-400'
                  : 'border-navy-600 bg-navy-800 text-slate-500 hover:border-green-500/20'
              }`}
            >
              <ThumbsUp className="h-4 w-4" /> Route was Safe
            </button>
            <button
              onClick={() => setFeedback('unsafe')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${
                feedback === 'unsafe'
                  ? 'border-red-500/40 bg-red-500/10 text-red-400'
                  : 'border-navy-600 bg-navy-800 text-slate-500 hover:border-red-500/20'
              }`}
            >
              <ThumbsDown className="h-4 w-4" /> Route was Unsafe
            </button>
          </div>
        </div>

        {/* Route name and destination */}
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Route Name *</label>
            <input
              value={routeName}
              onChange={e => setRouteName(e.target.value)}
              placeholder="e.g. Sector 17 to Sector 22 via Madhya Marg"
              className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-slate-800 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Destination *</label>
            <input
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="e.g. Sector 22"
              className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-slate-800 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Sector and reporter name */}
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Sector / Area</label>
            <input
              value={sector}
              onChange={e => setSector(e.target.value)}
              placeholder="e.g. Sector 22 (optional)"
              className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-slate-800 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Your Name (optional)</label>
            <input
              value={reporterName}
              onChange={e => setReporterName(e.target.value)}
              placeholder="Anonymous"
              className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-slate-800 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Details</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe what you experienced on this route — poor lighting, unsafe conditions, incidents, or why it felt safe..."
            className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-slate-800 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>

        {/* Media capture / upload */}
        <div className="mb-4">
          <label className="mb-2 block text-xs font-medium text-slate-600">Photos / Videos (optional)</label>

          {/* Camera + upload buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => startCamera('photo')}
              disabled={cameraActive}
              className="flex items-center gap-2 rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-xs text-slate-600 hover:border-cyan-500/30 hover:text-cyan-400 disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5" /> Take Photo
            </button>
            <button
              onClick={() => startCamera('video')}
              disabled={cameraActive}
              className="flex items-center gap-2 rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-xs text-slate-600 hover:border-cyan-500/30 hover:text-cyan-400 disabled:opacity-50"
            >
              <Video className="h-3.5 w-3.5" /> Record Video
            </button>
            <button
              onClick={() => photoInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-xs text-slate-600 hover:border-cyan-500/30 hover:text-cyan-400"
            >
              <Upload className="h-3.5 w-3.5" /> Upload Photos
            </button>
            <button
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-xs text-slate-600 hover:border-cyan-500/30 hover:text-cyan-400"
            >
              <Upload className="h-3.5 w-3.5" /> Upload Videos
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleFileSelect(e, 'image')}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={e => handleFileSelect(e, 'video')}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => handleFileSelect(e, 'image')}
            />
          </div>

          {/* Camera preview */}
          {cameraActive && (
            <div className="mt-3 rounded-lg border border-navy-600 bg-black overflow-hidden">
              <video
                ref={videoElRef}
                autoPlay
                playsInline
                muted={cameraMode === 'photo'}
                className="w-full max-h-64 object-contain"
              />
              <div className="flex items-center justify-center gap-3 bg-navy-900 p-3">
                {cameraMode === 'photo' ? (
                  <button
                    onClick={capturePhoto}
                    className="flex items-center gap-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 px-4 py-2 text-sm text-cyan-400 hover:bg-cyan-500/30"
                  >
                    <Camera className="h-4 w-4" /> Capture
                  </button>
                ) : (
                  isRecording ? (
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/30"
                    >
                      <span className="h-3 w-3 animate-pulse rounded-full bg-red-400" /> Stop Recording
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      className="flex items-center gap-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 px-4 py-2 text-sm text-cyan-400 hover:bg-cyan-500/30"
                    >
                      <Video className="h-4 w-4" /> Start Recording
                    </button>
                  )
                )}
                <button
                  onClick={stopCamera}
                  className="flex items-center gap-2 rounded-lg border border-navy-600 bg-navy-800 px-4 py-2 text-sm text-slate-500 hover:text-slate-800"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
              </div>
            </div>
          )}

          {/* Media previews */}
          {mediaPreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {mediaPreviews.map((media, i) => (
                <div key={i} className="group relative aspect-square rounded-lg border border-navy-600 bg-navy-800 overflow-hidden">
                  {media.type === 'image' ? (
                    <img src={media.url} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover" />
                  ) : (
                    <video src={media.url} className="h-full w-full object-cover" muted />
                  )}
                  <div className="absolute left-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[8px] text-white">
                    {media.type === 'image' ? <ImageIcon className="h-2.5 w-2.5" /> : <Video className="h-2.5 w-2.5" />}
                  </div>
                  <button
                    onClick={() => removeMedia(i)}
                    className="absolute right-1 top-1 rounded bg-red-500/80 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit / Reset buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isSupabaseConfigured}
            className="flex items-center gap-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 px-5 py-2.5 text-sm font-semibold text-cyan-400 transition-all hover:bg-cyan-500/30 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
          <button
            onClick={resetForm}
            className="flex items-center gap-2 rounded-lg border border-navy-600 bg-navy-800 px-4 py-2.5 text-sm text-slate-500 hover:text-slate-800"
          >
            <X className="h-4 w-4" /> Clear
          </button>
        </div>

        {/* Recent complaints */}
        {complaints.length > 0 && (
          <div className="mt-6 border-t border-navy-700 pt-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-cyan-400"
            >
              <History className="h-4 w-4" /> Recent Feedback ({complaints.length})
              <span className="text-xs text-slate-500">{showHistory ? 'Hide' : 'Show'}</span>
            </button>
            {showHistory && (
              <div className="mt-3 space-y-2">
                {complaints.map(c => (
                  <div key={c.id} className="rounded-lg border border-navy-700 bg-navy-800 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`rounded border px-1.5 py-0.5 text-[9px] font-medium ${feedbackColor(c.feedback)}`}>
                            {c.feedback === 'safe' ? <ThumbsUp className="mr-0.5 inline h-2.5 w-2.5" /> : <ThumbsDown className="mr-0.5 inline h-2.5 w-2.5" />}
                            {c.feedback.toUpperCase()}
                          </span>
                          <span className={`rounded px-1.5 py-0.5 text-[9px] capitalize ${statusColor(c.status)}`}>
                            {c.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm text-slate-600">{c.route_name}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3" /> {c.destination} {c.sector !== 'Unknown' && `· ${c.sector}`}
                        </p>
                        {c.description && (
                          <p className="mt-1 text-xs text-slate-500 line-clamp-2">{c.description}</p>
                        )}
                        {c.media_urls && c.media_urls.length > 0 && (
                          <div className="mt-1.5 flex items-center gap-1 text-xs text-cyan-400">
                            <ImageIcon className="h-3 w-3" /> {c.media_urls.length} attachment(s)
                          </div>
                        )}
                      </div>
                      <span className="shrink-0 text-[10px] text-slate-600">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </FadeIn>
  );
}
