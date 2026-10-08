import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Camera, 
  Wrench, 
  Info
} from 'lucide-react';

const SYMPTOMS = [
  { id: 'engine_no_start', label: 'Engine Won\'t Start', desc: 'Cranks but won\'t start, or total silence on button' },
  { id: 'strange_noise', label: 'Strange Noise', desc: 'Rattling, knocking, metal screeching, or ticking' },
  { id: 'overheating', label: 'Overheating', desc: 'Temp bar flashing, coolant boiling, excess heat' },
  { id: 'battery_problem', label: 'Battery / Electrical', desc: 'Weak dash, dim lights, clicking starter relay' },
  { id: 'chain_problem', label: 'Chain / Sprocket', desc: 'Slack chain slapping swingarm, stuck link, slipping' },
  { id: 'brake_issue', label: 'Brake Failure / Spongy', desc: 'Loss of lever pressure, shuddering, fluid leak' },
  { id: 'tyre_issue', label: 'Tyre Loss / Wobble', desc: 'Low pressure, rim bend, highway handling wobble' },
  { id: 'fuel_problem', label: 'Fuel Stutter / Cut', desc: 'Engine jerking at 4000+ RPM, stall when accelerating' },
  { id: 'other', label: 'Other Issue', desc: 'Clutch drag, radiator leak, suspension issue' }
];

const BIKES = [
  'KTM 390 Adventure',
  'Royal Enfield Himalayan 450',
  'Honda CB350 / H\'ness',
  'Triumph Scrambler 400X',
  'Bajaj Dominar 400',
  'BMW G310GS',
  'Hero Xpulse 200 4V',
  'Yamaha MT-15 / R15'
];

interface DiagnosticResult {
  possibleCauses: string[];
  safeChecks: string[];
  whatNotToDo: string[];
  ridingRisk: 'DO_NOT_RIDE' | 'CAUTION_RIDE_NEARBY' | 'SAFE_TO_RIDE';
  recommendedAssistance: string;
}

export function AiBikeAssistantPage() {
  const navigate = useNavigate();

  const [selectedBike, setSelectedBike] = useState(BIKES[0]);
  const [selectedSymptom, setSelectedSymptom] = useState(SYMPTOMS[0].id);
  const [userNotes, setUserNotes] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const handleDiagnose = () => {
    setAnalyzing(true);
    setResult(null);

    setTimeout(() => {
      setAnalyzing(false);
      // Realistic Motorcycle Triage Rules
      if (selectedSymptom === 'engine_no_start') {
        setResult({
          possibleCauses: [
            'Engine kill-switch engaged or side-stand sensor interlock active in gear.',
            'Discharged battery (<11.8V) preventing starter solenoid from closing.',
            'Blown 15A/30A main ignition fuse under the rider seat.'
          ],
          safeChecks: [
            'Flip kill-switch off and on firmly; ensure motorcycle is in Neutral (green \'N\' lit).',
            'Check clutch microswitch by fully pulling clutch lever while pressing starter.',
            'Listen for fuel pump 2-second primer whir when switching ignition key ON.'
          ],
          whatNotToDo: [
            'Do NOT repeatedly crank the starter for more than 5 seconds (risks burning motor or completely draining battery).',
            'Do NOT bump-start or roll-start fuel-injected bikes down steep hills with dead battery.'
          ],
          ridingRisk: 'DO_NOT_RIDE',
          recommendedAssistance: 'Roadside Battery Jump-Start or Mobile Mechanic'
        });
      } else if (selectedSymptom === 'brake_issue') {
        setResult({
          possibleCauses: [
            'Air bubbles in hydraulic brake fluid circuit (sponge lever).',
            'Glazed or completely worn brake pads against the rotor disc.',
            'Loose master cylinder banjo bolt or hydraulic line weeping.'
          ],
          safeChecks: [
            'Inspect brake fluid inspection window on handlebar reservoir; ensure fluid level is above MIN.',
            'Examine rotor disc for deep radial grooves or blue heat discoloration.',
            'Pump the brake lever 5 times rapidly while stationary to see if pressure stiffens.'
          ],
          whatNotToDo: [
            'CRITICAL: Do NOT ride on highway or mountain slopes with degraded front brakes.',
            'Do NOT spray WD-40, chain lube, or petroleum solvents anywhere near brake calipers.'
          ],
          ridingRisk: 'DO_NOT_RIDE',
          recommendedAssistance: 'Motorcycle Towing / Flatbed to Certified Workshop'
        });
      } else if (selectedSymptom === 'chain_problem') {
        setResult({
          possibleCauses: [
            'Excessive drive chain slack (>45mm) from prolonged mountain climbs.',
            'Seized O-ring chain links due to mud/grit ingress or lack of gear oil/lube.',
            'Worn sprocket teeth hooking or master link clip loosened.'
          ],
          safeChecks: [
            'Check chain slack midway between front and rear sprocket (correct slack is 20-30mm).',
            'Visually verify master link retaining clip is oriented correctly with closed end facing drive rotation.',
            'Rotate rear wheel on side-stand / paddock and inspect for kinked rigid links.'
          ],
          whatNotToDo: [
            'Do NOT hard-accelerate in high gears (slack chain can derail and crack the engine crankcase).',
            'Do NOT stick fingers into chain while wheel is turning.'
          ],
          ridingRisk: 'CAUTION_RIDE_NEARBY',
          recommendedAssistance: 'Mechanic On-Spot Chain Tension & Master Link Service'
        });
      } else {
        setResult({
          possibleCauses: [
            'Possible electrical connector vibration looseness or low coolant / oil pressure threshold.',
            'Fuel quality contamination or blocked tank breather vent.'
          ],
          safeChecks: [
            'Check engine oil inspection sight glass on level ground.',
            'Verify radiator coolant overflow bottle level.',
            'Check for loose battery terminal clamp bolts.'
          ],
          whatNotToDo: [
            'Do NOT open radiator cap while engine is hot (severe scalding risk).',
            'Do NOT push engine to high RPMs if red warning lamps illuminate.'
          ],
          ridingRisk: 'CAUTION_RIDE_NEARBY',
          recommendedAssistance: 'Professional Roadside Inspection Recommended'
        });
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-20 pb-24 font-sans selection:bg-[#FFF174] selection:text-black">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFF174] bg-[#FFF174]/10 px-3 py-1 rounded-full border border-[#FFF174]/20">
            <Sparkles size={14} /> AI Diagnostic Engine
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">AI BIKE ASSISTANT</h1>
              <p className="text-gray-400 text-xs mt-0.5">
                Intelligent roadside breakdown triage and safe pre-ride troubleshooting.
              </p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-5 mb-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
              1. Select Motorcycle Model
            </label>
            <select
              value={selectedBike}
              onChange={e => setSelectedBike(e.target.value)}
              className="w-full bg-[#182030] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
            >
              {BIKES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
              2. What is the observed symptom?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SYMPTOMS.map(sym => (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => setSelectedSymptom(sym.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedSymptom === sym.id
                      ? 'bg-[#FFF174]/15 border-[#FFF174] text-white shadow-sm'
                      : 'bg-[#182030] border-white/10 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <strong className="text-xs font-bold text-white block">{sym.label}</strong>
                  <span className="text-[10px] text-gray-400 block mt-0.5">{sym.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">
              Additional Observations (Sounds, warning lights, smells)
            </label>
            <textarea
              value={userNotes}
              onChange={e => setUserNotes(e.target.value)}
              placeholder="e.g. Engine clicked twice then dash went dark near Coronation Bridge..."
              rows={2}
              className="w-full bg-[#182030] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setHasPhoto(!hasPhoto)}
              className={`w-full py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                hasPhoto 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Camera size={16} />
              {hasPhoto ? '✓ Component Photo Attached' : 'Attach Photo of Part / Cluster (Optional)'}
            </button>
          </div>

          <button
            type="button"
            disabled={analyzing}
            onClick={handleDiagnose}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            {analyzing ? (
              <span>Analyzing telemetry & symptoms...</span>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Run AI Breakdown Diagnosis</span>
              </>
            )}
          </button>
        </div>

        {/* Diagnostic Results (Section 17) */}
        {result && (
          <div className="p-6 rounded-3xl bg-[#111622] border border-[#FFF174]/40 space-y-5 animate-fade-in">
            
            {/* Risk Assessment Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              result.ridingRisk === 'DO_NOT_RIDE' 
                ? 'bg-red-950/60 border-red-500/80 text-red-200' 
                : 'bg-yellow-950/60 border-yellow-500/80 text-yellow-200'
            }`}>
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} className={result.ridingRisk === 'DO_NOT_RIDE' ? 'text-red-400' : 'text-yellow-400'} />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider block">SAFETY ASSESSMENT</span>
                  <strong className="text-base font-black">
                    {result.ridingRisk === 'DO_NOT_RIDE' ? 'AVOID RIDING — HIGH RISK OF ACCIDENT OR SEIZURE' : 'RIDE WITH EXTREME CAUTION TO NEAREST STOP'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Possible Causes */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#FFF174] mb-2">
                1. Possible Causes (Based on {selectedBike})
              </h3>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {result.possibleCauses.map((cause, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#FFF174]">•</span>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Immediate Safe Checks */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-2">
                2. Immediate Safe Checks
              </h3>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {result.safeChecks.map((check, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What NOT to Do */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-red-400 mb-2">
                3. What NOT To Do (Prevent Damage)
              </h3>
              <ul className="space-y-1.5 text-xs text-red-200">
                {result.whatNotToDo.map((warn, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                    <span>{warn}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Action & Handoff */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Recommended Professional Assistance
              </span>
              <strong className="text-sm font-bold text-white block">
                {result.recommendedAssistance}
              </strong>
              
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/stranded')}
                  className="flex-1 py-3 rounded-xl bg-[#FFF174] text-black font-black text-xs uppercase flex items-center justify-center gap-1.5"
                >
                  <Wrench size={16} /> Request Professional Help
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/towing')}
                  className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                >
                  Towing
                </button>
              </div>
            </div>

            {/* Mandatory Disclaimer (Section 17) */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-[11px] text-gray-400 flex items-start gap-2">
              <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
              <p>
                <strong>Disclaimer:</strong> MotoAssist AI provides probabilistic recommendations based on user input and does not replace certified mechanic physical inspection. Always prioritize rider safety over motorcycle movement.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
