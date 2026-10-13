import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/FadeIn';
import { useTheme } from '@/contexts/ThemeContext';
import { Settings as SettingsIcon, Bell, Globe, Shield, Database, Map, Code, ToggleLeft, ToggleRight, Info, Sun, Moon } from 'lucide-react';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [language, setLanguage] = useState('en');
  const [mapStyle, setMapStyle] = useState('dark');

  const toggleItems = [
    { key: 'notifications', label: 'Push Notifications', description: 'Receive alerts for urgent incidents', value: notifications, setter: setNotifications },
    { key: 'autoRefresh', label: 'Auto-refresh Dashboard', description: 'Update dashboard data every 30 seconds', value: autoRefresh, setter: setAutoRefresh },
    { key: 'reducedMotion', label: 'Reduced Motion', description: 'Minimize animations for accessibility', value: reducedMotion, setter: setReducedMotion },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Settings"
        description="Configure notifications, accessibility, language, map preferences, and view system information"
        icon={<SettingsIcon className="h-5 w-5 text-cyan-400" />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Theme Selection */}
        <FadeIn>
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Sun className="h-4 w-4 text-cyan-400" /> Appearance
            </h2>
            <p className="mb-3 text-xs text-slate-500">Choose between light and dark theme. Your preference is saved automatically.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-3 rounded-lg border p-4 transition-all ${
                  theme === 'light'
                    ? 'border-cyan-500/40 bg-cyan-500/5'
                    : 'border-navy-700 bg-navy-800 hover:border-navy-600'
                }`}
              >
                <Sun className={`h-5 w-5 ${theme === 'light' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-600">Light</p>
                  <p className="text-[10px] text-slate-500">Bright, clean interface</p>
                </div>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-3 rounded-lg border p-4 transition-all ${
                  theme === 'dark'
                    ? 'border-cyan-500/40 bg-cyan-500/5'
                    : 'border-navy-700 bg-navy-800 hover:border-navy-600'
                }`}
              >
                <Moon className={`h-5 w-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-600">Dark</p>
                  <p className="text-[10px] text-slate-500">Easy on the eyes at night</p>
                </div>
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Preferences */}
        <FadeIn>
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Bell className="h-4 w-4 text-cyan-400" /> Preferences
            </h2>
            <div className="space-y-3">
              {toggleItems.map(item => (
                <div key={item.key} className="flex items-center justify-between rounded-lg bg-navy-800 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                  <button onClick={() => item.setter(!item.value)} className="text-cyan-400">
                    {item.value ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7 text-slate-600" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Language & Map */}
        <FadeIn delay={0.05}>
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Globe className="h-4 w-4 text-cyan-400" /> Language & Map
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">Language</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2.5 text-sm text-slate-600 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (coming soon)</option>
                  <option value="pa">Punjabi (coming soon)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">Map Style</label>
                <select
                  value={mapStyle}
                  onChange={e => setMapStyle(e.target.value)}
                  className="w-full rounded-lg border border-navy-600 bg-navy-800 px-3 py-2.5 text-sm text-slate-600 focus:outline-none"
                >
                  <option value="dark">Dark (Default)</option>
                  <option value="light">Light (coming soon)</option>
                  <option value="satellite">Satellite (coming soon)</option>
                </select>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Privacy & Security */}
        <FadeIn delay={0.1}>
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Shield className="h-4 w-4 text-cyan-400" /> Privacy & Security
            </h2>
            <div className="space-y-2">
              <div className="rounded-lg bg-navy-800 p-3">
                <p className="text-sm text-slate-600">Data Collection</p>
                <p className="mt-1 text-xs text-slate-500">UrbanShield AI does not collect personal data in demo mode. Production deployment would require a privacy policy compliant with India's Digital Personal Data Protection Act.</p>
              </div>
              <div className="rounded-lg bg-navy-800 p-3">
                <p className="text-sm text-slate-600">Protected Characteristics</p>
                <p className="mt-1 text-xs text-slate-500">The risk scoring engine NEVER uses protected personal characteristics (religion, caste, ethnicity, gender) to determine risk. Only incident type, location, recency, and facility proximity are used.</p>
              </div>
              <div className="rounded-lg bg-navy-800 p-3">
                <p className="text-sm text-slate-600">Report Anonymity</p>
                <p className="mt-1 text-xs text-slate-500">Citizen reports protect reporter identity. Personal information is never displayed alongside incident data.</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* System Info */}
        <FadeIn delay={0.15}>
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Info className="h-4 w-4 text-cyan-400" /> System Information
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between rounded-lg bg-navy-800 px-3 py-2">
                <span className="text-slate-500">Version</span>
                <span className="text-slate-600">1.0.0-demo</span>
              </div>
              <div className="flex justify-between rounded-lg bg-navy-800 px-3 py-2">
                <span className="text-slate-500">Mode</span>
                <span className="text-cyan-400">Demo (Sample Data)</span>
              </div>
              <div className="flex justify-between rounded-lg bg-navy-800 px-3 py-2">
                <span className="text-slate-500">Coverage</span>
                <span className="text-slate-600">Chandigarh, India</span>
              </div>
              <div className="flex justify-between rounded-lg bg-navy-800 px-3 py-2">
                <span className="text-slate-500">Map Provider</span>
                <span className="text-slate-600">OpenStreetMap</span>
              </div>
              <div className="flex justify-between rounded-lg bg-navy-800 px-3 py-2">
                <span className="text-slate-500">Backend</span>
                <span className="text-slate-600">Netlify Functions + Supabase</span>
              </div>
              <div className="flex justify-between rounded-lg bg-navy-800 px-3 py-2">
                <span className="text-slate-500">Risk Scoring</span>
                <span className="text-slate-600">6 weighted indicators (demo)</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Tech Stack */}
        <FadeIn delay={0.2} className="lg:col-span-2">
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Code className="h-4 w-4 text-cyan-400" /> Technology Stack
            </h2>
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Motion (Framer)', 'Leaflet', 'OpenStreetMap', 'Supabase', 'Netlify Functions', 'PostgreSQL', 'Lucide Icons'].map(tech => (
                <span key={tech} className="rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-center text-xs text-slate-500">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Data config */}
        <FadeIn delay={0.25} className="lg:col-span-2">
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Database className="h-4 w-4 text-cyan-400" /> Data & Map Configuration
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-navy-800 p-3">
                <Map className="h-4 w-4 text-cyan-400 mb-1.5" />
                <p className="text-sm text-slate-600">Chandigarh Boundary</p>
                <p className="mt-1 text-xs text-slate-500">Map navigation restricted to Chandigarh UT bounding box (30.61-30.82 N, 76.65-76.90 E). Boundary polygon overlay shown on map.</p>
              </div>
              <div className="rounded-lg bg-navy-800 p-3">
                <Database className="h-4 w-4 text-cyan-400 mb-1.5" />
                <p className="text-sm text-slate-600">Data Import Module</p>
                <p className="mt-1 text-xs text-slate-500">Supports GeoJSON, CSV, and JSON import. Validates source, date, location, licence, and geographic coverage. Located in data/importers/.</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
