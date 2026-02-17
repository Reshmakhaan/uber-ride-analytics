import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Target, Map, ShieldAlert, PieChart, Activity } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Predictions from './pages/Predictions';
import ZoneAnalysis from './pages/ZoneAnalysis';
import Simulator from './pages/Simulator';
import Insights from './pages/Insights';

const AppContent = () => {
  const location = useLocation();
  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Predictions', path: '/predictions', icon: Target },
    { name: 'Zone Analysis', path: '/zones', icon: Map },
    { name: 'Simulator', path: '/simulator', icon: ShieldAlert },
    { name: 'Insights', path: '/insights', icon: PieChart },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 glass-card rounded-none border-t-0 border-x-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center emerald-glow">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">RideAnalytics Pro</h1>
            <p className="font-body text-[10px] text-text-secondary uppercase tracking-wider">Uber Demand Intelligence</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => `nav-link font-display text-sm font-medium ${isActive ? 'active text-primary' : ''}`}
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-primary/20 border border-primary/30 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse-live"></span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/zones" element={<ZoneAnalysis />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/insights" element={<Insights />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 glass-card rounded-none border-b-0 border-x-0 z-50 px-4 flex items-center justify-around">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-text-secondary'}`}
          >
            <link.icon size={20} />
            <span className="text-[10px] font-medium uppercase font-display">{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
