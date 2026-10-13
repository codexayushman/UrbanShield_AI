import { useState } from 'react';
import Sidebar from './layouts/Sidebar';
import type { PageKey } from './types';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ThemeProvider } from './contexts/ThemeContext';

import Dashboard from './pages/Dashboard';
import SafetyMap from './pages/SafetyMap';
import SafeRoutes from './pages/SafeRoutes';
import IncidentReporting from './pages/IncidentReporting';
import CameraDetection from './pages/CameraDetection';
import ControlRoom from './pages/ControlRoom';
import SafetyAssistant from './pages/SafetyAssistant';
import Analytics from './pages/Analytics';
import WhatIfSimulator from './pages/WhatIfSimulator';
import Settings from './pages/Settings';
import SosButton from './components/SosButton';

function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard');
  const shouldReduceMotion = useReducedMotion();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'safety_map': return <SafetyMap />;
      case 'safe_routes': return <SafeRoutes />;
      case 'incident_reporting': return <IncidentReporting />;
      case 'camera_detection': return <CameraDetection />;
      case 'control_room': return <ControlRoom />;
      case 'safety_assistant': return <SafetyAssistant />;
      case 'analytics': return <Analytics />;
      case 'what_if_simulator': return <WhatIfSimulator />;
      case 'settings': return <Settings />;
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-navy-950">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

        <main className="lg:pl-64">
          <div className="pt-16 lg:pt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="min-h-screen p-4 md:p-6 lg:p-8"
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <SosButton onNavigate={(p) => setCurrentPage(p as PageKey)} />
      </div>
    </ThemeProvider>
  );
}

export default App;
