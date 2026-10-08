import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, ArrowLeft, ArrowRight, ShieldCheck, 
  RotateCcw, AlertCircle 
} from 'lucide-react';

interface CheckItem {
  id: string;
  category: 'MECHANICAL' | 'SAFETY' | 'LEGAL';
  title: string;
  desc: string;
  instruction: string;
  isCritical: boolean;
}

const CHECKLIST_ITEMS: CheckItem[] = [
  {
    id: 'tyres',
    category: 'MECHANICAL',
    title: 'Tyre Pressure & Tread',
    desc: 'Verify front and rear cold tyre PSI, inspect tread depth and look for embedded nails or sidewall cuts.',
    instruction: 'Check cold PSI according to bike manual (e.g. 28-32 Front / 32-36 Rear). Check TWI wear indicators.',
    isCritical: true
  },
  {
    id: 'brakes',
    category: 'MECHANICAL',
    title: 'Brake Pads & Fluid Level',
    desc: 'Check brake pads thickness (>2mm), check master cylinder fluid sight glasses, test firm lever feel.',
    instruction: 'Ensure levers do not touch handlebar under full squeeze. Brake fluid should be amber, not dark brown.',
    isCritical: true
  },
  {
    id: 'chain',
    category: 'MECHANICAL',
    title: 'Drive Chain Slack & Lube',
    desc: 'Check chain free play (25–35 mm). Ensure clean rollers and adequate lubrication before touring.',
    instruction: 'Check mid-point between sprockets on side stand. Inspect sprocket teeth for hooked wear.',
    isCritical: true
  },
  {
    id: 'oil',
    category: 'MECHANICAL',
    title: 'Engine Oil Level',
    desc: 'Check oil level in inspection window or dipstick while motorcycle is held upright on flat ground.',
    instruction: 'Level must sit safely between MIN and MAX marks. Top up with recommended grade if low.',
    isCritical: true
  },
  {
    id: 'coolant',
    category: 'MECHANICAL',
    title: 'Coolant Reservoir Level',
    desc: 'For liquid-cooled bikes, ensure coolant is between MIN and MAX lines in the expansion tank.',
    instruction: 'Do not open radiator cap while engine is hot! Inspect expansion reservoir only.',
    isCritical: false
  },
  {
    id: 'lights',
    category: 'SAFETY',
    title: 'Lights & Horn Operation',
    desc: 'Test high beam, low beam, front/rear turn signals, hazard flashers, brake lamp (front + foot pedal), and horn.',
    instruction: 'Crucial for Himalayan fog, winding curves, and oncoming trucks on narrow bridges.',
    isCritical: true
  },
  {
    id: 'battery',
    category: 'MECHANICAL',
    title: 'Battery Health & Terminals',
    desc: 'Check starter crank vitality, ensure battery terminals are tight with no white sulfation.',
    instruction: 'Battery voltage should exceed 12.4V with ignition on. Sluggish crank indicates weak cell.',
    isCritical: false
  },
  {
    id: 'fuel',
    category: 'SAFETY',
    title: 'Fuel Level & Range Calculation',
    desc: 'Calculate distance to next fuel station along highway or remote mountain pass.',
    instruction: 'In hills, fuel stations can be 80-120 km apart and frequently run dry during landslides.',
    isCritical: true
  },
  {
    id: 'documents',
    category: 'LEGAL',
    title: 'Legal Documents in Wallet',
    desc: 'Valid Driving Licence, Vehicle RC, Active Insurance Policy, and Valid PUC (Pollution Under Control).',
    instruction: 'Keep digital copies saved in MotoAssist Digital Wallet and original DL in jacket.',
    isCritical: true
  },
  {
    id: 'emergency_kit',
    category: 'SAFETY',
    title: 'Emergency Puncture & Tool Kit',
    desc: 'Tubeless puncture kit or spare 21/18" tubes, 12V/battery portable tyre inflator, spark plug wrench, fuses.',
    instruction: 'Carry basic Allen keys, cable ties, and electrical tape in saddlebag.',
    isCritical: false
  },
  {
    id: 'first_aid',
    category: 'SAFETY',
    title: 'First-Aid Medical Kit',
    desc: 'Sterile gauze, bandage, antiseptic Betadine, pain relief, motion sickness medication, emergency foil blanket.',
    instruction: 'Store in waterproof pouch accessible without removing full saddle luggage.',
    isCritical: false
  }
];

export function PreRideCheckPage() {
  const navigate = useNavigate();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectAll = () => {
    const all: Record<string, boolean> = {};
    CHECKLIST_ITEMS.forEach((item) => {
      all[item.id] = true;
    });
    setCheckedItems(all);
  };

  const resetAll = () => {
    setCheckedItems({});
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const criticalItems = CHECKLIST_ITEMS.filter((i) => i.isCritical);
  const criticalCheckedCount = criticalItems.filter((i) => checkedItems[i.id]).length;
  const allCriticalPassed = criticalCheckedCount === criticalItems.length;
  const totalCount = CHECKLIST_ITEMS.length;

  const isReadyToRide = allCriticalPassed && checkedCount >= 8;

  return (
    <div className="shell py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Touring Pre-Flight Protocol
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">11-Point Pre-Ride Check</h1>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Readiness Banner */}
      <div
        className={`p-6 rounded-3xl border mb-6 transition-all ${
          isReadyToRide
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 ${
                isReadyToRide ? 'bg-emerald-600' : 'bg-amber-600'
              }`}
            >
              {isReadyToRide ? <ShieldCheck size={28} /> : <AlertTriangle size={28} />}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-75">
                Flight Status
              </span>
              <h2 className="text-xl font-black text-white">
                {isReadyToRide ? 'READY TO RIDE' : 'ATTENTION REQUIRED'}
              </h2>
              <p className="text-xs mt-0.5 opacity-90">
                {isReadyToRide
                  ? 'All vital safety and mechanical systems confirmed. Ride safe!'
                  : `${criticalItems.length - criticalCheckedCount} critical safety items still unverified. Inspect before highway departure.`}
              </p>
            </div>
          </div>
        </div>

        {/* Meter */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex justify-between text-xs font-bold mb-1.5 text-white">
            <span>Inspection Progress</span>
            <span>{checkedCount} / {totalCount} Items Checked</span>
          </div>
          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isReadyToRide ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${(checkedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
          >
            Check All
          </button>
          <button
            onClick={resetAll}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>

        <button
          onClick={() => navigate('/safe-ride')}
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black flex items-center gap-1.5 transition-colors"
        >
          <span>Start Safe Ride</span> <ArrowRight size={14} />
        </button>
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((item) => {
          const isDone = !!checkedItems[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isDone
                  ? 'bg-neutral-900 border-emerald-500/30'
                  : 'bg-neutral-900/60 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => {}} // handled by parent onClick
                  className="mt-1 w-5 h-5 rounded-lg text-emerald-500 focus:ring-emerald-400 bg-black/40 border-white/20 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-bold ${isDone ? 'text-white' : 'text-gray-200'}`}>
                        {item.title}
                      </h3>
                      {item.isCritical && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-red-500/10 text-red-400 border border-red-500/20">
                          CRITICAL
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">{item.category}</span>
                  </div>

                  <p className="text-xs text-gray-400 mt-1">{item.desc}</p>

                  <div className="mt-2 p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-gray-300 flex items-start gap-2">
                    <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>{item.instruction}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 p-5 rounded-2xl bg-neutral-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Next Step: Launch Route Monitoring</h4>
          <p className="text-xs text-gray-400 mt-0.5">Activate live location sharing, arrival safety timer, and corridor support coverage.</p>
        </div>
        <button
          onClick={() => navigate('/safe-ride')}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-black font-black text-xs flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <span>Launch Safe Ride Mode</span> <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
