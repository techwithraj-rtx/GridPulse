import React, { useState, useEffect } from 'react';
import {
  Bell,
  Play,
  Pause,
  Zap,
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import towersBg from '../assets/transmission_towers.jpg';

export default function Header({
  telemetry,
  isPlaying,
  setIsPlaying,
  onInjectFault,
  onReset,
  playbackIndex = 0,
  isCritical = false,
  alertCount = 3
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <header className="relative w-full h-20 bg-[#090d19] border-b border-[#18233a] px-6 flex items-center justify-between select-none overflow-hidden z-30">
      
      {/* Background Graphic: Power Transmission Towers at Dusk with Glowing Electric Lines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-35 overflow-hidden">
        <img
          src={towersBg}
          alt="Power Grid Skyline"
          className="w-full h-full object-cover object-center filter contrast-125 brightness-90"
        />
        {/* Cyber Neon Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b16] via-[#090e1f]/80 to-[#070b16]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#090e1f]/40 to-[#070b16]" />
      </div>

      {/* Brand & Tagline */}
      <div className="relative z-10 flex items-center gap-3.5">
        <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-500 shadow-neon-cyan p-0.5">
          <div className="w-full h-full bg-[#080f1e] rounded-[10px] flex items-center justify-center">
            <Zap className="w-6 h-6 text-cyan-400 fill-cyan-400/30 filter drop-shadow-[0_0_8px_#00f5ff]" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 font-sans">
              <span>GridPulse</span>
              <span className="text-cyan-400 font-semibold text-lg">AI</span>
            </h1>
          </div>
          <p className="text-[11px] font-medium text-slate-300 tracking-normal flex items-center gap-1">
            Detect Earlier. Explain Clearly. Fail Over Intelligently.
          </p>
        </div>
      </div>

      {/* Right Controls, Status, Time, Notifications, Operator Profile */}
      <div className="relative z-10 flex items-center gap-5">
        
        {/* Interactive Simulation Controls (Pill Bar) */}
        <div className="flex items-center gap-1.5 bg-[#0e172e]/90 backdrop-blur-md p-1 rounded-xl border border-cyan-500/25 shadow-lg">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause SCADA Telemetry Stream" : "Start Live SCADA Telemetry Stream"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate</span>
              </>
            )}
          </button>

          <button
            onClick={onInjectFault}
            title="Inject Thermal & Harmonic Grid Anomaly"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 transition active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
            <span className="hidden sm:inline">Inject Fault</span>
          </button>

          <button
            onClick={onReset}
            title="Reset to Nominal Baseline"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* System Online Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d1c2e]/80 border border-emerald-500/30 text-xs font-medium text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </span>
          <span className="text-white font-medium text-xs">System Online</span>
        </div>

        {/* Live Date & Time */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-300 border-l border-slate-700/60 pl-4 font-mono">
          <span>{formattedDate}</span>
          <span className="text-slate-400">{formattedTime}</span>
        </div>

        {/* Notification Bell with Badge */}
        <div className="relative cursor-pointer hover:opacity-90 transition">
          <button className="p-2 rounded-xl bg-[#0e172e] border border-slate-700/60 text-slate-300 hover:text-white transition">
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-neon-red">
            {alertCount}
          </span>
        </div>

        {/* User Profile Chip: Aniket Yadav - Operator */}
        <div className="flex items-center gap-3 pl-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold text-sm flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)] border border-cyan-300/40">
            A
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-white leading-tight">
              Aniket Yadav
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Operator
            </span>
          </div>
        </div>

      </div>

    </header>
  );
}

