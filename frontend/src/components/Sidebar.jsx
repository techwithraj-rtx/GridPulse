import React from 'react';
import {
  Home,
  Compass,
  Layers,
  Bell,
  TrendingUp,
  FileText,
  Settings,
  Leaf
} from 'lucide-react';
import towersThumb from '../assets/transmission_towers.jpg';

export default function Sidebar({ activeTab, setActiveTab, alertCount = 3, isCritical = false }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'grid-map', label: 'Grid Map', icon: Compass },
    { id: 'assets', label: 'Assets', icon: Layers },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badge: alertCount > 0 ? alertCount : null
    },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-56 bg-[#080d19] border-r border-[#18233a] flex flex-col justify-between h-[calc(100vh-5rem)] sticky top-20 flex-shrink-0 select-none z-20">
      
      {/* Navigation List */}
      <div className="p-3 flex flex-col gap-1.5 overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/25 to-cyan-500/15 text-cyan-300 border border-cyan-400/35 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[11px] flex items-center justify-center shadow-neon-red">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Banner: "Smarter Grids. A Cleaner Tomorrow." */}
      <div className="p-3">
        <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 shadow-lg group cursor-pointer">
          {/* Background Image of Towers at Dusk */}
          <img
            src={towersThumb}
            alt="Smarter Grids"
            className="w-full h-28 object-cover object-bottom filter brightness-75 contrast-125 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080d19] via-[#080d19]/60 to-transparent" />

          {/* Text & Leaf Badge */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold text-cyan-300 leading-tight">
                Smarter Grids.
              </p>
              <p className="text-[10px] font-medium text-slate-300 leading-tight mt-0.5">
                A Cleaner Tomorrow.
              </p>
            </div>
            <div className="w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
              <Leaf className="w-3.5 h-3.5 fill-cyan-400/30" />
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
}

