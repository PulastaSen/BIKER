import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Share2,
  BatteryCharging,
  Disc,
  Fuel,
  Zap,
  Flame,
  Shield,
  Activity,
  Check
} from 'lucide-react';
import { useUserLocation } from '../hooks/useUserLocation';
import { FeelingUnsafeModal } from '../components/FeelingUnsafeModal';
import { MedicalIdQuickModal } from '../components/MedicalIdQuickModal';
import { MountainContourPattern, AnimatedRoadLines } from '../components/graphics';
import { buildWhatsAppBreakdownAlertUrl } from '../utils/whatsappShare';
import { API_BASE_URL } from '../config/api';
import { saveRequest, INITIAL_BIKES } from '../utils/appStorage';

export type HelpCategory = 'MEDICAL' | 'BIKE_PROBLEM' | 'UNSAFE' | 'TOWING' | 'BOTH' | 'NOT_SURE';
export type BikeProblemType = 'ALL' | 'TYRE' | 'BATTERY' | 'CHAIN' | 'ENGINE' | 'FUEL' | 'ELECTRICAL' | 'OTHER';

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
  subCategories?: BikeProblemType[];
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
    services: ['On-site repair', 'Chain link fix', 'Clutch wire', 'Engine check'],
    subCategories: ['ALL', 'CHAIN', 'ENGINE', 'OTHER']
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
    services: ['Genuine OEM Parts', 'OBD Diagnostics', 'Warranty claims', 'ADV specialists'],
    subCategories: ['ALL', 'ENGINE', 'ELECTRICAL', 'OTHER']
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
    services: ['Sherpa 450 spares', 'Clutch plates', 'Spoke truing', 'Oil top-up'],
    subCategories: ['ALL', 'ENGINE', 'CHAIN', 'OTHER']
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
    services: ['Tubeless plug repair', 'Tube replacement', 'Portable 12V inflator', 'Valve core'],
    subCategories: ['ALL', 'TYRE']
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
    services: ['Heavy-duty jump pack', 'Battery health test', 'Terminal cleanup'],
    subCategories: ['ALL', 'BATTERY', 'ELECTRICAL']
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
    services: ['2L - 5L Jerry can petrol', 'Funnel kit', 'Safe sealed delivery'],
    subCategories: ['ALL', 'FUEL']
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
    services: ['Motorcycle wheel-chock ramp', 'Soft tie-down straps', 'Hill recovery winch'],
    subCategories: ['ALL', 'OTHER']
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
  },
  {
    id: 'women-desk',
    name: 'National Women Safety Helpline',
    type: 'POLICE',
    badge: 'Govt 24/7 Toll-Free',
    isVerified: true,
    distance: 'Direct Cellular Line',
    phone: '1091',
    address: 'Highway Police Command Center',
    eta: 'Immediate Connect',
    services: ['Dedicated Women Safety Officer', 'Emergency Patrol Dispatch']
  }
];

const TOWING_PROVIDERS: ProviderListing[] = [
  {
    id: 'tow-mountain-1',
    name: 'Himalayan Hydraulic Flatbed Towing',
    type: 'TOWING',
    badge: 'Motorcycle Specialist',
    isVerified: true,
    distance: '3.5 km away',
    phone: '+91 97330 99887',
    address: 'Sevoke / Sukna Foothills (NH-10 Corridor)',
    eta: '20-25 mins',
    services: ['Front wheel-chock clamp', 'Soft handlebar tie-down straps', '5-Ton mountain recovery winch', 'Drop-deck hydraulic ramp']
  }
];

export function EmergencyAssistPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read category from URL parameter to allow browser back/forward and deep-linking
  const catParam = searchParams.get('cat') as HelpCategory | null;
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(catParam);

  // Bike problem sub-filter
  const [bikeIssueFilter, setBikeIssueFilter] = useState<BikeProblemType>('ALL');

  // Modals
  const [showUnsafeModal, setShowUnsafeModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);

  // Manual landmark search state
  const [searchPlace, setSearchPlace] = useState('');
  const [showLandmarkSearch, setShowLandmarkSearch] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Guided diagnosis state ("I'm not sure")
  const [q1Injured, setQ1Injured] = useState<'YES' | 'NO' | null>(null);
  const [q2BikeRolls, setQ2BikeRolls] = useState<'YES' | 'NO' | null>(null);

  // Towing bike details
  const [towingBikeModel, setTowingBikeModel] = useState('KTM 390 Adventure / Standard ADV');
  const [towingWinchNeeded, setTowingWinchNeeded] = useState(false);

  // Dispatch submission state
  const [dispatchPending, setDispatchPending] = useState(false);
  const [dispatchConfirmed, setDispatchConfirmed] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);
  const [serverDispatched, setServerDispatched] = useState(false);
  const [dispatchedProvider, setDispatchedProvider] = useState<ProviderListing | null>(null);

  // Accessibility focus ref
  const actionHeadingRef = useRef<HTMLHeadingElement | null>(null);

  // Geolocation hook
  const {
    coords,
    accuracy,
    status: locStatus,
    updatedText,
    address,
    requestLocation,
    setSearchLocation
  } = useUserLocation(true);

  // Sync category state with URL search param
  useEffect(() => {
    if (catParam !== selectedCategory) {
      setSelectedCategory(catParam);
    }
  }, [catParam]);

  // When category changes, scroll to top and focus heading (Zero-Unnecessary-Scroll Rule)
  useEffect(() => {
    if (selectedCategory) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      // Brief timeout to let DOM render before setting focus
      setTimeout(() => {
        actionHeadingRef.current?.focus();
      }, 50);
    }
  }, [selectedCategory]);

  const selectCategory = (cat: HelpCategory) => {
    setSelectedCategory(cat);
    setSearchParams(cat ? { cat } : {});
    if (cat === 'UNSAFE') {
      setShowUnsafeModal(true);
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'instant' });
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

  const handleShareLocation = async () => {
    const locText = coords 
      ? `Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)} (https://maps.google.com/?q=${coords.lat},${coords.lng})`
      : address || 'Location not acquired yet';
    const message = `MOTOASSIST EMERGENCY: I need assistance. My location: ${locText}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MotoAssist Emergency Distress',
          text: message
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(message);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch {
      // Ignore clipboard error
    }
  };

  const getWhatsAppAlertUrl = () => {
    return buildWhatsAppBreakdownAlertUrl({
      latitude: coords?.lat,
      longitude: coords?.lng,
      landmark: address || undefined,
      riderName: 'MotoAssist Rider',
      situation:
        selectedCategory === 'MEDICAL'
          ? 'Medical Emergency'
          : selectedCategory === 'TOWING'
          ? 'Motorcycle Towing'
          : selectedCategory === 'UNSAFE'
          ? 'Personal Safety Emergency'
          : 'Motorcycle Breakdown',
      status: 'Assistance requested'
    });
  };

  const handleDispatchAssistance = async (provider?: ProviderListing) => {
    setDispatchPending(true);
    const prov = provider || dispatchedProvider || MECHANICAL_PROVIDERS[0];
    const problem =
      selectedCategory === 'MEDICAL'
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
          description: towingWinchNeeded ? `${towingBikeModel} (Mountain Winch Needed)` : towingBikeModel || `Emergency roadside dispatch for ${prov.name}`
        })
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        serverOk = true;
      }
    } catch {
      serverOk = false;
    }

    saveRequest({
      id: reqId,
      riderId: 'user-rider-1',
      riderName: 'MotoAssist Rider',
      riderPhone: '+91 98000 00000',
      bike: INITIAL_BIKES[0],
      issue: selectedCategory === 'TOWING' ? 'TOWING' : selectedCategory === 'MEDICAL' ? 'ACCIDENT' : 'BREAKDOWN',
      locationShared: !!coords,
      description: towingWinchNeeded ? `${towingBikeModel} (Mountain Winch Needed)` : towingBikeModel || `Emergency roadside dispatch for ${prov.name}`,
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

  // Filter mechanical providers by sub-issue
  const filteredMechanical = MECHANICAL_PROVIDERS.filter((p) => {
    if (bikeIssueFilter === 'ALL') return true;
    return p.subCategories?.includes(bikeIssueFilter);
  });

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col font-sans selection:bg-red-500 selection:text-white pb-16 relative">
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

      {/* TOP EMERGENCY HEADER - ALWAYS VISIBLE */}
      <header className="sticky top-0 z-40 bg-[#120808]/95 border-b border-red-500/40 backdrop-blur-md px-3.5 py-2.5 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2.5">
          {selectedCategory ? (
            <button
              type="button"
              onClick={handleBackToCategories}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-gray-200 flex items-center gap-1.5 transition-all cursor-pointer min-h-[40px]"
              aria-label="Back to emergency categories selection"
            >
              <ArrowLeft size={16} className="text-[#FFF174]" />
              <span>Categories</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer min-h-[40px] px-2"
              aria-label="Return to home screen"
            >
              <ArrowLeft size={16} />
              <span>Home</span>
            </button>
          )}

          <div className="flex items-center gap-2 select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-red-300">
              EMERGENCY ASSIST
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMedicalModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold text-red-200 flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
              title="Emergency Medical ID"
              aria-label="Open Medical ID card"
            >
              <Heart size={14} className="text-red-400" />
              <span className="hidden sm:inline">Medical ID</span>
            </button>

            {/* Quick 112 Call in Top Bar */}
            <a
              href="tel:112"
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 shadow-[0_0_12px_rgba(239,68,68,0.5)] min-h-[40px]"
              title="Immediate Call 112"
              aria-label="Call 112 National Emergency"
            >
              <PhoneCall size={13} />
              <span>112</span>
            </a>
          </div>
        </div>
      </header>

      {/* =========================================================================
          VIEW STATE 1: CATEGORY SELECTION VIEW (When no category is selected)
          ========================================================================= */}
      {!selectedCategory && (
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pt-4 pb-8 space-y-4 relative z-10" aria-live="polite">
          
          {/* Header text */}
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              What emergency are you facing?
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 font-medium">
              Tap your issue below. Immediate actions and direct dial will appear instantly without scrolling.
            </p>
          </div>

          {/* Rapid Call 112 Card - Always Visible */}
          <section className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-700 via-red-600 to-red-700 border border-red-400/80 shadow-[0_0_25px_rgba(220,38,38,0.35)] text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                <PhoneCall size={20} className="text-white animate-bounce" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-200 block">
                  INDIA NATIONAL EMERGENCY
                </span>
                <strong className="text-sm sm:text-base font-black text-white block">
                  Call 112 for Police, Ambulance & Fire
                </strong>
              </div>
            </div>

            <a
              href="tel:112"
              className="px-4 py-2.5 rounded-xl bg-white text-red-700 hover:bg-red-50 active:scale-95 font-black text-xs uppercase tracking-wider shrink-0 transition-transform shadow-md flex items-center gap-1.5 min-h-[44px]"
              aria-label="Call 112 emergency phone line"
            >
              <PhoneCall size={14} />
              <span>Call 112</span>
            </a>
          </section>

          {/* Location Bar / Fallback */}
          <section className="p-3 rounded-2xl bg-[#141414] border border-white/10 text-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin size={16} className="text-[#FFF174] shrink-0" />
                <div className="truncate">
                  {locStatus === 'active' && (
                    <span className="text-emerald-400 font-semibold truncate block">
                      📍 GPS Acquired {accuracy ? `(±${accuracy}m)` : ''} • {updatedText}
                    </span>
                  )}
                  {locStatus === 'requesting' && (
                    <span className="text-yellow-400 font-semibold flex items-center gap-1.5">
                      <Loader2 size={12} className="animate-spin inline" /> Acquiring location…
                    </span>
                  )}
                  {locStatus === 'denied' && (
                    <span className="text-amber-400 font-semibold">
                      ⚠️ Location access is turned off.
                    </span>
                  )}
                  {locStatus === 'searched' && (
                    <span className="text-emerald-400 font-semibold truncate block">
                      📍 Landmark: {address}
                    </span>
                  )}
                  {locStatus === 'idle' && (
                    <span className="text-gray-400">Location not yet requested.</span>
                  )}
                  {locStatus === 'unavailable' && (
                    <span className="text-amber-400 font-semibold">
                      ⚠️ Location unavailable. Use landmark below.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {locStatus !== 'active' && (
                  <button
                    type="button"
                    onClick={handleLocationRequest}
                    className="px-2.5 py-1 rounded-lg bg-[#FFF174] text-black font-bold text-[11px] hover:bg-yellow-400 active:scale-95 transition-all cursor-pointer min-h-[36px]"
                  >
                    {locStatus === 'denied' ? 'Retry GPS' : 'Find GPS'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowLandmarkSearch(!showLandmarkSearch)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 font-medium text-[11px] cursor-pointer min-h-[36px]"
                >
                  {showLandmarkSearch ? 'Close' : 'Set Landmark'}
                </button>
              </div>
            </div>

            {/* Landmark Search Form & Quick Chips */}
            {showLandmarkSearch && (
              <div className="pt-2 border-t border-white/10 space-y-2 animate-in fade-in duration-200">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={searchPlace}
                    onChange={(e) => setSearchPlace(e.target.value)}
                    placeholder="Search milestone, town, or highway junction..."
                    className="flex-1 bg-[#1c1c1c] border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFF174]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-[#FFF174] text-black font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Set
                  </button>
                </form>

                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="text-[10px] text-gray-500 w-full">Quick mountain corridor landmarks:</span>
                  {HIGHWAY_LANDMARKS.slice(0, 6).map((lm) => (
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
          </section>

          {/* 5 TOUCH-FRIENDLY CATEGORY SELECTION CARDS */}
          <section className="space-y-2.5" aria-label="Select Emergency Category">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-400 px-1">
              <span>SELECT EMERGENCY CATEGORY</span>
              <button
                type="button"
                onClick={() => selectCategory('BOTH')}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-300 border border-white/10 transition-colors cursor-pointer min-h-[34px]"
              >
                Need Both (Medical & Bike)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* 1. 🚑 Medical emergency */}
              <button
                type="button"
                onClick={() => selectCategory('MEDICAL')}
                className="p-4 rounded-2xl bg-[#141414] hover:bg-[#201010] active:scale-[0.99] border-2 border-white/10 hover:border-red-500/80 transition-all cursor-pointer group flex items-center justify-between gap-3 min-h-[82px] text-left"
                aria-label="Medical emergency - Accidents, injuries, trauma care"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                    🚑
                  </div>
                  <div>
                    <strong className="text-base font-black text-white group-hover:text-red-300 transition-colors block">
                      Medical emergency
                    </strong>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      For accidents, injuries or urgent medical assistance.
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* 2. 🔧 Bike problem */}
              <button
                type="button"
                onClick={() => selectCategory('BIKE_PROBLEM')}
                className="p-4 rounded-2xl bg-[#141414] hover:bg-[#1f1d10] active:scale-[0.99] border-2 border-white/10 hover:border-[#FFF174]/80 transition-all cursor-pointer group flex items-center justify-between gap-3 min-h-[82px] text-left"
                aria-label="Bike problem - For punctures, battery failure, engine problems, fuel and repairs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                    🔧
                  </div>
                  <div>
                    <strong className="text-base font-black text-white group-hover:text-[#FFF174] transition-colors block">
                      Bike problem
                    </strong>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      For punctures, battery failure, engine problems, fuel and repairs.
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-[#FFF174] group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* 3. ⚠️ I feel unsafe */}
              <button
                type="button"
                onClick={() => selectCategory('UNSAFE')}
                className="p-4 rounded-2xl bg-[#141414] hover:bg-[#201810] active:scale-[0.99] border-2 border-white/10 hover:border-amber-500/80 transition-all cursor-pointer group flex items-center justify-between gap-3 min-h-[82px] text-left"
                aria-label="I feel unsafe - For threats, harassment, being followed or feeling unsafe"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                    ⚠️
                  </div>
                  <div>
                    <strong className="text-base font-black text-white group-hover:text-amber-300 transition-colors block">
                      I feel unsafe
                    </strong>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      For threats, harassment, being followed or feeling unsafe.
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* 4. 🚚 I need towing */}
              <button
                type="button"
                onClick={() => selectCategory('TOWING')}
                className="p-4 rounded-2xl bg-[#141414] hover:bg-[#101820] active:scale-[0.99] border-2 border-white/10 hover:border-blue-400/80 transition-all cursor-pointer group flex items-center justify-between gap-3 min-h-[82px] text-left"
                aria-label="I need towing - For motorcycles that cannot safely be ridden"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                    🚚
                  </div>
                  <div>
                    <strong className="text-base font-black text-white group-hover:text-blue-300 transition-colors block">
                      I need towing
                    </strong>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      For motorcycles that cannot safely be ridden.
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            </div>

            {/* 5. ❓ I'm not sure */}
            <button
              type="button"
              onClick={() => selectCategory('NOT_SURE')}
              className="w-full p-4 rounded-2xl bg-[#141414] hover:bg-[#1c1420] active:scale-[0.99] border-2 border-white/10 hover:border-purple-400/80 transition-all cursor-pointer group flex items-center justify-between gap-3 min-h-[82px] text-left"
              aria-label="I'm not sure - For users who cannot identify the problem"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                  ❓
                </div>
                <div>
                  <strong className="text-base font-black text-white group-hover:text-purple-300 transition-colors block">
                    I'm not sure
                  </strong>
                  <span className="text-xs text-gray-400 block mt-0.5">
                    For users who cannot identify the problem. 3 quick triage checks.
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all shrink-0" />
            </button>
          </section>

          {/* Discreet Help Tip */}
          <div className="text-center text-[11px] text-gray-400 pt-2">
            <span>All emergency actions operate instantly without login or registration.</span>
          </div>
        </main>
      )}

      {/* =========================================================================
          VIEW STATE 2: DEDICATED, FOCUSED CATEGORY ACTION SCREEN
          ZERO-UNNECESSARY-SCROLL: The primary actions render directly at the top!
          ========================================================================= */}
      {selectedCategory && (
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pt-3 pb-8 space-y-4 relative z-10" aria-live="polite">
          
          {/* Quick Context Bar with Back Link */}
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <button
              type="button"
              onClick={handleBackToCategories}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white transition-colors cursor-pointer min-h-[44px] py-1 px-2 rounded-lg bg-white/5 border border-white/10"
              aria-label="Back to Category Selection"
            >
              <ArrowLeft size={16} className="text-[#FFF174]" />
              <span>← Change Category</span>
            </button>

            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-gray-200">
              {selectedCategory === 'MEDICAL' && '🚑 Medical Emergency'}
              {selectedCategory === 'BIKE_PROBLEM' && '🔧 Bike Breakdown'}
              {selectedCategory === 'UNSAFE' && '⚠️ Personal Safety'}
              {selectedCategory === 'TOWING' && '🚚 Motorcycle Towing'}
              {selectedCategory === 'NOT_SURE' && '❓ Guided Triage'}
              {selectedCategory === 'BOTH' && '🚨 Medical + Bike'}
            </span>
          </div>

          {/* -------------------------------------------------------------
              A. MEDICAL EMERGENCY FOCUSED ACTION VIEW
              ------------------------------------------------------------- */}
          {selectedCategory === 'MEDICAL' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* PRIMARY ACTION 1: CALL 112 PROMINENT BUTTON (TOP OF VIEWPORT) */}
              <section className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-600 to-red-700 border-2 border-red-400 shadow-[0_0_35px_rgba(220,38,38,0.5)] text-white space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-100 block">
                      NATIONAL EMERGENCY RESPONSE
                    </span>
                    <h1
                      ref={actionHeadingRef}
                      tabIndex={-1}
                      className="text-xl sm:text-2xl font-black text-white focus:outline-none tracking-tight"
                    >
                      Call 112 for Police & Ambulance
                    </h1>
                    <span className="text-xs text-red-100/90 block mt-0.5">
                      Direct phone dial on cellular voice network. Immediate dispatch.
                    </span>
                  </div>
                </div>

                <a
                  href="tel:112"
                  className="w-full py-4 rounded-2xl bg-white text-red-700 hover:bg-red-50 active:scale-98 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform cursor-pointer min-h-[52px]"
                  aria-label="Direct Phone Call to 112"
                >
                  <PhoneCall size={20} />
                  <span>Call 112 Now</span>
                </a>
              </section>

              {/* CRITICAL LIFE SAFETY GUIDELINE */}
              <section className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <AlertTriangle size={16} className="shrink-0 text-red-400" />
                  <span>Immediate Life Safety Instructions</span>
                </div>
                <p className="text-[11px] leading-relaxed text-gray-200">
                  • <strong>Get to safety:</strong> Move off the roadway if you can do so safely.<br />
                  • <strong>Do NOT move an injured person</strong> if head, neck, or spine injury is suspected, unless remaining there presents immediate mortal danger (fire or highway traffic).<br />
                  • <strong>Keep helmet on:</strong> Do not remove the rider's helmet unless breathing is obstructed.
                </p>
              </section>

              {/* ACTION BUTTONS: 108 AMBULANCE & SHARE LOCATION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Ambulance 108 Direct Dial */}
                <a
                  href="tel:108"
                  className="p-3.5 rounded-2xl bg-[#141414] hover:bg-[#1a1a1a] border border-red-500/50 flex items-center justify-between text-left cursor-pointer min-h-[64px]"
                  aria-label="Call National 108 Emergency Ambulance"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-sm shrink-0">
                      108
                    </div>
                    <div>
                      <strong className="text-sm font-bold text-white block">Call 108 Ambulance</strong>
                      <span className="text-[11px] text-gray-400 block">Govt Free Medical Dispatch</span>
                    </div>
                  </div>
                  <PhoneCall size={16} className="text-red-400" />
                </a>

                {/* Share Live Location */}
                <button
                  type="button"
                  onClick={handleShareLocation}
                  className="p-3.5 rounded-2xl bg-[#141414] hover:bg-[#1a1a1a] border border-white/15 flex items-center justify-between text-left cursor-pointer min-h-[64px]"
                  aria-label="Share location with emergency contacts"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Share2 size={18} />
                    </div>
                    <div>
                      <strong className="text-sm font-bold text-white block">
                        {copySuccess ? 'Coordinates Copied!' : 'Share My Location'}
                      </strong>
                      <span className="text-[11px] text-gray-400 block">WhatsApp / SMS / Maps</span>
                    </div>
                  </div>
                  {copySuccess ? <Check size={16} className="text-emerald-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                </button>
              </div>

              {/* VERIFIED REGIONAL HOSPITALS & TRAUMA FACILITIES */}
              <section className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <Activity size={14} className="text-red-400" />
                    <span>Nearby Hospital Trauma Centres</span>
                  </h2>
                  <span className="text-[10px] text-gray-500">Verified 24/7 facilities</span>
                </div>

                <div className="space-y-2">
                  {MEDICAL_PROVIDERS.filter(p => p.type === 'HOSPITAL').map((prov) => (
                    <div
                      key={prov.id}
                      className="p-3.5 rounded-2xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-white">{prov.name}</strong>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                            {prov.badge}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400">
                          📍 {prov.distance} away ({prov.eta}) • {prov.address}
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {prov.services.map((s) => (
                            <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-300">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                        <a
                          href={`tel:${prov.phone.replace(/[^0-9+]/g, '')}`}
                          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                          aria-label={`Call hospital ${prov.name}`}
                        >
                          <PhoneCall size={14} />
                          <span>Call Hospital</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Location fallback chip */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-gray-300 flex items-center justify-between gap-2">
                <span className="truncate">
                  📍 {coords ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : address || 'GPS not active — landmark fallback available'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowLandmarkSearch(true)}
                  className="text-[#FFF174] font-bold underline shrink-0 cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              B. BIKE PROBLEM FOCUSED ACTION VIEW
              ------------------------------------------------------------- */}
          {selectedCategory === 'BIKE_PROBLEM' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Header Title & Issue Filter Selector (TOP OF VIEWPORT) */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h1
                      ref={actionHeadingRef}
                      tabIndex={-1}
                      className="text-xl sm:text-2xl font-black text-white focus:outline-none tracking-tight"
                    >
                      What is the bike problem?
                    </h1>
                    <span className="text-xs text-gray-400">
                      Select your specific breakdown issue to see the closest specialized mechanics.
                    </span>
                  </div>
                </div>

                {/* Sub-issue chips (Immediate choice) */}
                <div className="flex flex-wrap gap-1.5 text-xs pt-1" role="radiogroup" aria-label="Motorcycle issue filters">
                  {(
                    [
                      ['ALL', 'All Issues', Wrench],
                      ['TYRE', 'Puncture / Tyre', Disc],
                      ['BATTERY', 'Battery / Won\'t Start', BatteryCharging],
                      ['CHAIN', 'Chain / Sprocket', Activity],
                      ['ENGINE', 'Engine / Overheating', Flame],
                      ['FUEL', 'Out of Fuel', Fuel],
                      ['ELECTRICAL', 'Electrical / Fuse', Zap],
                      ['OTHER', 'Other / Stalled', HelpCircle]
                    ] as const
                  ).map(([key, label, IconComponent]) => (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={bikeIssueFilter === key}
                      onClick={() => setBikeIssueFilter(key)}
                      className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
                        bikeIssueFilter === key
                          ? 'bg-[#FFF174] text-black shadow-[0_0_15px_rgba(255,241,116,0.35)]'
                          : 'bg-[#181818] text-gray-300 hover:bg-[#222222] border border-white/10'
                      }`}
                    >
                      <IconComponent size={14} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Towing & Share Location Rapid Shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => selectCategory('TOWING')}
                  className="p-3.5 rounded-2xl bg-[#141414] hover:bg-[#1a1a1a] border border-blue-400/40 flex items-center justify-between text-left cursor-pointer min-h-[58px]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                      <Truck size={18} />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-white block">Unrideable? Request Towing</strong>
                      <span className="text-[10px] text-gray-400 block">Motorcycle Flatbed & Mountain Winch</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-blue-400" />
                </button>

                <button
                  type="button"
                  onClick={handleShareLocation}
                  className="p-3.5 rounded-2xl bg-[#141414] hover:bg-[#1a1a1a] border border-white/15 flex items-center justify-between text-left cursor-pointer min-h-[58px]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Share2 size={18} />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-white block">
                        {copySuccess ? 'Coordinates Copied!' : 'Share Breakdown Location'}
                      </strong>
                      <span className="text-[10px] text-gray-400 block">WhatsApp / SMS with mechanics</span>
                    </div>
                  </div>
                  {copySuccess ? <Check size={16} className="text-emerald-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                </button>
              </div>

              {/* Filtered Motorcycle Mechanics List */}
              <section className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <Wrench size={14} className="text-[#FFF174]" />
                    <span>Nearby Motorcycle Mechanics & Workshops</span>
                  </h2>
                  <span className="text-[10px] text-gray-400">Tailored for 2-wheelers</span>
                </div>

                {filteredMechanical.length > 0 ? (
                  <div className="space-y-2.5">
                    {filteredMechanical.map((prov) => (
                      <div
                        key={prov.id}
                        className="p-3.5 rounded-2xl bg-[#141414] border border-white/10 hover:border-[#FFF174]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-white">{prov.name}</strong>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {prov.badge}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-2">
                            <span>📍 {prov.distance} away ({prov.eta})</span>
                            <span>•</span>
                            <span>{prov.address}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {prov.services.map((s) => (
                              <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-300">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                          <a
                            href={`tel:${prov.phone.replace(/[^0-9+]/g, '')}`}
                            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                            aria-label={`Call provider ${prov.name}`}
                          >
                            <PhoneCall size={14} className="text-emerald-400" />
                            <span>Call Provider</span>
                          </a>

                          <button
                            type="button"
                            disabled={dispatchPending}
                            onClick={() => handleDispatchAssistance(prov)}
                            className="px-3.5 py-2.5 rounded-xl bg-[#FFF174] hover:bg-yellow-400 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider transition-colors cursor-pointer min-h-[44px]"
                          >
                            {dispatchPending ? '...' : 'Request'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 text-center space-y-2">
                    <p className="text-xs text-gray-300">
                      No specialized motorcycle providers found matching this specific filter in this corridor.
                    </p>
                    <button
                      type="button"
                      onClick={() => setBikeIssueFilter('ALL')}
                      className="px-4 py-2 bg-[#FFF174] text-black font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Show All Motorcycle Services
                    </button>
                  </div>
                )}
              </section>

              {/* Direct Request Confirmation Result if Triggered */}
              {dispatchConfirmed && dispatchedProvider && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/70 text-emerald-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <CheckCircle2 size={16} />
                    <span>Rescue Request Initiated (#{createdRequestId})</span>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    {serverDispatched
                      ? 'Server accepted your request. Provider notified.'
                      : 'Request saved locally (cellular fallback). Please call the provider directly using the button above.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------------
              C. I FEEL UNSAFE FOCUSED ACTION VIEW
              ------------------------------------------------------------- */}
          {selectedCategory === 'UNSAFE' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* PRIMARY ACTION 1: CALL 112 POLICE (TOP OF VIEWPORT) */}
              <section className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-600 to-red-700 border-2 border-red-400 shadow-[0_0_35px_rgba(220,38,38,0.5)] text-white space-y-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-100 block">
                    HIGHWAY THREAT & PERSONAL SAFETY ESCALATION
                  </span>
                  <h1
                    ref={actionHeadingRef}
                    tabIndex={-1}
                    className="text-xl sm:text-2xl font-black text-white focus:outline-none tracking-tight"
                  >
                    Call 112 National Police
                  </h1>
                  <span className="text-xs text-red-100/90 block mt-0.5">
                    Immediate connection to nearest police command center and highway patrol.
                  </span>
                </div>

                <a
                  href="tel:112"
                  className="w-full py-4 rounded-2xl bg-white text-red-700 hover:bg-red-50 active:scale-98 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform cursor-pointer min-h-[52px]"
                  aria-label="Direct Phone Call to 112 Police"
                >
                  <PhoneCall size={20} />
                  <span>Call 112 Police Now</span>
                </a>
              </section>

              {/* IMMEDIATE SAFETY GUIDELINES */}
              <section className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Shield size={16} className="shrink-0 text-amber-400" />
                  <span>Immediate Actionable Safety Steps</span>
                </div>
                <p className="text-[11px] leading-relaxed text-gray-200">
                  • <strong>Move toward light and people:</strong> Head immediately to a well-lit petrol pump, toll plaza, or open roadside establishment if safe.<br />
                  • <strong>Keep helmet on and bike keys in hand.</strong><br />
                  • <strong>Do not confront threatening individuals.</strong> Stay in plain sight of CCTV or public areas.
                </p>
              </section>

              {/* 1-TAP DISTRESS ACTIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Share Live Location via WhatsApp */}
                <a
                  href={getWhatsAppAlertUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] flex items-center justify-between transition-colors min-h-[64px]"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageCircle size={20} />
                    <div className="text-left">
                      <strong className="text-sm font-bold block text-white">Share Live Location</strong>
                      <span className="text-[10px] text-[#25D366]/90 block">WhatsApp Distress Alert</span>
                    </div>
                  </div>
                  <ExternalLink size={16} />
                </a>

                {/* Call Primary Trusted Contact */}
                <a
                  href="tel:+919876543210"
                  className="p-3.5 rounded-2xl bg-[#141414] hover:bg-[#1a1a1a] border border-white/20 text-white flex items-center justify-between transition-colors min-h-[64px]"
                >
                  <div className="flex items-center gap-2.5">
                    <PhoneCall size={20} className="text-emerald-400" />
                    <div className="text-left">
                      <strong className="text-sm font-bold block">Call Trusted Contact</strong>
                      <span className="text-[10px] text-gray-400 block">+91 98765 43210</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </a>
              </div>

              {/* VERIFIED SAFE HAVENS & POLICE OUTPOSTS */}
              <section className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-amber-400" />
                    <span>Safe Public Havens & Police Stations</span>
                  </h2>
                  <span className="text-[10px] text-gray-400">Lit & monitored locations</span>
                </div>

                <div className="space-y-2">
                  {SAFETY_PROVIDERS.map((prov) => (
                    <div
                      key={prov.id}
                      className="p-3.5 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-white block">{prov.name}</strong>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                            {prov.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 block mt-0.5">
                          📍 {prov.distance} • {prov.address}
                        </span>
                      </div>

                      <a
                        href={`tel:${prov.phone}`}
                        className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 min-h-[44px] shrink-0"
                      >
                        <PhoneCall size={14} className="text-red-400" />
                        <span>Call</span>
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* -------------------------------------------------------------
              D. I NEED TOWING FOCUSED ACTION VIEW
              ------------------------------------------------------------- */}
          {selectedCategory === 'TOWING' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* PRIMARY ACTION 1: CALL TOW OPERATOR (TOP OF VIEWPORT) */}
              <section className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 border-2 border-blue-400 shadow-[0_0_35px_rgba(59,130,246,0.4)] text-white space-y-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-100 block">
                    SPECIALIZED MOTORCYCLE FLATBED RECOVERY
                  </span>
                  <h1
                    ref={actionHeadingRef}
                    tabIndex={-1}
                    className="text-xl sm:text-2xl font-black text-white focus:outline-none tracking-tight"
                  >
                    Himalayan Motorcycle Flatbed Towing
                  </h1>
                  <span className="text-xs text-blue-100/90 block mt-0.5">
                    Equipped with wheel-chock clamps, soft tie-down straps, and mountain winch.
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <a
                    href="tel:+919733099887"
                    className="flex-1 py-4 rounded-2xl bg-white text-blue-800 hover:bg-blue-50 active:scale-98 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform cursor-pointer min-h-[52px]"
                    aria-label="Call Tow Truck Driver Directly"
                  >
                    <PhoneCall size={18} />
                    <span>Call Tow Truck (+91 97330 99887)</span>
                  </a>

                  <button
                    type="button"
                    disabled={dispatchPending}
                    onClick={() => handleDispatchAssistance(TOWING_PROVIDERS[0])}
                    className="px-5 py-4 rounded-2xl bg-blue-900/60 hover:bg-blue-900 disabled:opacity-50 border border-blue-400/60 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer min-h-[52px]"
                  >
                    <span>{dispatchPending ? 'Coordinating...' : 'Request Dispatch'}</span>
                  </button>
                </div>
              </section>

              {/* CURRENT LOCATION & VEHICLE DETAILS */}
              <section className="p-3.5 rounded-2xl bg-[#141414] border border-white/10 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-gray-300">Pickup Location:</span>
                  <button
                    type="button"
                    onClick={() => setShowLandmarkSearch(true)}
                    className="text-[#FFF174] font-bold underline cursor-pointer"
                  >
                    Change / Correct
                  </button>
                </div>
                <div className="text-gray-300 flex items-center gap-2">
                  <MapPin size={16} className="text-[#FFF174] shrink-0" />
                  <span>{coords ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : address || 'GPS not active — Please confirm landmark'}</span>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-2">
                  <label htmlFor="towingBikeModel" className="font-bold text-gray-300 block">
                    Motorcycle Model / Type:
                  </label>
                  <input
                    id="towingBikeModel"
                    type="text"
                    value={towingBikeModel}
                    onChange={(e) => setTowingBikeModel(e.target.value)}
                    placeholder="e.g. Royal Enfield Himalayan 450, KTM 390 Adventure..."
                    className="w-full bg-[#181818] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                  
                  <label className="flex items-center gap-2 cursor-pointer text-gray-300 pt-1">
                    <input
                      type="checkbox"
                      checked={towingWinchNeeded}
                      onChange={(e) => setTowingWinchNeeded(e.target.checked)}
                      className="rounded accent-blue-500 w-4 h-4"
                    />
                    <span>Bike is in ditch/slope — Mountain recovery winch required</span>
                  </label>
                </div>
              </section>

              {/* Towing Provider Details */}
              <section className="space-y-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 px-1">
                  Verified Mountain Towing Operator
                </h2>

                {TOWING_PROVIDERS.map((prov) => (
                  <div
                    key={prov.id}
                    className="p-4 rounded-2xl bg-[#141414] border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-sm font-bold text-white">{prov.name}</strong>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                        {prov.badge}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      📍 {prov.distance} • Base: {prov.address}
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {prov.services.map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </section>

              {/* Dispatch confirmation note */}
              {dispatchConfirmed && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/70 text-emerald-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <CheckCircle2 size={16} />
                    <span>Towing Request Logged (#{createdRequestId})</span>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    {serverDispatched
                      ? 'Server confirmed coordinates. Driver preparing departure.'
                      : 'Saved locally (cellular fallback). Please call the driver directly via cellular network.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------------
              E. I'M NOT SURE GUIDED TRIAGE FOCUSED VIEW
              ------------------------------------------------------------- */}
          {selectedCategory === 'NOT_SURE' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Header Title (TOP OF VIEWPORT) */}
              <section className="space-y-1">
                <h1
                  ref={actionHeadingRef}
                  tabIndex={-1}
                  className="text-xl sm:text-2xl font-black text-white focus:outline-none tracking-tight flex items-center gap-2"
                >
                  <HelpCircle size={22} className="text-purple-400" />
                  <span>3-Question Emergency Triage</span>
                </h1>
                <p className="text-xs text-gray-300">
                  Answer these 3 quick checks. We will immediately direct you to the correct assistance.
                </p>
              </section>

              {/* Continuous Call 112 Access */}
              <section className="p-3 rounded-2xl bg-red-950/40 border border-red-500/40 text-white flex items-center justify-between gap-2">
                <span className="text-xs text-red-200">
                  In acute danger or injured? Dial emergency immediately:
                </span>
                <a
                  href="tel:112"
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-black text-xs uppercase tracking-wider shrink-0"
                >
                  Call 112
                </a>
              </section>

              {/* 3 GUIDED QUESTIONS */}
              <div className="space-y-3 text-xs">
                {/* QUESTION 1: INJURY CHECK (PRIMARY LIFE SAFETY) */}
                <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/10 space-y-2">
                  <label className="text-white font-bold block text-sm">
                    1. Is anyone injured or in immediate danger?
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setQ1Injured('YES');
                        selectCategory('MEDICAL');
                      }}
                      className="flex-1 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white cursor-pointer min-h-[46px]"
                    >
                      🚑 YES — Someone is injured
                    </button>
                    <button
                      type="button"
                      onClick={() => setQ1Injured('NO')}
                      className={`flex-1 py-3 rounded-xl font-bold border transition-colors cursor-pointer min-h-[46px] ${
                        q1Injured === 'NO' ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-white/5 text-gray-300 border-white/10'
                      }`}
                    >
                      ✅ NO — Everyone is safe
                    </button>
                  </div>
                </div>

                {/* QUESTION 2: WHEEL / ROLLING CHECK */}
                <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/10 space-y-2">
                  <label className="text-white font-bold block text-sm">
                    2. Can the motorcycle roll freely in neutral?
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setQ2BikeRolls('YES')}
                      className={`flex-1 py-3 rounded-xl font-bold border transition-colors cursor-pointer min-h-[46px] ${
                        q2BikeRolls === 'YES' ? 'bg-[#FFF174] text-black border-[#FFF174]' : 'bg-white/5 text-gray-300 border-white/10'
                      }`}
                    >
                      Yes — Rolls freely
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQ2BikeRolls('NO');
                        selectCategory('TOWING');
                      }}
                      className="flex-1 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer min-h-[46px]"
                    >
                      🚚 No — Wheels locked / Needs Towing
                    </button>
                  </div>
                </div>

                {/* QUESTION 3: STARTING BEHAVIOR */}
                <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/10 space-y-2">
                  <label className="text-white font-bold block text-sm">
                    3. What happens when you turn on the key & press starter?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBikeIssueFilter('ENGINE');
                        selectCategory('BIKE_PROBLEM');
                      }}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left font-medium text-gray-200 cursor-pointer min-h-[48px]"
                    >
                      Engine cranks, but won't start (Fuel / Spark)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBikeIssueFilter('BATTERY');
                        selectCategory('BIKE_PROBLEM');
                      }}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left font-medium text-gray-200 cursor-pointer min-h-[48px]"
                    >
                      Silence or clicking sound (Battery / Fuse)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBikeIssueFilter('TYRE');
                        selectCategory('BIKE_PROBLEM');
                      }}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left font-medium text-gray-200 cursor-pointer min-h-[48px]"
                    >
                      Puncture / Tyre flat
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBikeIssueFilter('OTHER');
                        selectCategory('BIKE_PROBLEM');
                      }}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left font-medium text-gray-200 cursor-pointer min-h-[48px]"
                    >
                      Strange mechanical noise or chain problem
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              F. NEED BOTH (MEDICAL & BIKE) FOCUSED ACTION VIEW
              ------------------------------------------------------------- */}
          {selectedCategory === 'BOTH' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Header */}
              <div className="space-y-1">
                <h1
                  ref={actionHeadingRef}
                  tabIndex={-1}
                  className="text-xl sm:text-2xl font-black text-white focus:outline-none tracking-tight flex items-center gap-2"
                >
                  <AlertTriangle size={22} className="text-red-400" />
                  <span>Dual Emergency: Medical & Bike Recovery</span>
                </h1>
                <p className="text-xs text-gray-300">
                  Prioritize personal safety first. Vehicle recovery will be managed once medical assistance is secured.
                </p>
              </div>

              {/* SECTION 1: PERSONAL SAFETY & MEDICAL ACTIONS (TOP PRIORITY) */}
              <section className="p-4 sm:p-5 rounded-3xl bg-red-950/40 border-2 border-red-500 text-white space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <strong className="text-sm font-black uppercase text-red-300 tracking-wider">
                    PRIORITY 1: PERSONAL SAFETY & MEDICAL
                  </strong>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="tel:112"
                    className="py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    <PhoneCall size={16} />
                    <span>Call 112 National Police / EMS</span>
                  </a>

                  <a
                    href="tel:108"
                    className="py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    <PhoneCall size={16} />
                    <span>Call 108 Ambulance</span>
                  </a>
                </div>

                <div className="text-[11px] text-gray-300 leading-relaxed border-t border-red-500/30 pt-2">
                  Neotia Getwel Trauma Centre (3.2 km): <a href="tel:+913533058888" className="text-red-300 underline font-bold">+91 353 305 8888</a> • North Bengal Medical College (4.8 km): <a href="tel:+913532585478" className="text-red-300 underline font-bold">+91 353 258 5478</a>
                </div>
              </section>

              {/* SECTION 2: MOTORCYCLE RECOVERY & TOWING (SECONDARY) */}
              <section className="p-4 rounded-2xl bg-[#141414] border border-blue-400/40 text-white space-y-3">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-blue-400" />
                  <strong className="text-sm font-black uppercase text-blue-300 tracking-wider">
                    PRIORITY 2: MOTORCYCLE RECOVERY & TOWING
                  </strong>
                </div>

                <p className="text-xs text-gray-300">
                  Flatbed tow truck with mountain winch and wheel clamps can safely transport your motorcycle to an authorized workshop while you receive medical care.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="tel:+919733099887"
                    className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 min-h-[46px]"
                  >
                    <PhoneCall size={16} />
                    <span>Call Himalayan Tow Truck (+91 97330 99887)</span>
                  </a>

                  <button
                    type="button"
                    disabled={dispatchPending}
                    onClick={() => handleDispatchAssistance(TOWING_PROVIDERS[0])}
                    className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-bold text-xs uppercase min-h-[46px]"
                  >
                    {dispatchPending ? 'Coordinating...' : 'Request Towing Dispatch'}
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* Fallback Landmark Search Trigger */}
          {showLandmarkSearch && (
            <div className="p-4 rounded-2xl bg-[#161616] border border-white/20 space-y-2 text-xs">
              <span className="font-bold text-white block">Search Place or Landmark Manually:</span>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={searchPlace}
                  onChange={(e) => setSearchPlace(e.target.value)}
                  placeholder="Enter location, landmark, or highway milestone..."
                  className="flex-1 bg-[#202020] border border-white/20 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FFF174] text-black font-bold text-xs rounded-xl cursor-pointer"
                >
                  Set
                </button>
              </form>
            </div>
          )}

        </main>
      )}
    </div>
  );
}
