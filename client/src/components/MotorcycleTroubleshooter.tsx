import { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  RotateCcw, 
  ShieldAlert, 
  PhoneCall, 
  Wrench,
  Info
} from 'lucide-react';

interface TriageNode {
  id: string;
  category: string;
  question: string;
  contextNote?: string;
  options: {
    label: string;
    description?: string;
    nextNodeId?: string;
    outcome?: {
      severity: 'STOP_RIDING_DANGER' | 'SAFE_ROADSIDE_FIX' | 'WORKSHOP_INSPECTION_NEEDED';
      title: string;
      instructions: string[];
      emergencyPhone?: string;
      recommendedCategory?: 'Towing' | 'Bike Problem' | 'Medical' | 'Safety';
    };
  }[];
}

const TRIAGE_TREE: Record<string, TriageNode> = {
  start: {
    id: 'start',
    category: 'Initial Assessment',
    question: 'What symptom are you experiencing with the motorcycle right now?',
    contextNote: 'Answer questions one at a time. If you smell smoke, fuel, or hear metal screeching, stop immediately.',
    options: [
      {
        label: 'Brakes feel soft, spongey, or lever pulls all the way to grip',
        description: 'Braking performance degraded or fluid observed on caliper/fork',
        nextNodeId: 'brakes'
      },
      {
        label: 'Engine won’t start or died while riding',
        description: 'Starter clicks, turns without catching, or completely dead',
        nextNodeId: 'engine_start'
      },
      {
        label: 'Severe vibration, wobble, or handling instability',
        description: 'Front end shakes, rear wanders, or metallic clunking over bumps',
        nextNodeId: 'handling'
      },
      {
        label: 'Fluid leak detected (Oil, Coolant, or Fuel)',
        description: 'Liquid dripping onto ground, exhaust, or tyre',
        nextNodeId: 'fluid_leak'
      },
      {
        label: 'Flat tyre, loss of air, or puncture',
        description: 'Steering feels heavy or rim is riding low',
        nextNodeId: 'tyres'
      }
    ]
  },
  brakes: {
    id: 'brakes',
    category: 'Braking System',
    question: 'Is brake fluid visible on the caliper, disc rotor, or fork legs?',
    contextNote: 'Brake fluid on brake pads or tyres causes catastrophic loss of stopping power.',
    options: [
      {
        label: 'Yes — Fluid is leaking or sprayed on wheel/disc',
        outcome: {
          severity: 'STOP_RIDING_DANGER',
          title: 'CRITICAL BRAKE FAILURE — DO NOT RIDE',
          instructions: [
            'DO NOT attempt to ride this motorcycle under any circumstance.',
            'Hydraulic brake fluid on the disc or pads eliminates friction and will cause front-wheel lockup or total brake failure.',
            'Move the bike safely to the highway shoulder or roadside clear of fast traffic.',
            'Engage 1st gear and use the side stand on firm ground to prevent rolling.',
            'Request hydraulic flatbed towing with front-wheel chock.'
          ],
          recommendedCategory: 'Towing'
        }
      },
      {
        label: 'No fluid leak, but lever pulls completely to handlebar with minimal braking',
        outcome: {
          severity: 'STOP_RIDING_DANGER',
          title: 'AIR IN BRAKE LINE OR MASTER CYLINDER FAILURE',
          instructions: [
            'DO NOT RIDE ON HIGHWAY OR MOUNTAIN DESCENTS.',
            'Vapor lock or seal failure eliminates hydraulic pressure.',
            'Pumping the lever 5-10 times may temporarily restore pressure for emergency parking, but pressure will collapse again.',
            'Descending mountain hairpins (Sevoke/Darjeeling roads) without reliable front brakes is extremely hazardous.',
            'Call flatbed recovery to transport the motorcycle to a certified workshop.'
          ],
          recommendedCategory: 'Towing'
        }
      }
    ]
  },
  engine_start: {
    id: 'engine_start',
    category: 'Starting & Electrical',
    question: 'When you turn the ignition key ON, what happens?',
    options: [
      {
        label: 'Completely dead — no dash lights, no fuel pump prime, no horn',
        nextNodeId: 'electrical_dead'
      },
      {
        label: 'Dash turns on, fuel pump hums, but starter motor only clicks or does nothing',
        nextNodeId: 'starter_click'
      },
      {
        label: 'Engine cranks over normally with good speed, but refuses to fire up',
        nextNodeId: 'cranks_no_start'
      }
    ]
  },
  electrical_dead: {
    id: 'electrical_dead',
    category: 'Electrical Inspection',
    question: 'Have you verified the battery terminals and the main fuse?',
    contextNote: 'Mountain vibrations frequently loosen battery terminal bolts.',
    options: [
      {
        label: 'Checked — Terminals are tight and fuse is intact, still completely dead',
        outcome: {
          severity: 'WORKSHOP_INSPECTION_NEEDED',
          title: 'MAIN POWER RELAY OR BATTERY INTERNAL OPEN-CIRCUIT',
          instructions: [
            'The battery may have dropped an internal cell or the main ignition relay failed.',
            'If equipped with an immobilizer or keyless FOB, ensure FOB battery is not depleted.',
            'Request roadside electrical jump-start or terminal inspection.',
            'If battery cannot hold charge, a new AGM/lithium battery is required.'
          ],
          recommendedCategory: 'Bike Problem'
        }
      },
      {
        label: 'Have not checked battery terminals or under-seat fuses yet',
        outcome: {
          severity: 'SAFE_ROADSIDE_FIX',
          title: 'SAFE ROADSIDE ELECTRICAL VERIFICATION',
          instructions: [
            'Key OFF. Remove seat using bike ignition key.',
            'Check battery cables: Hand-wiggle positive (+) and negative (-) terminals. If loose, tighten with an 8mm or 10mm spanner or screwdriver.',
            'Locate fuse box near battery. Inspect the MAIN 30A fuse. If the metal bridge inside is broken, swap with the spare 30A fuse in the fuse cover.',
            'Turn key ON. If instrument cluster lights up, proceed with starting.',
            'SAFETY NOTE: Never bridge a blown fuse with foil or wire — severe wire harness fire hazard.'
          ],
          recommendedCategory: 'Bike Problem'
        }
      }
    ]
  },
  starter_click: {
    id: 'starter_click',
    category: 'Starter / Interlock Check',
    question: 'Is the engine kill switch set to RUN, bike in NEUTRAL, and side-stand UP?',
    contextNote: 'Modern motorcycles cut starter power if side-stand is down while in gear.',
    options: [
      {
        label: 'Yes — In neutral (green light on), stand up, clutch pulled in, still only clicks',
        outcome: {
          severity: 'WORKSHOP_INSPECTION_NEEDED',
          title: 'LOW BATTERY VOLTAGE OR WEAK STARTER SOLENOID',
          instructions: [
            'Rapid solenoid clicking indicates battery voltage dropped below ~10.5V under load.',
            'Do NOT repeatedly press starter button — this drains remaining charge completely and overheats starter coils.',
            'If on flat, safe pavement and motorcycle is a manual transmission (not scooter/slipper-clutch lock), a 2nd-gear push start may be attempted safely with 2 people.',
            'Alternatively, request a 12V portable jump-pack or roadside jump-start.'
          ],
          recommendedCategory: 'Bike Problem'
        }
      },
      {
        label: 'Kill switch or gear interlock was engaged',
        outcome: {
          severity: 'SAFE_ROADSIDE_FIX',
          title: 'INTERLOCK RESOLVED',
          instructions: [
            'Toggle engine kill switch back to RUN position.',
            'Shift firmly into NEUTRAL and confirm the green "N" indicator glows on cluster.',
            'Retract side-stand completely.',
            'Firmly squeeze clutch lever to trip the clutch safety switch.',
            'Press starter button with throttle completely closed.'
          ]
        }
      }
    ]
  },
  cranks_no_start: {
    id: 'cranks_no_start',
    category: 'Fuel & Ignition Delivery',
    question: 'Did the engine die abruptly at speed, or start sputtering gradually as if fuel-starved?',
    options: [
      {
        label: 'Died abruptly with sudden total silence (like switch was flipped)',
        outcome: {
          severity: 'WORKSHOP_INSPECTION_NEEDED',
          title: 'IGNITION COIL, CRANK POSITION SENSOR, OR FUSE TRIP',
          instructions: [
            'Sudden instant shutoff typically points to electrical ignition loss (crank position sensor or ignition fuse) rather than fuel starvation.',
            'Check the 10A/15A IGNITION fuse in the under-seat fuse box.',
            'Inspect spark plug lead cap to ensure vibration did not pop it off the spark plug tip.',
            'If fuse and plug cap are intact, sensor or fuel pump relay has failed. Request roadside recovery.'
          ],
          recommendedCategory: 'Bike Problem'
        }
      },
      {
        label: 'Sputtered, surged, and lost power gradually over 20-60 seconds',
        outcome: {
          severity: 'SAFE_ROADSIDE_FIX',
          title: 'FUEL STARVATION OR VAPOR LOCK',
          instructions: [
            'Check fuel level. On bikes with dual-tank lobes or high petcocks, switch to RESERVE if carbureted.',
            'Fuel Tank Vent Blockage (Vapor lock): Open fuel filler cap. If you hear a loud "whoosh" sound of vacuum releasing, the tank breather hose is kinked.',
            'With cap open, try starting. If bike runs, the vent line under tank is pinched.',
            'If fuel tank is empty, request emergency highway fuel delivery (5 liters).'
          ],
          recommendedCategory: 'Bike Problem'
        }
      }
    ]
  },
  fluid_leak: {
    id: 'fluid_leak',
    category: 'Fluid Safety',
    question: 'What type of fluid is leaking from the motorcycle?',
    options: [
      {
        label: 'Engine Oil — Dark, amber, or brown slick liquid',
        outcome: {
          severity: 'STOP_RIDING_DANGER',
          title: 'CRITICAL ENGINE OIL LOSS — SHUT OFF ENGINE IMMEDIATELY',
          instructions: [
            'TURN OFF ENGINE IMMEDIATELY. Do not run the motor even at idle.',
            'Riding with low oil causes catastrophic internal engine seizure within 2-3 km, which will instantly lock the rear wheel at speed.',
            'Oil dripping onto the rear tyre causes immediate, uncontrollable loss of traction.',
            'Inspect drain plug and oil filter cap for obvious loose bolts.',
            'Flatbed motorcycle recovery is required.'
          ],
          recommendedCategory: 'Towing'
        }
      },
      {
        label: 'Petrol / Fuel — Strong smell of petrol near engine or tank',
        outcome: {
          severity: 'STOP_RIDING_DANGER',
          title: 'EXTREME FIRE HAZARD — DISCONNECT IGNITION',
          instructions: [
            'TURN OFF IGNITION IMMEDIATELY and turn fuel petcock OFF (if equipped).',
            'Step away from the motorcycle at least 10 meters. Do not smoke or create sparks.',
            'Fuel leaking onto hot exhaust headers or cylinder heads will ignite instantly.',
            'Do NOT attempt to restart the engine until the leak has been located and sealed.',
            'Contact roadside recovery or emergency services if fire hazard is active.'
          ],
          recommendedCategory: 'Towing'
        }
      },
      {
        label: 'Coolant — Sweet smell, green/blue/pink watery liquid from radiator',
        outcome: {
          severity: 'STOP_RIDING_DANGER',
          title: 'COOLANT SYSTEM RUPTURE — OVERHEATING RISK',
          instructions: [
            'NEVER OPEN RADIATOR CAP WHILE HOT — boiling pressurized coolant will cause severe 3rd-degree burns.',
            'Allow engine to cool down for at least 30 minutes.',
            'Riding without coolant will warp the aluminum cylinder head and blow the head gasket within minutes.',
            'If radiator hose clamp has backed off and coolant is available, clamp can be retightened once cool.',
            'Otherwise, request towing to avoid engine destruction.'
          ],
          recommendedCategory: 'Towing'
        }
      }
    ]
  },
  handling: {
    id: 'handling',
    category: 'Chassis & Suspension',
    question: 'Where is the instability or strange vibration coming from?',
    options: [
      {
        label: 'Front end violently shakes ("tank slapper" / head shake) or steering feels notchy/stiff',
        outcome: {
          severity: 'STOP_RIDING_DANGER',
          title: 'CRITICAL STEERING OR FORK FAILURE',
          instructions: [
            'DO NOT RIDE AT HIGHWAY SPEED.',
            'Loose steering head bearings, bent front axle, or blown fork damping can trigger violent loss of control.',
            'Inspect front tyre for severe bulging or low pressure (below 15 PSI causes violent front wander).',
            'If steering feels locked or clicks at center, headstock bearings have collapsed.',
            'Towing recovery is mandatory for rider safety.'
          ],
          recommendedCategory: 'Towing'
        }
      },
      {
        label: 'Drive chain is slapping loudly against swingarm or rear wheel feels jerky',
        outcome: {
          severity: 'WORKSHOP_INSPECTION_NEEDED',
          title: 'DRIVE CHAIN EXCESSIVE SLACK / SPROCKET WEAR',
          instructions: [
            'SAFETY WARNING: NEVER inspect or clean drive chain with engine running or in gear!',
            'Check chain slack on the lower run midway between sprockets: Should be 25-35mm for street bikes, 35-45mm for adventure bikes.',
            'If chain touches the swingarm guide or is jumping teeth, it risks snapping and locking the rear wheel or cracking the engine crankcase.',
            'If chain tool and 24mm/27mm axle spanner are available, chain can be adjusted. Otherwise, ride only at crawl speed to nearest workshop.'
          ],
          recommendedCategory: 'Bike Problem'
        }
      }
    ]
  },
  tyres: {
    id: 'tyres',
    category: 'Tyre & Wheel',
    question: 'Does your motorcycle have Tubeless tyres (alloy wheels) or Tube-type tyres (spoked wheels)?',
    options: [
      {
        label: 'Tubeless (Alloy wheels, puncture object still embedded)',
        outcome: {
          severity: 'SAFE_ROADSIDE_FIX',
          title: 'TUBELESS MUSHROOM / ROPE PLUG REPAIRABLE',
          instructions: [
            'If nail/screw is visible in the tread (not sidewall), tubeless tyre can be repaired at roadside using a sticky string or mushroom plug kit.',
            'DO NOT remove the nail until your plug kit and air pump / CO2 cartridges are ready.',
            'If tyre is completely unseated from rim or alloy wheel has a dent/crack, do not attempt to inflate — rim failure risk.',
            'Request mobile puncture repair with 12V mini compressor or roadside assistance.'
          ],
          recommendedCategory: 'Bike Problem'
        }
      },
      {
        label: 'Tube-type (Spoked adventure / classic wheels) or sidewall slash',
        outcome: {
          severity: 'WORKSHOP_INSPECTION_NEEDED',
          title: 'TUBE REPLACEMENT OR TYRE REMOVAL REQUIRED',
          instructions: [
            'Tube-type tyres cannot be plugged from the outside with sticky strings.',
            'Wheel must be removed from motorcycle and tyre bead broken with tyre irons to patch or replace inner tube.',
            'Do NOT ride on a flat tube tyre — the valve stem will rip out and the tyre bead will damage the rim.',
            'Request a mechanic equipped with 21"/18"/17" replacement tubes and tyre irons, or flatbed recovery.'
          ],
          recommendedCategory: 'Bike Problem'
        }
      }
    ]
  }
};

export function MotorcycleTroubleshooter({
  onSelectCategory,
  onClose
}: {
  onSelectCategory?: (category: 'Towing' | 'Bike Problem' | 'Medical' | 'Safety') => void;
  onClose?: () => void;
}) {
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');
  const [history, setHistory] = useState<string[]>([]);

  const currentNode = TRIAGE_TREE[currentNodeId] || TRIAGE_TREE.start;

  const handleSelectOption = (nextNodeId?: string, outcome?: TriageNode['options'][0]['outcome']) => {
    if (nextNodeId && TRIAGE_TREE[nextNodeId]) {
      setHistory(prev => [...prev, currentNodeId]);
      setCurrentNodeId(nextNodeId);
    } else if (outcome) {
      // Reached an outcome
      setCurrentOutcome(outcome);
    }
  };

  const [currentOutcome, setCurrentOutcome] = useState<TriageNode['options'][0]['outcome'] | null>(null);

  const handleBack = () => {
    if (currentOutcome) {
      setCurrentOutcome(null);
      return;
    }
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setCurrentNodeId(prev);
    }
  };

  const handleRestart = () => {
    setCurrentOutcome(null);
    setCurrentNodeId('start');
    setHistory([]);
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-3xl p-5 sm:p-7 text-white space-y-6">
      
      {/* Header with safety guidance */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-[#FFF174] text-black">
            <Wrench size={18} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              Cautious Motorcycle Diagnostic Guide
            </h2>
            <p className="text-xs text-gray-400">
              One question at a time • Prioritizes rider safety above roadside repairs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(history.length > 0 || currentOutcome) && (
            <button
              onClick={handleBack}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-colors"
            >
              ← Previous Step
            </button>
          )}
          <button
            onClick={handleRestart}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Restart triage"
          >
            <RotateCcw size={15} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Close guide"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Automotive OBD/ECU Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
        <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-bold text-amber-300">Technical Note:</strong> Browser-based web applications cannot connect directly to motorcycle ECU/CAN-bus networks or clear diagnostic trouble codes (DTCs). This tool provides structured mechanical triage. Real diagnostics require a dedicated OBD-II scanner.
        </p>
      </div>

      {/* Outcome View */}
      {currentOutcome ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className={`p-5 rounded-2xl border ${
            currentOutcome.severity === 'STOP_RIDING_DANGER' 
              ? 'bg-red-950/40 border-red-500/50 text-red-200 shadow-[0_0_30px_rgba(220,38,38,0.2)]'
              : currentOutcome.severity === 'WORKSHOP_INSPECTION_NEEDED'
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {currentOutcome.severity === 'STOP_RIDING_DANGER' ? (
                <ShieldAlert size={22} className="text-red-400 animate-pulse" />
              ) : currentOutcome.severity === 'WORKSHOP_INSPECTION_NEEDED' ? (
                <AlertTriangle size={22} className="text-amber-400" />
              ) : (
                <CheckCircle2 size={22} className="text-emerald-400" />
              )}
              <h3 className="text-base sm:text-lg font-black tracking-wide text-white uppercase">
                {currentOutcome.title}
              </h3>
            </div>

            <ul className="space-y-2 mt-4 text-xs sm:text-sm">
              {currentOutcome.instructions.map((inst, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-[#FFF174] shrink-0">•</span>
                  <span className="leading-relaxed">{inst}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {currentOutcome.recommendedCategory && onSelectCategory && (
              <button
                type="button"
                onClick={() => onSelectCategory(currentOutcome.recommendedCategory!)}
                className="px-5 py-3 rounded-xl bg-[#FFF174] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Request {currentOutcome.recommendedCategory} Assistance</span>
                <ArrowRight size={14} />
              </button>
            )}

            <a
              href="tel:112"
              className="px-4 py-3 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-red-500/40"
            >
              <PhoneCall size={14} className="text-red-400" />
              <span>Call Emergency 112</span>
            </a>

            <button
              type="button"
              onClick={handleRestart}
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs uppercase tracking-wider"
            >
              Diagnose Another Issue
            </button>
          </div>
        </div>
      ) : (
        /* Question Step View */
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FFF174]">
              {currentNode.category}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {currentNode.question}
            </h3>
            {currentNode.contextNote && (
              <p className="text-xs text-gray-400 mt-1">
                {currentNode.contextNote}
              </p>
            )}
          </div>

          <div className="grid gap-2.5 pt-2">
            {currentNode.options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(opt.nextNodeId, opt.outcome)}
                className="w-full text-left p-4 rounded-2xl bg-white/5 hover:bg-[#FFF174]/10 hover:border-[#FFF174]/50 border border-white/10 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-[#FFF174] transition-colors">
                      {opt.label}
                    </h4>
                    {opt.description && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {opt.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight size={16} className="text-gray-500 group-hover:text-[#FFF174] shrink-0 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
