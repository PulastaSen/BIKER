import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';

interface DIYGuide {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Moderate';
  toolsRequired: string[];
  steps: string[];
  warnings: string[];
  whenToStop: string;
}

const DIY_GUIDES: DIYGuide[] = [
  {
    id: 'tubeless-puncture',
    title: 'Emergency Tubeless Tyre Puncture Repair',
    category: 'Tyres',
    difficulty: 'Easy',
    toolsRequired: ['Tubeless reamer tool', 'Split-eye insertion needle', 'Rubber cement / vulcanizing strip', 'Portable 12V or battery inflator'],
    steps: [
      'Locate nail or puncture spot on tyre tread (do NOT repair sidewall punctures on roadside).',
      'Remove nail with pliers and insert reamer tool into the hole at 90 degrees to clear steel cords.',
      'Thread sticky rubber strip halfway through split-eye needle and coat with rubber cement.',
      'Push needle straight into puncture until 1/3 of strip protrudes outside tread.',
      'Pull needle straight back out quickly without twisting (strip stays anchored in tread).',
      'Inflate tyre to 32-35 PSI and check for bubbles using water or saliva.'
    ],
    warnings: [
      'NEVER attempt to plug a puncture located in the tyre sidewall or shoulder (high risk of high-speed blowout).',
      'Keep fingers away from insertion needle tip.'
    ],
    whenToStop: 'If the puncture hole is larger than 6mm, or if tyre bead has unseated from the rim wheel, STOP and request professional recovery.'
  },
  {
    id: 'battery-jumpstart',
    title: 'Safe Motorcycle Battery Jump-Start',
    category: 'Electrical',
    difficulty: 'Moderate',
    toolsRequired: ['Motorcycle jumper cables (10 AWG)', '12V donor vehicle / jump booster pack'],
    steps: [
      'Ensure donor vehicle engine is TURNED OFF (car alternators produce excess amps that can fry motorcycle ECUs).',
      'Connect RED clamp to dead motorcycle battery POSITIVE (+) terminal.',
      'Connect other RED clamp to donor battery POSITIVE (+) terminal.',
      'Connect BLACK clamp to donor battery NEGATIVE (-) terminal.',
      'Connect other BLACK clamp to an unpainted metal chassis bolt or engine casing on stranded motorcycle (Ground).',
      'Turn on motorcycle ignition and start engine; once idling smoothly, disconnect cables in reverse order.'
    ],
    warnings: [
      'NEVER allow RED and BLACK clamps to touch while connected.',
      'Do NOT jump-start a physically swollen, cracked, or leaking lead-acid battery.'
    ],
    whenToStop: 'If starter relay only buzzes or smokes without cranking engine, stop immediately. Main wire harness may have a short.'
  },
  {
    id: 'chain-tension-slack',
    title: 'Drive Chain Slack & Tension Adjustment',
    category: 'Chassis',
    difficulty: 'Moderate',
    toolsRequired: ['Rear axle socket (27mm/32mm)', 'Adjuster bolt spanners (12mm/14mm)', 'Ruler / tape measure'],
    steps: [
      'Place motorcycle on side-stand or center-stand in Neutral.',
      'Loosen rear axle nut 1 to 2 turns (do not remove).',
      'Turn both left and right chain adjuster bolts evenly clockwise by 1/4 turn increments.',
      'Verify swingarm alignment tick marks are identical on both left and right swingarm sides.',
      'Check vertical slack midway between sprockets (aim for manufacturer target: 20-30mm on road bikes, 30-40mm on ADVs).',
      'Torque rear axle nut firmly (90-100 Nm) and re-check slack.'
    ],
    warnings: [
      'Never over-tighten chain; a taut chain without slack will snap and destroy the gearbox countershaft bearing under suspension compression.',
      'Never lubricate chain with engine running in gear.'
    ],
    whenToStop: 'If chain adjuster has reached maximum rearward limit, or if chain can be lifted off rear sprocket by >5mm, chain is worn out and requires replacement.'
  },
  {
    id: 'blown-fuse',
    title: 'Inspecting & Replacing a Blown Fuse',
    category: 'Electrical',
    difficulty: 'Easy',
    toolsRequired: ['Fuse puller / needle nose pliers', 'Spare fuses of identical amperage (10A, 15A, 30A)'],
    steps: [
      'Turn OFF ignition key and kill switch.',
      'Remove rider seat to access the black fuse box cover.',
      'Pop open fuse box clips and refer to lid diagram (e.g. IGNITION, HORN, LIGHTS, ABS).',
      'Pull out suspect fuse and hold against light; check if internal U-shaped wire element is melted or severed.',
      'Insert spare fuse of EXACT identical color and ampere rating from the spare holder slot.',
      'Test circuit by turning ignition key on.'
    ],
    warnings: [
      'NEVER substitute a higher amperage fuse (e.g. replacing a 10A fuse with 20A or copper wire). Doing so will melt the wiring harness and cause a motorcycle fire.'
    ],
    whenToStop: 'If the new fuse immediately pops again upon turning on ignition, there is an active direct ground short. Stop and request auto-electrician.'
  }
];

const TOOLKIT_ITEMS = [
  { id: '1', name: 'Tubeless puncture repair plug kit & reamer', defaultChecked: true },
  { id: '2', name: 'Portable 12V / rechargeable tyre inflator', defaultChecked: true },
  { id: '3', name: 'Multitool / 8, 10, 12, 14mm spanners & allen keys', defaultChecked: true },
  { id: '4', name: 'High-power LED headlamp / torch', defaultChecked: false },
  { id: '5', name: '10,000mAh Power bank & USB phone cable', defaultChecked: true },
  { id: '6', name: 'Rider First-aid trauma kit (bandages, antiseptic, tourniquet)', defaultChecked: false },
  { id: '7', name: 'High-visibility reflective safety vest', defaultChecked: true },
  { id: '8', name: 'Full-gauntlet riding gloves & thermal layer', defaultChecked: true },
  { id: '9', name: 'Spare blade fuses (10A, 15A, 30A)', defaultChecked: false },
  { id: '10', name: 'Heavy-duty cable ties (Zip ties) & electrical tape', defaultChecked: true },
  { id: '11', name: 'Spare clutch cable & universal wire nipple', defaultChecked: false }
];

export function DiyGuidesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'GUIDES' | 'TOOLKIT'>('GUIDES');
  const [selectedGuide, setSelectedGuide] = useState<DIYGuide>(DIY_GUIDES[0]);

  // Toolkit checklist
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    TOOLKIT_ITEMS.forEach(item => { init[item.id] = item.defaultChecked; });
    return init;
  });

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const isToolkitIncomplete = completedCount < TOOLKIT_ITEMS.length;

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-20 pb-24 font-sans selection:bg-[#FFF174] selection:text-black">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('GUIDES')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'GUIDES' ? 'bg-[#FFF174] text-black' : 'bg-white/10 text-gray-300'
              }`}
            >
              DIY Guides
            </button>
            <button
              onClick={() => setActiveTab('TOOLKIT')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'TOOLKIT' ? 'bg-[#FFF174] text-black' : 'bg-white/10 text-gray-300'
              }`}
            >
              Rider Toolkit ({completedCount}/{TOOLKIT_ITEMS.length})
            </button>
          </div>
        </div>

        {/* Tab 1: DIY Emergency Guides */}
        {activeTab === 'GUIDES' ? (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">DIY EMERGENCY GUIDES</h1>
              <p className="text-gray-400 text-xs mt-1">
                Safe, step-by-step procedures for common highway breakdown scenarios with critical warnings.
              </p>
            </div>

            {/* Guide Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIY_GUIDES.map(guide => (
                <button
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedGuide.id === guide.id
                      ? 'bg-[#FFF174]/15 border-[#FFF174] text-white shadow-sm'
                      : 'bg-[#111622] border-white/10 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <strong className="text-xs font-bold text-white block">{guide.title}</strong>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold mt-1 block">
                    {guide.category} • {guide.difficulty}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Guide Card */}
            <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-5">
              <div className="border-b border-white/10 pb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FFF174]">
                  {selectedGuide.category} PROCEDURE
                </span>
                <h2 className="text-xl font-black text-white mt-0.5">{selectedGuide.title}</h2>
              </div>

              {/* Tools Required */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                  TOOLS & EQUIPMENT REQUIRED
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedGuide.toolsRequired.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#FFF174] mb-2.5">
                  ACTION STEPS
                </h3>
                <ol className="space-y-2 text-xs text-gray-300 list-decimal pl-4">
                  {selectedGuide.steps.map((st, idx) => (
                    <li key={idx} className="pl-1 leading-relaxed">
                      {st}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Warnings */}
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-2 text-xs text-red-200">
                <div className="flex items-center gap-2 font-bold text-red-400">
                  <AlertTriangle size={16} /> CRITICAL WARNINGS
                </div>
                <ul className="space-y-1 list-disc pl-4 text-[11px]">
                  {selectedGuide.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>

              {/* When to Stop */}
              <div className="p-4 rounded-2xl bg-[#182030] border border-white/10 text-xs text-gray-300">
                <strong className="text-yellow-400 block mb-1">When to STOP & Request Help:</strong>
                <p className="text-[11px] text-gray-300">{selectedGuide.whenToStop}</p>
                <button
                  type="button"
                  onClick={() => navigate('/stranded')}
                  className="mt-3 px-4 py-2 bg-[#FFF174] text-black font-bold text-xs rounded-xl"
                >
                  Request Professional Mechanic
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Section 19 Emergency Toolkit */
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">MY RIDER TOOLKIT</h1>
              <p className="text-gray-400 text-xs mt-1">
                Pre-departure emergency gear checklist for highway and Himalayan expeditions.
              </p>
            </div>

            {/* Checklist Warning Banner */}
            {isToolkitIncomplete ? (
              <div className="p-4 rounded-2xl bg-yellow-950/40 border border-yellow-500/40 flex items-center justify-between gap-3 text-xs text-yellow-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={22} className="text-yellow-400 shrink-0" />
                  <div>
                    <strong className="text-sm font-bold text-white block">Your emergency toolkit is incomplete.</strong>
                    <span>You are missing {TOOLKIT_ITEMS.length - completedCount} safety items recommended for mountain rides.</span>
                  </div>
                </div>
                <span className="text-xs font-black bg-yellow-500/20 text-yellow-400 px-2.5 py-1 rounded-lg shrink-0">
                  {completedCount}/{TOOLKIT_ITEMS.length}
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3 text-xs text-emerald-200">
                <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
                <div>
                  <strong className="text-sm font-bold text-white block">Full Expedition Toolkit Ready!</strong>
                  <span>All 11 critical safety and repair items confirmed onboard.</span>
                </div>
              </div>
            )}

            {/* Item Checkboxes */}
            <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-2.5">
              {TOOLKIT_ITEMS.map(item => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <label
                    key={item.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-[#182030] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleItem(item.id)}
                        className="rounded text-emerald-600 focus:ring-0"
                      />
                      <span className="text-xs font-semibold">{item.name}</span>
                    </div>
                    {isChecked ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Missing</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
