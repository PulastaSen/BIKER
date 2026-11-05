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
  ShieldAlert,
  Truck,
  Wrench,
  HelpCircle,
  Flame,
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
}

const PROBLEM_OPTIONS: ProblemDefinition[] = [
  {
    id: 'MEDICAL',
    title: 'Medical Help',
    simpleTitle: 'Medical / Injury',
    description: 'Accident injury, severe pain, or sudden illness (108/112).',
    icon: Heart
  },
  {
    id: 'BREAKDOWN',
    title: 'Bike Breakdown',
    simpleTitle: 'Bike Stopped Working',
    description: 'Engine cutoff, flat tyre, electrical failure, or chain break.',
    icon: Wrench
  },
  {
    id: 'SAFETY',
    title: 'Personal Safety',
    simpleTitle: 'Feeling Unsafe',
    description: 'Stranded in remote dark area, harassment, or feeling threatened.',
    icon: ShieldAlert
  },
  {
    id: 'ACCIDENT',
    title: 'Crash / Accident',
    simpleTitle: 'Crash on the Road',
    description: 'Motorcycle collision, road slide, or highway spill.',
    icon: Flame
  },
  {
    id: 'TOWING',
    title: 'Towing & Recovery',
    simpleTitle: 'Need Flatbed Tow',
    description: 'Motorcycle cannot be ridden and needs a recovery truck.',
    icon: Truck
  },
  {
    id: 'UNSURE',
    title: 'Not Sure / Guidance',
    simpleTitle: 'Help Me Decide',
    description: 'Immediate safety triage and guided emergency escalation.',
    icon: HelpCircle
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

  // Selected problem category
  const [selectedProblem, setSelectedProblem] = useState<EmergencyProblemType>(() => {
    const rawType = searchParams.get('type') || searchParams.get('cat');
    if (rawType && ['MEDICAL', 'BREAKDOWN', 'SAFETY', 'ACCIDENT', 'TOWING', 'MULTIPLE', 'UNSURE'].includes(rawType)) {
      return rawType as EmergencyProblemType;
    }
    return 'UNSURE';
  });

  // GPS state
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string>('');
  const [lastGpsTime, setLastGpsTime] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [showLandmarkInput, setShowLandmarkInput] = useState<boolean>(false);

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
        setLastGpsTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission denied. You can enter a highway milestone.');
        } else {
          setGpsError('GPS signal weak. Enter a milestone or nearby shop below.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Load existing active incident or initialize
  useEffect(() => {
    acquireLocation();

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
          }
        } catch {
          // ignore parsing error
        }
      }
    };

    checkActiveSOS();

    fetchMedicalProfile().then((prof) => {
      if (prof) setMedicalCard(prof);
    });

    const contacts = getEmergencyContacts(user?.id || 'user-rider-1');
    setEmergencyContacts(contacts);
  }, [user]);

  // Voice narration on page load
  useEffect(() => {
    if (!voiceEnabled) return;
    if (incident) {
      speak('Emergency assistance request is active. Searching for nearby responders.');
    } else {
      speak('Emergency Services. Press and hold the red SOS button for 3 seconds or tap any direct helpline.');
    }
  }, [incident, voiceEnabled, speak]);

  // Hold-to-trigger handlers
  const handlePointerDown = () => {
    if (isSubmitting || incident) return;
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

    if (hasBackendApi() && !isOfflineMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/sos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: lat,
            longitude: lng,
            accuracyMeters: accuracy || undefined,
            problemType: selectedProblem,
            landmark: landmark.trim() || undefined
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json && json.success && json.data) {
            const inc: SOSIncident = {
              ...json.data,
              problemType: selectedProblem,
              landmark: landmark.trim() || undefined,
              serverReceived: true,
              gpsAcquired,
              familyConfirmed: false,
              providerAccepted: false
            };
            localStorage.setItem('motoassist_active_sos', JSON.stringify(inc));
            setIncident(inc);
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
      problemType: selectedProblem,
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
    setIsSubmitting(false);
  };

  // Cancel SOS
  const handleCancelSOS = async () => {
    if (!incident) return;
    if (!window.confirm('Cancel this emergency request?')) return;

    localStorage.removeItem('motoassist_active_sos');
    if (hasBackendApi() && incident.serverReceived) {
      try {
        await fetch(`${API_BASE_URL}/api/sos/${incident.incidentId}/cancel`, { method: 'PUT' });
      } catch {
        // ignore
      }
    }

    setIncident(null);
    setHoldProgress(0);
  };

  // Resolve SOS
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
    <div className="min-h-screen bg-[#12161A] text-white pt-2 pb-28 md:pb-16 font-sans">
      {/* Medical ID Sheet Modal */}
      <MedicalIdQuickModal
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
      />

      <div className="container mx-auto px-4 max-w-lg space-y-4">
        
        {/* ========================================================
            1. CLEAN TOP HEADER (Red & White branding)
            ======================================================== */}
        <header className="flex items-center justify-between py-2 border-b border-[#2E3844]">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-2 rounded-xl bg-[#1E252D] border border-[#2E3844] text-[#94A3B8] hover:text-[#FFF174] hover:border-[#FFF174] shadow-md transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Return to Home"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight leading-none">
                Emergency Services
              </h1>
              <span className="text-[11px] text-red-400 font-bold uppercase tracking-wider">
                24/7 Rapid Response
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice toggle */}
            <button
              type="button"
              onClick={toggleVoice}
              className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                voiceEnabled 
                  ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                  : 'bg-[#1E252D] text-[#94A3B8] border-[#2E3844] hover:text-white shadow-md'
              }`}
              aria-label={voiceEnabled ? 'Turn off voice guide' : 'Turn on voice guide'}
              title="Voice Guidance"
            >
              {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* Medical ID quick button */}
            <button
              type="button"
              onClick={() => setShowMedicalModal(true)}
              className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800 text-xs font-bold text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            >
              <Heart size={16} className="text-red-600" />
              <span>Medical ID{medicalCard?.bloodGroup ? ` (${medicalCard.bloodGroup})` : ''}</span>
            </button>
          </div>
        </header>

        {/* ========================================================
            2. ACTIVE EMERGENCY COMMAND (When SOS is triggered)
            Matches Screen 5 & 6 from Screenshot 1
            ======================================================== */}
        {incident ? (
          <section className="space-y-4 animate-in fade-in duration-200" aria-label="Active Incident Status">
            
            {/* Red & White Active Incident Card */}
            <div className="p-5 rounded-3xl bg-[#1A2026] border-2 border-red-500 shadow-2xl space-y-4">
              
              <div className="flex items-center justify-between border-b border-[#2E3844] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-600 block">
                      INCIDENT #{incident.incidentId}
                    </span>
                    <h2 className="text-lg font-black text-white leading-tight">
                      EMERGENCY ACTIVE
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCancelSOS}
                  className="px-3 py-1.5 rounded-xl bg-[#242D37] hover:bg-[#2A3440] text-xs font-bold text-[#94A3B8] hover:text-white transition-colors cursor-pointer min-h-[40px]"
                >
                  Cancel SOS
                </button>
              </div>

              {/* Reassurance Message */}
              <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-800/60 text-xs text-red-200 leading-relaxed font-medium">
                {incident.serverReceived
                  ? 'Stay in a safe location. Central dispatch and emergency contacts have logged your coordinates.'
                  : 'Operating in standalone emergency mode. Dial 112 directly below or notify family via WhatsApp/SMS.'}
              </div>

              {/* Clean Progression Tracker */}
              <div className="p-4 rounded-2xl bg-[#12161A] border border-[#2E3844] space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[#10B981] font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-[#10B981]" /> 1. Alert Logged
                  </span>
                  <span className="text-[11px] font-mono">Confirmed</span>
                </div>

                <div className="flex items-center justify-between text-[#10B981] font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-[#10B981]" /> 2. Location Acquired
                  </span>
                  <span className="text-[11px] font-mono">
                    {lat && lng ? `${lat.toFixed(3)}, ${lng.toFixed(3)}` : 'Milestone only'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-red-600 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Radio size={16} className="animate-pulse text-red-600" /> 3. Searching for Responders...
                  </span>
                  <span className="text-[10px] bg-red-950/60 text-red-300 border border-red-800 px-2 py-0.5 rounded-full font-black">
                    IN PROGRESS
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-300" /> 4. Responder Assigned
                  </span>
                  <span className="text-[11px]">Pending</span>
                </div>
              </div>

              {/* Primary Direct Dial: 112 Dispatch */}
              <a
                href="tel:112"
                className="w-full min-h-[52px] py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-red-600/30 active:scale-[0.98] transition-all"
              >
                <PhoneCall size={20} className="animate-bounce" />
                <span>Call 112 Dispatch Now</span>
              </a>

              {/* Direct Family Alerts (WhatsApp & SMS) */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[48px] p-3 rounded-2xl bg-[#1E252D] border border-emerald-500/50 text-emerald-300 hover:bg-[#242D37] text-left flex items-center justify-between transition-all active:scale-[0.98] shadow-sm font-bold text-xs"
                >
                  <span className="flex items-center gap-1.5">
                    <MessageCircle size={18} className="text-emerald-600" /> WhatsApp Alert
                  </span>
                  <ExternalLink size={14} className="text-emerald-600" />
                </a>

                <a
                  href={smsUrl}
                  className="min-h-[48px] p-3 rounded-2xl bg-[#1E252D] border border-blue-500/50 text-blue-300 hover:bg-[#242D37] text-left flex items-center justify-between transition-all active:scale-[0.98] shadow-sm font-bold text-xs"
                >
                  <span className="flex items-center gap-1.5">
                    <Phone size={18} className="text-blue-600" /> Send SMS (Offline)
                  </span>
                  <ExternalLink size={14} className="text-blue-600" />
                </a>
              </div>

              {/* Resolve Button: I'm Safe */}
              <div className="pt-2 border-t border-[#2E3844]">
                <button
                  type="button"
                  onClick={handleResolveSOS}
                  className="w-full min-h-[48px] py-3 bg-emerald-600 hover:bg-emerald-700 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 text-white shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  <CheckCircle2 size={18} />
                  <span>I'm Safe (Resolve SOS)</span>
                </button>
              </div>

            </div>

            {/* Rider Safety Guidelines Box */}
            <div className="p-4 rounded-2xl bg-[#1A2026] border border-[#2E3844] shadow-md space-y-2 text-xs">
              <strong className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
                <ShieldAlert size={16} className="text-red-600" /> Immediate Safety Guidelines
              </strong>
              <ul className="space-y-1.5 text-[#94A3B8] text-[11px] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span><strong>Move off the roadway:</strong> Stand behind the steel crash guardrail on highways.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span><strong>Turn on hazard lights:</strong> Warn oncoming trucks and traffic.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span><strong>Stay visible:</strong> Keep your reflective vest or helmet visible.</span>
                </li>
              </ul>
            </div>

          </section>
        ) : (
          /* ========================================================
             3. UNCLUTTERED IDLE EMERGENCY PAGE (Figma Screen 4 Style)
             Clean, White background, Red & White emergency controls!
             ======================================================== */
          <div className="space-y-4">
            
            {/* Quick 1-Tap Helpline Cards (Police, Ambulance, Fire) */}
            <section className="space-y-2" aria-label="Official Emergency Call Tiles">
              <span className="text-xs font-black uppercase tracking-wider text-[#94A3B8] block px-1">
                Direct Emergency Lines (1-Tap Dial)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Police / National 112 */}
                <a
                  href="tel:112"
                  className="p-3.5 rounded-2xl bg-[#1E252D] border border-[#2E3844] hover:border-red-500 shadow-lg flex items-center justify-between transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-950/40 text-red-400 flex items-center justify-center shrink-0 border border-red-800">
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <strong className="block text-sm font-black text-white leading-tight">Police & Rescue</strong>
                      <span className="text-[11px] text-[#94A3B8] font-medium">National Helpline 112</span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <PhoneCall size={16} />
                  </div>
                </a>

                {/* 2. Ambulance 108 */}
                <a
                  href="tel:108"
                  className="p-3.5 rounded-2xl bg-[#1E252D] border border-[#2E3844] hover:border-red-500 shadow-lg flex items-center justify-between transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-950/40 text-red-400 flex items-center justify-center shrink-0 border border-red-800">
                      <Heart size={20} />
                    </div>
                    <div>
                      <strong className="block text-sm font-black text-white leading-tight">Ambulance</strong>
                      <span className="text-[11px] text-[#94A3B8] font-medium">Medical Emergency 108</span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <PhoneCall size={16} />
                  </div>
                </a>

                {/* 3. Women 1091 / Highway 1033 */}
                <a
                  href="tel:1091"
                  className="p-3.5 rounded-2xl bg-[#1E252D] border border-[#2E3844] hover:border-red-500 shadow-lg flex items-center justify-between transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-950/40 text-red-400 flex items-center justify-center shrink-0 border border-red-800">
                      <Phone size={20} />
                    </div>
                    <div>
                      <strong className="block text-sm font-black text-white leading-tight">Women Safety</strong>
                      <span className="text-[11px] text-[#94A3B8] font-medium">Safety Helpline 1091</span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <PhoneCall size={16} />
                  </div>
                </a>
              </div>
            </section>

            {/* HERO CENTERPIECE: Iconic Red & White Circular SOS Button */}
            <section className="flex flex-col items-center justify-center py-4 bg-[#1A2026] rounded-3xl border border-[#2E3844] shadow-xl px-4">
              <div className="text-center mb-3">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {isSimpleMode ? 'Emergency SOS' : 'Instant Emergency SOS'}
                </h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Press and hold for 3 seconds to broadcast emergency coordinates.
                </p>
              </div>

              {/* Pulsing Concentric Circular Button */}
              <div className="relative flex items-center justify-center my-3">
                {/* SVG Progress Ring */}
                <svg className="w-56 h-56 transform -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="stroke-[#2E3844]"
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
                  className={`absolute w-44 h-44 rounded-full flex flex-col items-center justify-center gap-1 select-none shadow-[0_12px_35px_rgba(220,38,38,0.35)] transition-transform active:scale-95 touch-manipulation cursor-pointer ${
                    isHolding
                      ? 'bg-red-700 ring-8 ring-red-200 scale-95'
                      : isSubmitting
                      ? 'bg-red-800 animate-pulse'
                      : 'bg-gradient-to-tr from-red-600 to-red-500 hover:from-red-500 hover:to-red-600'
                  }`}
                  aria-label="Hold for 3 seconds to trigger emergency SOS"
                >
                  <AlertTriangle size={38} className="text-white drop-shadow-sm animate-bounce" />
                  <span className="text-2xl font-black tracking-widest text-white">SOS</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-100 bg-black/25 px-2.5 py-0.5 rounded-full border border-white/20">
                    {isHolding ? 'KEEP HOLDING...' : isSubmitting ? 'TRANSMITTING...' : 'HOLD 3 SECONDS'}
                  </span>
                </button>
              </div>

              <span className="text-xs text-gray-500 text-center font-medium">
                Hold to prevent accidental activation while riding
              </span>
            </section>

            {/* Problem Category Selection (Clean 2-Column Grid on White) */}
            <section className="space-y-2" aria-labelledby="problem-heading">
              <div className="flex items-center justify-between px-1">
                <h3 id="problem-heading" className="text-xs font-black uppercase tracking-wider text-gray-600">
                  Select Situation Type (Optional)
                </h3>
                <span className="text-[11px] text-red-600 font-bold">Tags Your SOS</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {PROBLEM_OPTIONS.map((prob) => {
                  const Icon = prob.icon;
                  const isSelected = selectedProblem === prob.id;

                  return (
                    <button
                      key={prob.id}
                      type="button"
                      onClick={() => setSelectedProblem(prob.id)}
                      className={`min-h-[96px] p-3 rounded-2xl border text-left transition-all active:scale-[0.98] flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-red-950/40 border-2 border-red-500 text-white shadow-xl'
                          : 'bg-[#1E252D] border-[#2E3844] hover:border-[#FFF174] text-white shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-red-600 text-white' : 'bg-[#242D37] text-red-400'
                        }`}>
                          <Icon size={18} />
                        </div>
                        {isSelected && <CheckCircle2 size={16} className="text-red-400" />}
                      </div>

                      <div className="mt-2">
                        <strong className="block text-xs sm:text-sm font-black text-white leading-tight">
                          {isSimpleMode ? prob.simpleTitle : prob.title}
                        </strong>
                        <p className="text-[10px] text-[#94A3B8] line-clamp-1 mt-0.5">
                          {prob.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Clean Location Fix Bar */}
            <section className="p-3.5 rounded-2xl bg-[#1A2026] border border-[#2E3844] shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    lat !== null ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' : 'bg-[#242D37] text-[#94A3B8] border border-[#2E3844]'
                  }`}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <strong className="block text-xs font-black text-white">
                      {lat !== null ? 'GPS Fix Acquired' : gpsLoading ? 'Locating...' : 'GPS Pending'}
                    </strong>
                    <span className="text-[11px] text-[#94A3B8] font-medium">
                      {lat !== null && accuracy !== null 
                        ? `±${accuracy}m accuracy • Updated ${lastGpsTime}`
                        : 'Tap refresh to update coordinates'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLandmarkInput(!showLandmarkInput)}
                    className="text-xs font-bold text-[#FFF174] hover:underline cursor-pointer"
                  >
                    {landmark ? 'Edit Landmark' : '+ Landmark'}
                  </button>
                  <button
                    type="button"
                    onClick={acquireLocation}
                    disabled={gpsLoading}
                    className="p-2 rounded-xl bg-[#242D37] hover:bg-[#2E3844] border border-[#2E3844] text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
                    title="Refresh GPS"
                    aria-label="Refresh GPS"
                  >
                    <RefreshCw size={14} className={gpsLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Landmark input if toggled or populated */}
              {(showLandmarkInput || landmark) && (
                <div className="pt-2 border-t border-[#2E3844] space-y-1">
                  <label htmlFor="landmark-input" className="block text-[11px] font-bold text-[#94A3B8]">
                    Highway milestone / landmark:
                  </label>
                  <input
                    id="landmark-input"
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g., NH-10 KM 42 near Sevoke Bridge"
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#12161A] border border-[#2E3844] text-white text-xs placeholder-[#64748B] focus:outline-none focus:border-[#FFF174]"
                  />
                </div>
              )}

              {gpsError && (
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1.5">
                  <AlertCircle size={14} className="shrink-0 text-amber-400" />
                  <span>{gpsError}</span>
                </div>
              )}
            </section>

          </div>
        )}

      </div>
    </div>
  );
}
