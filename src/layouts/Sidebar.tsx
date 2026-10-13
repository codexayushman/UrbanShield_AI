import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import type { PageKey } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import {
  LayoutDashboard,
  Map as MapIcon,
  Route,
  FileWarning,
  Camera,
  Monitor,
  Bot,
  BarChart3,
  FlaskConical,
  Settings,
  Shield,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';

interface SidebarProps {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
}

const navItems: { key: PageKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'safety_map', label: 'Chandigarh Safety Map', icon: MapIcon },
  { key: 'safe_routes', label: 'Safe Routes', icon: Route },
  { key: 'incident_reporting', label: 'Incident Reporting', icon: FileWarning },
  { key: 'camera_detection', label: 'AI Camera Detection', icon: Camera },
  { key: 'control_room', label: 'Control Room', icon: Monitor },
  { key: 'safety_assistant', label: 'Safety Assistant', icon: Bot },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'what_if_simulator', label: 'What-If Simulator', icon: FlaskConical },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { theme, toggleTheme } = useTheme();

  const handleNavigate = (page: PageKey) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between border-b border-navy-700 bg-navy-900 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-cyan-400" />
          <span className="text-sm font-bold text-slate-800">UrbanShield AI</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-navy-700 p-1.5 text-slate-600 transition-colors hover:text-cyan-400"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-navy-700 p-1.5 text-slate-600"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 flex-col border-r border-navy-700 bg-navy-900 lg:flex">
        <SidebarContent currentPage={currentPage} onNavigate={handleNavigate} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? {} : { opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={shouldReduceMotion ? {} : { x: -280 }}
              animate={{ x: 0 }}
              exit={shouldReduceMotion ? {} : { x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-navy-700 bg-navy-900 lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-navy-700 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-cyan-400" />
                  <span className="text-sm font-bold text-slate-800">UrbanShield AI</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-slate-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent currentPage={currentPage} onNavigate={handleNavigate} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({ currentPage, onNavigate }: { currentPage: PageKey; onNavigate: (p: PageKey) => void }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <div className="hidden items-center gap-2.5 border-b border-navy-700 px-5 py-4 lg:flex">
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-1.5">
          <Shield className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-800">UrbanShield AI</h1>
          <p className="text-[10px] text-slate-500">Chandigarh Safety Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Navigation</p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.key;
            return (
              <li key={item.key}>
                <button
                  onClick={() => onNavigate(item.key)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-500 hover:bg-navy-800 hover:text-slate-600 border border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-navy-700 px-4 py-3">
        <button
          onClick={toggleTheme}
          className="mb-2 flex w-full items-center justify-between rounded-lg bg-navy-800 px-3 py-2 text-sm text-slate-600 transition-colors hover:text-cyan-400"
        >
          <span className="flex items-center gap-2">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {theme === 'light' ? 'Dark Theme' : 'Light Theme'}
          </span>
          <span className="text-xs text-slate-500">Switch</span>
        </button>
        <div className="flex items-center gap-2 rounded-lg bg-navy-800 px-3 py-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          <span className="text-[10px] text-slate-500">Demo Mode Active</span>
        </div>
        <p className="mt-2 text-center text-[9px] text-slate-600">
          Sample data for demonstration only
        </p>
      </div>
    </>
  );
}
