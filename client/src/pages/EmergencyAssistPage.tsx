import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  HelpCircle,
  MapPin,
  ArrowLeft,
  Heart,
  ChevronRight,
  Loader2,
  Wrench,
  Truck,
  ShieldAlert,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { useUserLocation } from '../hooks/useUserLocation';
import { FeelingUnsafeModal } from '../components/FeelingUnsafeModal';
import { MedicalIdQuickModal } from '../components/MedicalIdQuickModal';
import { MountainContourPattern, AnimatedRoadLines } from '../components/graphics';
import { buildWhatsAppBreakdownAlertUrl } from '../utils/whatsappShare';
import { API_BASE_URL } from '../config/api';
import { saveRequest, INITIAL_BIKES } from '../utils/appStorage';

type HelpCategory = 'MEDICAL' | 'BIKE_PROBLEM' | 'UNSAFE' | 'TOWING' | 'BOTH' | 'NOT_SURE' | null;
type MechanicalSubFilter = 'ALL' | 'MECHANICS' | 'OEM' | 'TYRE' | 'BATTERY' | 'FUEL' | 'TOWING' | 'PARTS';

const HIGHWAY_LANDMARKS = [
  'Sevoke Road Checkpost',
  'Coronation Bridge (NH-10)',
  'Bagdogra Airport Bypass',
  'Sukna Forest Crossing',
  'Hill Cart Road / Darjeeling More',
  'Matigara Highway Junction',
  'Teesta Bazaar Junction',
  'Kurseong Rohini Road'
];

interface ProviderListing {
  id: string;
  name: string;
  type: 'MECHANIC' | 'OEM' | 'TYRE' | 'BATTERY' | 'FUEL' | 'TOWING' | 'HOSPITAL' | 'AMBULANCE' | 'PHARMACY' | 'POLICE';
  badge: string;
  isVerified: boolean;
  distance: string;
  phone: string;
  address: string;
  eta: string;
  services: string[];
}

const MECHANICAL_PROVIDERS: ProviderListing[] = [
  {
    id: 'mech-1',
    name: 'Raj Motors Mountain Roadside Rescue',
    type: 'MECHANIC',
    badge: 'MotoAssist Verified',
    isVerified: true,
    distance: '2.4 km',
    phone: '+91 98320 12345',
    address: 'Sevoke More, NH-10 Corridor',
    eta: '10-15 mins',
    services: ['On-site repair', 'Chain link fix', 'Clutch wire', 'Engine check']
  },
  {
    id: 'oem-ktm',
    name: 'KTM & Husqvarna Authorized Service Hub',
    type: 'OEM',
    badge: 'OEM Authorized',
    isVerified: true,
    distance: '3.8 km',
    phone: '+91 94340 77123',
    address: 'Sevoke Road 2nd Mile, Siliguri',
    eta: '15-20 mins',
    services: ['Genuine OEM Parts', 'OBD Diagnostics', 'Warranty claims', 'ADV specialists']
  },
  {
    id: 'oem-re',
    name: 'Royal Enfield Himalayan Service Point',
    type: 'OEM',
    badge: 'OEM Authorized',
    isVerified: true,
    distance: '4.1 km',
    phone: '+91 94341 55678',
    address: 'Near Checkpost, Siliguri',
    eta: '15-25 mins',
    services: ['Sherpa 450 spares', 'Clutch plates', 'Spoke truing', 'Oil top-up']
  },
  {
    id: 'tyre-1',
    name: 'Highway Mobile Puncture & Tyre Express',
    type: 'TYRE',
    badge: 'MotoAssist Verified',
    isVerified: true,
    distance: '1.8 km',
    phone: '+91 97330 44556',
    address: 'Sevoke Road Crossing',
    eta: '8-12 mins',
    services: ['Tubeless plug repair', 'Tube replacement', 'Portable 12V inflator', 'Valve core']
  },
  {
    id: 'batt-1',
    name: 'Exide & Amaron Jump-Start Express',
    type: 'BATTERY',
    badge: 'MotoAssist Verified',
    isVerified: true,
    distance: '2.9 km',
    phone: '+91 96410 88990',
    address: 'Matigara Highway Bypass',
    eta: '12-18 mins',
    services: ['Heavy-duty jump pack', 'Battery health test', 'Terminal cleanup']
  },
  {
    id: 'fuel-1',
    name: 'Emergency Highway Fuel Delivery',
    type: 'FUEL',
    badge: 'MotoAssist Verified',
    isVerified: true,
    distance: '2.1 km',
    phone: '+91 98322 11223',
    address: 'NH-31 Junction',
    eta: '10-14 mins',
    services: ['2L - 5L Jerry can petrol', 'Funnel kit', 'Safe sealed delivery']
  },
  {
    id: 'tow-1',
    name: 'Himalayan Hydraulic Flatbed Towing',
    type: 'TOWING',
    badge: 'MotoAssist Verified',
    isVerified: true,
    distance: '3.5 km',
    phone: '+91 97330 99887',
    address: 'Sevoke / Sukna Foothills',
    eta: '20-25 mins',
    services: ['Motorcycle wheel-chock ramp', 'Soft tie-down straps', 'Hill recovery winch']
  }
];

const MEDICAL_PROVIDERS: ProviderListing[] = [
  {
    id: 'hosp-1',
    name: 'Neotia Getwel Healthcare Trauma Centre',
    type: 'HOSPITAL',
    badge: 'Level-1 Emergency ICU',
    isVerified: true,
    distance: '3.2 km',
    phone: '+91 353 305 8888',
    address: 'Uttorayon Township, NH-31 Matigara',
    eta: '8 mins',
    services: ['24/7 Trauma Surgery', 'CT Scan & MRI', 'Blood Bank', 'Emergency ICU']
  },
  {
    id: 'hosp-2',
    name: 'North Bengal Medical College & Hospital',
    type: 'HOSPITAL',
    badge: 'Govt Apex Hospital',
    isVerified: true,
    distance: '4.8 km',
    phone: '+91 353 258 5478',
    address: 'Sushruta Nagar, Siliguri',
    eta: '12 mins',
    services: ['Govt 24/7 Emergency', 'Orthopedic Trauma', 'Burn Unit']
  },
  {
    id: 'amb-108',
    name: 'National 108 Emergency Ambulance',
    type: 'AMBULANCE',
    badge: 'Govt Free Dispatch',
    isVerified: true,
    distance: 'Nearest base 2.0 km',
    phone: '108',
    address: 'Highway Rapid Corridor Base',
    eta: '8-15 mins',
    services: ['Paramedic on-board', 'Oxygen supply', 'Stretcher transfer']
  },
  {
    id: 'pharm-1',
    name: 'Apollo 24/7 Emergency Pharmacy & Dressing',
    type: 'PHARMACY',
    badge: '24/7 Open',
    isVerified: true,
    distance: '1.5 km',
    phone: '+91 353 254 0123',
    address: 'Sevoke Road 2nd Mile',
    eta: '5 mins',
    services: ['Antiseptic dressings', 'Bandages & splints', 'Pain relief medication']
  }
];

const SAFETY_PROVIDERS: ProviderListing[] = [
  {
    id: 'pol-1',
    name: 'Sevoke Police Outpost & Highway Patrol',
    type: 'POLICE',
    badge: 'Police Outpost',
    isVerified: true,
    distance: '1.9 km',
    phone: '112',
    address: 'NH-10 Sevoke Checkpost',
    eta: '5-10 mins',
    services: ['24/7 Highway Patrol', 'Emergency SOS Dial 112', 'Women Help Desk']
  },
  {
    id: 'safe-fuel',
    name: 'IOCL 24/7 COCO Highway Station (Safe Stop)',
    type: 'FUEL',
    badge: 'Safe Public Haven',
    isVerified: true,
    distance: '1.2 km',
    phone: '+91 353 254 9900',
    address: 'NH-31 Highway Crossing',
    eta: '3 mins',
    services: ['24/7 CCTV & Security', 'Well-lit rest area', 'Drinking water', 'Clean washrooms']
  }
];

export function EmergencyAssistPage() {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<HelpCategory>(null);
  const [mechSubFilter, setMechSubFilter] = useState<MechanicalSubFilter>('ALL');
  const [showUnsafeModal, setShowUnsafeModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [searchPlace, setSearchPlace] = useState('');
  const [showLandmarkSearch, setShowLandmarkSearch] = useState(false);

  // Guided diagnosis for "I'm not sure"
  const [engineCranks, setEngineCranks] = useState<'YES' | 'NO' | null>(null);
  const [bikeRolls, setBikeRolls] = useState<'YES' | 'NO' | null>(null);
  const [isSafeSpot, setIsSafeSpot] = useState<'YES' | 'NO' | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);

  // Immediate dispatch submission state
  const [dispatchPending, setDispatchPending] = useState(false);
  const [dispatchConfirmed, setDispatchConfirmed] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);
  const [serverDispatched, setServerDispatched] = useState(false);
  const [dispatchedProvider, setDispatchedProvider] = useState<ProviderListing | null>(null);
  const [riderNote, setRiderNote] = useState('');

  // Geolocation hook
  const {
    coords,
    accuracy,
    status: locStatus,
    updatedText,
    address,
    requestLocation,
    setSearchLocation,
  } = useUserLocation(true);

  const handleCategoryClick = (cat: HelpCategory) => {
    setSelectedCategory(cat);
    if (cat === 'UNSAFE') {
      setShowUnsafeModal(true);
    }
  };

  const handleLocationRequest = () => {
    requestLocation('Your current location helps us find the right assistance.');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPlace.trim().length > 2) {
      setSearchLocation(searchPlace.trim());
      setShowLandmarkSearch(false);
    }
  };

  const handleDiagnose = () => {
    if (bikeRolls === 'NO') {
      setDiagnosisResult('Mechanical or Chain/Brake Lock: We recommend a Flatbed Tow Truck with soft tie-downs.');
    } else if (engineCranks === 'NO') {
      setDiagnosisResult('Electrical / Battery Failure: Mobile jump-start assistance or fuse check needed.');
    } else {
      setDiagnosisResult('Engine or Fuel System: On-site roadside mechanic diagnosis recommended.');
    }
  };

  const handleDispatchAssistance = async (provider?: ProviderListing) => {
    setDispatchPending(true);
    const prov = provider || dispatchedProvider || MECHANICAL_PROVIDERS[0];
    const problem = selectedCategory === 'MEDICAL' 
      ? 'Medical' 
      : selectedCategory === 'TOWING' 
      ? 'Towing' 
      : selectedCategory === 'UNSAFE' 
      ? 'Safety' 
      : 'Breakdown';

    const reqId = `REQ-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    let serverOk = false;

    try {
      const res = await fetch(`${API_BASE_URL}/api/assistance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemCategory: problem,
          helpCategory: selectedCategory === 'MEDICAL' ? 'MEDICAL' : 'MECHANICAL',
          providerId: prov.id,
          location: {
            coordinates: coords ? [coords.lng, coords.lat] : undefined,
            address: address || searchPlace.trim() || prov.address,
            accuracyMeters: accuracy || 15
          },
          description: riderNote || `Emergency roadside dispatch for ${prov.name}`
        })
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        serverOk = true;
      }
    } catch {
      serverOk = false;
    }

    // Save to local storage for instant offline resilience and HUD tracking
    saveRequest({
      id: reqId,
      riderId: 'user-rider-1',
      riderName: 'MotoAssist Rider',
      riderPhone: '+91 98000 00000',
      bike: INITIAL_BIKES[0],
      issue: selectedCategory === 'TOWING' ? 'TOWING' : selectedCategory === 'MEDICAL' ? 'ACCIDENT' : 'BREAKDOWN',
      locationShared: !!coords,
      description: riderNote || `Emergency roadside dispatch for ${prov.name}`,
      approximateLocation: address || searchPlace.trim() || prov.address,
      status: 'OPEN',
      assignedHelperId: prov.id,
      assignedHelperName: prov.name,
      assignedHelperPhone: prov.phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    setCreatedRequestId(reqId);
    setServerDispatched(serverOk);
    setDispatchedProvider(prov);
    setDispatchPending(false);
    setDispatchConfirmed(true);
  };

  const filteredMechanical = MECHANICAL_PROVIDERS.filter((p) => {
    if (mechSubFilter === 'ALL') return true;
    if (mechSubFilter === 'MECHANICS') return p.type === 'MECHANIC';
    if (mechSubFilter === 'OEM') return p.type === 'OEM';
    if (mechSubFilter === 'TYRE') return p.type === 'TYRE';
    if (mechSubFilter === 'BATTERY') return p.type === 'BATTERY';
    if (mechSubFilter === 'FUEL') return p.type === 'FUEL';
    if (mechSubFilter === 'TOWING') return p.type === 'TOWING';
    return true;
  });

  const getWhatsAppAlertUrl = () => {
    return buildWhatsAppBreakdownAlertUrl({
      latitude: coords?.lat,
      longitude: coords?.lng,
      landmark: address || undefined,
      riderName: 'MotoAssist Rider',
      situation: selectedCategory === 'MEDICAL' ? 'Medical Emergency' : selectedCategory === 'TOWING' ? 'Motorcycle Towing' : 'Motorcycle Breakdown',
      status: 'Assistance requested'
    });
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col font-sans selection:bg-red-500 selection:text-white pb-24 md:pb-16 relative">
      <AnimatedRoadLines opacity={0.12} />
      <MountainContourPattern height={140} opacity={0.2} />

      {/* Feeling Unsafe Modal */}
      <FeelingUnsafeModal
        isOpen={showUnsafeModal}
        onClose={() => setShowUnsafeModal(false)}
        primaryContactPhone="+91 98765 43210"
        primaryContactName="Mom / Trusted Circle"
      />

      {/* Medical ID Modal */}
      <MedicalIdQuickModal
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
      />

      {/* TOP EMERGENCY HEADER */}
      <header className="sticky top-0 z-40 bg-[#140808]/95 border-b border-red-500/40 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Home</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-red-400">
              EMERGENCY ASSIST MODE
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowMedicalModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold text-red-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Emergency Medical ID"
          >
            <Heart size={14} className="text-red-400" />
            <span className="hidden sm:inline">Medical ID</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pt-5 space-y-5 relative z-10">
        
        {/* HERO TITLE SECTION */}
        <section className="space-y-1.5 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Let's get you help.
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 font-medium">
            Tell us what happened. We'll connect you directly to nearest roadside or emergency services.
          </p>
        </section>

        {/* PROMINENT CALL 112 ACTION (National Emergency India) */}
        <section className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-600 via-red-600 to-red-700 border-2 border-red-400 shadow-[0_0_30px_rgba(220,38,38,0.45)] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <PhoneCall size={24} className="text-white animate-bounce" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-red-100 block">
                NATIONAL EMERGENCY SERVICES (INDIA)
              </span>
              <strong className="text-lg sm:text-xl font-black text-white block">
                Call 112 for Police, Ambulance & Fire
              </strong>
              <span className="text-[11px] text-red-100/90 block">
                Immediate direct phone dial on your cellular network.
              </span>
            </div>
          </div>

          <a
            href="tel:112"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-red-700 hover:bg-red-50 active:scale-95 font-black text-sm uppercase tracking-wider text-center shadow-lg transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            <PhoneCall size={18} />
            <span>Call 112 Now</span>
          </a>
        </section>

        {/* LOCATION ACCESS DURING EMERGENCY */}
        <section className="p-4 rounded-2xl bg-[#121212] border border-white/10 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FFF174] shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-300 block">
                  Your current location helps us find the right assistance.
                </span>
                <span className="text-[11px] text-gray-400 block mt-0.5">
                  {locStatus === 'active' && (
                    <span className="text-emerald-400 font-semibold">
                      📍 Location acquired. {accuracy ? `(Accuracy ±${accuracy}m)` : ''} • Updated {updatedText}
                    </span>
                  )}
                  {locStatus === 'requesting' && (
                    <span className="text-yellow-400 font-semibold flex items-center gap-1.5">
                      <Loader2 size={12} className="animate-spin inline" /> Finding your location…
                    </span>
                  )}
                  {locStatus === 'denied' && (
                    <span className="text-amber-400 font-semibold">
                      ⚠️ Location access is turned off.
                    </span>
                  )}
                  {locStatus === 'searched' && (
                    <span className="text-emerald-400 font-semibold">
                      📍 Landmark set: {address}
                    </span>
                  )}
                  {locStatus === 'idle' && (
                    <span className="text-gray-400">GPS not requested yet. Tap below to share location.</span>
                  )}
                </span>
              </div>
            </div>

            {locStatus !== 'active' && (
              <button
                type="button"
                onClick={handleLocationRequest}
                className="px-3 py-1.5 rounded-xl bg-[#FFF174] text-black font-bold text-xs hover:bg-yellow-400 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                {locStatus === 'denied' ? 'Enable location' : 'Find Location'}
              </button>
            )}
          </div>

          {/* Fallback actions if denied or unavailable */}
          {(locStatus === 'denied' || locStatus === 'unavailable' || showLandmarkSearch) && (
            <div className="pt-2 border-t border-white/10 space-y-2.5 animate-in fade-in duration-200">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={searchPlace}
                  onChange={(e) => setSearchPlace(e.target.value)}
                  placeholder="Search place, town, milestone or highway junction..."
                  className="flex-1 bg-[#181818] border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFF174]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Set Landmark
                </button>
              </form>

              {/* Quick Landmark Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-gray-500 w-full">Quick regional mountain landmarks:</span>
                {HIGHWAY_LANDMARKS.slice(0, 5).map((lm) => (
                  <button
                    key={lm}
                    type="button"
                    onClick={() => {
                      setSearchLocation(lm);
                      setSearchPlace(lm);
                      setShowLandmarkSearch(false);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium cursor-pointer"
                  >
                    {lm}
                  </button>
                ))}
              </div>
            </div>
          )}

          {locStatus !== 'denied' && !showLandmarkSearch && (
            <button
              type="button"
              onClick={() => setShowLandmarkSearch(true)}
              className="text-[11px] text-gray-400 hover:text-[#FFF174] underline underline-offset-4 cursor-pointer"
            >
              Or search for a place or landmark manually
            </button>
          )}
        </section>

        {/* 5 LARGE TOUCH-FRIENDLY CATEGORY ACTIONS + BOTH TOGGLE */}
        <section className="space-y-3" aria-label="Emergency Help Categories">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-400 px-1">
            <span>SELECT WHAT IS HAPPENING</span>
            <button
              type="button"
              onClick={() => setSelectedCategory('BOTH')}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                selectedCategory === 'BOTH'
                  ? 'bg-red-500 text-white border-red-400'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
              }`}
            >
              Need Both (Medical & Bike)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. 🚑 Medical emergency */}
            <button
              type="button"
              onClick={() => handleCategoryClick('MEDICAL')}
              className={`p-4 sm:p-5 rounded-3xl text-left border-2 transition-all cursor-pointer group flex items-center justify-between gap-4 ${
                selectedCategory === 'MEDICAL'
                  ? 'bg-red-950/60 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.4)]'
                  : 'bg-[#141414] hover:bg-[#1f1010] border-white/10 hover:border-red-500/50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                  🚑
                </div>
                <div>
                  <strong className="text-base sm:text-lg font-black text-white group-hover:text-red-300 transition-colors block">
                    Medical emergency
                  </strong>
                  <span className="text-xs text-gray-400 block mt-0.5">
                    Accidents, injuries, trauma care
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0" />
            </button>

            {/* 2. 🔧 Bike problem */}
            <button
              type="button"
              onClick={() => handleCategoryClick('BIKE_PROBLEM')}
              className={`p-4 sm:p-5 rounded-3xl text-left border-2 transition-all cursor-pointer group flex items-center justify-between gap-4 ${
                selectedCategory === 'BIKE_PROBLEM'
                  ? 'bg-yellow-950/40 border-[#FFF174] shadow-[0_0_25px_rgba(255,241,116,0.3)]'
                  : 'bg-[#141414] hover:bg-[#1c1c14] border-white/10 hover:border-[#FFF174]/50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                  🔧
                </div>
                <div>
                  <strong className="text-base sm:text-lg font-black text-white group-hover:text-[#FFF174] transition-colors block">
                    Bike problem
                  </strong>
                  <span className="text-xs text-gray-400 block mt-0.5">
                    Punctures, battery, chain, fuel
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-[#FFF174] group-hover:translate-x-1 transition-all shrink-0" />
            </button>

            {/* 3. ⚠️ I feel unsafe */}
            <button
              type="button"
              onClick={() => handleCategoryClick('UNSAFE')}
              className={`p-4 sm:p-5 rounded-3xl text-left border-2 transition-all cursor-pointer group flex items-center justify-between gap-4 ${
                selectedCategory === 'UNSAFE'
                  ? 'bg-amber-950/50 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
                  : 'bg-[#141414] hover:bg-[#1c1612] border-white/10 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                  ⚠️
                </div>
                <div>
                  <strong className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors block">
                    I feel unsafe
                  </strong>
                  <span className="text-xs text-gray-400 block mt-0.5">
                    Followed, stranded at night, threats
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
            </button>

            {/* 4. 🚚 I need towing */}
            <button
              type="button"
              onClick={() => handleCategoryClick('TOWING')}
              className={`p-4 sm:p-5 rounded-3xl text-left border-2 transition-all cursor-pointer group flex items-center justify-between gap-4 ${
                selectedCategory === 'TOWING'
                  ? 'bg-blue-950/40 border-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.3)]'
                  : 'bg-[#141414] hover:bg-[#12161c] border-white/10 hover:border-blue-400/50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                  🚚
                </div>
                <div>
                  <strong className="text-base sm:text-lg font-black text-white group-hover:text-blue-300 transition-colors block">
                    I need towing
                  </strong>
                  <span className="text-xs text-gray-400 block mt-0.5">
                    Motorcycle flatbed & mountain winch
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
            </button>
          </div>

          {/* 5. ❓ I'm not sure (Full Width) */}
          <button
            type="button"
            onClick={() => handleCategoryClick('NOT_SURE')}
            className={`w-full p-4 sm:p-5 rounded-3xl text-left border-2 transition-all cursor-pointer group flex items-center justify-between gap-4 ${
              selectedCategory === 'NOT_SURE'
                ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_25px_rgba(192,132,252,0.3)]'
                : 'bg-[#141414] hover:bg-[#18141c] border-white/10 hover:border-purple-400/50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                ❓
              </div>
              <div>
                <strong className="text-base sm:text-lg font-black text-white group-hover:text-purple-300 transition-colors block">
                  I'm not sure
                </strong>
                <span className="text-xs text-gray-400 block mt-0.5">
                  Answer 3 simple questions — we'll recommend what to do
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all shrink-0" />
          </button>
        </section>

        {/* ========================================================
            TARGETED DIRECT FLOWS (NO NESTED MENUS!)
            ======================================================== */}

        {/* 1. MECHANICAL FLOW */}
        {(selectedCategory === 'BIKE_PROBLEM' || selectedCategory === 'BOTH') && (
          <section className="p-5 rounded-3xl bg-[#141414] border border-[#FFF174]/40 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Wrench size={20} className="text-[#FFF174]" />
                  <span>Motorcycle Roadside & Mechanical Services</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Mechanics, OEM workshops, puncture repair, fuel & battery jump-start.
                </p>
              </div>
            </div>

            {/* Sub-filter chips */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {(
                [
                  ['ALL', 'All Services'],
                  ['MECHANICS', 'Mechanics'],
                  ['OEM', 'OEM Authorized'],
                  ['TYRE', 'Punctures'],
                  ['BATTERY', 'Battery'],
                  ['FUEL', 'Fuel'],
                  ['TOWING', 'Towing']
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMechSubFilter(key)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    mechSubFilter === key
                      ? 'bg-[#FFF174] text-black'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* List of nearby providers */}
            <div className="space-y-3">
              {filteredMechanical.map((prov) => (
                <div
                  key={prov.id}
                  className="p-4 rounded-2xl bg-[#181818] border border-white/10 hover:border-[#FFF174]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-black text-white">{prov.name}</strong>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {prov.badge}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-3">
                      <span>📍 {prov.distance} away ({prov.eta})</span>
                      <span>•</span>
                      <span>{prov.address}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {prov.services.map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    <a
                      href={`tel:${prov.phone.replace(/[^0-9+]/g, '')}`}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <PhoneCall size={14} className="text-emerald-400" />
                      <span>Call Provider</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDispatchAssistance(prov)}
                      className="px-3.5 py-2 rounded-xl bg-[#FFF174] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. MEDICAL FLOW */}
        {(selectedCategory === 'MEDICAL' || selectedCategory === 'BOTH') && (
          <section className="p-5 rounded-3xl bg-[#141414] border border-red-500/40 space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Heart size={20} className="text-red-400" />
                <span>Urgent Medical Care & Trauma Facilities</span>
              </h3>
              <p className="text-xs text-gray-400">
                Ambulance services, regional emergency hospitals & 24/7 pharmacies.
              </p>
            </div>

            <div className="space-y-3">
              {MEDICAL_PROVIDERS.map((prov) => (
                <div
                  key={prov.id}
                  className="p-4 rounded-2xl bg-[#181818] border border-white/10 hover:border-red-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-black text-white">{prov.name}</strong>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                        {prov.badge}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-3">
                      <span>📍 {prov.distance} away ({prov.eta})</span>
                      <span>•</span>
                      <span>{prov.address}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {prov.services.map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    <a
                      href={`tel:${prov.phone.replace(/[^0-9+]/g, '')}`}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <PhoneCall size={14} />
                      <span>{prov.type === 'AMBULANCE' ? 'Call 108' : 'Call Hospital'}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-gray-400">
              💡 <em>Important Notice:</em> Official government ambulance dispatch in India operates via state tele-networks (108/102). Tapping dials directly to dispatch operators with your coordinates.
            </div>
          </section>
        )}

        {/* 3. SAFETY / FEELING UNSAFE FLOW */}
        {selectedCategory === 'UNSAFE' && (
          <section className="p-5 rounded-3xl bg-[#141414] border border-amber-500/40 space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <ShieldAlert size={20} className="text-amber-400" />
                <span>Personal Safety & Threat Escalation</span>
              </h3>
              <p className="text-xs text-gray-400">
                Call 112, alert trusted contacts, share location via WhatsApp, or reach safe havens.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="tel:112"
                className="p-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm flex items-center justify-between transition-colors shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <PhoneCall size={18} />
                  <span>Call 112 National Police</span>
                </div>
                <ChevronRight size={18} />
              </a>

              <a
                href={getWhatsAppAlertUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-black text-sm flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle size={18} />
                  <span>Share via WhatsApp</span>
                </div>
                <ExternalLink size={16} />
              </a>
            </div>

            {/* Safe destinations and Police stations */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">
                Nearest Safe Public Havens & Police Stations
              </span>
              {SAFETY_PROVIDERS.map((prov) => (
                <div
                  key={prov.id}
                  className="p-4 rounded-2xl bg-[#181818] border border-white/10 flex items-center justify-between gap-3"
                >
                  <div>
                    <strong className="text-sm font-black text-white block">{prov.name}</strong>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      📍 {prov.distance} away • {prov.address}
                    </span>
                  </div>
                  <a
                    href={`tel:${prov.phone}`}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <PhoneCall size={14} className="text-red-400" />
                    <span>Call</span>
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. TOWING FLOW */}
        {selectedCategory === 'TOWING' && (
          <section className="p-5 rounded-3xl bg-[#141414] border border-blue-400/40 space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Truck size={20} className="text-blue-400" />
                <span>Motorcycle Flatbed Recovery & Towing</span>
              </h3>
              <p className="text-xs text-gray-400">
                Specialized hydraulic flatbeds equipped with wheel clamps and soft straps for ADV & superbikes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181818] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <strong className="text-sm font-black text-white">Himalayan Breakdown Towing</strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Motorcycle Flatbed
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  📍 3.5 km away (ETA: 20-25 mins) • Foothills & Hill Cart Road
                </div>
                <div className="text-[11px] text-gray-300">
                  Equipped with soft handlebar harnesses, hydraulic ramp, and transport insurance.
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="tel:+919733099887"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase flex items-center gap-1.5"
                >
                  <PhoneCall size={14} />
                  <span>Call Tow Truck</span>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* 5. "I'M NOT SURE" GUIDED DIAGNOSTIC FLOW */}
        {selectedCategory === 'NOT_SURE' && (
          <section className="p-5 rounded-3xl bg-[#161616] border border-purple-500/40 space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-purple-300 flex items-center gap-2">
                <HelpCircle size={18} />
                <span>Simple Guided Diagnostic Check</span>
              </h3>
              <p className="text-xs text-gray-400">
                Answer these 3 quick checks without technical knowledge.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold block">
                  1. When you press the ignition starter, does the engine crank or turn over?
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEngineCranks('YES')}
                    className={`flex-1 py-2.5 rounded-xl font-bold border transition-colors cursor-pointer ${
                      engineCranks === 'YES' ? 'bg-[#FFF174] text-black border-[#FFF174]' : 'bg-white/5 text-gray-300 border-white/10'
                    }`}
                  >
                    Yes, it cranks
                  </button>
                  <button
                    type="button"
                    onClick={() => setEngineCranks('NO')}
                    className={`flex-1 py-2.5 rounded-xl font-bold border transition-colors cursor-pointer ${
                      engineCranks === 'NO' ? 'bg-[#FFF174] text-black border-[#FFF174]' : 'bg-white/5 text-gray-300 border-white/10'
                    }`}
                  >
                    No, silence or clicking sound
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold block">
                  2. Can you safely push the motorcycle in neutral, or are the wheels locked?
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBikeRolls('YES')}
                    className={`flex-1 py-2.5 rounded-xl font-bold border transition-colors cursor-pointer ${
                      bikeRolls === 'YES' ? 'bg-[#FFF174] text-black border-[#FFF174]' : 'bg-white/5 text-gray-300 border-white/10'
                    }`}
                  >
                    Rolls freely
                  </button>
                  <button
                    type="button"
                    onClick={() => setBikeRolls('NO')}
                    className={`flex-1 py-2.5 rounded-xl font-bold border transition-colors cursor-pointer ${
                      bikeRolls === 'NO' ? 'bg-[#FFF174] text-black border-[#FFF174]' : 'bg-white/5 text-gray-300 border-white/10'
                    }`}
                  >
                    Wheels locked / Stuck
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold block">
                  3. Are you parked in a safe spot away from highway blind turns?
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSafeSpot('YES')}
                    className={`flex-1 py-2.5 rounded-xl font-bold border transition-colors cursor-pointer ${
                      isSafeSpot === 'YES' ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-white/5 text-gray-300 border-white/10'
                    }`}
                  >
                    Yes, safely off-road
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSafeSpot('NO')}
                    className={`flex-1 py-2.5 rounded-xl font-bold border transition-colors cursor-pointer ${
                      isSafeSpot === 'NO' ? 'bg-red-500 text-white border-red-400' : 'bg-white/5 text-gray-300 border-white/10'
                    }`}
                  >
                    No, exposed on blind turn
                  </button>
                </div>
              </div>

              {engineCranks && bikeRolls && !diagnosisResult && (
                <button
                  type="button"
                  onClick={handleDiagnose}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 font-bold text-white rounded-xl cursor-pointer shadow-md mt-2"
                >
                  Analyze Problem & Recommend Action
                </button>
              )}

              {diagnosisResult && (
                <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/40 text-purple-200 space-y-2 mt-2">
                  <strong className="block font-bold text-sm text-purple-100">
                    Recommended Next Action:
                  </strong>
                  <p className="text-xs text-gray-200">{diagnosisResult}</p>
                  {isSafeSpot === 'NO' && (
                    <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 font-bold text-[11px]">
                      ⚠️ Priority: Turn on your hazard lights, step behind the crash barrier if possible, and wear your helmet while waiting.
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* DIRECT DISPATCH ACTION (Zero Login Barrier) */}
        {selectedCategory && selectedCategory !== 'UNSAFE' && (
          <section className="p-5 rounded-3xl bg-[#141414] border border-white/15 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center justify-between">
              <span>CONFIRM RESCUE DISPATCH</span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                No account required
              </span>
            </h3>

            <div className="space-y-2">
              <label htmlFor="riderEmergencyNote" className="text-xs text-gray-300 block font-bold">
                Optional note or landmark details:
              </label>
              <textarea
                id="riderEmergencyNote"
                rows={2}
                value={riderNote}
                onChange={(e) => setRiderNote(e.target.value)}
                placeholder="e.g. Red KTM parked on shoulder near river crossing, rear tyre flat..."
                className="w-full bg-[#181818] border border-white/20 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFF174]"
              />
            </div>

            {dispatchConfirmed ? (
              <div className="p-5 sm:p-6 rounded-3xl bg-emerald-950/40 border-2 border-emerald-500/80 text-emerald-300 text-center space-y-4 shadow-[0_0_40px_rgba(16,185,129,0.25)]">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                    INCIDENT #{createdRequestId || 'ACTIVE'}
                  </span>
                </div>

                <div className="space-y-1">
                  <strong className="block text-xl sm:text-2xl font-black text-white">
                    Emergency Help Dispatched
                  </strong>
                  <p className="text-xs text-gray-300 max-w-md mx-auto">
                    {serverDispatched
                      ? 'Dispatch server confirmed your emergency coordinates. Provider is preparing departure.'
                      : 'Request recorded locally (Offline). Cellular network is active — please dial provider directly below.'}
                  </p>
                </div>

                {dispatchedProvider && (
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-left text-xs space-y-1.5 max-w-md mx-auto">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Assigned Provider:</span>
                      <span className="text-white font-bold">{dispatchedProvider.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Estimated Arrival:</span>
                      <span className="text-[#FFF174] font-bold">{dispatchedProvider.eta}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Contact Number:</span>
                      <span className="text-white font-mono">{dispatchedProvider.phone}</span>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap justify-center gap-2.5">
                  {dispatchedProvider && (
                    <a
                      href={`tel:${dispatchedProvider.phone.replace(/[^0-9+]/g, '')}`}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <PhoneCall size={14} />
                      <span>Call Provider Now</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate(createdRequestId ? `/requests/${createdRequestId}` : '/')}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <span>Track Live in Incident HUD</span>
                    <ChevronRight size={14} />
                  </button>

                  <a
                    href={getWhatsAppAlertUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <MessageCircle size={14} />
                    <span>Share via WhatsApp</span>
                  </a>

                  <a
                    href="tel:112"
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <PhoneCall size={14} />
                    <span>Call 112 (Police / EMS)</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleDispatchAssistance()}
                  disabled={dispatchPending}
                  className="w-full py-4 rounded-2xl bg-[#FFF174] hover:bg-yellow-400 active:scale-98 text-black font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(255,241,116,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {dispatchPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>COORDINATING NEAREST RESCUE...</span>
                    </>
                  ) : (
                    <>
                      <span>REQUEST IMMEDIATE ASSISTANCE</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
                <span className="text-[11px] text-gray-500 block text-center">
                  Zero form completion required. Emergency dispatch initiated directly.
                </span>
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}
