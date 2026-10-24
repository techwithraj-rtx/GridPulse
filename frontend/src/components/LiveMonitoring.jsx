import React from 'react';
import {
  Thermometer,
  Zap,
  Activity,
  Gauge,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Info,
  Radio,
  Bell
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function LiveMonitoring({ telemetry, history = [] }) {
  // Telemetry metrics
  const tempWti = telemetry ? telemetry.temp_wti : 78;
  const tempOti = telemetry ? telemetry.temp_oti : 58;
  const currentA = telemetry ? telemetry.current_a : 420;
  const loadPct = Math.round((currentA / 525) * 100);
  const voltage = telemetry ? (telemetry.voltage_kv * 6).toFixed(1) : '66.0'; // 66 kV scale
  const thd = telemetry ? telemetry.thd_i : 11.4;
  const isCritical = (telemetry?.chi ?? 42) < 60;

  // Real-time dynamic alerts feed
  const alertsList = isCritical
    ? [
        {
          id: 1,
          type: 'CRITICAL',
          title: 'High Winding Temperature Hotspot Warning (> 110 °C)',
          time: 'Just now',
          desc: `T_wti reached ${tempWti.toFixed(1)} °C. Thermal gradient Δθ is ${telemetry?.delta_theta?.toFixed(1) || '31.4'} °C.`
        },
        {
          id: 2,
          type: 'WARNING',
          title: 'Current THD Exceeds IEEE 519 Standard (> 5.0%)',
          time: '45s ago',
          desc: `Harmonic distortion surged to ${thd.toFixed(1)}% THD on secondary 11kV bus.`
        },
        {
          id: 3,
          type: 'WARNING',
          title: 'Reactive Power Displacement Q/P Exceeded',
          time: '2m ago',
          desc: `Q/P ratio jumped to ${telemetry?.q_p_ratio?.toFixed(2) || '0.78'} (Power factor sag to 0.79).`
        },
        {
          id: 4,
          type: 'INFO',
          title: 'Automated Failover Route Computed',
          time: '3m ago',
          desc: 'NetworkX identified Substation B available with 42% headroom.'
        }
      ]
    : [
        {
          id: 1,
          type: 'NORMAL',
          title: 'Nominal Operating Temperature',
          time: '1m ago',
          desc: `T_wti measured at ${tempWti.toFixed(1)} °C within standard ONAN curve.`
        },
        {
          id: 2,
          type: 'NORMAL',
          title: 'Harmonic Distortion Within IEEE 519',
          time: '4m ago',
          desc: `Current THD steady at ${thd.toFixed(1)}% (< 5.0% threshold).`
        },
        {
          id: 3,
          type: 'INFO',
          title: 'Automatic Voltage Regulator (AVR) Tap Adjusted',
          time: '12m ago',
          desc: 'Tap changer locked at Position 7 for 66kV stabilization.'
        },
        {
          id: 4,
          type: 'NORMAL',
          title: 'Baseline Frequency Stabilized at 50.02 Hz',
          time: '24m ago',
          desc: 'Grid sync check verified normal across high-voltage bus.'
        }
      ];

  // Chart data formatted from history
  const chartData = history.length > 3
    ? history.map((item, idx) => ({
        tick: `T-${history.length - idx}s`,
        tempWti: item.temp_wti,
        tempOti: item.temp_oti,
        thd: item.thd_i
      }))
    : [
        { tick: '00:00', tempWti: 64, tempOti: 52, thd: 2.4 },
        { tick: '04:00', tempWti: 65, tempOti: 52, thd: 2.6 },
        { tick: '08:00', tempWti: 68, tempOti: 53, thd: 2.8 },
        { tick: '12:00', tempWti: 72, tempOti: 55, thd: 3.1 },
        { tick: '16:00', tempWti: 75, tempOti: 57, thd: isCritical ? 6.5 : 3.0 },
        { tick: '20:00', tempWti: isCritical ? 98 : 66, tempOti: isCritical ? 72 : 53, thd: isCritical ? 10.5 : 2.7 },
        { tick: 'Now', tempWti: tempWti, tempOti: tempOti, thd: thd }
      ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
              Live Monitoring
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time streaming telemetry, 24-hour trends, and time-stamped substation alert stream.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
            <span>Telemetry Ingestion: 1000ms</span>
          </span>
        </div>
      </div>

      {/* 2. Real-Time Dynamic 4 KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Tile 1: Temperature */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Winding Temperature</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              tempWti > 90
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {tempWti > 90 ? '+12% Hotspot' : 'Nominal'}
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight flex items-baseline gap-1">
              {tempWti.toFixed(0)}
              <span className="text-sm font-normal text-slate-500">&deg;C</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Top Oil Temp: {tempOti.toFixed(0)} &deg;C
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                tempWti > 90 ? 'bg-rose-500' : tempWti > 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (tempWti / 130) * 100)}%` }}
            />
          </div>
        </div>

        {/* Tile 2: Load */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Substation Load</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              loadPct > 80
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {loadPct}% Capacity
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight flex items-baseline gap-1">
              {loadPct}
              <span className="text-sm font-normal text-slate-500">%</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Continuous Rating: 25 MVA
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                loadPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${loadPct}%` }}
            />
          </div>
        </div>

        {/* Tile 3: Voltage */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Primary Voltage</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              66 kV Bus
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight flex items-baseline gap-1">
              {voltage}
              <span className="text-sm font-normal text-slate-500">kV</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Secondary: {(telemetry?.voltage_kv || 11.0).toFixed(2)} kV
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 w-[95%]" />
          </div>
        </div>

        {/* Tile 4: Current */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Load Current</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              3-Phase RMS
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight flex items-baseline gap-1">
              {currentA.toFixed(0)}
              <span className="text-sm font-normal text-slate-500">A</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              THD Harmonic: {thd.toFixed(1)}%
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                currentA > 380 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (currentA / 525) * 100)}%` }}
            />
          </div>
        </div>

      </div>

      {/* 3. Trend Chart & Right Alert Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 24-Hour Trend Line Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Temperature &amp; Harmonic Trends
              </h3>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                Thermal Runaway Tracking Profile
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5 text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> T<sub>wti</sub>
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> T<sub>oti</sub>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> THD<sub>i</sub>
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="tick" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 130]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tempWti"
                  name="Winding Temp (°C)"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="tempOti"
                  name="Top Oil Temp (°C)"
                  stroke="#d97706"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="thd"
                  name="Current THD (%)"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Sampling: IEC 61850 SCADA Stream</span>
            <span className="font-semibold text-slate-700">Divergence Alert &gt; 25 &deg;C</span>
          </div>
        </div>

        {/* Right: Live Alerts Log (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live Substation Alerts
                </h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isCritical
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {isCritical ? '2 Critical Alarms' : 'Normal Feed'}
              </span>
            </div>

            {/* Alert Items List */}
            <div className="space-y-3 mt-4">
              {alertsList.map((alert) => {
                let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (alert.type === 'CRITICAL') badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                if (alert.type === 'WARNING') badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                if (alert.type === 'INFO') badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';

                return (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${badgeClass}`}>
                        {alert.type}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {alert.time}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {alert.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {alert.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-2">
            <span>Total Logged Today: 18 Events</span>
            <button className="text-emerald-700 hover:text-emerald-800 font-semibold text-xs">
              View Audit Log →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
