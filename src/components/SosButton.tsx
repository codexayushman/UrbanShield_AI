import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Siren, X, Phone, MapPin, AlertTriangle } from 'lucide-react';
import { CHANDIGARH_FACILITIES } from '@/config/chandigarh';
import type { GeoPoint } from '@/types';

interface SosButtonProps {
  onNavigate?: (page: string) => void;
}

export default function SosButton({ onNavigate }: SosButtonProps) {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [locating, setLocating] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleLocate = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocating(false);
        },
        () => setLocating(false),
        { timeout: 8000 }
      );
    } else {
      setLocating(false);
    }
  };

  const emergencyContacts = [
    { name: 'Police Control Room', number: '100' },
    { name: 'Ambulance', number: '108' },
    { name: 'Women Helpline', number: '1091' },
    { name: 'Anti-Stalking Helpline', number: '1094' },
    { name: 'Disaster Management', number: '1070' },
  ];

  const nearestFacility = (() => {
    if (!location) return null;
    let nearest = CHANDIGARH_FACILITIES[0] as { id: string; name: string; type: string; location: GeoPoint };
    let minDist = Infinity;
    for (const f of CHANDIGARH_FACILITIES) {
      const d = Math.sqrt((f.location.lat - location.lat) ** 2 + (f.location.lng - location.lng) ** 2);
      if (d < minDist) { minDist = d; nearest = f; }
    }
    return nearest;
  })();

  return (
    <>
      {/* Floating SOS button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 transition-transform hover:scale-105 active:scale-95 sos-pulse"
        aria-label="SOS Emergency"
      >
        <span className="text-sm font-bold tracking-wider">SOS</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? {} : { opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="fixed bottom-5 right-5 left-5 z-50 mx-auto max-w-md rounded-2xl border border-red-500/30 bg-navy-900 p-5 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2">
                    <Siren className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Emergency SOS</h2>
                    <p className="text-[10px] text-slate-500">Quick access to emergency services</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-500 hover:text-slate-800 hover:bg-navy-800">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Location */}
              <div className="mb-4 rounded-lg border border-navy-700 bg-navy-800 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <div>
                      <p className="text-sm text-slate-600">
                        {location ? `Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Share your location'}
                      </p>
                      {nearestFacility && (
                        <p className="text-[10px] text-slate-500">Nearest facility: {nearestFacility.name}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLocate}
                    disabled={locating}
                    className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50"
                  >
                    {locating ? 'Locating...' : 'Locate'}
                  </button>
                </div>
              </div>

              {/* Emergency contacts */}
              <div className="mb-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-red-400" /> Emergency Contacts
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {emergencyContacts.map(c => (
                    <a
                      key={c.number}
                      href={`tel:${c.number}`}
                      className="flex items-center justify-between rounded-lg border border-navy-700 bg-navy-800 px-3 py-2.5 transition-colors hover:border-red-500/30 hover:bg-red-500/5"
                    >
                      <span className="text-sm text-slate-600">{c.name}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-400">{c.number}</span>
                        <Phone className="h-3.5 w-3.5 text-red-400" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href="tel:100"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-transform hover:scale-105 active:scale-95"
                >
                  <Siren className="h-4 w-4" />
                  Call 100
                </a>
                {onNavigate && (
                  <button
                    onClick={() => { onNavigate('incident_reporting'); setOpen(false); }}
                    className="flex items-center justify-center gap-2 rounded-lg border border-navy-600 bg-navy-800 px-4 py-3 text-sm font-medium text-slate-600 hover:border-cyan-500/30"
                  >
                    <AlertTriangle className="h-4 w-4 text-cyan-400" />
                    Report
                  </button>
                )}
              </div>

              <p className="mt-3 text-center text-[10px] text-slate-500">
                This is a demo. In a real emergency, call your local emergency number.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
