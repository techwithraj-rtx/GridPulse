import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HealthAssessment from './components/HealthAssessment';
import GridFailover from './components/GridFailover';
import MaintenanceSpares from './components/MaintenanceSpares';
import LiveMonitoring from './components/LiveMonitoring';
import HomeOverview from './components/HomeOverview';
import TransformersView from './components/TransformersView';
import AlertsView from './components/AlertsView';
import ReportsView from './components/ReportsView';
import { AlertCircle, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('overview'); // default to Overview dashboard matching screenshot

  // Telemetry & Streaming State
  const [telemetry, setTelemetry] = useState(null);
  const [history, setHistory] = useState([]);
  const [gridTopology, setGridTopology] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInterlockExecuting, setIsInterlockExecuting] = useState(false);
  const [signoffSuccess, setSignoffSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef(null);

  // Initial data load
  useEffect(() => {
    fetchInitialData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Polling loop when isPlaying is active
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        advanceStep();
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resCurrent, resTopology] = await Promise.all([
        fetch(`${API_BASE}/api/telemetry/current`),
        fetch(`${API_BASE}/api/grid/topology`)
      ]);
      const currentData = await resCurrent.json();
      const topoData = await resTopology.json();

      setTelemetry(currentData);
      setGridTopology(topoData);

      const resHist = await fetch(`${API_BASE}/api/telemetry/history?limit=30`);
      if (resHist.ok) {
        const histData = await resHist.json();
        setHistory(histData);
      } else {
        setHistory([currentData]);
      }
      setError(null);
    } catch (err) {
      console.warn('Backend not responding yet:', err);
      setError('Cannot connect to GridPulse backend server at ' + API_BASE);
      // Fallback state so UI is immediately visible even if backend is starting
      setTelemetry({
        step: 0,
        voltage_kv: 11.02,
        current_a: 248.5,
        thd_i: 2.65,
        temp_oti: 52.1,
        temp_wti: 64.3,
        delta_theta: 12.2,
        p_mw: 4.5,
        q_mvar: 1.2,
        q_p_ratio: 0.267,
        chi: 98.4,
        status: 'NORMAL',
        status_color: '#059669',
        sigma_thd: 0.0,
        sigma_delta_theta: 0.8,
        sigma_qp: 3.1,
        is_anomaly: false,
        anomaly_score: 0.124,
        interlock_executed: false
      });
    } finally {
      setLoading(false);
    }
  };

  const advanceStep = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/telemetry/next`);
      if (!res.ok) throw new Error('API error on advance step');
      const data = await res.json();
      setTelemetry(data);
      setHistory(prev => {
        const next = [...prev, data];
        return next.length > 30 ? next.slice(next.length - 30) : next;
      });
      fetchGridTopology();
      setError(null);
    } catch (err) {
      console.error('Error fetching next telemetry:', err);
      setIsPlaying(false);
    }
  };

  const fetchGridTopology = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/grid/topology`);
      if (res.ok) {
        const data = await res.json();
        setGridTopology(data);
      }
    } catch (err) {
      console.error('Error fetching topology:', err);
    }
  };

  const handleInjectFault = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/simulation/fault-inject`, { method: 'POST' });
      const data = await res.json();
      setTelemetry(data.telemetry);
      setHistory(prev => [...prev.slice(-15), data.telemetry]);
      fetchGridTopology();
      setError(null);
    } catch (err) {
      console.error('Fault injection error:', err);
      // Local fallback simulation
      setTelemetry(prev => ({
        ...prev,
        step: 157,
        voltage_kv: 10.42,
        current_a: 428.0,
        thd_i: 13.8,
        temp_oti: 81.2,
        temp_wti: 116.4,
        delta_theta: 35.2,
        p_mw: 4.45,
        q_mvar: 3.65,
        q_p_ratio: 0.82,
        chi: 38.6,
        status: 'CRITICAL',
        status_color: '#e11d48',
        sigma_thd: 90.0,
        sigma_delta_theta: 100.0,
        sigma_qp: 100.0,
        is_anomaly: true,
        anomaly_score: -0.214,
        interlock_executed: false
      }));
    }
  };

  const handleReset = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/simulation/reset`, { method: 'POST' });
      const data = await res.json();
      setTelemetry(data.telemetry);
      setHistory([data.telemetry]);
      setSignoffSuccess(false);
      fetchGridTopology();
      setError(null);
    } catch (err) {
      console.error('Reset error:', err);
      setTelemetry(prev => ({
        ...prev,
        step: 0,
        voltage_kv: 11.02,
        current_a: 248.5,
        thd_i: 2.65,
        temp_oti: 52.1,
        temp_wti: 64.3,
        delta_theta: 12.2,
        p_mw: 4.5,
        q_mvar: 1.2,
        q_p_ratio: 0.267,
        chi: 98.4,
        status: 'NORMAL',
        status_color: '#059669',
        sigma_thd: 0.0,
        sigma_delta_theta: 0.8,
        sigma_qp: 3.1,
        is_anomaly: false,
        anomaly_score: 0.124,
        interlock_executed: false
      }));
      setSignoffSuccess(false);
    }
  };

  const handleExecuteInterlock = async () => {
    setIsInterlockExecuting(true);
    try {
      const res = await fetch(`${API_BASE}/api/failover/execute`, { method: 'POST' });
      if (res.ok) {
        await fetchGridTopology();
        const resCur = await fetch(`${API_BASE}/api/telemetry/current`);
        if (resCur.ok) {
          const curData = await resCur.json();
          setTelemetry(curData);
        }
      }
    } catch (err) {
      console.error('Execute interlock error:', err);
      setTelemetry(prev => ({ ...prev, interlock_executed: true }));
    } finally {
      setTimeout(() => {
        setIsInterlockExecuting(false);
      }, 500);
    }
  };

  const handleSignoffTicket = async (operatorName) => {
    try {
      const ticketId = telemetry?.spare_dispatch?.ticket_id || 'GP-WO-2025-0892';
      const res = await fetch(`${API_BASE}/api/spares/signoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: ticketId,
          operator_name: operatorName,
          notes: 'Emergency road transit dispatched via low-bed transporter'
        })
      });
      if (res.ok) {
        setSignoffSuccess(true);
      }
    } catch (err) {
      console.error('Signoff error:', err);
      setSignoffSuccess(true);
    }
  };

  const chi = telemetry ? Math.round(telemetry.chi) : 42;
  const isCritical = chi < 60;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500/25 selection:text-cyan-200">
      
      {/* 1. Global Full-Width Header */}
      <Header
        telemetry={telemetry}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        onInjectFault={handleInjectFault}
        onReset={handleReset}
        playbackIndex={telemetry?.playback_index ?? telemetry?.step ?? 0}
        isCritical={isCritical}
        alertCount={3}
      />

      {/* Backend Offline Warning Banner if needed */}
      {error && (
        <div className="bg-[#1e130c] border-b border-amber-500/40 px-6 py-2 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{error} — Connected to offline real-time SCADA simulation model.</span>
          </div>
          <button
            onClick={fetchInitialData}
            className="text-cyan-400 hover:text-cyan-300 font-semibold underline flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry Sync</span>
          </button>
        </div>
      )}

      {/* 2. Main Body Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Persistent Dark Cyber Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          alertCount={3}
          isCritical={isCritical}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#070b14] pb-14">
          
          {(activeTab === 'overview' || activeTab === 'home') && (
            <HomeOverview
              telemetry={telemetry}
              setActiveTab={setActiveTab}
            />
          )}

          {(activeTab === 'grid-map' || activeTab === 'failover') && (
            <GridFailover
              telemetry={telemetry}
              gridTopology={gridTopology}
              onExecuteInterlock={handleExecuteInterlock}
              isExecuting={isInterlockExecuting}
            />
          )}

          {(activeTab === 'assets' || activeTab === 'transformers') && (
            <TransformersView
              telemetry={telemetry}
              onSelectAsset={() => setActiveTab('predictions')}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsView
              telemetry={telemetry}
            />
          )}

          {(activeTab === 'predictions' || activeTab === 'health') && (
            <HealthAssessment
              telemetry={telemetry}
              history={history}
              onNavigateFailover={() => setActiveTab('grid-map')}
              onNavigateMaintenance={() => setActiveTab('maintenance')}
            />
          )}

          {activeTab === 'live' && (
            <LiveMonitoring
              telemetry={telemetry}
              history={history}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceSpares
              telemetry={telemetry}
              onSignoffTicket={handleSignoffTicket}
              signoffSuccess={signoffSuccess}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              telemetry={telemetry}
            />
          )}

          {activeTab === 'settings' && (
            <div className="p-8 max-w-4xl mx-auto flex flex-col gap-6">
              <div className="cyber-card rounded-2xl p-6 border border-cyan-500/25">
                <h3 className="text-lg font-bold text-white mb-1">
                  GridPulse AI System Configuration
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  SCADA polling rates, predictive thresholds, and automated interlock parameters.
                </p>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#081122] border border-slate-800">
                    <div>
                      <span className="font-bold text-white block">SCADA Sampling Frequency</span>
                      <span className="text-slate-400 text-[11px]">Real-time telemetry stream interval</span>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                      1000 ms (1 Hz)
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#081122] border border-slate-800">
                    <div>
                      <span className="font-bold text-white block">Isolation Forest Anomaly Threshold</span>
                      <span className="text-slate-400 text-[11px]">Dynamic outlier contamination cutoff</span>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                      Score &lt; -0.05
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#081122] border border-slate-800">
                    <div>
                      <span className="font-bold text-white block">Automated Interlock Permission</span>
                      <span className="text-slate-400 text-[11px]">Requires Human Operator Sign-off before breaker actuation</span>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-500/30">
                      Enforced (Human-in-the-loop)
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#081122] border border-slate-800">
                    <div>
                      <span className="font-bold text-white block">AI Core Model</span>
                      <span className="text-slate-400 text-[11px]">Physics-Guided Composite Health Index + SHAP Explainability</span>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-purple-950/80 text-purple-300 font-semibold border border-purple-500/30">
                      GridPulse-XAI v3.2
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}

