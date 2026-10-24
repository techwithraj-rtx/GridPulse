import React, { useState } from 'react';
import {
  Wrench,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Package,
  Truck,
  Check,
  ClipboardList,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function MaintenanceSpares({
  telemetry,
  onSignoffTicket,
  signoffSuccess = false
}) {
  const isCritical = (telemetry?.chi ?? 42) < 60;

  // Maintenance Checklist state
  const [checklist, setChecklist] = useState([
    { id: 'c1', label: 'Oil Condition & Dielectric Breakdown Test', subtext: 'Verify moisture content & dissolved gas analysis (DGA)', done: false },
    { id: 'c2', label: 'Bushing Verification & Thermal Scan', subtext: 'Infrared inspection of 66kV HV bushings for hotspot anomalies', done: false },
    { id: 'c3', label: 'Cooling Fan & Radiator Pump Test', subtext: 'Inspect forced-air contactors & check radiator valve seating', done: false },
    { id: 'c4', label: 'On-Load Tap Changer (OLTC) Inspection', subtext: 'Diverter switch timing test & motor drive mechanism review', done: false },
    { id: 'c5', label: 'Buchholz Relay & Pressure Relief Calibration', subtext: 'Confirm gas accumulation trip signal interlock', done: false },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operatorName, setOperatorName] = useState('Ankit Sharma (Chief Operator)');

  const toggleCheck = (id) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const handleMarkAllDone = () => {
    setChecklist(prev => prev.map(item => ({ ...item, done: true })));
  };

  const handleAuthorizeTicket = () => {
    if (onSignoffTicket) {
      onSignoffTicket(operatorName);
    }
    setTimeout(() => {
      setIsModalOpen(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      
      {/* 1. Header Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Wrench className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">
              Maintenance &amp; Spare Dispatch
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Preventative maintenance scheduling, physical checklist verification, and central inventory mobilization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Asset ID:</span>
          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
            TR-017 (25 MVA)
          </span>
        </div>
      </div>

      {/* 2. Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* KPI 1: Next Maintenance */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Next Maintenance
            </span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              15 Jun 2025
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Routine 90-Day Inspection
            </span>
          </div>
        </div>

        {/* KPI 2: Maintenance Status */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
            isCritical
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {isCritical ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Maintenance Status
            </span>
            <div className={`text-sm font-bold mt-0.5 ${isCritical ? 'text-rose-700' : 'text-emerald-800'}`}>
              {isCritical ? 'Attention Required' : 'On Schedule'}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {isCritical ? 'Critical thermal anomaly detected' : 'No pending critical work orders'}
            </span>
          </div>
        </div>

        {/* KPI 3: Recommended Spares */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Recommended Spares
            </span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              3 Compatible Spares
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Available in Central &amp; Depot Stock
            </span>
          </div>
        </div>

      </div>

      {/* 3. Split Section: Checklist & Recommended Spares */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Maintenance Checklist & Timeline (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Maintenance Checklist
                </h3>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  Pre-Service Inspection Verification
                </p>
              </div>
              <button
                onClick={handleMarkAllDone}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 transition"
              >
                Mark All Done
              </button>
            </div>

            {/* Checklist Items */}
            <div className="divide-y divide-slate-100 mt-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="py-3 flex items-start gap-3 cursor-pointer group hover:bg-slate-50/60 -mx-2 px-2 rounded-lg transition"
                >
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    item.done
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 group-hover:border-emerald-500 bg-white'
                  }`}>
                    {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <span className={`text-xs font-medium block transition ${
                      item.done ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-emerald-900'
                    }`}>
                      {item.label}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {item.subtext}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Completed: {checklist.filter(c => c.done).length} / {checklist.length}</span>
            <span className="text-slate-400 font-medium">Logged to Substation Asset Log</span>
          </div>
        </div>

        {/* Right: Recommended Spares Cards (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Recommended Spare Assets
                </h3>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  Verified Compatible Utility Inventory
                </p>
              </div>
              <span className="text-xs font-medium text-slate-500">
                Live Stock Status
              </span>
            </div>

            {/* 3 Spares Cards */}
            <div className="space-y-3 mt-4">
              
              {/* Card 1: Oil Filter */}
              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                    OF
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Oil Filter (High-Efficiency Cartridge)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Compatible with TR-017 • Central Warehouse (Aisle 4)
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  In Stock
                </span>
              </div>

              {/* Card 2: HV Bushing */}
              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                    BS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      High-Voltage Bushing (66 kV RIP Type)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Compatible with TR-017 • North Depot Bay 2
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  In Stock
                </span>
              </div>

              {/* Card 3: OLTC */}
              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-xs">
                    TC
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      On-Load Tap Changer (OLTC Vacuum Switch)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Compatible with TR-017 • Regional Reserve Yard
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Limited Stock
                </span>
              </div>

            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-2">
            <span>Logistics Lead Time: 2.5h</span>
            <span className="font-semibold text-emerald-700">Pre-Approved Transit Route R-104</span>
          </div>
        </div>

      </div>

      {/* 4. AI Dispatch Suggestion Card & Action */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              AI Dispatch Suggestion &amp; Work Order Generator
            </h4>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {isCritical
                ? "Immediate Action Suggested: Automated work order recommended for TR-017 prior to thermal trip breach. Heavy-haul transporter 50T pre-cleared for replacement asset TX-SPARE-01 from Central Yard (ETA: 2.5h)."
                : "Predictive Health Optimal: Transformer running normally. Routine preventative dispatch order can be pre-filled for the next maintenance window."}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 whitespace-nowrap transition active:scale-95 self-start md:self-auto"
        >
          <ClipboardList className="w-4 h-4" />
          <span>{signoffSuccess ? 'Work Order Authorized ✓' : 'Generate Dispatch Work Order'}</span>
        </button>
      </div>

      {/* 5. Operator Work Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-6 flex flex-col gap-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Maintenance Dispatch Work Order
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Order Ref: #GP-WO-2025-0892
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Asset</span>
                  <span className="font-semibold text-slate-800">TR-017 (25 MVA, East Grid)</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Spare Unit</span>
                  <span className="font-semibold text-emerald-700">TX-SPARE-01 (Hitachi 25MVA)</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Depot Location</span>
                  <span className="text-slate-700">Central Yard - Bay 04</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated ETA</span>
                  <span className="font-semibold text-slate-800">2.5 Hours (Highway Route)</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Authorizing Operator Signature
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {signoffSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Work Order Signed and Mobilized! Logistics crew notified.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={handleAuthorizeTicket}
                disabled={signoffSuccess}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm &amp; Dispatch Order</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
