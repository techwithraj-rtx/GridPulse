import React from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  FileCheck,
  Share2
} from 'lucide-react';

export default function ReportsView({ telemetry }) {
  const reports = [
    {
      id: 'REP-01',
      title: 'Substation TR-017 Comprehensive Health Index (CHI) Audit',
      type: 'Diagnostic Health Report',
      date: 'Today, 12:00 UTC',
      size: '2.4 MB PDF',
      status: 'Ready'
    },
    {
      id: 'REP-02',
      title: 'NetworkX Grid Failover Contingency Transfer Simulation Plan',
      type: 'Switching Interlock Report',
      date: 'Today, 11:30 UTC',
      size: '1.8 MB PDF',
      status: 'Ready'
    },
    {
      id: 'REP-03',
      title: 'SCADA Historian Telemetry Time-Series Archive (200 Ticks)',
      type: 'Raw Historian CSV',
      date: 'Today, 10:45 UTC',
      size: '480 KB CSV',
      status: 'Ready'
    },
    {
      id: 'REP-04',
      title: 'Quarterly Dielectric Breakdown & Gas Analysis (DGA) Summary',
      type: 'Compliance Record',
      date: '15 May 2025',
      size: '4.2 MB PDF',
      status: 'Archived'
    }
  ];

  const handleDownload = (title) => {
    alert(`Downloading export: ${title}`);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto select-none">
      
      {/* Header */}
      <div className="cyber-card rounded-2xl p-6 border border-cyan-500/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 shadow-neon-cyan">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight font-sans">
              Reports &amp; Historical Audits
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Export official utility compliance documentation, contingency plans, and health assessments.
          </p>
        </div>

        <button
          onClick={() => handleDownload('All Active Reports')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-neon-cyan flex items-center gap-1.5 transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export All Reports</span>
        </button>
      </div>

      {/* Reports List */}
      <div className="cyber-card rounded-2xl border border-cyan-500/20 overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Available Compliance &amp; SCADA Historian Documents</span>
          <span className="text-slate-500 font-normal">Generated under IEEE C57 &amp; IEC 61850</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {reports.map((r) => (
            <div key={r.id} className="p-4 hover:bg-slate-800/30 transition flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#091122] text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                  <FileCheck className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {r.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="text-cyan-400 font-medium">{r.type}</span>
                    <span>•</span>
                    <span className="font-mono">{r.date}</span>
                    <span>•</span>
                    <span className="font-mono">{r.size}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(r.title)}
                  className="px-3 py-1.5 rounded-lg bg-[#0e172e] hover:bg-cyan-950/60 border border-slate-700/80 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
