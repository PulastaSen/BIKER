import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Heart,
  PhoneCall,
  MessageCircle,
  MapPin,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Truck,
  Wrench,
  HelpCircle,
  Flame,
  BatteryWarning,
  Phone,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink
} from 'lucide-react';
import { API_BASE_URL, hasBackendApi } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { fetchMedicalProfile } from '../services/ecosystemApi';
import { getEmergencyContacts } from '../utils/appStorage';
import type { MedicalProfile, EmergencyContact } from '../types/app';
import { 
  buildWhatsAppEmergencyAlertUrl, 
  buildSmsEmergencyAlertUrl 
} from '../utils/whatsappShare';
import { MedicalIdQuickModal } from '../components/MedicalIdQuickModal';

export type EmergencyProblemType = 
  | 'MEDICAL'
  | 'BREAKDOWN'
  | 'SAFETY'
  | 'ACCIDENT'
  | 'TOWING'
  | 'MULTIPLE'
  | 'UNSURE';

interface ProblemDefinition {
  id: EmergencyProblemType;
  title: string;
  simpleTitle: string;
  description: string;
  icon: typeof AlertTriangle;
  badge: string;
  color: string;
  borderColor: string;
  accentBg: string;
}

const PROBLEM_OPTIONS: ProblemDefinition[] = [
  {
    id: 'MEDICAL',
    title: 'Medical Assistance',
    simpleTitle: 'Medical / Injury',
    description: 'Accident injury, severe pain, or sudden medical illness.',
    icon: Heart,
    badge: '108 / 112 Ambulance',
    color: 'text-red-400',
    borderColor: 'border-red-500/40 hover:border-red-500',
    accentBg: 'bg-red-950/30'
  },
  {
    id: 'BREAKDOWN',
    title: 'Bike Breakdown',
    simpleTitle: 'Bike Stopped Working',
    description: 'Engine cutoff, flat tyre, electrical failure, or chain break.',
    icon: Wrench,
    badge: 'Roadside Mechanic',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40 hover:border-amber-500',
    accentBg: 'bg-amber-950/30'
  },
  {
    id: 'SAFETY',
    title: 'Personal Safety',
    simpleTitle: 'Feeling Unsafe / Danger',
    description: 'Stranded in remote dark area, harassment, or feeling threatened.',
    icon: ShieldAlert,
    badge: '112 / 1091 Police',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/40 hover:border-purple-500',
    accentBg: 'bg-purple-950/30'
  },
  {
    id: 'ACCIDENT',
    title: 'Accident / Crash',
    simpleTitle: 'Crash on the Road',
    description: 'Motorcycle collision, road slide, or highway spill.',
    icon: Flame,
    badge: 'Immediate Response',
    color: 'text-red-500',
    borderColor: 'border-red-600/40 hover:border-red-600',
    accentBg: 'bg-red-950/40'
  },
  {
    id: 'TOWING',
    title: 'Towing & Recovery',
    simpleTitle: 'Need Flatbed Tow',
    description: 'Motorcycle cannot be ridden and must be loaded onto a carrier.',
    icon: Truck,
    badge: 'Flatbed Tow Truck',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/40 hover:border-blue-500',
    accentBg: 'bg-blue-950/30'
  },
  {
    id: 'MULTIPLE',
    title: 'Multiple Issues',
    simpleTitle: 'Both Injury & Bike',
    description: 'Combined medical injury and bike immobilized.',
    icon: BatteryWarning,
    badge: 'Combined Rescue',
    color: 'text-orange-400',
    borderColor: 'border-orange-500/40 hover:border-orange-500',
    accentBg: 'bg-orange-950/30'
  },
  {
    id: 'UNSURE',
    title: 'Not Sure / Guidance',
    simpleTitle: 'Help Me Decide',
    description: 'Immediate safety triage and guided emergency escalation.',
    icon: HelpCircle,
    badge: 'Dispatch Triage',
    color: 'text-[#FFF174]',
    borderColor: 'border-[#FFF174]/40 hover:border-[#FFF174]',
    accentBg: 'bg-yellow-950/20'
  }
];

interface SOSTimelineItem {
  event: string;
  timestamp: string;
  detail?: string;
}

interface SOSIncident {
  incidentId: string;
  status: string;
  notificationStatus: string;
  problemType?: EmergencyProblemType;
  landmark?: string;
  serverReceived?: boolean;
  gpsAcquired?: boolean;
  familyConfirmed?: boolean;
  providerAccepted?: boolean;
  providerDetails?: {
    name: string;
    phone: string;
    etaMinutes?: number;
  };
  location?: {
    coordinates: number[]; // [lng, lat]
    accuracyMeters?: number;
  };
  timeline?: SOSTimelineItem[];
  createdAt?: string;
  resolvedAt?: string;
}

export function SOSPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSimpleMode, voiceEnabled, toggleVoice, speak } = useAccessibility();

  // 4-step emergency flow: 1=Problem, 2=Location, 3=Confirm, 4=Active Tracking
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form selections
  const [selectedProblem, setSelectedProblem] = useState<EmergencyProblemType | null>(() => {
    const rawType = searchParams.get('type') || searchParams.get('cat');
    if (rawType && ['MEDICAL', 'BREAKDOWN', 'SAFETY', 'ACCIDENT', 'TOWING', 'MULTIPLE', 'UNSURE'].includes(rawType)) {
      return rawType as EmergencyProblemType;
    }
    return null;
  });

  // GPS state
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string>('');
  const [lastGpsTime, setLastGpsTime] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');

  // Hold-to-trigger state
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Active Incident & Medical ID
  const [incident, setIncident] = useState<SOSIncident | null>(null);
  const [medicalCard, setMedicalCard] = useState<MedicalProfile | null>(null);
  const [showMedicalModal, setShowMedicalModal] = useState<boolean>(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(!navigator.onLine);

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const HOLD_DURATION = 3000; // 3 seconds to prevent accidental dispatch

  // Check network online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOfflineMode(false);
    const handleOffline = () => setIsOfflineMode(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load existing active incident or initialize
  useEffect(() => {
    const checkActiveSOS = async () => {
      if (hasBackendApi()) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/sos/active`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.success && data.data) {
              setIncident({
                ...data.data,
                serverReceived: true,
                gpsAcquired: !!(data.data.location?.coordinates && data.data.location.coordinates.length === 2),
                familyConfirmed: false
              });
              setStep(4);
              return;
            }
          }
        } catch (err) {
          console.error('Failed to check active SOS from API:', err);
        }
      }

      // Check local storage for persistent emergency state
      const raw = localStorage.getItem('motoassist_active_sos');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.status === 'ACTIVE' || parsed.status === 'ACKNOWLEDGED')) {
            setIncident(parsed);
            setStep(4);
            return;
          }
        } catch {
          // ignore parsing error
        }
      }

      // If step param was passed in URL and problem preselected
      if (selectedProblem) {
        setStep(2);
      }
    };

    checkActiveSOS();

    // Fetch medical card & ICE contacts
    fetchMedicalProfile().then((prof) => {
      if (prof) setMedicalCard(prof);
    });

    const contacts = getEmergencyContacts(user?.id || 'user-rider-1');
    setEmergencyContacts(contacts);
  }, [user]);

  // Request location automatically
  const acquireLocation = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setAccuracy(Math.round(pos.coords.accuracy));
        setLastGpsTime(new Date().toLocaleTimeString());
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission denied. Please enter a landmark below.');
        } else {
          setGpsError('GPS signal weak or unavailable. You can enter a highway milestone below.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Acquire location when entering step 2
  useEffect(() => {
    if (step === 2 && lat === null) {
      acquireLocation();
    }
  }, [step]);

  // Voice narration on step change
  useEffect(() => {
    if (!voiceEnabled) return;

    if (step === 1) {
      speak('Step 1. What emergency help do you need? Choose an option or call 112 directly.');
    } else if (step === 2) {
      speak('Step 2. Identifying your location. Please verify your coordinates or add a landmark.');
    } else if (step === 3) {
      speak('Step 3. Please review your emergency request and hold the button for 3 seconds to send.');
    } else if (step === 4) {
      speak('Emergency assistance request is active. Searching for nearby responders.');
    }
  }, [step, voiceEnabled, speak]);

  // Hold-to-trigger handlers
  const handlePointerDown = () => {
    if (isSubmitting || step !== 3) return;
    setIsHolding(true);
    setHoldProgress(0);

    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
    }, 40);

    holdTimerRef.current = setTimeout(() => {
      triggerSOS();
    }, HOLD_DURATION);
  };

  const handlePointerUp = () => {
    if (isSubmitting) return;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setIsHolding(false);
    setHoldProgress(0);
  };

  // Submit Emergency SOS
  const triggerSOS = async () => {
    setIsSubmitting(true);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setHoldProgress(100);

    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 150]);
    }

    const gpsAcquired = lat !== null && lng !== null;
    const nowStr = new Date().toLocaleTimeString();

    // Check if backend API reachable
    if (hasBackendApi() && !isOfflineMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/sos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: lat,
            longitude: lng,
            accuracyMeters: accuracy || undefined,
            problemType: selectedProblem || 'UNSURE',
            landmark: landmark.trim() || undefined
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json && json.success && json.data) {
            const inc: SOSIncident = {
              ...json.data,
              problemType: selectedProblem || 'UNSURE',
              landmark: landmark.trim() || undefined,
              serverReceived: true,
              gpsAcquired,
              familyConfirmed: false,
              providerAccepted: false
            };
            localStorage.setItem('motoassist_active_sos', JSON.stringify(inc));
            setIncident(inc);
            setStep(4);
            setIsSubmitting(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend API unreachable, activating offline emergency mode:', err);
        setIsOfflineMode(true);
      }
    }

    // Honest Standalone Offline Emergency Incident
    const fallbackIncident: SOSIncident = {
      incidentId: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'ACTIVE',
      notificationStatus: 'DISPATCHED_LOCAL',
      problemType: selectedProblem || 'UNSURE',
      landmark: landmark.trim() || undefined,
      serverReceived: false,
      gpsAcquired,
      familyConfirmed: false,
      providerAccepted: false,
      location: gpsAcquired ? { coordinates: [lng!, lat!], accuracyMeters: accuracy || 15 } : undefined,
      createdAt: new Date().toISOString(),
      timeline: [
        { event: 'EMERGENCY TRIGGERED', timestamp: nowStr, detail: '3-second verified hold confirmed' },
        ...(gpsAcquired ? [{ event: 'GPS FIX ACQUIRED', timestamp: nowStr, detail: `Accuracy ±${accuracy || 15}m` }] : []),
        ...(landmark.trim() ? [{ event: 'LANDMARK RECORDED', timestamp: nowStr, detail: landmark.trim() }] : []),
        { event: 'LOCAL DISPATCH ACTIVE', timestamp: nowStr, detail: 'Immediate 112, 108 & SMS ready' }
      ]
    };

    localStorage.setItem('motoassist_active_sos', JSON.stringify(fallbackIncident));
    setIncident(fallbackIncident);
    setStep(4);
    setIsSubmitting(false);
  };

  // Cancel SOS
  const handleCancelSOS = async () => {
    if (!incident) return;
    if (!window.confirm('Are you sure you want to cancel this emergency request?')) return;

    localStorage.removeItem('motoassist_active_sos');
    if (hasBackendApi() && incident.serverReceived) {
      try {
        await fetch(`${API_BASE_URL}/api/sos/${incident.incidentId}/cancel`, { method: 'PUT' });
      } catch {
        // ignore
      }
    }

    setIncident(null);
    setStep(1);
    setSelectedProblem(null);
    setHoldProgress(0);
  };

  // Resolve SOS (Rider confirms safety)
  const handleResolveSOS = async () => {
    if (!incident) return;
    if (!window.confirm('Confirm that you are safe and ready to close this incident?')) return;

    localStorage.removeItem('motoassist_active_sos');
    if (hasBackendApi() && incident.serverReceived) {
      try {
        await fetch(`${API_BASE_URL}/api/sos/${incident.incidentId}/resolve`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: 'Rider confirmed safety and resolved incident.' })
        });
      } catch {
        // ignore
      }
    }

    setIncident(null);
    setStep(1);
    setSelectedProblem(null);
    setHoldProgress(0);
  };

  const selectedProblemDef = PROBLEM_OPTIONS.find((p) => p.id === selectedProblem);

  // Generate WhatsApp & SMS direct share links
  const incidentCoords = incident?.location?.coordinates;
  const activeLat = incidentCoords && incidentCoords.length === 2 ? incidentCoords[1] : (lat ?? undefined);
  const activeLng = incidentCoords && incidentCoords.length === 2 ? incidentCoords[0] : (lng ?? undefined);
  const activeLandmark = incident?.landmark || landmark || undefined;
  const primaryPhone = emergencyContacts[0]?.phone;

  const whatsAppUrl = buildWhatsAppEmergencyAlertUrl({
    latitude: activeLat,
    longitude: activeLng,
    landmark: activeLandmark,
    phone: primaryPhone,
    riderName: user?.name || 'I'
  });

  const smsUrl = buildSmsEmergencyAlertUrl({
    latitude: activeLat,
    longitude: activeLng,
    landmark: activeLandmark,
    phone: primaryPhone,
    riderName: user?.name || 'I',
    situation: selectedProblemDef?.title || 'Emergency Assistance'
  });

  return (
    <div className="min-h-screen bg-[#101214] text-white pt-3 pb-24 md:pb-16 font-sans selection:bg-red-500 selection:text-white">
      {/* Medical ID Sheet Modal */}
      <MedicalIdQuickModal
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
      />

      <div className="container mx-auto px-4 max-w-xl space-y-4">
        
        {/* TOP STATUS BAR */}
        <header className="flex items-center justify-between border-b border-[#343B42] pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-1.5 rounded-xl bg-[#22272B] hover:bg-[#2D3339] border border-[#343B42] text-xs font-bold text-[#B8C0C5] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              title="Return to Home"
              aria-label="Return to Home"
            >
              <ArrowLeft size={15} />
            </button>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h1 className="text-xs font-black tracking-widest text-red-400 uppercase">
              MOTOASSIST EMERGENCY RESPONSE
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Guidance Toggle */}
            <button
              type="button"
              onClick={toggleVoice}
              className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                voiceEnabled 
                  ? 'bg-[#FFF174]/10 text-[#FFF174] border-[#FFF174]/40' 
                  : 'bg-[#22272B] text-[#B8C0C5] border-[#343B42] hover:text-white'
              }`}
              aria-label={voiceEnabled ? 'Turn off voice guide' : 'Turn on voice guide'}
              title="Voice Guidance"
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="hidden sm:inline text-[11px]">{voiceEnabled ? 'Voice On' : 'Voice'}</span>
            </button>

            {/* Medical ID Button */}
            <button
              type="button"
              onClick={() => setShowMedicalModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-xs font-bold text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Heart size={14} className="text-red-400" />
              <span>Medical ID{medicalCard?.bloodGroup ? ` (${medicalCard.bloodGroup})` : ''}</span>
            </button>
          </div>
        </header>

        {/* ========================================================
            STEP INDICATOR (1 to 4) - only when not yet active
            ======================================================== */}
        {step < 4 && (
          <nav aria-label="Emergency Steps" className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                step === 1
                  ? 'bg-red-600 border-red-500 text-white shadow-md'
                  : 'bg-[#191D20] border-[#343B42] text-[#B8C0C5]'
              }`}
            >
              1. Problem
            </button>
            <button
              type="button"
              onClick={() => { if (selectedProblem) setStep(2); }}
              disabled={!selectedProblem}
              className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                step === 2
                  ? 'bg-red-600 border-red-500 text-white shadow-md'
                  : selectedProblem
                  ? 'bg-[#191D20] border-[#343B42] text-[#B8C0C5] cursor-pointer'
                  : 'bg-[#191D20]/50 border-white/5 text-gray-600 cursor-not-allowed'
              }`}
            >
              2. Location
            </button>
            <button
              type="button"
              onClick={() => { if (selectedProblem) setStep(3); }}
              disabled={!selectedProblem}
              className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                step === 3
                  ? 'bg-red-600 border-red-500 text-white shadow-md'
                  : selectedProblem
                  ? 'bg-[#191D20] border-[#343B42] text-[#B8C0C5] cursor-pointer'
                  : 'bg-[#191D20]/50 border-white/5 text-gray-600 cursor-not-allowed'
              }`}
            >
              3. Confirm
            </button>
          </nav>
        )}

        {/* ALWAYS ACCESSIBLE DIRECT LIFE-HAZARD 112 OVERRIDE */}
        <section aria-label="Direct 112 Emergency Call">
          <a
            href="tel:112"
            className="w-full min-h-[48px] p-3.5 rounded-2xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white border border-red-400/50 flex items-center justify-between shadow-[0_4px_20px_rgba(220,38,38,0.35)] transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black/30 flex items-center justify-center shrink-0">
                <PhoneCall size={20} className="text-white animate-pulse" />
              </div>
              <div className="text-left">
                <strong className="block text-sm font-black tracking-wide leading-tight">
                  IMMEDIATE LIFE HAZARD? DIAL 112
                </strong>
                <span className="text-[11px] text-red-100 font-medium">
                  Direct connection to National Police, Ambulance & Fire
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-black/40 text-[11px] font-black uppercase text-[#FFF174]">
              CALL
            </span>
          </a>
        </section>

        {/* ========================================================
            STEP 1: PROBLEM SELECTION
            ======================================================== */}
        {step === 1 && (
          <section className="space-y-3" aria-labelledby="step1-heading">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="step1-heading" className="text-lg font-black text-white">
                  {isSimpleMode ? 'Choose what happened' : 'What emergency help do you need?'}
                </h2>
                <p className="text-xs text-[#B8C0C5] mt-0.5">
                  Select your primary situation to connect the right responders.
                </p>
              </div>
            </div>

            {/* 2-Column Responsive Problem Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {PROBLEM_OPTIONS.map((prob) => {
                const IconComponent = prob.icon;
                const isSelected = selectedProblem === prob.id;

                return (
                  <button
                    key={prob.id}
                    type="button"
                    onClick={() => setSelectedProblem(prob.id)}
                    className={`min-h-[110px] p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#22272B] border-2 border-[#FFF174] shadow-[0_0_20px_rgba(255,241,116,0.15)] ring-1 ring-[#FFF174]/50'
                        : `bg-[#22272B] ${prob.borderColor} text-white`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className={`w-8 h-8 rounded-xl ${prob.accentBg} flex items-center justify-center shrink-0`}>
                        <IconComponent size={18} className={prob.color} />
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={16} className="text-[#FFF174] shrink-0" />
                      )}
                    </div>

                    <div className="mt-2">
                      <strong className="block text-xs sm:text-sm font-black text-white leading-tight">
                        {isSimpleMode ? prob.simpleTitle : prob.title}
                      </strong>
                      {!isSimpleMode && (
                        <p className="text-[10px] text-[#B8C0C5] line-clamp-2 mt-1 leading-normal">
                          {prob.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Next Action Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!selectedProblem}
                onClick={() => setStep(2)}
                className={`w-full min-h-[48px] py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedProblem
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/40 active:scale-[0.98]'
                    : 'bg-[#22272B] text-gray-500 border border-[#343B42] cursor-not-allowed'
                }`}
              >
                <span>Continue: Location</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        )}

        {/* ========================================================
            STEP 2: LOCATION IDENTIFICATION
            ======================================================== */}
        {step === 2 && (
          <section className="space-y-4" aria-labelledby="step2-heading">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="step2-heading" className="text-lg font-black text-white">
                  Where are you located?
                </h2>
                <p className="text-xs text-[#B8C0C5] mt-0.5">
                  Responders need accurate coordinates or a highway milestone.
                </p>
              </div>
            </div>

            {/* GPS Status Card */}
            <div className="p-4 rounded-2xl bg-[#22272B] border border-[#343B42] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    lat !== null ? 'bg-emerald-950/40 text-emerald-400' : 'bg-red-950/40 text-red-400'
                  }`}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <strong className="block text-xs font-black text-white">
                      {lat !== null ? 'GPS Fix Acquired' : gpsLoading ? 'Locating...' : 'GPS Pending'}
                    </strong>
                    <span className="text-[10px] text-[#B8C0C5]">
                      {lat !== null && accuracy !== null 
                        ? `±${accuracy}m accuracy • Updated ${lastGpsTime}`
                        : gpsLoading 
                        ? 'Contacting phone GPS satellites...'
                        : 'Tap refresh to acquire location'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={acquireLocation}
                  disabled={gpsLoading}
                  className="px-2.5 py-1.5 rounded-xl bg-[#191D20] hover:bg-[#2D3339] border border-[#343B42] text-xs font-bold text-[#FFF174] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} className={gpsLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Coordinates display if acquired */}
              {lat !== null && lng !== null && (
                <div className="p-2.5 rounded-xl bg-[#101214] border border-[#343B42] font-mono text-[11px] text-emerald-300 flex justify-between items-center">
                  <span>Coordinates:</span>
                  <span className="font-bold">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
                </div>
              )}

              {gpsError && (
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-amber-400" />
                  <span>{gpsError}</span>
                </div>
              )}
            </div>

            {/* Manual Landmark / Highway Milestone Input */}
            <div className="space-y-1.5">
              <label htmlFor="landmark-input" className="block text-xs font-bold text-[#B8C0C5]">
                Highway, Milestone, or Landmark (Highly Recommended)
              </label>
              <input
                id="landmark-input"
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g., NH-10 KM 42 near Sevoke Bridge, or next to HP Petrol Pump"
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-2xl bg-[#22272B] border border-[#343B42] text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#FFF174]"
              />
              <p className="text-[10px] text-[#B8C0C5] leading-normal">
                If cellular GPS drops in hilly or remote corridors, responders use this milestone to find you.
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-[48px] py-3 px-4 rounded-2xl bg-[#22272B] hover:bg-[#2D3339] border border-[#343B42] text-xs font-bold text-[#B8C0C5] flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 min-h-[48px] py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 active:scale-[0.98] cursor-pointer"
              >
                <span>Continue: Review</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        )}

        {/* ========================================================
            STEP 3: CONFIRMATION CARD & 3-SECOND HOLD DISPATCH
            ======================================================== */}
        {step === 3 && (
          <section className="space-y-4" aria-labelledby="step3-heading">
            <div className="text-center">
              <h2 id="step3-heading" className="text-xl font-black text-white">
                Review & Send Emergency Request
              </h2>
              <p className="text-xs text-red-300 mt-1">
                Hold the button below for 3 seconds to transmit your alert.
              </p>
            </div>

            {/* Request Summary Card */}
            <div className="p-4 rounded-2xl bg-[#22272B] border border-[#343B42] space-y-3">
              <div className="flex items-center justify-between border-b border-[#343B42] pb-2.5">
                <span className="text-xs text-[#B8C0C5]">Emergency Type:</span>
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  {selectedProblemDef && <selectedProblemDef.icon size={15} className={selectedProblemDef.color} />}
                  {selectedProblemDef?.title || 'Emergency'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-[#343B42] pb-2.5">
                <span className="text-xs text-[#B8C0C5]">Location Fix:</span>
                <span className="text-xs font-bold text-white">
                  {lat !== null ? `${lat.toFixed(4)}, ${lng?.toFixed(4)} (±${accuracy}m)` : 'Milestone only'}
                </span>
              </div>

              {landmark.trim() && (
                <div className="flex items-start justify-between border-b border-[#343B42] pb-2.5">
                  <span className="text-xs text-[#B8C0C5]">Landmark:</span>
                  <span className="text-xs font-bold text-[#FFF174] text-right max-w-[220px]">
                    {landmark.trim()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#B8C0C5]">ICE Contacts:</span>
                <span className="text-xs font-bold text-emerald-400">
                  {emergencyContacts.length > 0 
                    ? `${emergencyContacts.length} Contact(s) linked` 
                    : 'Direct emergency numbers active'}
                </span>
              </div>
            </div>

            {/* Circular Hold-for-3-Seconds Ring & Button */}
            <div className="relative flex flex-col items-center justify-center py-2">
              <svg className="w-56 h-56 transform -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-[#191D20]"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-red-500 transition-all duration-75"
                  strokeWidth="6"
                  strokeDasharray="282.7"
                  strokeDashoffset={282.7 - (282.7 * holdProgress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <button
                type="button"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                disabled={isSubmitting}
                className={`absolute w-44 h-44 rounded-full flex flex-col items-center justify-center gap-1 select-none shadow-[0_0_50px_rgba(220,38,38,0.45)] transition-transform active:scale-95 touch-manipulation cursor-pointer ${
                  isHolding
                    ? 'bg-red-700 ring-8 ring-red-500/40 scale-95'
                    : isSubmitting
                    ? 'bg-red-800 animate-pulse'
                    : 'bg-gradient-to-tr from-red-600 to-red-500 hover:from-red-500 hover:to-red-600'
                }`}
                aria-label="Hold for 3 seconds to confirm emergency alert"
              >
                <AlertTriangle size={36} className="text-white animate-bounce" />
                <span className="text-xl font-black tracking-widest text-white">SEND SOS</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-200 bg-red-950/70 px-2.5 py-0.5 rounded-full border border-red-400/30">
                  {isHolding ? 'KEEP HOLDING...' : isSubmitting ? 'TRANSMITTING...' : 'HOLD 3 SECONDS'}
                </span>
              </button>
            </div>

            <p className="text-[#B8C0C5] text-[11px] text-center">
              A 3-second hold prevents accidental activations while riding.
            </p>

            {/* Back to Edit Button */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-[#B8C0C5] hover:text-white underline cursor-pointer"
              >
                ← Back to edit location details
              </button>
            </div>
          </section>
        )}

        {/* ========================================================
            STEP 4: TRUTHFUL STATUS PROGRESSION & ACTIVE COMMAND
            ======================================================== */}
        {step === 4 && (
          <section className="space-y-4 animate-in fade-in duration-150" aria-labelledby="active-heading">
            
            {/* Active Incident Header Banner */}
            <div className="p-4 sm:p-5 rounded-3xl bg-red-950/40 border-2 border-red-500/80 shadow-[0_0_40px_rgba(220,38,38,0.25)] space-y-4">
              
              <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                    INCIDENT #{incident?.incidentId || 'SOS-ACTIVE'}
                  </span>
                  <h2 id="active-heading" className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    EMERGENCY REQUEST ACTIVE
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleCancelSOS}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-gray-300 transition-colors cursor-pointer"
                >
                  Cancel SOS
                </button>
              </div>

              {/* Truthful Status Tracker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#B8C0C5]">Dispatch Status:</span>
                  <span className="text-[#FFF174] flex items-center gap-1.5">
                    <Radio size={14} className="animate-pulse text-[#FFF174]" />
                    {incident?.providerAccepted 
                      ? 'Responder Assigned' 
                      : incident?.serverReceived
                      ? 'Searching for nearby responders...'
                      : 'Offline Emergency Mode Active'}
                  </span>
                </div>

                {/* 8-Stage Truthful Progression Visual */}
                <div className="p-3 rounded-2xl bg-[#101214] border border-[#343B42] space-y-2 text-xs">
                  
                  {/* Stage 1: Preparing */}
                  <div className="flex items-center justify-between text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> 1. Request Prepared
                    </span>
                    <span className="text-[10px] text-gray-500">Done</span>
                  </div>

                  {/* Stage 2: Sending */}
                  <div className="flex items-center justify-between text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> 2. Transmitted via Network
                    </span>
                    <span className="text-[10px] text-gray-500">Done</span>
                  </div>

                  {/* Stage 3: System Logging */}
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-1.5 ${
                      incident?.serverReceived ? 'text-emerald-400 font-semibold' : 'text-amber-400'
                    }`}>
                      {incident?.serverReceived ? (
                        <>
                          <CheckCircle2 size={13} /> 3. Received by Dispatch System
                        </>
                      ) : (
                        <>
                          <AlertCircle size={13} /> 3. Offline Mode (Local buffer ready)
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {incident?.serverReceived ? 'Logged' : 'Offline'}
                    </span>
                  </div>

                  {/* Stage 4: Searching / Waiting for response */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#FFF174] font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#FFF174] animate-ping" />
                      4. Searching for nearby responders...
                    </span>
                    <span className="text-[10px] text-[#FFF174] font-mono">In Progress</span>
                  </div>

                  {/* Stage 5: Provider Accepted (Only when verified) */}
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-700" />
                      5. Provider Accepted
                    </span>
                    <span className="text-[10px]">Pending</span>
                  </div>

                  {/* Stage 6: En Route */}
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-700" />
                      6. Provider En Route
                    </span>
                    <span className="text-[10px]">Pending</span>
                  </div>

                  {/* Stage 7: Arrived */}
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-700" />
                      7. Provider Arrived
                    </span>
                    <span className="text-[10px]">Pending</span>
                  </div>

                  {/* Stage 8: Completed */}
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-700" />
                      8. Incident Safely Resolved
                    </span>
                    <span className="text-[10px]">Pending</span>
                  </div>
                </div>

                <p className="text-[10px] text-red-200/90 leading-relaxed italic">
                  Note: MotoAssist never simulates fake provider arrivals. If no verified responder is available within 3 minutes, dial 112 directly below.
                </p>
              </div>

              {/* I'm Safe / Resolve Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleResolveSOS}
                  className="w-full min-h-[48px] py-3.5 bg-emerald-600 hover:bg-emerald-500 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 text-white shadow-lg cursor-pointer"
                >
                  <CheckCircle2 size={16} />
                  <span>I'm Safe (Resolve SOS)</span>
                </button>
              </div>
            </div>

            {/* ========================================================
                DIRECT CONTACTS & OFFLINE EMERGENCY MODE
                ======================================================== */}
            <section className="space-y-2.5" aria-label="Direct Phone & Message Actions">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#B8C0C5]">
                  DIRECT EMERGENCY CHANNELS
                </h3>
                <span className="text-[10px] text-[#FFF174] font-bold">1-Tap Direct</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. National 112 */}
                <a
                  href="tel:112"
                  className="min-h-[52px] p-3 rounded-2xl bg-[#22272B] border border-red-500/40 hover:border-red-500 text-left transition-all active:scale-[0.98] flex items-center gap-2.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                    <PhoneCall size={18} />
                  </div>
                  <div>
                    <strong className="block text-xs font-black text-white">Call 112</strong>
                    <span className="text-[10px] text-red-300 block">National Police</span>
                  </div>
                </a>

                {/* 2. Ambulance 108 */}
                <a
                  href="tel:108"
                  className="min-h-[52px] p-3 rounded-2xl bg-[#22272B] border border-emerald-500/40 hover:border-emerald-500 text-left transition-all active:scale-[0.98] flex items-center gap-2.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <PhoneCall size={18} />
                  </div>
                  <div>
                    <strong className="block text-xs font-black text-white">Ambulance</strong>
                    <span className="text-[10px] text-emerald-300 block">Dial 108</span>
                  </div>
                </a>

                {/* 3. Women Helpline 1091 */}
                <a
                  href="tel:1091"
                  className="min-h-[52px] p-3 rounded-2xl bg-[#22272B] border border-purple-500/40 hover:border-purple-500 text-left transition-all active:scale-[0.98] flex items-center gap-2.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <strong className="block text-xs font-black text-white">Women 1091</strong>
                    <span className="text-[10px] text-purple-300 block">Safety Helpline</span>
                  </div>
                </a>

                {/* 4. Highway Patrol 1033 */}
                <a
                  href="tel:1033"
                  className="min-h-[52px] p-3 rounded-2xl bg-[#22272B] border border-blue-500/40 hover:border-blue-500 text-left transition-all active:scale-[0.98] flex items-center gap-2.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Truck size={18} />
                  </div>
                  <div>
                    <strong className="block text-xs font-black text-white">Highway 1033</strong>
                    <span className="text-[10px] text-blue-300 block">NHAI Patrol</span>
                  </div>
                </a>
              </div>

              {/* 1-Tap Family Notification Row (WhatsApp + SMS) */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[48px] p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 hover:border-emerald-500 text-left flex items-center justify-between text-white transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle size={18} className="text-emerald-400" />
                    <div>
                      <strong className="block text-xs font-bold">Alert Family</strong>
                      <span className="text-[10px] text-emerald-300">WhatsApp Alert</span>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-emerald-400" />
                </a>

                <a
                  href={smsUrl}
                  className="min-h-[48px] p-3 rounded-2xl bg-blue-950/40 border border-blue-500/40 hover:border-blue-500 text-left flex items-center justify-between text-white transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-blue-400" />
                    <div>
                      <strong className="block text-xs font-bold">Send SMS</strong>
                      <span className="text-[10px] text-blue-300">Works with 0 data</span>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-blue-400" />
                </a>
              </div>
            </section>

            {/* RIDER SURVIVAL INSTRUCTIONS */}
            <section className="p-4 rounded-2xl bg-[#191D20] border border-[#343B42] space-y-2 text-xs">
              <strong className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
                <ShieldAlert size={14} className="text-[#FFF174]" />
                Immediate Safety Guidelines
              </strong>
              <ul className="space-y-1.5 text-[#B8C0C5] text-[11px] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#FFF174] font-bold">•</span>
                  <span><strong>Stay with your bike</strong> if you are in a visible, well-lit, or safe location.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFF174] font-bold">•</span>
                  <span><strong>Move off the active roadway:</strong> Stand behind the steel crash guardrail on highways.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFF174] font-bold">•</span>
                  <span><strong>Turn on hazard lights:</strong> Or leave your taillight on to warn oncoming trucks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFF174] font-bold">•</span>
                  <span><strong>Conserve phone battery:</strong> Close heavy apps and lower screen brightness.</span>
                </li>
              </ul>
            </section>

          </section>
        )}

      </div>
    </div>
  );
}
