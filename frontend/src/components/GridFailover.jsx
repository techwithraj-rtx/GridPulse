import React, { useState } from 'react';
import {
  GitFork,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Clock,
  RefreshCw,
  Info
} from 'lucide-react';

export default function GridFailover({
  telemetry,
  gridTopology,
  onExecuteInterlock,
  isExecuting = false
}) {
  const [simulatedRouteActive, setSimulatedRouteActive] = useState(false);

  const isInterlockDone = telemetry?.interlock_executed || gridTopology?.interlock_executed || simulatedRouteActive;
  const isCritical = (telemetry?.chi ?? 42) < 60;

  const handleToggleFailover = async () => {
    if (onExecuteInterlock) {
      await onExecuteInterlock();
    }
    setSimulatedRouteActive(!simulatedRouteActive);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      
      {/* 1. Header Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <GitFork className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
              Grid Failover
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate and identify alternative power routes during transformer outages.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-2 ${
            isInterlockDone
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : isCritical
              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isInterlockDone ? 'bg-emerald-600' : isCritical ? 'bg-rose-500' : 'bg-slate-400'
            }`} />
            <span>
              {isInterlockDone
                ? 'Failover Active (Substation B)'
                : isCritical
                ? 'Outage Detected: Failover Recommended'
                : 'Primary Route Active (Normal)'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Network Topology Visualizer & Simulated Failover Preview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: SVG Network Topology Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Network Topology Visualizer
              </h3>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                Substation Interconnect &amp; Power Routing
              </p>
            </div>

            {/* Route Status Badges */}
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Active Route
              </span>
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Alternative Route
              </span>
              <span className="flex items-center gap-1 text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Outage
              </span>
            </div>
          </div>

          {/* SVG Topology Diagram (Clean Enterprise Light-Mode) */}
          <div className="my-6 bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex items-center justify-center">
            <svg viewBox="0 0 540 320" className="w-full max-h-80 select-none">
              
              {/* Connection Lines */}
              {/* Route A to C (Primary Route) */}
              <path
                d="M 120 90 L 270 230"
                stroke={isInterlockDone ? "#cbd5e1" : (isCritical ? "#f87171" : "#059669")}
                strokeWidth={isInterlockDone ? "2" : "3.5"}
                strokeDasharray={isInterlockDone ? "4 4" : "none"}
                className={!isInterlockDone ? "animate-power-flow" : ""}
                fill="none"
              />

              {/* Route B to C (Alternative Route) */}
              <path
                d="M 420 90 L 270 230"
                stroke={isInterlockDone ? "#059669" : "#94a3b8"}
                strokeWidth={isInterlockDone ? "3.5" : "2"}
                strokeDasharray={isInterlockDone ? "none" : "5 5"}
                className={isInterlockDone ? "animate-power-flow" : ""}
                fill="none"
              />

              {/* Tie Interconnect A to B */}
              <path
                d="M 120 90 L 420 90"
                stroke={isInterlockDone ? "#059669" : "#cbd5e1"}
                strokeWidth="2.5"
                strokeDasharray={isInterlockDone ? "none" : "6 4"}
                fill="none"
              />

              {/* Center Tie-Breaker Box on A-B line */}
              <g transform="translate(255, 78)">
                <rect
                  x="0"
                  y="0"
                  width="30"
                  height="24"
                  rx="4"
                  fill="#ffffff"
                  stroke={isInterlockDone ? "#059669" : "#94a3b8"}
                  strokeWidth="2"
                />
                <text
                  x="15"
                  y="15"
                  fill={isInterlockDone ? "#059669" : "#64748b"}
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  TB-12
                </text>
                <circle
                  cx="15"
                  cy="27"
                  r="3"
                  fill={isInterlockDone ? "#059669" : "#ef4444"}
                />
              </g>

              {/* Node 1: Substation A (TR-017) */}
              <g transform="translate(120, 90)">
                <circle
                  cx="0"
                  cy="0"
                  r="36"
                  fill="#ffffff"
                  stroke={isInterlockDone ? "#94a3b8" : (isCritical ? "#ef4444" : "#059669")}
                  strokeWidth="3"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="28"
                  fill={isCritical && !isInterlockDone ? "#fee2e2" : "#f8fafc"}
                />
                <text x="0" y="-3" fill="#1e293b" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Substation A
                </text>
                <text x="0" y="11" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  TR-017 (25 MVA)
                </text>

                {/* Status Flag */}
                <g transform="translate(0, -48)">
                  <rect
                    x="-55"
                    y="0"
                    width="110"
                    height="18"
                    rx="9"
                    fill={isInterlockDone ? "#f1f5f9" : (isCritical ? "#fee2e2" : "#ecfdf5")}
                    stroke={isInterlockDone ? "#cbd5e1" : (isCritical ? "#fca5a5" : "#a7f3d0")}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="12"
                    fill={isInterlockDone ? "#64748b" : (isCritical ? "#b91c1c" : "#047857")}
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {isInterlockDone ? 'ISOLATED' : (isCritical ? 'OUTAGE DETECTED' : 'ACTIVE INCOMER')}
                  </text>
                </g>
              </g>

              {/* Node 2: Substation B (Healthy Backup) */}
              <g transform="translate(420, 90)">
                <circle
                  cx="0"
                  cy="0"
                  r="36"
                  fill="#ffffff"
                  stroke={isInterlockDone ? "#059669" : "#059669"}
                  strokeWidth={isInterlockDone ? "3.5" : "2.5"}
                />
                <circle cx="0" cy="0" r="28" fill="#f8fafc" />
                <text x="0" y="-3" fill="#1e293b" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Substation B
                </text>
                <text x="0" y="11" fill="#047857" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  TR-02 (Headroom: 42%)
                </text>

                {/* Status Flag */}
                <g transform="translate(0, -48)">
                  <rect
                    x="-65"
                    y="0"
                    width="130"
                    height="18"
                    rx="9"
                    fill="#ecfdf5"
                    stroke="#a7f3d0"
                    strokeWidth="1"
                  />
                  <text x="0" y="12" fill="#047857" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {isInterlockDone ? 'POWER ROUTED VIA B' : 'ALTERNATIVE ROUTE READY'}
                  </text>
                </g>
              </g>

              {/* Node 3: Substation C (Downstream Feeder Demand) */}
              <g transform="translate(270, 230)">
                <circle
                  cx="0"
                  cy="0"
                  r="34"
                  fill="#ffffff"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />
                <circle cx="0" cy="0" r="26" fill="#eff6ff" />
                <text x="0" y="-3" fill="#1e293b" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Substation C
                </text>
                <text x="0" y="11" fill="#2563eb" fontSize="9" textAnchor="middle">
                  Grid Load (18 MW)
                </text>

                {/* Customer Flag */}
                <g transform="translate(0, 42)">
                  <rect
                    x="-70"
                    y="0"
                    width="140"
                    height="18"
                    rx="9"
                    fill="#f8fafc"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                  <text x="0" y="12" fill="#475569" fontSize="9" fontWeight="medium" textAnchor="middle">
                    East Grid Residential &amp; Industry
                  </text>
                </g>
              </g>

            </svg>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Dynamic switching topology powered by NetworkX Graph Engine
            </span>
            <span className="font-semibold text-slate-700">
              Interlock 25A Confirmed
            </span>
          </div>
        </div>

        {/* Right: Simulated Failover Preview Card (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Simulated Failover Preview
                </h3>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  Automated Switching Assessment
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Safe Headroom
              </span>
            </div>

            {/* AI Summary Banner */}
            <div className="my-4 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 leading-relaxed flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-emerald-950">Switchover Feasibility Confirmed</span>
                Load can be supplied via Substation B with minimal impact on distribution continuity.
              </div>
            </div>

            {/* Route Details Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-50 px-3.5 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                Contingency Parameters
              </div>

              <div className="divide-y divide-slate-100">
                <div className="px-3.5 py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Primary Route</span>
                  <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                    Unavailable (TR-017 Tripping Risk)
                  </span>
                </div>

                <div className="px-3.5 py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Alternative Route</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    Substation B (Available - 42% Headroom)
                  </span>
                </div>

                <div className="px-3.5 py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Switchover Time</span>
                  <span className="font-mono font-semibold text-slate-800">
                    ~2 min (Synchronized Transfer)
                  </span>
                </div>

                <div className="px-3.5 py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Affected Area</span>
                  <span className="text-slate-800 font-medium text-right">
                    East Grid (Industrial &amp; Residential)
                  </span>
                </div>

                <div className="px-3.5 py-2.5 flex items-center justify-between bg-slate-50/50">
                  <span className="text-slate-500 font-medium">Controlled Shedding</span>
                  <span className="text-amber-800 font-semibold text-right">
                    Feeder 2 (3.5 MVA Non-Critical)
                  </span>
                </div>
              </div>
            </div>

            {/* Step sequence indicator */}
            <div className="mt-4 space-y-1.5 text-[11px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Interlocking Sequence Execution
              </span>
              <div className="flex items-center gap-2 text-slate-600">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isInterlockDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  1
                </span>
                <span>Trip CB_F2 (Shed non-critical load)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isInterlockDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  2
                </span>
                <span>Trip CB_HV_01 &amp; CB_LV_01 (Isolate TR-017)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isInterlockDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  3
                </span>
                <span>Close Tie-Breaker TB-12 (Transfer to Substation B)</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={handleToggleFailover}
              disabled={isExecuting}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition active:scale-95 ${
                isInterlockDone
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20'
              }`}
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Switching Sequence...</span>
                </>
              ) : isInterlockDone ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Failover Active • Revert to Primary Route</span>
                </>
              ) : (
                <>
                  <span>Simulate Failover</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
