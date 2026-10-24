import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Check,
  Clock,
  ShieldAlert
} from 'lucide-react';

export default function AlertsView({ telemetry }) {
  const isCritical = (telemetry?.chi ?? 42) < 60;
  const [filter, setFilter] = useState('ALL');

  const allAlerts = [
    {
      id: 101,
      title: 'High Winding Temperature Hotspot (T_wti > 110 °C)',
      severity: 'CRITICAL',
      asset: 'TR-017 (East Grid)',
      time: 'Just now',
      desc: 'Winding temperature exceeds continuous thermal envelope. Immediate load relief or tie failover advised.',
      status: 'ACTIVE'
    },
    {
      id: 102,
      title: 'Harmonic Current Distortion Limit Exceeded (THD > 5%)',
      severity: 'CRITICAL',
      asset: 'TR-017 (East Grid)',
      time: '45s ago',
      desc: '5th and 7th harmonic content surged to 12.8% on 11kV busbar A.',
      status: 'ACTIVE'
    },
    {
      id: 103,
      title: 'Reactive Power Q/P Ratio Sagging (PF < 0.82)',
      severity: 'WARNING',
      asset: 'TR-017 (East Grid)',
      time: '5m ago',
      desc: 'Heavy reactive displacement detected. Capacitor bank stepping required.',
      status: 'ACKNOWLEDGED'
    },
    {
      id: 104,
      title: 'Scheduled Transformer Oil Sampling Due',
      severity: 'INFO',
      asset: 'TR-021 (Central Depot)',
      time: '2h ago',
      desc: 'Routine quarterly laboratory dissolved gas analysis scheduled for next Tuesday.',
      status: 'ACKNOWLEDGED'
    },
    {
      id: 105,
      title: 'Substation Incomer Feeder Frequency Normal (50.01 Hz)',
      severity: 'RESOLVED',
      asset: 'Substation Bay 01',
      time: '5h ago',
      desc: 'Interstate utility tie line frequency normalized after transient deviation.',
      status: 'RESOLVED'
    }
  ];

  const filtered = allAlerts.filter(a => {
    if (filter === 'ACTIVE') return a.status === 'ACTIVE';
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (filter === 'RESOLVED') return a.status === 'RESOLVED';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto select-none">
      
      {/* Header */}
      <div className="cyber-card rounded-2xl p-6 border border-cyan-500/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 shadow-neon-cyan">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight font-sans">
              Substation Alerts &amp; Event Stream
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time SCADA alarm logs, threshold crossings, and AI diagnostic alerts.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#081122] p-1 rounded-xl border border-slate-800">
          {['ALL', 'ACTIVE', 'CRITICAL', 'RESOLVED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === f
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="cyber-card rounded-2xl border border-cyan-500/20 overflow-hidden">
        <div className="divide-y divide-slate-800/80">
          {filtered.map(alert => {
            let badgeClass = 'bg-slate-800/80 text-slate-300 border-slate-700';
            if (alert.severity === 'CRITICAL') badgeClass = 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-neon-red';
            if (alert.severity === 'WARNING') badgeClass = 'bg-amber-950/80 text-amber-300 border-amber-500/50';
            if (alert.severity === 'RESOLVED') badgeClass = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';

            return (
              <div key={alert.id} className="p-4.5 hover:bg-slate-800/30 transition flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`mt-0.5 p-2 rounded-xl border flex-shrink-0 ${badgeClass}`}>
                    {alert.severity === 'CRITICAL' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Clock className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeClass}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {alert.asset}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400 font-mono">
                        {alert.time}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {alert.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="px-3 py-1.5 rounded-lg bg-[#0e172e] hover:bg-cyan-950/60 border border-slate-700/80 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs font-medium transition">
                    Acknowledge
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
