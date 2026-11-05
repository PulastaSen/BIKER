import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  getBikes, 
  saveBike, 
  deleteBike as removeBikeFromStorage,
  addMaintenanceRecord,
  deleteMaintenanceRecord
} from '../../utils/appStorage';
import { fetchUserSubscriptionsApi, generateBikeQrTagApi, revokeBikeQrTagApi } from '../../services/ecosystemApi';
import type { Bike, FuelType, UserSubscription, VehicleQrTag, MaintenanceRecord } from '../../types/app';
import { getBikeImage, getBikeDisplayName, maskRegistrationNumber } from '../../utils/bikeUtils';
import {
  ArrowLeft,
  Star,
  Edit3,
  Trash2,
  QrCode,
  Wrench,
  ShieldCheck,
  Zap,
  Gauge,
  Fuel,
  Disc,
  Layers,
  Sparkles,
  AlertTriangle,
  Calendar,
  Check,
  X,
  Plus,
  Send,
  Bot,
  HelpCircle,
  Copy,
  PhoneCall,
  Eye,
  EyeOff
} from 'lucide-react';

type TabType = 'overview' | 'specs' | 'features' | 'maintenance' | 'troubleshoot' | 'ai';

interface TroubleshootingIssue {
  id: string;
  title: string;
  symptom: string;
  causes: string[];
  safeChecks: string[];
  whatNotToDo: string[];
  risk: 'DO_NOT_RIDE' | 'CAUTION_RIDE_NEARBY' | 'SAFE_TO_RIDE';
  recommendedAction: string;
  categoryParam: string;
}

const TROUBLESHOOTING_ISSUES: TroubleshootingIssue[] = [
  {
    id: 'no_start',
    title: "Bike Won't Start",
    symptom: "Starter motor silent, clicking rapidly, or cranking but failing to ignite.",
    causes: [
      "Discharged 12V battery (<11.8V) unable to engage starter solenoid.",
      "Engine kill-switch inadvertently switched to OFF position.",
      "Side-stand interlock sensor active while motorcycle is in gear.",
      "Blown 15A/30A ignition or fuel injection fuse."
    ],
    safeChecks: [
      "Ensure transmission is strictly in Neutral (green 'N' illuminated on dash).",
      "Toggle the engine kill-switch firmly ON/OFF three times.",
      "Fully pull the clutch lever in while pressing the starter button.",
      "Listen for the fuel pump's 2-second primer whir when turning key to ON."
    ],
    whatNotToDo: [
      "Do NOT hold the starter button for more than 5 continuous seconds (prevents starter motor burnout).",
      "Do NOT roll-start or clutch-dump modern fuel-injected bikes down steep hills with a totally dead battery."
    ],
    risk: 'DO_NOT_RIDE',
    recommendedAction: '12V Roadside Battery Jump-Start or Mobile Mechanic',
    categoryParam: 'BATTERY'
  },
  {
    id: 'low_mileage',
    title: 'Low Mileage / Fuel Stutter',
    symptom: 'Sudden drop in fuel economy, jerky throttle response, or hesitation above 4,000 RPM.',
    causes: [
      "Air filter clogged with fine mountain dust or debris.",
      "Under-inflated tyres creating high rolling resistance.",
      "Dry, stiff, or over-tightened drive chain dragging on the sprockets.",
      "Fuel contaminated with water or low-grade adulterated petrol."
    ],
    safeChecks: [
      "Audit tyre pressures against cold specification (32 PSI Front / 36 PSI Rear).",
      "Inspect drive chain slack (should measure 25–30 mm free play).",
      "Check spark plug cap connection for water ingress after water crossings."
    ],
    whatNotToDo: [
      "Do NOT rev the engine aggressively in lower gears to overcome stalling.",
      "Do NOT use unverified local additive canisters without manufacturer clearance."
    ],
    risk: 'CAUTION_RIDE_NEARBY',
    recommendedAction: 'Workshop Throttle Body & Air Filter Inspection',
    categoryParam: 'FUEL'
  },
  {
    id: 'overheating',
    title: 'Engine Overheating',
    symptom: 'High temperature warning icon flashing, radiator fan running continuously, coolant boiling.',
    causes: [
      "Radiator cooling fins blocked with dried mud, bugs, or gravel.",
      "Low coolant level in the expansion reservoir tank.",
      "Low engine oil level reducing thermodynamic heat transfer.",
      "Prolonged idling in dense stop-and-go mountain traffic."
    ],
    safeChecks: [
      "Pull over immediately into a safe, shaded spot and turn the engine OFF.",
      "Check through the radiator cowl for visible mud caking or crushed fins.",
      "Check oil level inspection sight-glass with bike held upright on level ground."
    ],
    whatNotToDo: [
      "CRITICAL DANGER: NEVER open the radiator pressure cap while the engine is hot (severe steam burns!).",
      "Do NOT pour cold water directly onto hot engine block metal (risks thermal shock cracking)."
    ],
    risk: 'DO_NOT_RIDE',
    recommendedAction: 'Mobile Roadside Coolant Top-Up or Flatbed Recovery',
    categoryParam: 'ENGINE'
  },
  {
    id: 'chain_noise',
    title: 'Chain Noise / Slapping',
    symptom: 'Rattling, metallic clicking, chain slapping against swingarm, or visible rust.',
    causes: [
      "Excessive chain slack beyond manufacturer limit (>35 mm).",
      "Dry, unlubricated O-rings / X-rings causing seized links.",
      "Worn sprocket teeth hooked or shark-finned.",
      "Rear wheel misalignment after axle adjustment."
    ],
    safeChecks: [
      "Measure chain free play midway along the lower run (target: 25–30 mm).",
      "Inspect chain guide slider pad on swingarm for wear or missing bolts.",
      "Look for orange rust powder on O-rings indicating lubricant starvation."
    ],
    whatNotToDo: [
      "DANGER: NEVER clean or lubricate the chain with the engine running in gear!",
      "Do NOT ride at high speeds if the chain has skipped or shows tight spots."
    ],
    risk: 'CAUTION_RIDE_NEARBY',
    recommendedAction: 'Drive Chain Tensioning & Deep Lube Service',
    categoryParam: 'CHAIN'
  },
  {
    id: 'brake_issue',
    title: 'Brake Problem / Spongy Lever',
    symptom: 'Brake lever pulls all the way to the handlebar grip, squealing, or weak stopping bite.',
    causes: [
      "Air bubbles trapped in hydraulic brake fluid circuit.",
      "Worn brake pads below 1.5mm friction material wear limit.",
      "Contaminated disc rotor (chain lube overspray or grease).",
      "Low brake fluid in the handlebar or rear master cylinder reservoir."
    ],
    safeChecks: [
      "Check fluid inspection sight glass on master cylinder (must be above MIN).",
      "Pump brake lever 5 times rapidly while stopped to verify if lever pressure stiffens.",
      "Inspect disc rotor surface for deep grooves or blue heat glazing."
    ],
    whatNotToDo: [
      "CRITICAL: Do NOT ride on highways or mountain descent passes with spongy brakes!",
      "Do NOT spray WD-40, chain cleaner, or solvents near brake rotors or calipers."
    ],
    risk: 'DO_NOT_RIDE',
    recommendedAction: 'Emergency Brake Bleed / Mobile Pad Replacement',
    categoryParam: 'OTHER'
  },
  {
    id: 'battery_issue',
    title: 'Battery Issue / Dim Lights',
    symptom: 'Headlight flickers, instrument cluster resets when starting, horn sounds weak.',
    causes: [
      "Corroded or loose 12V battery terminal bolts.",
      "Battery sulfation due to extended parking without tender.",
      "Faulty stator coil or voltage regulator/rectifier (RR unit).",
      "High parasitic drain from aftermarket auxiliary lights or USB chargers."
    ],
    safeChecks: [
      "Remove rider seat and confirm terminal clamps (+ and -) are tight with no white powder.",
      "Disconnect aftermarket accessories to isolate parasitic drain.",
      "Test horn sound with engine off vs engine idling."
    ],
    whatNotToDo: [
      "Do NOT push-start repeatedly on low battery (can spike ECU electronics).",
      "Do NOT touch metal tools across both battery terminals simultaneously (arc short)."
    ],
    risk: 'CAUTION_RIDE_NEARBY',
    recommendedAction: '12V Battery Diagnostic / Replacement Dispatch',
    categoryParam: 'BATTERY'
  },
  {
    id: 'tyre_problem',
    title: 'Tyre Puncture / Handling Wobble',
    symptom: 'Heavy sluggish steering, loss of pressure, highway handlebar oscillation, nail in tread.',
    causes: [
      "Nail, screw, or road debris puncturing tread carcass.",
      "Slow leak from valve stem rubber or faulty Schrader core.",
      "Rim bend or dent from severe pothole impact.",
      "Severely uneven tyre wear or missing wheel balance weights."
    ],
    safeChecks: [
      "Rotate wheel slowly to visually locate nail, screw, or foreign object in tread.",
      "Apply soapy water to valve stem to check for bubbling leaks.",
      "Inspect sidewall for bulging or rim flange deformation."
    ],
    whatNotToDo: [
      "Do NOT pull out a nail/screw if you do not have a tyre plug kit and 12V inflator ready.",
      "Do NOT ride on a completely flat tyre (destroys tyre carcass and bends alloy/spoke rim)."
    ],
    risk: 'DO_NOT_RIDE',
    recommendedAction: 'Mobile Tubeless Mushroom Plug & Air Refill',
    categoryParam: 'TYRE'
  },
  {
    id: 'electrical_fault',
    title: 'Electrical / Blown Fuse',
    symptom: 'Total instrument console blackout, blinkers stopped working, or blown fuses.',
    causes: [
      "Main fuse blown due to short circuit in accessory wiring.",
      "Water ingress into handlebar switchgear after monsoon riding.",
      "Pinched wiring harness near the steering headstock triple tree.",
      "Faulty relay for fuel pump or starter motor."
    ],
    safeChecks: [
      "Locate the fuse box under rider seat and check the spare fuses in the lid.",
      "Inspect visible wiring around the headstock for chafing against the frame.",
      "Check if hazard lights activate even if headlight is off."
    ],
    whatNotToDo: [
      "NEVER bridge a blown fuse with aluminum foil or copper wire (severe fire risk!).",
      "Always replace a blown fuse with identical amperage rating (e.g. 10A with 10A, 15A with 15A)."
    ],
    risk: 'DO_NOT_RIDE',
    recommendedAction: 'Auto-Electrical Specialist Technician Dispatch',
    categoryParam: 'ELECTRICAL'
  }
];

export function BikeDetailPage() {
  const { bikeId } = useParams<{ bikeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bike, setBike] = useState<Bike | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [maskedReg, setMaskedReg] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  // Edit Bike Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editReg, setEditReg] = useState('');
  const [editYear, setEditYear] = useState('2025');
  const [editFuelType, setEditFuelType] = useState<FuelType>('PETROL');
  const [editIsPrimary, setEditIsPrimary] = useState(false);
  const [editNotes, setEditNotes] = useState('');

  // Maintenance Modal State
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [maintType, setMaintType] = useState<MaintenanceRecord['serviceType']>('PERIODIC_SERVICE');
  const [maintName, setMaintName] = useState('');
  const [maintDate, setMaintDate] = useState(new Date().toISOString().split('T')[0]);
  const [maintOdo, setMaintOdo] = useState('5000');
  const [maintCost, setMaintCost] = useState('');
  const [maintCenter, setMaintCenter] = useState('');
  const [maintNotes, setMaintNotes] = useState('');

  // QR Modal State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrTag, setQrTag] = useState<VehicleQrTag | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);

  // Selected Troubleshooting Issue
  const [selectedIssue, setSelectedIssue] = useState<TroubleshootingIssue>(TROUBLESHOOTING_ISSUES[0]);

  // AI Assistant Chat State
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  const loadCurrentBike = async () => {
    if (!bikeId) return;
    const all = getBikes(user?.id);
    const found = all.find((b) => b.id === bikeId);
    if (found) {
      setBike(found);
      if (user) {
        const subs = await fetchUserSubscriptionsApi(user.id);
        const sub = subs.find((s) => s.linkedBike?.bikeId === found.id && s.status === 'ACTIVE');
        setSubscription(sub || null);
      }
    } else {
      // If not found, navigate back to garage
      navigate('/rider/bikes');
    }
  };

  useEffect(() => {
    loadCurrentBike();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bikeId, user]);

  // Initialize AI assistant welcome message when bike loads
  useEffect(() => {
    if (bike && aiMessages.length === 0) {
      setAiMessages([
        {
          sender: 'ai',
          text: `Hello! I am your MotoAssist specialist for the **${getBikeDisplayName(bike)}** (${bike.year}). I have your verified ${bike.engine ? bike.engine.split(' ')[0] : ''} engine architecture, fluid specifications, chain tension guidelines, and high-altitude mountain travel parameters loaded. What would you like to know or inspect?`,
          time: 'Just now'
        }
      ]);
    }
  }, [bike, aiMessages.length]);

  const handleOpenEdit = () => {
    if (!bike) return;
    setEditBrand(bike.brand);
    setEditModel(bike.model);
    setEditCategory(bike.category || '');
    setEditReg(bike.registrationNumber);
    setEditYear(bike.year.toString());
    setEditFuelType(bike.fuelType);
    setEditIsPrimary(!!bike.isPrimary);
    setEditNotes(bike.notes || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!bike || !user || !editBrand || !editModel || !editReg) return;

    const updated: Bike = {
      ...bike,
      brand: editBrand,
      model: editModel,
      category: editCategory || bike.category,
      registrationNumber: editReg.toUpperCase(),
      year: parseInt(editYear, 10) || bike.year,
      fuelType: editFuelType,
      isPrimary: editIsPrimary,
      notes: editNotes,
    };

    saveBike(updated);
    setBike(updated);
    setShowEditModal(false);
  };

  const handleSetPrimary = () => {
    if (!bike) return;
    const updated = { ...bike, isPrimary: true };
    saveBike(updated);
    setBike(updated);
  };

  const handleDelete = () => {
    if (!bike) return;
    if (window.confirm(`Are you sure you want to remove ${getBikeDisplayName(bike)} from your garage?`)) {
      removeBikeFromStorage(bike.id);
      navigate('/rider/bikes');
    }
  };

  const handleOpenQr = async () => {
    if (!bike) return;
    setShowQrModal(true);
    setQrLoading(true);
    setQrCopied(false);
    try {
      const tag = await generateBikeQrTagApi(bike.id);
      setQrTag(tag);
    } finally {
      setQrLoading(false);
    }
  };

  const handleRevokeQr = async () => {
    if (!bike) return;
    if (!window.confirm('Are you sure you want to revoke this emergency tag?')) return;
    setQrLoading(true);
    try {
      await revokeBikeQrTagApi(bike.id);
      setQrTag(null);
    } finally {
      setQrLoading(false);
    }
  };

  const handleSaveMaintenance = (e: FormEvent) => {
    e.preventDefault();
    if (!bike || !maintName) return;

    const newRecord: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
      bikeId: bike.id,
      serviceType: maintType,
      serviceName: maintName,
      date: maintDate,
      odometerKm: parseInt(maintOdo, 10) || 5000,
      cost: maintCost ? parseFloat(maintCost) : undefined,
      serviceCenter: maintCenter || 'Self Maintenance',
      notes: maintNotes || undefined,
    };

    addMaintenanceRecord(bike.id, newRecord);
    loadCurrentBike();
    setShowMaintModal(false);
    setMaintName('');
    setMaintCost('');
    setMaintCenter('');
    setMaintNotes('');
  };

  const handleDeleteMaint = (recordId: string) => {
    if (!bike) return;
    if (window.confirm('Delete this maintenance record?')) {
      deleteMaintenanceRecord(bike.id, recordId);
      loadCurrentBike();
    }
  };

  // AI Assistant Query Handler
  const handleSendAi = (promptText?: string) => {
    const textToSend = promptText || aiInput.trim();
    if (!textToSend || !bike) return;

    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      time: 'Just now'
    };

    setAiMessages((prev) => [...prev, userMsg]);
    if (!promptText) setAiInput('');
    setAiTyping(true);

    setTimeout(() => {
      setAiTyping(false);
      let reply = '';
      const q = textToSend.toLowerCase();

      if (q.includes('oil') || q.includes('engine oil') || q.includes('lubricant')) {
        reply = `**Engine Oil Specifications for ${getBikeDisplayName(bike)}:**\n\n• **Recommended Grade:** 10W-50 or 15W-50 API SN / JASO MA2 Full Synthetic.\n• **Oil Capacity:** Approximately 2.0L to 2.2L (with oil filter replacement).\n• **Service Interval:** Every 5,000 km or 12 months (whichever occurs first).\n• **Pre-Ride Check:** Always inspect the oil sight-glass with motorcycle held vertically upright on level tarmac. Ensure oil line sits midway between MIN and MAX marks.`;
      } else if (q.includes('tyre') || q.includes('tire') || q.includes('pressure') || q.includes('psi')) {
        reply = `**Tyre Specifications & Cold Pressure for ${getBikeDisplayName(bike)}:**\n\n• **Front Tyre:** Cold pressure **32 PSI**.\n• **Rear Tyre:** Cold pressure **36 PSI** (increase to **38 PSI** when carrying heavy luggage panniers or pillion).\n• **Wheel Architecture:** Tubeless cross-spoke wheels.\n• **Safety Audit:** Always check tyre pressures when the rubber is cold before heading out on high-speed expressway corridors.`;
      } else if (q.includes('mountain') || q.includes('himalaya') || q.includes('high altitude') || q.includes('pass')) {
        reply = `**Himalayan & High-Altitude Corridor Checklist for ${getBikeDisplayName(bike)}:**\n\n1. **Air Filter:** Clean or replace before departure. Thin air above 3,500m reduces oxygen intake.\n2. **Coolant Concentration:** Ensure minimum 50/50 ethylene-glycol anti-freeze mix to prevent radiator freeze-up in sub-zero overnight temperatures.\n3. **Drive Chain:** Lube every 400 km in dusty conditions. Target 25–30mm slack.\n4. **Fuel Reserve:** The ${bike.tankCapacity || '17L'} fuel tank delivers ~380–420 km range. Carry a 2L spare fuel canister for remote sectors like Rohtang to Kaza or Chang La.\n5. **Emergency Kit:** Pack 12V mini-compressor, tubeless mushroom plug kit, spare 15A fuses, and clutch inner wire.`;
      } else if (q.includes('chain') || q.includes('slack') || q.includes('lube')) {
        reply = `**Drive Chain Maintenance Guidelines:**\n\n• **Slack Measurement:** 25 mm to 30 mm free play measured at the middle point of lower chain run with the bike on side stand.\n• **Lubrication:** Clean with dedicated chain cleaner (never petrol/diesel which swells O-rings) and coat with synthetic off-road chain lube every 500 km or after wet water crossings.`;
      } else {
        reply = `**Information for ${getBikeDisplayName(bike)} (${bike.year}):**\n\n• **Engine Architecture:** ${bike.engine || 'High-efficiency 4-stroke liquid-cooled'}\n• **Power / Torque:** ${bike.power || 'Factory tuned'} / ${bike.torque || 'High mid-range torque'}\n• **Fuel Capacity:** ${bike.tankCapacity || 'Standard tank'}\n• **Brakes:** ${bike.brakes || 'Dual disc with dual-channel ABS'}\n\nFor any specific technical inspection, maintenance interval, or highway breakdown guidance, feel free to ask!`;
      }

      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: 'Just now'
        }
      ]);
    }, 700);
  };

  if (!bike) return null;

  const displayName = getBikeDisplayName(bike);
  const bikeImg = getBikeImage(bike);
  const formattedReg = maskRegistrationNumber(bike.registrationNumber, maskedReg);
  const records = bike.maintenanceRecords || [];

  return (
    <div className="min-h-screen bg-[#12161A] text-white flex flex-col font-sans selection:bg-[#FFF174] selection:text-[#12161A] pb-24">
      
      {/* TOP NAVIGATION BREADCRUMB HEADER */}
      <header className="sticky top-0 z-40 bg-[#1A2026]/95 backdrop-blur-md border-b border-[#2E3844] px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <Link
            to="/rider/bikes"
            className="flex items-center gap-1.5 text-xs font-bold text-[#94A3B8] hover:text-white transition-colors min-h-[40px] px-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Garage</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase text-[#FFF174] bg-[#242D37] border border-[#2E3844] px-2.5 py-1 rounded-lg">
              MOTORCYCLE PROFILE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenEdit}
              className="px-3 py-1.5 rounded-xl bg-[#242D37] hover:bg-[#2A3440] border border-[#2E3844] text-xs font-bold text-white flex items-center gap-1.5 min-h-[40px] transition-colors"
            >
              <Edit3 size={14} className="text-[#FFF174]" />
              <span className="hidden sm:inline">Edit Bike</span>
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-300 flex items-center gap-1 min-h-[40px] transition-colors"
              title="Remove bike from garage"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-7 space-y-6">

        {/* ========================================================
            HERO SHOWCASE: BIKE OVERVIEW
            ======================================================== */}
        <section className="bg-gradient-to-br from-[#1E252D] via-[#1A2026] to-[#12161A] border border-[#2E3844] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            
            {/* Left: Image Container */}
            <div className="w-full lg:w-96 h-56 sm:h-64 rounded-2xl overflow-hidden bg-[#12161A] border border-[#2E3844] relative shrink-0 shadow-lg group">
              <img
                src={bikeImg}
                alt={displayName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {bike.isPrimary && (
                <div className="absolute top-3 left-3 bg-[#FFF174] text-[#12161A] font-black text-xs px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                  <Star size={13} fill="currentColor" />
                  <span>PRIMARY BIKE</span>
                </div>
              )}
            </div>

            {/* Center: Bike Details & Specs Headline */}
            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#94A3B8] bg-[#242D37] border border-[#2E3844] px-2.5 py-1 rounded-md font-mono">
                  {bike.brand}
                </span>
                <span className="text-xs text-[#94A3B8] font-bold">
                  Model Year {bike.year}
                </span>
                {bike.category && (
                  <span className="text-[10px] font-bold text-sky-400 bg-sky-950/40 border border-sky-800 px-2 py-0.5 rounded-full">
                    {bike.category}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight">
                {displayName}
              </h1>

              {/* Registration Plate with IND styling & Privacy toggle */}
              <div className="flex items-center gap-3 pt-1">
                <div className="inline-flex items-center gap-2 bg-[#12161A] border border-[#2E3844] px-3 py-1.5 rounded-xl shadow-inner font-mono font-bold text-sm">
                  <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-tighter">IND</span>
                  <span className="text-white tracking-wider">{formattedReg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMaskedReg(!maskedReg)}
                  className="p-1.5 rounded-lg bg-[#242D37] border border-[#2E3844] text-[#94A3B8] hover:text-white transition-colors"
                  title={maskedReg ? 'Reveal full plate' : 'Mask for privacy'}
                >
                  {maskedReg ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>

              {/* 4 Key Vital Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-[#242D37]/70 border border-[#2E3844]">
                  <span className="text-[10px] text-[#94A3B8] font-mono uppercase block">Engine Capacity</span>
                  <strong className="text-sm font-bold text-white block mt-0.5">
                    {bike.engine ? bike.engine.split(' ')[0] : `${bike.year} Spec`}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-[#242D37]/70 border border-[#2E3844]">
                  <span className="text-[10px] text-[#94A3B8] font-mono uppercase block">Max Power</span>
                  <strong className="text-sm font-bold text-white block mt-0.5">
                    {bike.power ? bike.power.split('@')[0].trim() : 'Factory Spec'}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-[#242D37]/70 border border-[#2E3844]">
                  <span className="text-[10px] text-[#94A3B8] font-mono uppercase block">Kerb Weight</span>
                  <strong className="text-sm font-bold text-white block mt-0.5">
                    {bike.weight || 'Standard'}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-[#242D37]/70 border border-[#2E3844]">
                  <span className="text-[10px] text-[#94A3B8] font-mono uppercase block">Fuel Range</span>
                  <strong className="text-sm font-bold text-[#10B981] block mt-0.5">
                    {bike.tankCapacity ? bike.tankCapacity.split('(')[0].trim() : `${bike.fuelType}`}
                  </strong>
                </div>
              </div>

              {/* Active Protection Plan Pill */}
              {subscription && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs flex items-center justify-between gap-3 text-emerald-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#10B981]" />
                    <span>Protected by <strong>{subscription.planName}</strong> • {subscription.features.maxFreeBreakdowns - subscription.features.usedBreakdowns} Free Breakdowns Left</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded">ACTIVE SHIELD</span>
                </div>
              )}
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="w-full lg:w-48 flex flex-row lg:flex-col gap-2 shrink-0">
              {!bike.isPrimary && (
                <button
                  type="button"
                  onClick={handleSetPrimary}
                  className="flex-1 lg:flex-initial px-3.5 py-2.5 rounded-xl bg-[#242D37] hover:bg-[#2A3440] border border-[#2E3844] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors min-h-[42px]"
                >
                  <Star size={14} className="text-[#FFF174]" />
                  <span>Set as Primary</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenQr}
                className="flex-1 lg:flex-initial px-3.5 py-2.5 rounded-xl bg-[#242D37] hover:bg-[#2A3440] border border-[#2E3844] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors min-h-[42px]"
              >
                <QrCode size={14} className="text-indigo-400" />
                <span>Emergency QR</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/emergency?cat=BIKE_PROBLEM&sub=BATTERY`)}
                className="flex-1 lg:flex-initial px-3.5 py-2.5 rounded-xl bg-[#FFF174] hover:bg-yellow-400 text-[#12161A] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors min-h-[42px] shadow-md"
              >
                <Wrench size={14} />
                <span>Request Help</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================
            TAB NAVIGATION: CLEAN MULTI-SECTION COCKPIT
            ======================================================== */}
        <div className="border-b border-[#2E3844] flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: Gauge },
            { id: 'specs', label: 'Full Specifications', icon: Layers },
            { id: 'features', label: 'Features & Electronics', icon: Sparkles },
            { id: 'maintenance', label: `Service Records (${records.length})`, icon: Calendar },
            { id: 'troubleshoot', label: 'Troubleshooting Guide', icon: AlertTriangle },
            { id: 'ai', label: 'Ask AI Assistant', icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer min-h-[42px] ${
                  isActive
                    ? 'bg-[#FFF174] text-[#12161A] font-black shadow-md'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E252D]'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB 1: OVERVIEW TAB
            ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Quick Specs Snapshot */}
              <div className="p-5 rounded-2xl bg-[#1E252D] border border-[#2E3844] space-y-3">
                <div className="flex items-center gap-2 text-[#FFF174]">
                  <Gauge size={18} />
                  <h3 className="text-base font-bold text-white">Engine & Dimensions Snapshot</h3>
                </div>
                <div className="divide-y divide-[#2E3844] text-xs">
                  <div className="py-2 flex justify-between">
                    <span className="text-[#94A3B8]">Engine</span>
                    <strong className="text-white text-right">{bike.engine || 'Standard 4-Stroke'}</strong>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-[#94A3B8]">Power Output</span>
                    <strong className="text-white">{bike.power || 'Factory Specification'}</strong>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-[#94A3B8]">Peak Torque</span>
                    <strong className="text-white">{bike.torque || 'Factory Specification'}</strong>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-[#94A3B8]">Kerb Weight</span>
                    <strong className="text-white">{bike.weight || 'Standard'}</strong>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-[#94A3B8]">Ground Clearance</span>
                    <strong className="text-white">{bike.groundClearance || '200 mm'}</strong>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-[#94A3B8]">Fuel Tank</span>
                    <strong className="text-[#10B981]">{bike.tankCapacity || 'Standard'}</strong>
                  </div>
                </div>
              </div>

              {/* Maintenance Health Status */}
              <div className="p-5 rounded-2xl bg-[#1E252D] border border-[#2E3844] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#10B981]">
                    <ShieldCheck size={18} />
                    <h3 className="text-base font-bold text-white">Health & Service Status</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('maintenance')}
                    className="text-xs font-bold text-[#FFF174] hover:underline"
                  >
                    View History →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-[#242D37] border border-[#2E3844]">
                    <span className="text-[10px] text-[#94A3B8] block">Drive Chain Status</span>
                    <strong className="text-sm font-bold text-white block mt-0.5">Cleaned & Lubed</strong>
                    <span className="text-[10px] text-[#10B981] block mt-0.5">Target 28mm slack</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#242D37] border border-[#2E3844]">
                    <span className="text-[10px] text-[#94A3B8] block">Engine Oil Life</span>
                    <strong className="text-sm font-bold text-white block mt-0.5">Synthetic 10W-50</strong>
                    <span className="text-[10px] text-sky-400 block mt-0.5">Inspection at 5,000 km</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#242D37] border border-[#2E3844]">
                    <span className="text-[10px] text-[#94A3B8] block">Tyre Pressures</span>
                    <strong className="text-sm font-bold text-white block mt-0.5">32 F / 36 R PSI</strong>
                    <span className="text-[10px] text-[#10B981] block mt-0.5">Tubeless verified</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#242D37] border border-[#2E3844]">
                    <span className="text-[10px] text-[#94A3B8] block">Registration & RC</span>
                    <strong className="text-sm font-bold text-white block mt-0.5">Active Status</strong>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">PUC & Insurance Active</span>
                  </div>
                </div>

                {bike.notes && (
                  <div className="p-3 rounded-xl bg-[#12161A] border border-[#2E3844] text-xs">
                    <span className="text-[10px] font-mono text-[#FFF174] uppercase block">Corridor & Tour Notes</span>
                    <p className="text-[#CBD5E1] mt-0.5">{bike.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Link to Troubleshooting */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#1E252D] to-[#1A2026] border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <strong className="text-sm font-bold text-white block">Facing a mechanical or electrical issue?</strong>
                  <span className="text-xs text-[#94A3B8]">Access step-by-step verified diagnostic checks tailored for your {displayName}.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('troubleshoot')}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shrink-0 transition-colors"
              >
                Open Troubleshooting
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: FULL SPECIFICATIONS TAB
            ======================================================== */}
        {activeTab === 'specs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Full Manufacturer Specifications</h2>
                <p className="text-xs text-[#94A3B8]">Verified factory dimensions, powertrain, chassis, and running gear.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Powertrain & Engine */}
              <div className="p-5 rounded-2xl bg-[#1E252D] border border-[#2E3844] space-y-3">
                <div className="flex items-center gap-2 text-[#FFF174]">
                  <Zap size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Powertrain & Engine</h3>
                </div>
                <div className="divide-y divide-[#2E3844] text-xs">
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Displacement & Architecture</span>
                    <strong className="text-white text-right">{bike.engine || 'Single Cylinder 4-Valve DOHC'}</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Maximum Power</span>
                    <strong className="text-white text-right">{bike.power || '40.02 PS @ 8,000 RPM'}</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Peak Torque</span>
                    <strong className="text-white text-right">{bike.torque || '40 Nm @ 5,500 RPM'}</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Fuel Delivery</span>
                    <strong className="text-white text-right">Electronic Fuel Injection (Ride-by-Wire)</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Transmission</span>
                    <strong className="text-white text-right">6-Speed with Slip & Assist Clutch</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Cooling Method</span>
                    <strong className="text-white text-right">Liquid-Cooled with Thermostat Bypass</strong>
                  </div>
                </div>
              </div>

              {/* Dimensions & Weight */}
              <div className="p-5 rounded-2xl bg-[#1E252D] border border-[#2E3844] space-y-3">
                <div className="flex items-center gap-2 text-sky-400">
                  <Gauge size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Dimensions & Ergonomics</h3>
                </div>
                <div className="divide-y divide-[#2E3844] text-xs">
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Seat Height</span>
                    <strong className="text-white text-right">{bike.seatHeight || '825 mm - 845 mm (Adjustable)'}</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Ground Clearance</span>
                    <strong className="text-white text-right">{bike.groundClearance || '230 mm'}</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Kerb Weight</span>
                    <strong className="text-white text-right">{bike.weight || '196 kg'}</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Fuel Tank Capacity</span>
                    <strong className="text-white text-right">{bike.tankCapacity || '17 Litres'}</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Estimated Corridor Range</span>
                    <strong className="text-[#10B981] text-right">~380 km – 420 km</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Fuel Type</span>
                    <strong className="text-white text-right">{bike.fuelType} (E20 Compatible)</strong>
                  </div>
                </div>
              </div>

              {/* Chassis, Suspension & Brakes */}
              <div className="p-5 rounded-2xl bg-[#1E252D] border border-[#2E3844] space-y-3">
                <div className="flex items-center gap-2 text-purple-400">
                  <Layers size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Chassis & Suspension</h3>
                </div>
                <div className="divide-y divide-[#2E3844] text-xs">
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Frame Type</span>
                    <strong className="text-white text-right">Steel Twin-Spar Tubular Frame with Bolt-On Subframe</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Front Suspension</span>
                    <strong className="text-white text-right">43mm Inverted USD Forks (200mm Travel)</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Rear Suspension</span>
                    <strong className="text-white text-right">Linkage Monoshock with Preload Adjust (200mm Travel)</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Braking System</span>
                    <strong className="text-white text-right">{bike.brakes || '320mm Front Disc & 270mm Rear Disc'}</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">ABS System</span>
                    <strong className="text-white text-right">Dual-Channel ABS with Switchable Rear Wheel Mode</strong>
                  </div>
                </div>
              </div>

              {/* Wheels, Tyres & Pressures */}
              <div className="p-5 rounded-2xl bg-[#1E252D] border border-[#2E3844] space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Disc size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Wheels, Tyres & Pressure</h3>
                </div>
                <div className="divide-y divide-[#2E3844] text-xs">
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Front Wheel Size</span>
                    <strong className="text-white text-right">90/90-21 Cross-Spoke Tubeless</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Rear Wheel Size</span>
                    <strong className="text-white text-right">140/80-17 Cross-Spoke Tubeless</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Cold Tyre Pressure (Front)</span>
                    <strong className="text-emerald-400 text-right">32 PSI (2.2 Bar)</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Cold Tyre Pressure (Rear)</span>
                    <strong className="text-emerald-400 text-right">36 PSI Solo / 38 PSI with Pillion & Luggage</strong>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Rim Construction</span>
                    <strong className="text-white text-right">Reinforced Aluminum Spoke Tubeless</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: FEATURES & ELECTRONICS TAB
            ======================================================== */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Features, Electronics & Equipment</h2>
              <p className="text-xs text-[#94A3B8]">Standard rider aids, electronics, and verified equipment on this motorcycle.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {(bike.features && bike.features.length > 0 ? bike.features : [
                'Ride-by-Wire with 4 Ride Modes',
                '4" Round TFT with full Google Maps',
                'Showa 43mm USD Forks (200mm Travel)',
                '21" Front & 17" Rear Spoke Tubeless Rims',
                'Slip & Assist 6-Speed Clutch',
                'Integrated Tail-Lamp Blinkers',
                'USB Type-C 18W Fast Charging Port',
                'Adjustable Seat Height (825mm - 845mm)'
              ]).map((feat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#1E252D] border border-[#2E3844] flex items-start gap-3 shadow-md"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#242D37] border border-[#2E3844] text-[#FFF174] flex items-center justify-center shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <strong className="text-xs sm:text-sm font-bold text-white block leading-tight">{feat}</strong>
                    <span className="text-[10px] text-[#94A3B8] block mt-1">Verified equipment</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: MAINTENANCE & SERVICE HISTORY TAB
            ======================================================== */}
        {activeTab === 'maintenance' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">Maintenance Records & Service History</h2>
                <p className="text-xs text-[#94A3B8]">Track oil changes, chain lubrication, brake services, and inspections.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowMaintModal(true)}
                className="px-4 py-2.5 bg-[#FFF174] hover:bg-yellow-400 text-[#12161A] font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md min-h-[42px]"
              >
                <Plus size={15} />
                <span>Log Service Record</span>
              </button>
            </div>

            {/* Service Records List */}
            {records.length > 0 ? (
              <div className="space-y-3">
                {records.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#1E252D] border border-[#2E3844] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#242D37] border border-[#2E3844] text-[#FFF174] flex items-center justify-center shrink-0">
                        {rec.serviceType === 'OIL_CHANGE' && <Fuel size={18} />}
                        {rec.serviceType === 'CHAIN_LUBE' && <Layers size={18} />}
                        {rec.serviceType === 'BRAKE_PADS' && <Disc size={18} />}
                        {rec.serviceType === 'TYRE_REPLACEMENT' && <Disc size={18} />}
                        {rec.serviceType === 'PERIODIC_SERVICE' && <Wrench size={18} />}
                        {rec.serviceType === 'OTHER' && <ShieldCheck size={18} />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-sm sm:text-base font-bold text-white">
                            {rec.serviceName || rec.serviceType.replace('_', ' ')}
                          </strong>
                          <span className="text-[10px] font-mono font-bold bg-[#242D37] border border-[#2E3844] text-[#FFF174] px-2 py-0.5 rounded">
                            {rec.odometerKm.toLocaleString()} KM
                          </span>
                        </div>

                        {rec.notes && (
                          <p className="text-xs text-[#94A3B8] leading-relaxed max-w-2xl">{rec.notes}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748B] pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-[#94A3B8]" />
                            {rec.date}
                          </span>
                          {rec.serviceCenter && (
                            <span>• {rec.serviceCenter}</span>
                          )}
                          {rec.cost && (
                            <span className="text-[#10B981] font-bold">• ₹{rec.cost.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteMaint(rec.id)}
                      className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                      title="Delete maintenance log"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#1E252D] border border-[#2E3844] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#242D37] border border-[#2E3844] text-[#FFF174] flex items-center justify-center mx-auto">
                  <Calendar size={22} />
                </div>
                <h3 className="text-base font-bold text-white">No Service Records Logged Yet</h3>
                <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
                  Keep your maintenance records organized. Log your oil changes, chain cleanings, and workshop visits for warranty and safety tracking.
                </p>
                <button
                  type="button"
                  onClick={() => setShowMaintModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#FFF174] text-[#12161A] font-bold text-xs uppercase"
                >
                  Log First Service Record
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 5: BIKE PROBLEMS & SAFE TROUBLESHOOTING TAB
            ======================================================== */}
        {activeTab === 'troubleshoot' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">What problem are you facing with your {displayName}?</h2>
              <p className="text-xs text-[#94A3B8]">Select your symptom below for verified mechanical checks and safe troubleshooting guidelines.</p>
            </div>

            {/* Problem Category Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TROUBLESHOOTING_ISSUES.map((issue) => {
                const isSelected = selectedIssue.id === issue.id;
                return (
                  <button
                    key={issue.id}
                    type="button"
                    onClick={() => setSelectedIssue(issue)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer min-h-[64px] flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#242D37] border-[#FFF174] text-white shadow-md'
                        : 'bg-[#1E252D] border-[#2E3844] text-[#94A3B8] hover:text-white hover:border-[#94A3B8]'
                    }`}
                  >
                    <strong className={`text-xs block ${isSelected ? 'text-[#FFF174]' : 'text-white'}`}>
                      {issue.title}
                    </strong>
                    <span className="text-[10px] text-[#94A3B8] line-clamp-1">{issue.symptom}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Troubleshooting Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#1E252D] border border-[#2E3844] space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#2E3844] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFF174] bg-[#242D37] px-2 py-0.5 rounded">
                      VERIFIED TROUBLESHOOTING
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      selectedIssue.risk === 'DO_NOT_RIDE' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                      selectedIssue.risk === 'CAUTION_RIDE_NEARBY' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {selectedIssue.risk.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">{selectedIssue.title}</h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{selectedIssue.symptom}</p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/emergency?cat=BIKE_PROBLEM&sub=${selectedIssue.categoryParam}`)}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shrink-0 shadow-md"
                >
                  <PhoneCall size={14} />
                  <span>Dispatch Roadside Help</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* Possible Causes */}
                <div className="p-4 rounded-xl bg-[#12161A] border border-[#2E3844] space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <HelpCircle size={15} />
                    <span>Possible Causes</span>
                  </div>
                  <ul className="space-y-2 text-[#CBD5E1]">
                    {selectedIssue.causes.map((cause, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400 shrink-0">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Safe Rider Checks */}
                <div className="p-4 rounded-xl bg-[#12161A] border border-[#2E3844] space-y-2">
                  <div className="flex items-center gap-1.5 text-[#10B981] font-bold">
                    <ShieldCheck size={15} />
                    <span>Safe Rider Checks</span>
                  </div>
                  <ul className="space-y-2 text-[#CBD5E1]">
                    {selectedIssue.safeChecks.map((check, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#10B981] shrink-0">✓</span>
                        <span>{check}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What NOT to do */}
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-red-400 font-bold">
                    <AlertTriangle size={15} />
                    <span>What NOT To Do</span>
                  </div>
                  <ul className="space-y-2 text-red-200">
                    {selectedIssue.whatNotToDo.map((warn, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-red-400 shrink-0">✕</span>
                        <span>{warn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#242D37] border border-[#2E3844] flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Recommended assistance: <strong className="text-white">{selectedIssue.recommendedAction}</strong></span>
                <span className="text-[11px] text-[#FFF174]">Never bypass safety switches or ride with soft brakes</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: BIKE-SPECIFIC AI ASSISTANT ("ASK ABOUT THIS BIKE")
            ======================================================== */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-[#242D37] border border-[#2E3844] text-[#FFF174]">
                  <Bot size={18} />
                </span>
                <h2 className="text-lg font-bold text-white">Ask AI Assistant About {displayName}</h2>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Pre-loaded with verified technical parameters, lubricants, cold pressures, and mountain readiness for your motorcycle.
              </p>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] text-[#94A3B8] self-center">Quick Questions:</span>
              {[
                "Which engine oil specification is recommended?",
                "What is the recommended tyre pressure for touring?",
                "What should I inspect before travelling in the mountains?",
                "How do I measure and adjust chain slack correctly?",
                "Why is my fuel mileage decreasing?"
              ].map((query, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendAi(query)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-[#1E252D] hover:bg-[#242D37] border border-[#2E3844] hover:border-[#FFF174] text-[#CBD5E1] transition-all cursor-pointer text-left"
                >
                  {query}
                </button>
              ))}
            </div>

            {/* Chat Container */}
            <div className="rounded-2xl bg-[#1E252D] border border-[#2E3844] flex flex-col h-[420px] shadow-xl overflow-hidden">
              
              {/* Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin">
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 max-w-xl ${
                      msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.sender === 'user'
                        ? 'bg-[#FFF174] text-[#12161A]'
                        : 'bg-[#242D37] text-[#FFF174] border border-[#2E3844]'
                    }`}>
                      {msg.sender === 'user' ? 'YOU' : <Bot size={15} />}
                    </div>

                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-1.5 ${
                      msg.sender === 'user'
                        ? 'bg-[#242D37] text-white border border-[#2E3844] rounded-tr-none'
                        : 'bg-[#12161A] text-[#E2E8F0] border border-[#2E3844] rounded-tl-none'
                    }`}>
                      <div className="whitespace-pre-line">{msg.text}</div>
                      <span className="text-[9px] text-[#64748B] block text-right">{msg.time}</span>
                    </div>
                  </div>
                ))}

                {aiTyping && (
                  <div className="flex items-center gap-2 text-xs text-[#94A3B8] p-2 animate-pulse">
                    <Bot size={14} className="text-[#FFF174]" />
                    <span>Consulting technical specification manual...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-[#1A2026] border-t border-[#2E3844] flex items-center gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendAi();
                  }}
                  placeholder={`Ask anything about ${displayName} maintenance, lubricants, mods...`}
                  className="flex-1 bg-[#12161A] border border-[#2E3844] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#FFF174]"
                />
                <button
                  type="button"
                  onClick={() => handleSendAi()}
                  className="p-2.5 rounded-xl bg-[#FFF174] hover:bg-yellow-400 text-[#12161A] font-bold transition-transform active:scale-95 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label="Send query"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>

            <div className="text-center text-[11px] text-[#64748B]">
              <span>AI assistance provides model-relevant guidance. In critical structural or safety faults, always seek qualified technician inspection.</span>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================
          EDIT MOTORCYCLE MODAL (TOUCH-FRIENDLY & ACCESSIBLE)
          ======================================================== */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#1E252D] border border-[#2E3844] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2E3844] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 size={18} className="text-[#FFF174]" />
                <span>Edit Motorcycle Details</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#242D37]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Brand / Manufacturer *</label>
                <input
                  type="text"
                  required
                  value={editBrand}
                  onChange={(e) => setEditBrand(e.target.value)}
                  className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  value={editModel}
                  onChange={(e) => setEditModel(e.target.value)}
                  className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Registration Plate *</label>
                  <input
                    type="text"
                    required
                    value={editReg}
                    onChange={(e) => setEditReg(e.target.value)}
                    className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-[#FFF174]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Model Year</label>
                  <input
                    type="number"
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Category / Variant</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="Adventure Tourer, Street..."
                    className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Fuel Type</label>
                  <select
                    value={editFuelType}
                    onChange={(e) => setEditFuelType(e.target.value as FuelType)}
                    className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  >
                    <option value="PETROL">Petrol</option>
                    <option value="ELECTRIC">Electric (EV)</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Notes / Accessories</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Cross-spoke tubeless, crash guards, panniers"
                  className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                />
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editIsPrimary}
                  onChange={(e) => setEditIsPrimary(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#FFF174]"
                />
                <span className="text-white font-medium">Set as primary motorcycle</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2E3844]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#242D37] text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FFF174] hover:bg-yellow-400 text-[#12161A] font-black text-xs uppercase"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          LOG MAINTENANCE RECORD MODAL
          ======================================================== */}
      {showMaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#1E252D] border border-[#2E3844] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2E3844] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench size={18} className="text-[#FFF174]" />
                <span>Log Service / Maintenance Record</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowMaintModal(false)}
                className="p-1.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#242D37]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMaintenance} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Service Type *</label>
                  <select
                    value={maintType}
                    onChange={(e) => setMaintType(e.target.value as MaintenanceRecord['serviceType'])}
                    className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  >
                    <option value="PERIODIC_SERVICE">Periodic Service</option>
                    <option value="OIL_CHANGE">Oil & Filter Change</option>
                    <option value="CHAIN_LUBE">Chain Cleaning & Lube</option>
                    <option value="BRAKE_PADS">Brake Pads Replacement</option>
                    <option value="TYRE_REPLACEMENT">Tyre Replacement</option>
                    <option value="OTHER">Other Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Service Date *</label>
                  <input
                    type="date"
                    required
                    value={maintDate}
                    onChange={(e) => setMaintDate(e.target.value)}
                    className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Service Title / Description *</label>
                <input
                  type="text"
                  required
                  value={maintName}
                  onChange={(e) => setMaintName(e.target.value)}
                  placeholder="e.g. 5,000 km Service with Motul 10W-50"
                  className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Odometer (KM) *</label>
                  <input
                    type="number"
                    required
                    value={maintOdo}
                    onChange={(e) => setMaintOdo(e.target.value)}
                    className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  />
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Cost (₹ Optional)</label>
                  <input
                    type="number"
                    value={maintCost}
                    onChange={(e) => setMaintCost(e.target.value)}
                    placeholder="e.g. 2450"
                    className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Service Center / Workshop</label>
                <input
                  type="text"
                  value={maintCenter}
                  onChange={(e) => setMaintCenter(e.target.value)}
                  placeholder="e.g. Authorized RE Himalayan Hub or Self"
                  className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Technical Notes / Parts Used</label>
                <textarea
                  rows={2}
                  value={maintNotes}
                  onChange={(e) => setMaintNotes(e.target.value)}
                  placeholder="e.g. Filled 2.1L Motul 7100, replaced oil filter, cleaned air filter..."
                  className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFF174] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2E3844]">
                <button
                  type="button"
                  onClick={() => setShowMaintModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#242D37] text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FFF174] hover:bg-yellow-400 text-[#12161A] font-black text-xs uppercase"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          EMERGENCY QR TAG MODAL
          ======================================================== */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#1E252D] border border-[#2E3844] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-[#2E3844] pb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <QrCode size={20} />
                <h3 className="text-base font-bold text-white">Emergency Vehicle QR Tag</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1.5 rounded-xl text-[#94A3B8] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {qrLoading ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-8 h-8 border-2 border-[#FFF174] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#94A3B8]">Generating emergency QR tag...</p>
              </div>
            ) : qrTag ? (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-gradient-to-br from-indigo-950/40 via-[#12161A] to-black border border-indigo-500/30 rounded-2xl space-y-3">
                  <div className="w-40 h-40 bg-white p-2.5 rounded-2xl mx-auto flex items-center justify-center shadow-lg text-black">
                    <div className="border-4 border-black p-2 rounded-xl flex flex-col items-center justify-center w-full h-full gap-1">
                      <div className="flex justify-between w-full">
                        <div className="w-6 h-6 border-4 border-black bg-black" />
                        <div className="w-6 h-6 border-4 border-black bg-black" />
                      </div>
                      <div className="text-[9px] font-black tracking-tighter text-center uppercase">
                        MOTOASSIST RESCUE<br />
                        <span className="font-mono text-[7px] text-gray-600 truncate block max-w-[120px]">{qrTag.token}</span>
                      </div>
                      <div className="flex justify-between w-full">
                        <div className="w-6 h-6 border-4 border-black bg-black" />
                        <div className="w-4 h-4 bg-black" />
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#FFF174] break-all block">
                    {window.location.origin}{window.location.pathname.replace(/\/?$/, '/')}#/qr/{qrTag.token}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <strong className="text-white block font-mono">{bike.registrationNumber}</strong>
                  <p className="text-[11px] text-[#94A3B8]">
                    Scan tag in an emergency to display vital medical profile and owner ICE contacts without revealing private data.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}${window.location.pathname.replace(/\/?$/, '/')}#/qr/${qrTag.token}`;
                      navigator.clipboard.writeText(url);
                      setQrCopied(true);
                      setTimeout(() => setQrCopied(false), 2000);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#242D37] hover:bg-[#2A3440] text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    {qrCopied ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} />}
                    <span>{qrCopied ? 'Link Copied!' : 'Copy Tag Link'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRevokeQr}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-300 flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    <span>Revoke</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
}

