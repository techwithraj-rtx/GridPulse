import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Thermometer,
  Zap,
  Activity,
  Droplet,
  Sparkles,
  Info,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

export default function HealthAssessment({
  telemetry,
  history = [],
  onNavigateFailover,
  onNavigateMaintenance
}) {
  // Extract values from telemetry or defaults
  const chi = telemetry ? Math.round(telemetry.chi) : 42;
  const isCritical = chi < 60;
  const isStress = chi >= 60 && chi < 80;

  // 4 factor scores computed dynamically from telemetry
  // Temperature factor: inversely proportional to delta_theta and WTI
  const tempDelta = telemetry ? telemetry.delta_theta : 31.4;
  const tempScore = Math.max(15, Math.min(100, Math.round(100 - (tempDelta - 10) * 3.2)));

  // Load factor: based on load current
  const currentA = telemetry ? telemetry.current_a : 412;
  const loadPct = Math.round((currentA / 525) * 100);
  const loadScore = Math.max(20, Math.min(100, Math.round(110 - loadPct * 0.7)));

  // Voltage factor: deviation from 11.0 kV (or 66 kV)
  const voltage = telemetry ? telemetry.voltage_kv : 10.45;
  const voltDev = Math.abs(11.0 - voltage);
  const voltageScore = Math.max(30, Math.min(100, Math.round(98 - voltDev * 40)));

  // Oil Condition: based on THD and OTI
  const thd = telemetry ? telemetry.thd_i : 12.8;
  const oilScore = Math.max(25, Math.min(100, Math.round(95 - (thd - 2.5) * 5.0)));

  // 6-Month historical data
  const sixMonthHistory = [
    { month: 'Jan', health: 94, status: 'healthy' },
    { month: 'Feb', health: 91, status: 'healthy' },
    { month: 'Mar', health: 88, status: 'healthy' },
    { month: 'Apr', health: isCritical ? 72 : 86, status: isCritical ? 'watch' : 'healthy' },
    { month: 'May', health: isCritical ? 58 : 84, status: isCritical ? 'stress' : 'healthy' },
    { month: 'Jun', health: chi, status: isCritical ? 'critical' : 'healthy' },
  ];

  // 30-Day trend synthesized or from history
  const trendData = history.length > 5
    ? history.map((item, idx) => ({
        day: `T-${history.length - idx}s`,
        health: item.chi,
        temp: item.temp_wti,
        thd: item.thd_i
      }))
    : [
        { day: 'Day 1', health: 92 },
        { day: 'Day 5', health: 90 },
        { day: 'Day 10', health: 87 },
        { day: 'Day 15', health: 82 },
        { day: 'Day 20', health: isCritical ? 71 : 85 },
        { day: 'Day 25', health: isCritical ? 54 : 83 },
        { day: 'Day 30', health: chi }
      ];

  // Factor bar color helper
  const getFactorColor = (score) => {
    if (score >= 75) return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
    if (score >= 50) return { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
    return { bar: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' };
  };

  // Status styles for CHI
  const getChiStatus = () => {
    if (chi >= 80) {
      return {
        label: 'Healthy',
        desc: 'Transformer operating within optimal nominal parameters.',
        color: '#059669',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    }
    if (chi >= 60) {
      return {
        label: 'Watch / Stress',
        desc: 'Moderate harmonic displacement detected; monitoring thermal gradient.',
        color: '#d97706',
        badge: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    }
    return {
      label: 'Critical',
      desc: 'Health index has dropped significantly. High thermal runaway risk.',
      color: '#e11d48',
      badge: 'bg-rose-50 text-rose-700 border-rose-200'
    };
  };

  const statusInfo = getChiStatus();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      
      {/* 1. Asset Details Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold font-mono text-sm">
            TX-17
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
                TR-017
              </h2>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-medium text-slate-600">East Grid Substation</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono font-medium text-slate-500">66/11 kV</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-700">25 MVA</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Bay 04 High-Voltage Yard</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" /> Updated 2 mins ago (Live Telemetry)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.badge} flex items-center gap-1.5`}>
            <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
            {statusInfo.label} Priority
          </span>

          {isCritical && (
            <button
              onClick={onNavigateFailover}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <span>View Failover Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Row: CHI Circular Ring & 4 Factors Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Composite Health Index Widget (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Composite Health Index
              </h3>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                SCADA Physics &amp; ML Diagnostic
              </p>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.badge}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* SVG Progress Ring */}
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                {/* Track */}
                <circle
                  cx="70"
                  cy="70"
                  r="56"
                  stroke="#e2e8f0"
                  strokeWidth="11"
                  fill="transparent"
                />
                {/* Active Score Bar */}
                <circle
                  cx="70"
                  cy="70"
                  r="56"
                  stroke={statusInfo.color}
                  strokeWidth="11"
                  strokeDasharray={351.8}
                  strokeDashoffset={351.8 - (351.8 * chi) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                  {chi}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  / 100 CHI
                </span>
              </div>
            </div>

            <div className="mt-3 text-center px-4">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {statusInfo.desc}
              </p>
              {telemetry?.is_anomaly && (
                <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-medium border border-rose-200">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  Isolation Forest ML Anomaly Confirmed
                </span>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Evaluation Interval: 1s SCADA</span>
            <span className="font-mono text-slate-700 font-medium">IEEE C57.104 Standard</span>
          </div>
        </div>

        {/* Right: Health Factors Breakdown Grid (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Health Factors Breakdown
              </h3>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                Component Degradation Breakdown
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              4 Physical Dimensions
            </span>
          </div>

          {/* 4 Mini Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            
            {/* Factor 1: Temperature */}
            {(() => {
              const style = getFactorColor(tempScore);
              return (
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Thermometer className="w-4 h-4 text-rose-600" />
                      Temperature
                    </span>
                    <span className={`font-bold font-mono text-xs ${style.text}`}>
                      {tempScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden my-1">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                      style={{ width: `${tempScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Gradient &Delta;&theta;: {tempDelta.toFixed(1)} &deg;C {tempScore < 50 ? '(Hotspot Warning)' : '(Normal)'}
                  </p>
                </div>
              );
            })()}

            {/* Factor 2: Load */}
            {(() => {
              const style = getFactorColor(loadScore);
              return (
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Zap className="w-4 h-4 text-amber-600" />
                      Load
                    </span>
                    <span className={`font-bold font-mono text-xs ${style.text}`}>
                      {loadScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden my-1">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                      style={{ width: `${loadScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Current: {currentA.toFixed(0)} A ({loadPct}% continuous capacity)
                  </p>
                </div>
              );
            })()}

            {/* Factor 3: Voltage */}
            {(() => {
              const style = getFactorColor(voltageScore);
              return (
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      Voltage
                    </span>
                    <span className={`font-bold font-mono text-xs ${style.text}`}>
                      {voltageScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden my-1">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                      style={{ width: `${voltageScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Measured: {voltage.toFixed(2)} kV (Nominal 11.0 kV)
                  </p>
                </div>
              );
            })()}

            {/* Factor 4: Oil Condition */}
            {(() => {
              const style = getFactorColor(oilScore);
              return (
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Droplet className="w-4 h-4 text-cyan-600" />
                      Oil Condition
                    </span>
                    <span className={`font-bold font-mono text-xs ${style.text}`}>
                      {oilScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden my-1">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                      style={{ width: `${oilScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    THD: {thd.toFixed(1)}% {thd > 5.0 ? '(Harmonic Surge)' : '(Compliant)'}
                  </p>
                </div>
              );
            })()}

          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Critical Threshold: Factor Score &lt; 40</span>
            <button
              onClick={onNavigateMaintenance}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <span>Schedule Inspection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. Trend Charts (Recharts): Area Chart & 6-Month History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Health Trend Last 30 Days (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Health Trend
              </h3>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                Degradation Profile (Last 30 Windows)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="w-3 h-0.5 bg-emerald-600 inline-block rounded-full" />
              <span>Composite Score</span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="healthGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isCritical ? "#e11d48" : "#059669"} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={isCritical ? "#e11d48" : "#059669"} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                  }}
                  labelStyle={{ fontWeight: 600, color: '#1e293b' }}
                />
                <Area
                  type="monotone"
                  dataKey="health"
                  stroke={isCritical ? "#e11d48" : "#059669"}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#healthGradLight)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Health History Last 6 Months (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Health History
              </h3>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                Monthly Average Score (Jan – Jun)
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">H1 2025</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sixMonthHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="health" radius={[4, 4, 0, 0]}>
                  {sixMonthHistory.map((entry, index) => {
                    let fill = '#059669';
                    if (entry.health < 60) fill = '#e11d48';
                    else if (entry.health < 80) fill = '#d97706';
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. AI Insight Callout Box */}
      <div className="rounded-2xl p-4 bg-emerald-50/70 border border-emerald-200/80 shadow-xs flex items-start gap-3.5 text-emerald-950">
        <div className="p-2 rounded-xl bg-emerald-600 text-white flex-shrink-0 shadow-xs mt-0.5">
          <Sparkles className="w-4 h-4 fill-current" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            GridPulse AI Operational Recommendation
          </h4>
          <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
            {isCritical
              ? "Health index is declining due to rising temperature (Delta theta = 31.4 °C) and 5th harmonic distortion (12.8%). Immediate automated failover through Tie Breaker TB-12 is strongly advised to prevent catastrophic insulation breakdown."
              : "Transformer TR-017 is running smoothly within baseline operational parameters. All thermal and dielectric indicators are well within IEEE standards. Next scheduled routine inspection in 42 days."}
          </p>
        </div>
        {isCritical && (
          <button
            onClick={onNavigateFailover}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold whitespace-nowrap self-center transition active:scale-95 shadow-xs"
          >
            Open Failover Hub
          </button>
        )}
      </div>

    </div>
  );
}
