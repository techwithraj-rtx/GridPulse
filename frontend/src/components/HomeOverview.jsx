import React, { useState } from 'react';
import {
  Activity,
  Zap,
  Bell,
  Coins,
  ChevronRight,
  Plus,
  Minus,
  Crosshair,
  TrendingUp,
  AlertTriangle,
  Building,
  CheckCircle2,
  Sliders,
  Filter,
  Cpu,
  FileText,
  Lightbulb,
  UserCheck,
  ChevronDown,
  Sparkles,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ComposedChart,
  Bar,
  Line
} from 'recharts';
import satelliteImg from '../assets/satellite_substation.jpg';

export default function HomeOverview({ telemetry, setActiveTab }) {
  const [trendTimeframe, setTrendTimeframe] = useState('24H');
  const [loadDays, setLoadDays] = useState('7 Days');
  const [mapZoom, setMapZoom] = useState(1);
  const [activeZone, setActiveZone] = useState('North');

  // Live telemetry dynamic bindings
  const chi = telemetry ? Math.round(telemetry.chi) : 94;
  const isCritical = chi < 60;

  // 1. Grid Stability Trend Data
  const stabilityData = [
    { time: '12 AM', stability: 74 },
    { time: '4 AM', stability: 82 },
    { time: '8 AM', stability: 78 },
    { time: '12 PM', stability: 85 },
    { time: '4 PM', stability: 94 }, // Peak highlighted point
    { time: '8 PM', stability: 83 },
    { time: '12 AM', stability: 89 },
  ];

  // 2. Load vs Actual Data (Oct 16 - Oct 22)
  const loadData = [
    { day: '16 Oct', actual: 145, predicted: 168 },
    { day: '17 Oct', actual: 172, predicted: 170 },
    { day: '18 Oct', actual: 160, predicted: 165 },
    { day: '19 Oct', actual: 198, predicted: 188 },
    { day: '20 Oct', actual: 138, predicted: 152 },
    { day: '21 Oct', actual: 184, predicted: 176 },
    { day: '22 Oct', actual: 152, predicted: 162 },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto select-none">
      
      {/* 1. Greeting Banner */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Good Afternoon, Aniket</span>
          <span className="text-2xl">👋</span>
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Here's what's happening with your grid today.
        </p>
      </div>

      {/* 2. Top Metric Cards (4 Grid KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Grid Health Score */}
        <div className="cyber-card rounded-2xl p-4.5 border border-cyan-500/20 hover:border-cyan-500/40 transition shadow-lg flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#08202b] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] flex-shrink-0">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-slate-300 block">
              Grid Health Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white tracking-tight font-sans">
                {chi}%
              </span>
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                <ArrowUp className="w-3 h-3 mr-0.5 inline" /> 2%
              </span>
            </div>
            <span className="text-[11px] font-medium text-emerald-400 mt-1 block">
              {isCritical ? 'Attention Required' : 'Stable & Optimal'}
            </span>
          </div>
        </div>

        {/* Card 2: Assets Monitored */}
        <div className="cyber-card rounded-2xl p-4.5 border border-blue-500/20 hover:border-blue-500/40 transition shadow-lg flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#0b1b36] border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)] flex-shrink-0">
            <Building className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-slate-300 block">
              Assets Monitored
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white tracking-tight font-sans">
                1,248
              </span>
              <span className="inline-flex items-center text-[11px] font-bold text-blue-400 bg-blue-950/60 border border-blue-500/30 px-1.5 py-0.5 rounded">
                <ArrowUp className="w-3 h-3 mr-0.5 inline" /> 12%
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400 mt-1 block truncate">
              Transformers | Lines | Substations
            </span>
          </div>
        </div>

        {/* Card 3: Active Alerts */}
        <div className="cyber-card rounded-2xl p-4.5 border border-rose-500/30 bg-[#160d1b]/70 hover:border-rose-500/50 transition shadow-lg flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#290d16] border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)] flex-shrink-0">
            <Bell className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-slate-300 block">
              Active Alerts
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white tracking-tight font-sans">
                3
              </span>
              <span className="inline-flex items-center text-[11px] font-bold text-rose-400 bg-rose-950/60 border border-rose-500/30 px-1.5 py-0.5 rounded">
                <ArrowDown className="w-3 h-3 mr-0.5 inline" /> 60%
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400 mt-1 block">
              1 Critical | 2 Warnings
            </span>
          </div>
        </div>

        {/* Card 4: Predicted Savings */}
        <div className="cyber-card rounded-2xl p-4.5 border border-purple-500/20 hover:border-purple-500/40 transition shadow-lg flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#1d1233] border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)] flex-shrink-0">
            <Coins className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-slate-300 block">
              Predicted Savings
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-sans">
                ₹ 12.4 Lakhs
              </span>
              <span className="inline-flex items-center text-[11px] font-bold text-teal-400 bg-teal-950/60 border border-teal-500/30 px-1.5 py-0.5 rounded">
                <ArrowUp className="w-3 h-3 mr-0.5 inline" /> 18%
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400 mt-1 block">
              vs. last 7 days
            </span>
          </div>
        </div>

      </div>

      {/* 3. Middle Section: Live Grid Map & Satellite View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Map: Live Grid Map (7 cols) */}
        <div className="lg:col-span-7 cyber-card rounded-2xl p-5 border border-cyan-500/25 flex flex-col justify-between relative overflow-hidden min-h-[460px]">
          
          {/* Header & Status */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Live Grid Map
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Real-time
              </span>
            </div>
          </div>

          {/* Top-Left Legend */}
          <div className="absolute top-14 left-5 z-10 flex flex-col gap-1 text-[10px] text-slate-300 bg-[#091122]/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Substation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Transformer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-cyan-400" />
              <span>Transmission Line</span>
            </div>
            <div className="pt-1 mt-1 border-t border-slate-700/50 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Healthy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-neon-red" />
                <span>Critical</span>
              </div>
            </div>
          </div>

          {/* Interactive SVG Grid Canvas */}
          <div className="relative w-full h-[360px] my-auto flex items-center justify-center">
            
            <svg
              viewBox="0 0 600 360"
              className="w-full h-full max-h-[380px] filter drop-shadow-[0_0_20px_rgba(6,182,212,0.15)]"
              style={{ transform: `scale(${mapZoom})`, transition: 'transform 0.3s ease' }}
            >
              {/* Regional Grid Boundary Silhouette */}
              <path
                d="M 120 70 Q 280 40 450 70 Q 540 140 520 260 Q 420 340 300 330 Q 180 340 100 250 Q 70 160 120 70 Z"
                fill="#071224"
                stroke="#152844"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />

              {/* Zone Labels */}
              <text x="240" y="85" fill="#475569" fontSize="11" fontWeight="600">North Zone</text>
              <text x="440" y="190" fill="#475569" fontSize="11" fontWeight="600">East Zone</text>
              <text x="180" y="240" fill="#475569" fontSize="11" fontWeight="600">West Zone</text>
              <text x="290" y="300" fill="#475569" fontSize="11" fontWeight="600">South Zone</text>

              {/* Interconnecting Power Lines */}
              {/* Healthy Lines (Cyan Glowing) */}
              <line x1="220" y1="175" x2="280" y2="120" stroke="#06b6d4" strokeWidth="2" strokeOpacity="0.8" />
              <line x1="280" y1="120" x2="355" y2="175" stroke="#06b6d4" strokeWidth="2" strokeOpacity="0.8" />
              <line x1="220" y1="175" x2="245" y2="245" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 3" />
              <line x1="245" y1="245" x2="355" y2="175" stroke="#f59e0b" strokeWidth="2" />
              <line x1="355" y1="175" x2="420" y2="245" stroke="#06b6d4" strokeWidth="2" />
              <line x1="280" y1="120" x2="420" y2="245" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" />
              <line x1="245" y1="245" x2="330" y2="285" stroke="#06b6d4" strokeWidth="2" />
              <line x1="330" y1="285" x2="420" y2="245" stroke="#06b6d4" strokeWidth="2" />

              {/* Animated Power Flow Particles */}
              <line x1="280" y1="120" x2="355" y2="175" stroke="#38bdf8" strokeWidth="2" className="animate-power-flow" />

              {/* Nodes: Substations & Transformers */}
              {/* North Substation Node (Green) */}
              <circle cx="280" cy="120" r="14" fill="#042f2e" stroke="#10b981" strokeWidth="2" />
              <circle cx="280" cy="120" r="6" fill="#10b981" />
              <Building className="w-3.5 h-3.5 text-white" />

              {/* West Node (Green) */}
              <circle cx="220" cy="175" r="12" fill="#042f2e" stroke="#10b981" strokeWidth="2" />
              <circle cx="220" cy="175" r="5" fill="#10b981" />

              {/* West-South Node (Warning / Orange) */}
              <circle cx="245" cy="245" r="12" fill="#451a03" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="245" cy="245" r="5" fill="#f59e0b" />

              {/* South Node (Green) */}
              <circle cx="330" cy="285" r="12" fill="#042f2e" stroke="#10b981" strokeWidth="2" />
              <circle cx="330" cy="285" r="5" fill="#10b981" />

              {/* East Node (Green) */}
              <circle cx="420" cy="245" r="12" fill="#042f2e" stroke="#10b981" strokeWidth="2" />
              <circle cx="420" cy="245" r="5" fill="#10b981" />

              {/* CRITICAL NODE: Transformer T-248 (Red Radial Pulse) */}
              <g className="cursor-pointer" onClick={() => setActiveTab('health')}>
                {/* Concentric Pulsing Red Rings */}
                <circle cx="355" cy="175" r="28" fill="#e11d48" fillOpacity="0.2" className="animate-ping" style={{ animationDuration: '3s' }} />
                <circle cx="355" cy="175" r="20" fill="#e11d48" fillOpacity="0.3" />
                <circle cx="355" cy="175" r="14" fill="#881337" stroke="#f43f5e" strokeWidth="2.5" />
                <circle cx="355" cy="175" r="6" fill="#f43f5e" />
              </g>
            </svg>

            {/* Annotated Callout Card Pointing to T-248 */}
            <div className="absolute top-[18%] right-[12%] z-20 bg-[#1e0d19]/95 backdrop-blur-md border border-rose-500/60 rounded-xl p-2.5 shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-start gap-2.5 max-w-[200px]">
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white leading-tight">
                  Transformer T-248
                </span>
                <span className="text-[10px] font-semibold text-rose-400 mt-0.5">
                  Critical
                </span>
                <span className="text-[10px] font-medium text-slate-300">
                  Risk Score: <strong className="text-rose-400">87%</strong>
                </span>
              </div>
            </div>

            {/* Floating Bottom Left: North Region Card */}
            <div className="absolute bottom-3 left-4 z-20 bg-[#091122]/90 backdrop-blur-md border border-cyan-500/30 rounded-xl px-3 py-2 flex items-center gap-3 shadow-lg">
              <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Building className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-medium text-slate-400 leading-tight">
                  North Region
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Grid Health</span>
                  <span className="text-xs font-bold text-emerald-400">96%</span>
                </div>
              </div>
              {/* Mini Sparkline Curve */}
              <svg width="45" height="18" className="overflow-visible stroke-emerald-400 stroke-2 fill-none ml-1">
                <path d="M 0 14 Q 10 4 20 12 T 45 4" />
              </svg>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Bottom Right Zoom / Recenter Controls */}
            <div className="absolute bottom-3 right-4 z-20 flex flex-col gap-1 bg-[#091122]/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg">
              <button
                onClick={() => setMapZoom(prev => Math.min(prev + 0.2, 1.8))}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition"
                title="Zoom In"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMapZoom(prev => Math.max(prev - 0.2, 0.8))}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition"
                title="Zoom Out"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMapZoom(1)}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition"
                title="Reset View"
              >
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>

          </div>

        </div>

        {/* Right Map: Satellite View (5 cols) */}
        <div className="lg:col-span-5 cyber-card rounded-2xl p-5 border border-cyan-500/25 flex flex-col justify-between relative overflow-hidden min-h-[460px]">
          
          {/* Header & Status */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Satellite View
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              Live Imagery
            </span>
          </div>

          {/* Aerial Satellite Imagery Container */}
          <div className="relative w-full h-[360px] my-auto rounded-xl overflow-hidden border border-cyan-500/20 shadow-inner group">
            <img
              src={satelliteImg}
              alt="High Resolution Satellite View"
              className="w-full h-full object-cover object-center filter brightness-90 contrast-110 group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080d19]/90 via-transparent to-[#080d19]/40 pointer-events-none" />

            {/* Overlaid Vector Pins & Telemetry Labels */}
            
            {/* Tag 1: 132/33 kV Substation (S-102) */}
            <div className="absolute top-[16%] left-[24%] z-10 flex items-center gap-1.5 bg-[#061427]/90 border border-cyan-400/80 px-2 py-0.5 rounded-full text-[10px] font-semibold text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>132/33 kV Substation (S-102)</span>
            </div>

            {/* Tag 2: Transmission Line (400 kV) */}
            <div className="absolute top-[32%] right-[8%] z-10 flex items-center gap-1.5 bg-[#061427]/90 border border-cyan-400/60 px-2 py-0.5 rounded-full text-[10px] font-semibold text-cyan-300 shadow-md">
              <span className="w-1.5 h-1.5 bg-cyan-400 rotate-45" />
              <span>Transmission Line (400 kV)</span>
            </div>

            {/* Tag 3: Critical Asset T-248 with Red Glowing Concentric Target */}
            <div className="absolute top-[48%] right-[22%] z-10 flex flex-col items-center">
              {/* Concentric red pulse rings */}
              <div className="relative flex items-center justify-center w-12 h-12">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-60" />
                <span className="relative inline-flex rounded-full h-6 w-6 bg-rose-600/80 border-2 border-rose-400 shadow-[0_0_15px_#f43f5e]" />
              </div>
              <div className="bg-[#240816]/95 border border-rose-500 px-2 py-0.5 rounded-md text-[10px] font-bold text-rose-300 shadow-neon-red mt-1">
                T-248 (Critical)
              </div>
            </div>

            {/* Tag 4: 33/11 kV Substation (S-077) */}
            <div className="absolute bottom-[22%] right-[16%] z-10 flex items-center gap-1.5 bg-[#061427]/90 border border-cyan-400/80 px-2 py-0.5 rounded-full text-[10px] font-semibold text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>33/11 kV Substation (S-077)</span>
            </div>

            {/* Compass Rose (N) in bottom right corner */}
            <div className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-[#081122]/90 border border-slate-700 flex flex-col items-center justify-center text-[9px] font-bold text-cyan-300 shadow-lg">
              <span className="text-[10px] leading-none text-rose-400 font-extrabold">▲</span>
              <span className="leading-none mt-0.5">N</span>
            </div>

          </div>

          {/* Bottom Satellite Legend */}
          <div className="flex items-center justify-between text-[10px] text-slate-300 px-1 pt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Substation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Transformer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-neon-red" />
              <span>Critical Asset</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400" />
              <span>Transmission Line</span>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Row 3: Grid Stability Trend, Top Alerts, and Predicted Load vs Actual */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        
        {/* Card 1: Grid Stability Trend (4 cols) */}
        <div className="lg:col-span-4 cyber-card rounded-2xl p-5 border border-cyan-500/20 flex flex-col justify-between">
          
          {/* Header & Filter Controls */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Grid Stability Trend
              </h3>
            </div>
            <div className="flex items-center bg-[#070e1c] p-0.5 rounded-lg border border-slate-800">
              {['24H', '7D', '30D'].map(period => (
                <button
                  key={period}
                  onClick={() => setTrendTimeframe(period)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                    trendTimeframe === period
                      ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stabilityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyberCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#1e293b' }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[20, 40, 60, 80, 100]}
                  tickFormatter={v => `${v}%`}
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#1e293b' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0b1329] border border-cyan-400/80 px-2.5 py-1.5 rounded-lg shadow-neon-cyan text-center">
                          <span className="text-xs font-bold text-cyan-300 block">
                            {payload[0].value}%
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            14:32
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="stability"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cyberCyan)"
                  dot={{ r: 3, fill: '#06b6d4', stroke: '#080d19', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#00f5ff', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Card 2: Top Alerts (4 cols) */}
        <div className="lg:col-span-4 cyber-card rounded-2xl p-5 border border-cyan-500/20 flex flex-col justify-between">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Top Alerts
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('alerts')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>

          {/* 3 Alert Items */}
          <div className="flex flex-col gap-2.5">
            
            {/* Alert 1: Critical */}
            <div
              onClick={() => setActiveTab('health')}
              className="p-2.5 rounded-xl bg-[#1d0d18]/70 hover:bg-[#251020] border border-rose-500/40 transition cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-neon-red flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                      Critical
                    </span>
                    <span className="text-xs font-bold text-white">
                      T-248 Transformer
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    High temperature (87°C)
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-medium text-slate-400 flex-shrink-0">
                1h ago
              </span>
            </div>

            {/* Alert 2: Warning */}
            <div className="p-2.5 rounded-xl bg-[#1c160c]/70 hover:bg-[#261e10] border border-amber-500/40 transition cursor-pointer flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Warning
                    </span>
                    <span className="text-xs font-bold text-white">
                      Line L-103
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Voltage fluctuation detected
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-medium text-slate-400 flex-shrink-0">
                3h ago
              </span>
            </div>

            {/* Alert 3: Warning */}
            <div className="p-2.5 rounded-xl bg-[#1c160c]/70 hover:bg-[#261e10] border border-amber-500/40 transition cursor-pointer flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Warning
                    </span>
                    <span className="text-xs font-bold text-white">
                      T-112 Transformer
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Oil level dropping
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-medium text-slate-400 flex-shrink-0">
                5h ago
              </span>
            </div>

          </div>

        </div>

        {/* Card 3: Predicted Load vs Actual (4 cols) */}
        <div className="lg:col-span-4 cyber-card rounded-2xl p-5 border border-cyan-500/20 flex flex-col justify-between">
          
          {/* Header & Controls */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Predicted Load vs Actual
            </h3>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#070e1c] border border-slate-800 text-[10px] font-semibold text-slate-300">
              <span>{loadDays}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Subheader Legend */}
          <div className="flex items-center gap-4 text-[10px] text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Predicted</span>
            </div>
          </div>

          {/* Combo Bar & Line Chart Container */}
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={loadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#1e293b' }}
                />
                <YAxis
                  domain={[0, 250]}
                  ticks={[0, 50, 100, 150, 200, 250]}
                  tickFormatter={v => `${v} MW`}
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#1e293b' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0b1329] border border-cyan-400/80 px-2.5 py-1.5 rounded-lg shadow-neon-cyan">
                          <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">
                            {payload[0].payload.day}
                          </span>
                          <span className="text-xs font-bold text-teal-300 block">
                            Actual: {payload[0].payload.actual} MW
                          </span>
                          <span className="text-xs font-bold text-cyan-300 block">
                            Predicted: {payload[0].payload.predicted} MW
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Actual Load Teal Bars */}
                <Bar
                  dataKey="actual"
                  fill="#14b8a6"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
                {/* Predicted Load Dotted / Glowing Spline Line */}
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#00f5ff"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={{ r: 3, fill: '#00f5ff', stroke: '#080d19', strokeWidth: 1.5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>

      {/* 5. Row 4: Process Flow Banner: "How GridPulse AI Works" */}
      <div className="cyber-card rounded-2xl p-6 border border-cyan-500/25 relative overflow-hidden shadow-xl">
        
        {/* Subtle Ambient Glow and Circuitry Accents */}
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-cyan-900/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left: Workflow Steps */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-cyan-400 font-bold text-base leading-none">+</span>
              <h3 className="text-sm font-bold text-white tracking-wide">
                How GridPulse AI Works
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-medium mb-5">
              From raw data to smarter decisions.
            </p>

            {/* 6 Step Pipeline Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              
              {/* Step 1: Sensor Data */}
              <div className="bg-[#091122]/90 border border-cyan-500/25 rounded-xl p-3 flex flex-col items-center text-center relative group hover:border-cyan-400 transition">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-2 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-white">
                  1. Sensor Data
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">
                  (IoT + SCADA)
                </span>
              </div>

              {/* Step 2: Data Validation */}
              <div className="bg-[#091122]/90 border border-cyan-500/25 rounded-xl p-3 flex flex-col items-center text-center relative group hover:border-cyan-400 transition">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-2 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                  <Filter className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-white">
                  2. Data Validation
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">
                  (Clean &amp; Filter)
                </span>
              </div>

              {/* Step 3: AI Prediction */}
              <div className="bg-[#091122]/90 border border-cyan-500/25 rounded-xl p-3 flex flex-col items-center text-center relative group hover:border-cyan-400 transition">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-2 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-white">
                  3. AI Prediction
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">
                  (ML + GenAI)
                </span>
              </div>

              {/* Step 4: Explainability */}
              <div className="bg-[#091122]/90 border border-cyan-500/25 rounded-xl p-3 flex flex-col items-center text-center relative group hover:border-cyan-400 transition">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-2 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-white">
                  4. Explainability
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">
                  (XAI)
                </span>
              </div>

              {/* Step 5: Recommendations */}
              <div className="bg-[#091122]/90 border border-cyan-500/25 rounded-xl p-3 flex flex-col items-center text-center relative group hover:border-cyan-400 transition">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-2 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-white">
                  5. Recommendations
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">
                  (Actionable Insights)
                </span>
              </div>

              {/* Step 6: Human Approved */}
              <div className="bg-[#091122]/90 border border-cyan-500/25 rounded-xl p-3 flex flex-col items-center text-center relative group hover:border-cyan-400 transition">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-2 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-white">
                  6. Human Approved
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">
                  (Failover / Maintenance)
                </span>
              </div>

            </div>
          </div>

          {/* Right: Resilient Grid Brand Callout */}
          <div className="lg:w-72 flex flex-col justify-center items-start lg:items-end text-left lg:text-right border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-4 lg:pt-0 lg:pl-6 flex-shrink-0">
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Real-time monitoring.<br />
              Explainable insights.<br />
              A more resilient grid.
            </p>
            <div className="flex items-center gap-2 mt-3 text-cyan-400 font-bold text-base font-sans">
              <Zap className="w-5 h-5 fill-cyan-400/30" />
              <span>GridPulse AI</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

