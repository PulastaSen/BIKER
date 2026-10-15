import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall,
  X,
  ArrowLeft,
  ShieldAlert,
  Heart,
  Activity,
  AlertTriangle,
  Share2,
  Check,
  Wrench,
  Disc,
  BatteryCharging,
  Flame,
  Fuel,
  HelpCircle,
  Truck,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  ChevronRight,
  Shield,
  MapPin
} from 'lucide-react';
import {
  MedicalEmergencyGraphic,
  BikeBreakdownGraphic,
  PersonalSafetyGraphic,
  TowingRecoveryGraphic,
  GuidedTriageGraphic,
  DualEmergencyGraphic
} from './graphics';
import { buildWhatsAppBreakdownAlertUrl } from '../utils/whatsappShare';
import { saveRequest, INITIAL_BIKES } from '../utils/appStorage';
import { API_BASE_URL, hasBackendApi } from '../config/api';

export type EmergencyCategory = 'MEDICAL' | 'BIKE_PROBLEM' | 'UNSAFE' | 'TOWING' | 'NOT_SURE' | 'BOTH';
export type BikeProblemType = 'ALL' | 'TYRE' | 'BATTERY' | 'CHAIN' | 'ENGINE' | 'FUEL' | 'ELECTRICAL' | 'OTHER';

export interface ProviderListing {
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

export const EMERGENCY_MECHANICAL_PROVIDERS: ProviderListing[] = [
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
  }
];

export const EMERGENCY_MEDICAL_PROVIDERS: ProviderListing[] = [
  {
    id: 'hosp-1',
    name: 'Neotia Getwel Healthcare Trauma Centre',
    type: 'HOSPITAL',
    badge: 'Level 1 Trauma',
    isVerified: true,
    distance: '3.2 km',
    phone: '+91 353 305 8888',
    address: 'Uttorayon Township, Matigara',
    eta: '8-12 mins',
    services: ['24/7 Emergency Medicine', 'Neurosurgery & Orthopaedics', 'ICU & Blood Bank']
  },
  {
    id: 'hosp-2',
    name: 'North Bengal Medical College & Hospital',
    type: 'HOSPITAL',
    badge: 'Govt Apex Trauma',
    isVerified: true,
    distance: '4.8 km',
    phone: '+91 353 258 5478',
    address: 'Sushruta Nagar, Siliguri',
    eta: '12-18 mins',
    services: ['Free Emergency Ward', '24/7 Govt Blood Bank', 'Emergency Surgical Theatre']
  },
  {
    id: 'hosp-3',
    name: 'Siliguri District Hospital Emergency Ward',
    type: 'HOSPITAL',
    badge: 'Govt District Hospital',
    isVerified: true,
    distance: '2.8 km',
    phone: '+91 353 253 2345',
    address: 'Court More, Siliguri Town',
    eta: '8-10 mins',
    services: ['Emergency Casualty', 'General Trauma', '24/7 Pharmacy']
  }
];

export const EMERGENCY_SAFETY_PROVIDERS: ProviderListing[] = [
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

export const EMERGENCY_TOWING_PROVIDERS: ProviderListing[] = [
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

export interface EmergencyActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  category: EmergencyCategory | null;
  onSelectCategory: (category: EmergencyCategory) => void;
  coords?: { lat: number; lng: number } | null;
  accuracy?: number | null;
  address?: string | null;
  onOpenLandmarkSearch?: () => void;
  onOpenMedicalId?: () => void;
}

export function EmergencyActionSheet({
  isOpen,
  onClose,
  category,
  onSelectCategory,
  coords,
  accuracy,
  address,
  onOpenLandmarkSearch,
  onOpenMedicalId
}: EmergencyActionSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const primaryActionRef = useRef<HTMLAnchorElement | null>(null);

  // Category B state: problem filter
  const [bikeIssueFilter, setBikeIssueFilter] = useState<BikeProblemType>('ALL');

  // Category D state: towing options
  const [towingBikeModel, setTowingBikeModel] = useState('Royal Enfield Himalayan 450');
  const [towingWinchNeeded, setTowingWinchNeeded] = useState(false);

  // Category E state: guided triage steps
  const [triageStep, setTriageStep] = useState<1 | 2 | 3>(1);

  // Copy success feedback
  const [copySuccess, setCopySuccess] = useState(false);

  // Dispatch state
  const [dispatchPending, setDispatchPending] = useState(false);
  const [dispatchConfirmed, setDispatchConfirmed] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);
  const [serverDispatched, setServerDispatched] = useState(false);
  const [dispatchedProvider, setDispatchedProvider] = useState<ProviderListing | null>(null);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      // Auto focus primary action after sheet opens
      setTimeout(() => {
        primaryActionRef.current?.focus();
      }, 100);
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Trap Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Reset category-specific internal state when category changes
  useEffect(() => {
    setDispatchConfirmed(false);
    setDispatchedProvider(null);
    setTriageStep(1);
  }, [category]);

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
        category === 'MEDICAL'
          ? 'Medical Emergency'
          : category === 'TOWING'
          ? 'Motorcycle Towing'
          : category === 'UNSAFE'
          ? 'Personal Safety Emergency'
          : 'Motorcycle Breakdown',
      status: 'Assistance requested'
    });
  };

  const handleDispatchAssistance = async (provider: ProviderListing) => {
    setDispatchPending(true);
    const requestId = `RH-${Date.now().toString().slice(-4)}`;

    const helpCatMap: Record<EmergencyCategory, 'MEDICAL' | 'MECHANICAL' | 'SAFETY' | 'TOWING' | 'BOTH'> = {
      MEDICAL: 'MEDICAL',
      BIKE_PROBLEM: 'MECHANICAL',
      UNSAFE: 'SAFETY',
      TOWING: 'TOWING',
      NOT_SURE: 'MECHANICAL',
      BOTH: 'BOTH'
    };

    const newRequest = {
      id: requestId,
      requestId,
      riderId: 'user-rider-1',
      riderName: 'MotoAssist Rider',
      riderPhone: '+91 98765 43210',
      bike: INITIAL_BIKES[0],
      issue: `${provider.type} - ${provider.name}`,
      helpCategory: helpCatMap[category || 'BIKE_PROBLEM'],
      subcategory: provider.type,
      urgency: (category === 'MEDICAL' || category === 'UNSAFE' ? 'CRITICAL' : 'HIGH') as 'CRITICAL' | 'HIGH',
      description: `Emergency request for ${provider.name} at ${address || 'Corridor'}`,
      approximateLocation: address || (coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Highway Sector'),
      locationShared: !!coords,
      latitude: coords?.lat,
      longitude: coords?.lng,
      accuracyMeters: accuracy || 15,
      status: 'REQUESTED' as const,
      createdAt: new Date().toISOString()
    };

    saveRequest(newRequest);

    if (hasBackendApi()) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/assistance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRequest)
        });
        if (res.ok) {
          setServerDispatched(true);
        }
      } catch {
        setServerDispatched(false);
      }
    } else {
      setServerDispatched(false);
    }

    setCreatedRequestId(requestId);
    setDispatchedProvider(provider);
    setDispatchPending(false);
    setDispatchConfirmed(true);
  };

  // Filter mechanics for Category B
  const filteredMechanical = EMERGENCY_MECHANICAL_PROVIDERS.filter((p) => {
    if (bikeIssueFilter === 'ALL') return true;
    return p.subCategories?.includes(bikeIssueFilter);
  });

  const getCategoryMeta = () => {
    switch (category) {
      case 'MEDICAL':
        return {
          title: 'Medical emergency',
          subtitle: 'Accidents, injuries, trauma care & medical assistance',
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
          borderColor: 'border-red-500/50',
          Graphic: MedicalEmergencyGraphic
        };
      case 'BIKE_PROBLEM':
        return {
          title: 'Motorcycle breakdown',
          subtitle: 'Punctures, battery, chain, engine & roadside mechanics',
          badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          borderColor: 'border-[#FFF174]/40',
          Graphic: BikeBreakdownGraphic
        };
      case 'UNSAFE':
        return {
          title: 'Personal safety',
          subtitle: 'Immediate police dial, trusted contacts & safe public havens',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          borderColor: 'border-amber-500/50',
          Graphic: PersonalSafetyGraphic
        };
      case 'TOWING':
        return {
          title: 'Motorcycle towing',
          subtitle: 'Specialized 2-wheeler flatbeds, wheel clamps & mountain recovery',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          borderColor: 'border-blue-500/50',
          Graphic: TowingRecoveryGraphic
        };
      case 'NOT_SURE':
        return {
          title: 'Guided diagnosis & triage',
          subtitle: '3 quick questions to pinpoint the exact help you need',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          borderColor: 'border-purple-500/50',
          Graphic: GuidedTriageGraphic
        };
      case 'BOTH':
        return {
          title: 'Medical & bike recovery',
          subtitle: 'Personal safety prioritised first, followed by vehicle recovery',
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
          borderColor: 'border-red-500/60',
          Graphic: DualEmergencyGraphic
        };
      default:
        return {
          title: 'Emergency Assistance',
          subtitle: 'Select an emergency option',
          badgeColor: 'bg-white/10 text-white border-white/20',
          borderColor: 'border-white/20',
          Graphic: MedicalEmergencyGraphic
        };
    }
  };

  const meta = getCategoryMeta();
  const CategoryGraphic = meta.Graphic;

  return (
    <AnimatePresence>
      {isOpen && category && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-sheet-title"
        >
          {/* Backdrop with slight dimming & blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* Bottom Sheet on Mobile / Centered Compact Dialog on Desktop */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 400) {
                onClose();
              }
            }}
            className={`relative w-full sm:max-w-xl max-h-[85vh] sm:max-h-[85vh] bg-[#1D1D1D] border-t sm:border ${meta.borderColor} rounded-t-[32px] sm:rounded-3xl shadow-[0_-10px_50px_rgba(0,0,0,0.9)] z-10 flex flex-col overflow-hidden text-white`}
          >
            {/* Visual Touch Drag Handle */}
            <div className="pt-2.5 pb-1 flex justify-center sm:hidden cursor-grab active:cursor-grabbing shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-white/30 hover:bg-white/50 transition-colors" />
            </div>

            {/* Header: Title, Short Explanation & Close Button */}
            <div className="px-4 sm:px-6 py-3 border-b border-white/10 flex items-start justify-between gap-3 shrink-0 bg-[#252525]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 select-none">
                  <CategoryGraphic size={36} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 id="emergency-sheet-title" className="text-base sm:text-lg font-black text-white truncate tracking-tight">
                      {meta.title}
                    </h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeColor} hidden sm:inline-block shrink-0`}>
                      Live Actions
                    </span>
                  </div>
                  <p className="text-[11px] text-[#C5C5C5] mt-0.5 line-clamp-1">{meta.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs text-gray-300 font-bold flex items-center gap-1 transition-all cursor-pointer min-h-[38px]"
                  aria-label="Back to categories"
                >
                  <ArrowLeft size={14} className="text-[#FFF174]" />
                  <span className="hidden sm:inline">Categories</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                  aria-label="Close emergency overlay"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Overlay Body (Scroll happens INSIDE the sheet only) */}
            <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 space-y-4 pb-8 sm:pb-6">
              
              {/* ==============================================================
                  CATEGORY A: MEDICAL EMERGENCY
                  ============================================================== */}
              {category === 'MEDICAL' && (
                <div className="space-y-3.5">
                  {/* PRIMARY ACTION: CALL 112 PROMINENT BUTTON AT TOP */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 border-2 border-red-400 shadow-[0_0_25px_rgba(220,38,38,0.4)] text-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-100">
                        NATIONAL EMERGENCY RESPONSE
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                        Immediate Cellular Call
                      </span>
                    </div>

                    <a
                      ref={primaryActionRef}
                      href="tel:112"
                      className="w-full py-3.5 rounded-xl bg-white text-red-700 hover:bg-red-50 active:scale-98 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform cursor-pointer min-h-[50px]"
                      aria-label="Call 112 National Emergency"
                    >
                      <PhoneCall size={18} />
                      <span>Call 112 Now</span>
                    </a>
                    <span className="text-[11px] text-red-100/90 block text-center">
                      Works without internet, GPS or app registration.
                    </span>
                  </div>

                  {/* CRITICAL LIFE SAFETY GUIDELINE */}
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-red-300">
                      <AlertTriangle size={15} className="shrink-0 text-red-400" />
                      <span>Immediate Life Safety Steps</span>
                    </div>
                    <ul className="text-[11px] text-gray-200 list-disc list-inside space-y-0.5 leading-snug">
                      <li><strong>Move to safety</strong> off the roadway if safe to do so.</li>
                      <li><strong>Do NOT move an injured rider</strong> if spine/neck injury is suspected, unless in immediate fire/traffic danger.</li>
                      <li><strong>Keep helmet on</strong> unless breathing is obstructed.</li>
                    </ul>
                  </div>

                  {/* ACTION BUTTONS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Call 108 Ambulance */}
                    <a
                      href="tel:108"
                      className="p-3 rounded-xl bg-[#181818] hover:bg-[#222222] border border-red-500/40 flex items-center justify-between text-left cursor-pointer min-h-[52px]"
                      aria-label="Call 108 Govt Ambulance"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
                          108
                        </div>
                        <div>
                          <strong className="text-xs font-bold text-white block">Call 108 Ambulance</strong>
                          <span className="text-[10px] text-gray-400 block">Govt Medical Dispatch</span>
                        </div>
                      </div>
                      <PhoneCall size={15} className="text-red-400 shrink-0" />
                    </a>

                    {/* Share My Location */}
                    <button
                      type="button"
                      onClick={handleShareLocation}
                      className="p-3 rounded-xl bg-[#181818] hover:bg-[#222222] border border-white/15 flex items-center justify-between text-left cursor-pointer min-h-[52px]"
                      aria-label="Share location with emergency contacts"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Share2 size={16} />
                        </div>
                        <div>
                          <strong className="text-xs font-bold text-white block">
                            {copySuccess ? 'Copied to Clipboard!' : 'Share My Location'}
                          </strong>
                          <span className="text-[10px] text-gray-400 block">WhatsApp / SMS / Coordinates</span>
                        </div>
                      </div>
                      {copySuccess ? <Check size={16} className="text-emerald-400 shrink-0" /> : <ChevronRight size={16} className="text-gray-400 shrink-0" />}
                    </button>
                  </div>

                  {/* Contact Emergency Contact & Medical ID Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href="tel:+919876543210"
                      className="p-3 rounded-xl bg-[#181818] hover:bg-[#222222] border border-white/15 flex items-center justify-between text-left cursor-pointer min-h-[52px]"
                      aria-label="Call trusted emergency contact"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                          <PhoneCall size={16} />
                        </div>
                        <div>
                          <strong className="text-xs font-bold text-white block">Call Emergency Contact</strong>
                          <span className="text-[10px] text-gray-400 block">+91 98765 43210 (Family)</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 shrink-0" />
                    </a>

                    {onOpenMedicalId && (
                      <button
                        type="button"
                        onClick={onOpenMedicalId}
                        className="p-3 rounded-xl bg-[#181818] hover:bg-[#222222] border border-red-500/30 flex items-center justify-between text-left cursor-pointer min-h-[52px]"
                        aria-label="Open emergency medical ID card"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-300 flex items-center justify-center shrink-0">
                            <Heart size={16} />
                          </div>
                          <div>
                            <strong className="text-xs font-bold text-white block">View Medical ID</strong>
                            <span className="text-[10px] text-gray-400 block">Blood group, allergies & policy</span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 shrink-0" />
                      </button>
                    )}
                  </div>

                  {/* NEARBY HOSPITAL TRAUMA CENTRES */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                      <span className="flex items-center gap-1.5">
                        <Activity size={14} className="text-red-400" /> Nearby Hospital Trauma Facilities
                      </span>
                      <span className="text-[10px] text-gray-500">Verified 24/7 centers</span>
                    </div>

                    <div className="space-y-2">
                      {EMERGENCY_MEDICAL_PROVIDERS.map((prov) => (
                        <div
                          key={prov.id}
                          className="p-3 rounded-xl bg-[#181818] border border-white/10 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <strong className="text-white font-bold truncate">{prov.name}</strong>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 shrink-0">
                                {prov.badge}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400 block mt-0.5">
                              📍 {prov.distance} ({prov.eta}) • {prov.address}
                            </span>
                          </div>

                          <a
                            href={`tel:${prov.phone.replace(/[^0-9+]/g, '')}`}
                            className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase flex items-center gap-1 shrink-0 cursor-pointer min-h-[38px]"
                            aria-label={`Call ${prov.name}`}
                          >
                            <PhoneCall size={12} />
                            <span>Call</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  CATEGORY B: BIKE BREAKDOWN
                  ============================================================== */}
              {category === 'BIKE_PROBLEM' && (
                <div className="space-y-3.5">
                  {/* Selectable breakdown issue chips */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-gray-300 block">
                      Select your breakdown issue to find the nearest specialist:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                      {(
                        [
                          ['ALL', 'All Problems', Wrench],
                          ['TYRE', 'Puncture or tyre damage', Disc],
                          ['BATTERY', 'Battery or starting failure', BatteryCharging],
                          ['CHAIN', 'Chain or drivetrain issue', Activity],
                          ['ENGINE', 'Engine or electrical problem', Flame],
                          ['FUEL', 'Fuel shortage', Fuel],
                          ['OTHER', 'Unknown mechanical problem', HelpCircle]
                        ] as const
                      ).map(([key, label, IconComponent]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setBikeIssueFilter(key)}
                          className={`p-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer min-h-[42px] text-left text-xs ${
                            bikeIssueFilter === key
                              ? 'bg-[#FFF174] text-black shadow-md'
                              : 'bg-[#181818] text-gray-300 hover:bg-[#222222] border border-white/10'
                          }`}
                        >
                          <IconComponent size={14} className="shrink-0" />
                          <span className="truncate">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Immediate Shortcuts: Towing & Share Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectCategory('TOWING')}
                      className="p-3 rounded-xl bg-[#181818] hover:bg-[#222222] border border-blue-400/40 flex items-center justify-between text-left cursor-pointer min-h-[48px]"
                    >
                      <div className="flex items-center gap-2">
                        <Truck size={16} className="text-blue-400" />
                        <div>
                          <strong className="text-xs font-bold text-white block">Unrideable? Request Towing</strong>
                          <span className="text-[10px] text-gray-400 block">Flatbed & Mountain Winch</span>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-blue-400" />
                    </button>

                    <button
                      type="button"
                      onClick={handleShareLocation}
                      className="p-3 rounded-xl bg-[#181818] hover:bg-[#222222] border border-white/15 flex items-center justify-between text-left cursor-pointer min-h-[48px]"
                    >
                      <div className="flex items-center gap-2">
                        <Share2 size={16} className="text-emerald-400" />
                        <div>
                          <strong className="text-xs font-bold text-white block">
                            {copySuccess ? 'Coordinates Copied!' : 'Share Location With Mechanic'}
                          </strong>
                          <span className="text-[10px] text-gray-400 block">WhatsApp / Coordinates</span>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-gray-400" />
                    </button>
                  </div>

                  {/* NEARBY MOTORCYCLE MECHANICS LIST */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                      <span className="flex items-center gap-1.5">
                        <Wrench size={14} className="text-[#FFF174]" /> Nearby Motorcycle Mechanics & Workshops
                      </span>
                      <span className="text-[10px] text-gray-400">{filteredMechanical.length} available</span>
                    </div>

                    <div className="space-y-2">
                      {filteredMechanical.map((prov) => (
                        <div
                          key={prov.id}
                          className="p-3 rounded-xl bg-[#181818] border border-white/10 hover:border-[#FFF174]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-white font-bold">{prov.name}</strong>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                {prov.badge}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400 block mt-0.5">
                              📍 {prov.distance} away ({prov.eta}) • {prov.address}
                            </span>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {prov.services.slice(0, 3).map((s) => (
                                <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-300">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                            <a
                              href={`tel:${prov.phone.replace(/[^0-9+]/g, '')}`}
                              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 cursor-pointer min-h-[38px]"
                              aria-label={`Call ${prov.name}`}
                            >
                              <PhoneCall size={13} className="text-emerald-400" />
                              <span>Call</span>
                            </a>

                            <button
                              type="button"
                              disabled={dispatchPending}
                              onClick={() => handleDispatchAssistance(prov)}
                              className="px-3 py-2 rounded-lg bg-[#FFF174] hover:bg-yellow-400 disabled:opacity-50 text-black font-black text-xs uppercase cursor-pointer min-h-[38px]"
                            >
                              {dispatchPending ? '...' : 'Request'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dispatch confirmation feedback inside the overlay */}
                  {dispatchConfirmed && dispatchedProvider && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/70 text-emerald-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                        <CheckCircle2 size={16} />
                        <span>Rescue Request Initiated (#{createdRequestId})</span>
                      </div>
                      <p className="text-[11px] text-gray-300">
                        {serverDispatched
                          ? 'Server accepted your request. Provider notified.'
                          : 'Request saved in offline queue. Please call the provider directly using the call button.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ==============================================================
                  CATEGORY C: I FEEL UNSAFE
                  ============================================================== */}
              {category === 'UNSAFE' && (
                <div className="space-y-3.5">
                  {/* PRIMARY ACTION: CALL 112 POLICE AT TOP */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 border-2 border-red-400 shadow-[0_0_25px_rgba(220,38,38,0.4)] text-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-100">
                        HIGHWAY SAFETY ESCALATION
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                        Immediate Police Dispatch
                      </span>
                    </div>

                    <a
                      ref={primaryActionRef}
                      href="tel:112"
                      className="w-full py-3.5 rounded-xl bg-white text-red-700 hover:bg-red-50 active:scale-98 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform cursor-pointer min-h-[50px]"
                      aria-label="Call 112 Police Now"
                    >
                      <PhoneCall size={18} />
                      <span>Call 112 Police Now</span>
                    </a>
                  </div>

                  {/* IMMEDIATE SAFETY GUIDELINES */}
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <Shield size={15} className="shrink-0 text-amber-400" />
                      <span>Immediate Safety Instructions</span>
                    </div>
                    <ul className="text-[11px] text-gray-200 list-disc list-inside space-y-0.5 leading-snug">
                      <li><strong>Move toward light and people:</strong> Head to a well-lit petrol station or open shop.</li>
                      <li><strong>Keep helmet on and bike keys in hand.</strong></li>
                      <li><strong>Do not confront threatening individuals.</strong> Stay in plain sight of CCTV or public areas.</li>
                    </ul>
                  </div>

                  {/* 1-TAP DISTRESS ACTIONS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={getWhatsAppAlertUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] flex items-center justify-between transition-colors min-h-[52px]"
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle size={18} />
                        <div className="text-left">
                          <strong className="text-xs font-bold block text-white">Share Live Location</strong>
                          <span className="text-[10px] text-[#25D366]/90 block">WhatsApp Distress Alert</span>
                        </div>
                      </div>
                      <ExternalLink size={14} />
                    </a>

                    <a
                      href="tel:+919876543210"
                      className="p-3 rounded-xl bg-[#181818] hover:bg-[#222222] border border-white/20 text-white flex items-center justify-between transition-colors min-h-[52px]"
                    >
                      <div className="flex items-center gap-2">
                        <PhoneCall size={18} className="text-emerald-400" />
                        <div className="text-left">
                          <strong className="text-xs font-bold block">Call Trusted Contact</strong>
                          <span className="text-[10px] text-gray-400 block">+91 98765 43210</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-400" />
                    </a>
                  </div>

                  {/* SAFE HAVENS & POLICE STATIONS */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                      <span className="flex items-center gap-1.5">
                        <ShieldAlert size={14} className="text-amber-400" /> Safe Public Havens & Police Stations
                      </span>
                      <span className="text-[10px] text-gray-400">Well-lit corridors</span>
                    </div>

                    <div className="space-y-2">
                      {EMERGENCY_SAFETY_PROVIDERS.map((prov) => (
                        <div
                          key={prov.id}
                          className="p-3 rounded-xl bg-[#181818] border border-white/10 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-white font-bold">{prov.name}</strong>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300">
                                {prov.badge}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400 block mt-0.5">
                              📍 {prov.distance} • {prov.address}
                            </span>
                          </div>

                          <a
                            href={`tel:${prov.phone}`}
                            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 min-h-[38px] shrink-0"
                          >
                            <PhoneCall size={12} className="text-red-400" />
                            <span>Call</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ==============================================================
                  CATEGORY D: I NEED TOWING
                  ============================================================== */}
              {category === 'TOWING' && (
                <div className="space-y-3.5">
                  {/* PRIMARY ACTION: CALL TOW TRUCK OPERATOR DIRECTLY */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 border-2 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.35)] text-white space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-100 block">
                      SPECIALIZED MOTORCYCLE FLATBED RECOVERY
                    </span>

                    <a
                      ref={primaryActionRef}
                      href="tel:+919733099887"
                      className="w-full py-3.5 rounded-xl bg-white text-blue-800 hover:bg-blue-50 active:scale-98 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform cursor-pointer min-h-[50px]"
                      aria-label="Call Tow Truck Driver Directly"
                    >
                      <PhoneCall size={18} />
                      <span>Call Tow Truck (+91 97330 99887)</span>
                    </a>
                    <span className="text-[11px] text-blue-100/90 block text-center">
                      Wheel-chock clamps, soft tie-down straps & 5-ton winch equipped.
                    </span>
                  </div>

                  {/* Location & Vehicle Options */}
                  <div className="p-3 rounded-xl bg-[#181818] border border-white/10 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-bold text-gray-300 flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#FFF174]" /> Pickup Location:
                      </span>
                      {onOpenLandmarkSearch && (
                        <button
                          type="button"
                          onClick={onOpenLandmarkSearch}
                          className="text-[#FFF174] font-bold underline cursor-pointer"
                        >
                          Change Landmark
                        </button>
                      )}
                    </div>
                    <span className="text-gray-300 block text-[11px]">
                      {coords ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : address || 'GPS not active — will verify landmark via cellular'}
                    </span>

                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <label htmlFor="sheetTowingModel" className="font-bold text-gray-300 block text-[11px]">
                        Motorcycle Model / Category:
                      </label>
                      <input
                        id="sheetTowingModel"
                        type="text"
                        value={towingBikeModel}
                        onChange={(e) => setTowingBikeModel(e.target.value)}
                        placeholder="e.g. Royal Enfield Himalayan 450, KTM 390..."
                        className="w-full bg-[#121212] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                      />

                      <label className="flex items-center gap-2 cursor-pointer text-gray-300 pt-1 text-[11px]">
                        <input
                          type="checkbox"
                          checked={towingWinchNeeded}
                          onChange={(e) => setTowingWinchNeeded(e.target.checked)}
                          className="rounded accent-blue-500 w-4 h-4"
                        />
                        <span>Motorcycle is off-road / in ditch (Mountain winch needed)</span>
                      </label>
                    </div>

                    <button
                      type="button"
                      disabled={dispatchPending}
                      onClick={() => handleDispatchAssistance(EMERGENCY_TOWING_PROVIDERS[0])}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                    >
                      <Truck size={15} />
                      <span>{dispatchPending ? 'Coordinating...' : 'Request Towing Dispatch'}</span>
                    </button>
                  </div>

                  {/* Dispatch confirmation note */}
                  {dispatchConfirmed && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/70 text-emerald-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                        <CheckCircle2 size={16} />
                        <span>Towing Request Logged (#{createdRequestId})</span>
                      </div>
                      <p className="text-[11px] text-gray-300">
                        {serverDispatched
                          ? 'Server confirmed coordinates. Driver preparing departure.'
                          : 'Saved in offline queue. Please call the driver directly via cellular network above.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ==============================================================
                  CATEGORY E: I'M NOT SURE (GUIDED TRIAGE)
                  ============================================================== */}
              {category === 'NOT_SURE' && (
                <div className="space-y-3.5">
                  {/* Emergency Continuous Dial */}
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center justify-between gap-2 text-xs">
                    <span className="text-red-200">Injured or acute danger?</span>
                    <a
                      href="tel:112"
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase shrink-0"
                    >
                      Call 112
                    </a>
                  </div>

                  {/* Progressive Guided Questions (One at a time) */}
                  <div className="p-4 rounded-2xl bg-[#181818] border border-purple-500/30 space-y-3 text-xs">
                    <div className="flex items-center justify-between text-purple-300 font-bold border-b border-white/10 pb-2">
                      <span>Step {triageStep} of 3</span>
                      <span className="text-[10px] text-gray-400">Tap to identify problem</span>
                    </div>

                    {/* Question 1: Injury */}
                    {triageStep === 1 && (
                      <div className="space-y-2.5 animate-in fade-in duration-150">
                        <label className="text-sm font-bold text-white block">
                          1. Is anyone injured or in immediate danger?
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectCategory('MEDICAL')}
                            className="flex-1 py-3.5 px-3 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white cursor-pointer min-h-[46px] text-xs flex items-center justify-center gap-1.5"
                          >
                            <span>🚑 YES — Someone is injured</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTriageStep(2)}
                            className="flex-1 py-3.5 px-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-gray-200 border border-white/15 cursor-pointer min-h-[46px] text-xs flex items-center justify-center gap-1.5"
                          >
                            <span>✅ NO — Everyone is safe</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Question 2: Bike mobility */}
                    {triageStep === 2 && (
                      <div className="space-y-2.5 animate-in fade-in duration-150">
                        <label className="text-sm font-bold text-white block">
                          2. Can the motorcycle roll safely in neutral?
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectCategory('TOWING')}
                            className="flex-1 py-3.5 px-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer min-h-[46px] text-xs flex items-center justify-center gap-1.5"
                          >
                            <span>🚚 NO — Wheels locked / Needs Towing</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTriageStep(3)}
                            className="flex-1 py-3.5 px-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-gray-200 border border-white/15 cursor-pointer min-h-[46px] text-xs flex items-center justify-center gap-1.5"
                          >
                            <span>✅ YES — Rolls freely</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTriageStep(1)}
                          className="text-[11px] text-gray-400 underline block pt-1"
                        >
                          ← Back to question 1
                        </button>
                      </div>
                    )}

                    {/* Question 3: Starting / Electrical issue */}
                    {triageStep === 3 && (
                      <div className="space-y-2.5 animate-in fade-in duration-150">
                        <label className="text-sm font-bold text-white block">
                          3. What is the main issue you notice?
                        </label>
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setBikeIssueFilter('ENGINE');
                              onSelectCategory('BIKE_PROBLEM');
                            }}
                            className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left font-medium text-gray-200 cursor-pointer min-h-[44px] flex items-center justify-between"
                          >
                            <span>Engine cranks, but won't start (Fuel / Spark)</span>
                            <ChevronRight size={15} className="text-[#FFF174]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBikeIssueFilter('BATTERY');
                              onSelectCategory('BIKE_PROBLEM');
                            }}
                            className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left font-medium text-gray-200 cursor-pointer min-h-[44px] flex items-center justify-between"
                          >
                            <span>Complete electrical silence or clicking (Battery / Fuse)</span>
                            <ChevronRight size={15} className="text-[#FFF174]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBikeIssueFilter('TYRE');
                              onSelectCategory('BIKE_PROBLEM');
                            }}
                            className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left font-medium text-gray-200 cursor-pointer min-h-[44px] flex items-center justify-between"
                          >
                            <span>Flat tyre / Puncture</span>
                            <ChevronRight size={15} className="text-[#FFF174]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBikeIssueFilter('CHAIN');
                              onSelectCategory('BIKE_PROBLEM');
                            }}
                            className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left font-medium text-gray-200 cursor-pointer min-h-[44px] flex items-center justify-between"
                          >
                            <span>Chain came off or strange mechanical noise</span>
                            <ChevronRight size={15} className="text-[#FFF174]" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTriageStep(2)}
                          className="text-[11px] text-gray-400 underline block pt-1"
                        >
                          ← Back to question 2
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==============================================================
                  CATEGORY F: NEED BOTH (MEDICAL & BIKE)
                  ============================================================== */}
              {category === 'BOTH' && (
                <div className="space-y-3.5">
                  {/* SECTION 1: PERSONAL SAFETY & MEDICAL ACTIONS (TOP PRIORITY) */}
                  <div className="p-4 rounded-2xl bg-red-950/40 border-2 border-red-500 text-white space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <strong className="text-xs font-black uppercase text-red-300 tracking-wider">
                        PRIORITY 1: PERSONAL SAFETY & MEDICAL
                      </strong>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a
                        ref={primaryActionRef}
                        href="tel:112"
                        className="py-3 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase flex items-center justify-center gap-1.5 min-h-[46px]"
                      >
                        <PhoneCall size={15} />
                        <span>Call 112 National Police / EMS</span>
                      </a>

                      <a
                        href="tel:108"
                        className="py-3 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 min-h-[46px]"
                      >
                        <PhoneCall size={15} />
                        <span>Call 108 Ambulance</span>
                      </a>
                    </div>

                    <div className="text-[11px] text-gray-300 leading-relaxed border-t border-red-500/30 pt-2">
                      Hospital: Neotia Getwel Trauma: <a href="tel:+913533058888" className="text-red-300 underline font-bold">+91 353 305 8888</a>
                    </div>
                  </div>

                  {/* SECTION 2: MOTORCYCLE RECOVERY & TOWING (SECONDARY) */}
                  <div className="p-4 rounded-2xl bg-[#181818] border border-blue-400/40 text-white space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-blue-400" />
                      <strong className="text-xs font-black uppercase text-blue-300 tracking-wider">
                        PRIORITY 2: MOTORCYCLE RECOVERY & TOWING
                      </strong>
                    </div>

                    <p className="text-[11px] text-gray-300 leading-snug">
                      Flatbed tow truck with mountain winch can transport your bike to an authorized workshop while you receive medical care.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <a
                        href="tel:+919733099887"
                        className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 min-h-[44px] flex-1"
                      >
                        <PhoneCall size={15} />
                        <span>Call Tow Truck (+91 97330 99887)</span>
                      </a>

                      <button
                        type="button"
                        disabled={dispatchPending}
                        onClick={() => handleDispatchAssistance(EMERGENCY_TOWING_PROVIDERS[0])}
                        className="py-3 px-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-bold text-xs uppercase min-h-[44px]"
                      >
                        {dispatchPending ? '...' : 'Request Towing Dispatch'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
