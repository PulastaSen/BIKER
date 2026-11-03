import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Wrench, 
  Heart, 
  ShieldCheck, 
  MapPin, 
  Navigation, 
  PhoneCall, 
  Fuel, 
  Disc, 
  Zap, 
  Flame, 
  Layers, 
  HelpCircle, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Eye, 
  Share2, 
  Plus, 
  Bike as BikeIcon, 
  Compass,
  Hospital,
  Pill
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { getRequests, getBikes, getEmergencyContacts } from '../utils/appStorage';
import type { HelpRequest, Bike, EmergencyContact } from '../types/app';
import { useUserLocation } from '../hooks/useUserLocation';
import { ActiveIncidentHUD } from '../components/ActiveIncidentHUD';
import { FeelingUnsafeModal } from '../components/FeelingUnsafeModal';
import { MedicalIdQuickModal } from '../components/MedicalIdQuickModal';
import { CrashDetectionModal } from '../components/CrashDetectionModal';
import { crashDetector } from '../services/crashDetection';
import type { CrashDetectionEvent } from '../types/app';
import { buildWhatsAppEmergencyAlertUrl } from '../utils/whatsappShare';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    isSimpleMode, 
    toggleSimpleMode, 
    voiceEnabled, 
    toggleVoice, 
    speak, 
    language, 
    setLanguage, 
    t 
  } = useAccessibility();

  const [activeRequest, setActiveRequest] = useState<HelpRequest | undefined>();
  const [showUnsafeModal, setShowUnsafeModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [detectedCrashEvent, setDetectedCrashEvent] = useState<CrashDetectionEvent | null>(null);
  const [userBikes, setUserBikes] = useState<Bike[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  // Real Geolocation hook without silent fallbacks
  const {
    coords,
    accuracy,
    status: locStatus,
    requestLocation,
    address,
    updatedText
  } = useUserLocation(true);

  // Crash detection listener
  useEffect(() => {
    crashDetector.startMonitoring();
    const unsubCrash = crashDetector.addListener((event) => {
      if (event.confidence === 'HIGH' || event.confidence === 'MEDIUM') {
        setDetectedCrashEvent(event);
      }
    });
    return () => unsubCrash();
  }, []);

  // Load user data & active requests
  useEffect(() => {
    const all = getRequests();
    const active = all.find(
      (r) =>
        (user ? r.riderId === user.id : true) &&
        (r.status === 'OPEN' || r.status === 'HELPER_OFFERED' || r.status === 'IN_PROGRESS' || r.status === 'SEARCHING')
    );
    setActiveRequest(active);

    const bikes = getBikes(user?.id);
    setUserBikes(bikes);

    const contacts = getEmergencyContacts(user?.id || 'user-rider-1');
    setEmergencyContacts(contacts);
  }, [user]);

  // Handle Voice Announcement for screen elements
  const handleVoiceRead = (text: string) => {
    speak(text);
  };

  const primaryBike = userBikes.find(b => b.isPrimary) || userBikes[0];
  const primaryContact = emergencyContacts[0];

  const whatsAppShareUrl = buildWhatsAppEmergencyAlertUrl({
    riderName: user?.name || 'Rider',
    latitude: coords?.lat,
    longitude: coords?.lng,
    landmark: address || 'Highway Corridor'
  });

  return (
    <div className="min-h-screen bg-[#101214] text-[#FFFFFF] flex flex-col font-sans pb-28 md:pb-16 selection:bg-[#FFF174] selection:text-[#101214]">
      
      {/* Crash Detection Modal */}
      <CrashDetectionModal
        event={detectedCrashEvent}
        onDismiss={() => setDetectedCrashEvent(null)}
        onEscalateSOS={() => {
          setDetectedCrashEvent(null);
          navigate('/sos');
        }}
      />

      {/* Feeling Unsafe Modal */}
      <FeelingUnsafeModal
        isOpen={showUnsafeModal}
        onClose={() => setShowUnsafeModal(false)}
        primaryContactPhone={primaryContact?.phone || "+91 98765 43210"}
        primaryContactName={primaryContact?.name || "Emergency Contact"}
      />

      {/* Medical ID Modal */}
      <MedicalIdQuickModal
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
      />

      {/* TOP ACCESSIBILITY & TELEMETRY BAR */}
      <div className="bg-[#191D20] border-b border-[#343B42] px-4 py-2 text-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* GPS Telemetry Pill */}
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${coords ? 'bg-[#10B981] animate-pulse' : 'bg-[#F59E0B]'}`} />
            <div className="truncate text-[11px] text-[#B8C0C5]">
              {coords ? (
                <span>📍 Location active {accuracy ? `(±${accuracy}m)` : ''} • {updatedText || 'Live'}</span>
              ) : locStatus === 'denied' ? (
                <button onClick={() => requestLocation()} className="text-[#F59E0B] underline font-bold">
                  Enable location for fastest help
                </button>
              ) : (
                <span>Acquiring satellite GPS...</span>
              )}
            </div>
          </div>

          {/* Quick Accessibility Toggles */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#22272B] rounded-lg border border-[#343B42] p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded transition-colors ${language === 'en' ? 'bg-[#FFF174] text-black font-extrabold' : 'text-[#B8C0C5] hover:text-white'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded transition-colors ${language === 'hi' ? 'bg-[#FFF174] text-black font-extrabold' : 'text-[#B8C0C5] hover:text-white'}`}
              >
                हिंदी
              </button>
            </div>

            {/* Voice Guidance Toggle */}
            <button
              type="button"
              onClick={toggleVoice}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 min-h-[34px] transition-colors ${
                voiceEnabled
                  ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                  : 'bg-[#22272B] border-[#343B42] text-[#B8C0C5] hover:text-white'
              }`}
              title="Toggle voice instructions"
              aria-label="Toggle voice guidance"
            >
              {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span className="hidden sm:inline">{t('voice.toggle', 'Voice Guide')}</span>
            </button>

            {/* Simple Mode Toggle */}
            <button
              type="button"
              onClick={toggleSimpleMode}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 min-h-[34px] transition-colors ${
                isSimpleMode
                  ? 'bg-[#FFF174] text-black border-[#FFF174] font-extrabold'
                  : 'bg-[#22272B] border-[#343B42] text-[#B8C0C5] hover:text-white'
              }`}
              title="Toggle simple mode for high readability"
              aria-label="Toggle simple view mode"
            >
              <Eye size={13} />
              <span>{isSimpleMode ? 'Normal View' : t('simple_mode.toggle', 'Simple View')}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-7 space-y-6 sm:space-y-8">
        
        {/* ACTIVE INCIDENT HUD: Displays at top if active rescue exists */}
        {activeRequest && (
          <ActiveIncidentHUD
            requestId={activeRequest.id}
            issueCategory={activeRequest.issue.replaceAll('_', ' ')}
            status={activeRequest.status === 'HELPER_OFFERED' ? 'ACCEPTED' : activeRequest.status}
            distance="2.4 km away"
            eta="12 mins"
            providerName="Verified Mountain Rescue Hub"
            providerPhone="+91 98320 12345"
            onCancel={() => setActiveRequest(undefined)}
          />
        )}

        {/* ========================================================
            A. EMERGENCY SOS — TOP HIGH-VISIBILITY BANNER (NO LOGIN NEEDED)
            ======================================================== */}
        <section aria-labelledby="sos-section-title">
          <div className="bg-gradient-to-r from-[#B91C1C] via-[#DC2626] to-[#991B1B] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-red-400 shadow-[0_10px_35px_rgba(220,38,38,0.4)] flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span className="text-[11px] font-mono font-black uppercase tracking-widest text-red-100">
                  IMMEDIATE EMERGENCY RESPONSE • NO LOGIN NEEDED
                </span>
              </div>
              <h2 id="sos-section-title" className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                {t('home.emergency_sos', 'Emergency SOS')}
              </h2>
              <p className="text-xs sm:text-sm text-red-100 font-medium max-w-xl">
                {t('home.sos_subtitle', 'In critical danger or severe crash? Call national emergency 112 or dispatch assistance.')}
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <a
                href="tel:112"
                onClick={() => handleVoiceRead('Calling 112 National Emergency')}
                className="flex-1 sm:flex-initial px-5 py-3.5 bg-black hover:bg-neutral-900 text-[#FFF174] font-display font-black text-sm uppercase tracking-wider rounded-xl border border-[#FFF174]/40 flex items-center justify-center gap-2 transition-all min-h-[48px] shadow-lg active:scale-95"
              >
                <PhoneCall size={18} className="text-[#FFF174]" />
                <span>Call 112</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  handleVoiceRead('Opening Emergency SOS assistance screen');
                  navigate('/sos');
                }}
                className="flex-1 sm:flex-initial px-5 py-3.5 bg-white text-red-900 hover:bg-red-50 font-display font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all min-h-[48px] shadow-lg active:scale-95 cursor-pointer"
              >
                <ShieldAlert size={18} />
                <span>Trigger SOS</span>
              </button>
            </div>
          </div>
        </section>

        {/* SCREEN TITLE: WHAT DO YOU NEED HELP WITH? */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-display font-black text-[#FFFFFF] tracking-tight">
            What do you need help with?
          </h1>
          <p className="text-xs sm:text-sm text-[#B8C0C5] max-w-2xl font-normal">
            Choose your problem below. We connect you directly to verified mechanics, emergency dispatch, and nearby highway support.
          </p>
        </div>

        {/* ========================================================
            B. BIKE PROBLEM (8 SPECIFIC CATEGORIES IN COMPACT GRID)
            ======================================================== */}
        <section aria-labelledby="bike-problem-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#22272B] border border-[#343B42] text-[#FFF174]">
                <Wrench size={16} />
              </span>
              <h2 id="bike-problem-heading" className="text-lg sm:text-xl font-display font-bold text-[#FFFFFF]">
                {t('home.bike_help', 'Get help with your bike')}
              </h2>
            </div>
            <button
              onClick={() => navigate('/services')}
              className="text-xs font-bold text-[#FFF174] hover:underline flex items-center gap-1"
            >
              <span>Service List</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {[
              {
                id: 'start',
                title: "Bike won't start",
                sub: 'BATTERY',
                icon: Zap,
                color: 'text-[#FFF174]',
                desc: 'Dead battery, starter issue or ignition'
              },
              {
                id: 'puncture',
                title: 'Puncture / Flat Tyre',
                sub: 'TYRE',
                icon: Disc,
                color: 'text-[#B1D8E3]',
                desc: 'Tubeless mushroom plug or tube replacement'
              },
              {
                id: 'chain',
                title: 'Chain problem',
                sub: 'CHAIN',
                icon: Layers,
                color: 'text-[#F59E0B]',
                desc: 'Snapped link, chain slip or slack adjustment'
              },
              {
                id: 'engine',
                title: 'Engine problem',
                sub: 'ENGINE',
                icon: Flame,
                color: 'text-[#EF4444]',
                desc: 'Overheating, oil leak, or sudden stalling'
              },
              {
                id: 'battery',
                title: 'Battery problem',
                sub: 'BATTERY',
                icon: Zap,
                color: 'text-[#FFF174]',
                desc: '12V jump-start or battery test'
              },
              {
                id: 'electrical',
                title: 'Electrical problem',
                sub: 'ELECTRICAL',
                icon: Zap,
                color: 'text-[#B1D8E3]',
                desc: 'Fuses, lighting, horn, or wiring fault'
              },
              {
                id: 'fuel',
                title: 'Fuel problem',
                sub: 'FUEL',
                icon: Fuel,
                color: 'text-[#10B981]',
                desc: 'Run out of petrol? On-demand 2L-5L canister'
              },
              {
                id: 'other',
                title: 'Other problem',
                sub: 'OTHER',
                icon: HelpCircle,
                color: 'text-[#B8C0C5]',
                desc: 'Brakes, clutch wire, levers or unlisted issue'
              }
            ].map((prob) => {
              const IconComponent = prob.icon;
              return (
                <div
                  key={prob.id}
                  onClick={() => {
                    handleVoiceRead(`Opening help for ${prob.title}`);
                    navigate(`/emergency?cat=BIKE_PROBLEM&sub=${prob.sub}`);
                  }}
                  className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#22272B] hover:bg-[#2D3339] active:scale-[0.98] border border-[#343B42] hover:border-[#FFF174]/60 transition-all cursor-pointer flex flex-col justify-between min-h-[115px] sm:min-h-[125px] shadow-sm group"
                  role="button"
                  tabIndex={0}
                  aria-label={`${prob.title} - ${prob.desc}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/emergency?cat=BIKE_PROBLEM&sub=${prob.sub}`);
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#191D20] border border-[#343B42] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <IconComponent size={16} className={prob.color} />
                      </div>
                      <ChevronRight size={15} className="text-[#B8C0C5] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <strong className="text-xs sm:text-sm font-display font-bold text-[#FFFFFF] block leading-tight pt-1 group-hover:text-[#FFF174] transition-colors">
                      {prob.title}
                    </strong>
                    <p className="text-[10px] sm:text-[11px] text-[#B8C0C5] line-clamp-2 leading-snug">
                      {prob.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            C. MEDICAL HELP & TRAUMA RESPONSE
            ======================================================== */}
        <section aria-labelledby="medical-heading" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#22272B] border border-[#343B42] text-red-400">
              <Heart size={16} />
            </span>
            <h2 id="medical-heading" className="text-lg sm:text-xl font-display font-bold text-[#FFFFFF]">
              {t('home.medical_help', 'Medical emergency & hospitals')}
            </h2>
          </div>

          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {/* 1. Call 112 Ambulance */}
            <a
              href="tel:112"
              onClick={() => handleVoiceRead('Calling 112 Ambulance')}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#22272B] hover:bg-[#2D3339] border border-red-500/40 hover:border-red-500 flex flex-col justify-between transition-all min-h-[110px] group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase">Emergency Dispatch</span>
                <strong className="text-xs sm:text-sm font-display font-bold text-white block mt-0.5 group-hover:text-red-300">
                  Call 112 / 108 Ambulance
                </strong>
                <p className="text-[10px] text-[#B8C0C5] mt-1">Official state trauma dispatch</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-red-400 mt-2">
                <PhoneCall size={12} /> <span>1-Tap Dial</span>
              </div>
            </a>

            {/* 2. Find Nearby Hospitals */}
            <div
              onClick={() => {
                handleVoiceRead('Searching nearby hospitals and trauma centers');
                navigate('/nearby-services');
              }}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#22272B] hover:bg-[#2D3339] border border-[#343B42] hover:border-[#FFF174]/50 flex flex-col justify-between transition-all min-h-[110px] cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#B1D8E3] uppercase">Trauma Hubs</span>
                <strong className="text-xs sm:text-sm font-display font-bold text-white block mt-0.5 group-hover:text-[#FFF174]">
                  Nearby Hospitals
                </strong>
                <p className="text-[10px] text-[#B8C0C5] mt-1">Find government & private emergency rooms</p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#B1D8E3] mt-2">
                <span>View on map</span>
                <ChevronRight size={13} />
              </div>
            </div>

            {/* 3. Share Location with Family */}
            <a
              href={whatsAppShareUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleVoiceRead('Sharing location on WhatsApp')}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#22272B] hover:bg-[#2D3339] border border-[#343B42] hover:border-[#10B981]/50 flex flex-col justify-between transition-all min-h-[110px] group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#10B981] uppercase">Live Coordinates</span>
                <strong className="text-xs sm:text-sm font-display font-bold text-white block mt-0.5 group-hover:text-[#10B981]">
                  Share Location
                </strong>
                <p className="text-[10px] text-[#B8C0C5] mt-1">Send GPS coordinates via WhatsApp</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#10B981] mt-2">
                <Share2 size={12} /> <span>Send WhatsApp</span>
              </div>
            </a>

            {/* 4. Medical ID & Blood Group */}
            <div
              onClick={() => setShowMedicalModal(true)}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#22272B] hover:bg-[#2D3339] border border-[#343B42] hover:border-red-400/50 flex flex-col justify-between transition-all min-h-[110px] cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-red-300 uppercase">Emergency Profile</span>
                <strong className="text-xs sm:text-sm font-display font-bold text-white block mt-0.5 group-hover:text-red-300">
                  Medical ID Card
                </strong>
                <p className="text-[10px] text-[#B8C0C5] mt-1">Blood group, allergies & ICE contacts</p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-red-300 mt-2">
                <span>Open card</span>
                <ChevronRight size={13} />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            D. PERSONAL SAFETY & WOMEN RIDER ASSISTANCE
            ======================================================== */}
        <section aria-labelledby="safety-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#22272B] border border-[#343B42] text-[#F59E0B]">
                <ShieldCheck size={16} />
              </span>
              <h2 id="safety-heading" className="text-lg sm:text-xl font-display font-bold text-[#FFFFFF]">
                {t('home.safety_help', 'Personal safety & women rider network')}
              </h2>
            </div>
            <button
              onClick={() => navigate('/women-safety')}
              className="text-xs font-bold text-[#F59E0B] hover:underline flex items-center gap-1"
            >
              <span>Safety Center</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {/* 1. Feeling Unsafe Quick Trigger */}
            <div
              onClick={() => {
                handleVoiceRead('Opening personal safety support modal');
                setShowUnsafeModal(true);
              }}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#22272B] hover:bg-[#2D3339] border border-[#F59E0B]/40 hover:border-[#F59E0B] flex flex-col justify-between transition-all min-h-[110px] cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#F59E0B] uppercase">Immediate Alert</span>
                <strong className="text-xs sm:text-sm font-display font-bold text-white block mt-0.5 group-hover:text-[#F59E0B]">
                  I Feel Unsafe
                </strong>
                <p className="text-[10px] text-[#B8C0C5] mt-1">Dark road, being followed or breakdown alone</p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#F59E0B] mt-2">
                <span>Alert trusted circle</span>
                <ChevronRight size={13} />
              </div>
            </div>

            {/* 2. Call Women Helpline 1091 */}
            <a
              href="tel:1091"
              onClick={() => handleVoiceRead('Calling 1091 Women Safety Helpline')}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#22272B] hover:bg-[#2D3339] border border-[#343B42] hover:border-purple-400 flex flex-col justify-between transition-all min-h-[110px] group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Govt Helpline</span>
                <strong className="text-xs sm:text-sm font-display font-bold text-white block mt-0.5 group-hover:text-purple-300">
                  Call Helpline 1091
                </strong>
                <p className="text-[10px] text-[#B8C0C5] mt-1">24/7 dedicated women police desk</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-purple-400 mt-2">
                <PhoneCall size={12} /> <span>1-Tap Dial</span>
              </div>
            </a>

            {/* 3. Trusted Contacts */}
            <div
              onClick={() => navigate('/rider/emergency-contacts')}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#22272B] hover:bg-[#2D3339] border border-[#343B42] hover:border-[#FFF174]/50 flex flex-col justify-between transition-all min-h-[110px] cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#FFF174] uppercase">ICE Circle</span>
                <strong className="text-xs sm:text-sm font-display font-bold text-white block mt-0.5 group-hover:text-[#FFF174]">
                  Trusted Contacts
                </strong>
                <p className="text-[10px] text-[#B8C0C5] mt-1">
                  {emergencyContacts.length > 0 
                    ? `${emergencyContacts.length} contacts linked for automatic alerts`
                    : 'Add someone we can call in an emergency'}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#FFF174] mt-2">
                <span>Manage contacts</span>
                <ChevronRight size={13} />
              </div>
            </div>

            {/* 4. Safe Public Havens */}
            <div
              onClick={() => navigate('/remote-readiness')}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#22272B] hover:bg-[#2D3339] border border-[#343B42] hover:border-[#10B981]/50 flex flex-col justify-between transition-all min-h-[110px] cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#10B981] uppercase">Verified Safe Stops</span>
                <strong className="text-xs sm:text-sm font-display font-bold text-white block mt-0.5 group-hover:text-[#10B981]">
                  Safe Public Spots
                </strong>
                <p className="text-[10px] text-[#B8C0C5] mt-1">Police highway posts and 24/7 lit petrol pumps</p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#10B981] mt-2">
                <span>View safe stops</span>
                <ChevronRight size={13} />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            E. NEARBY SERVICES RADAR (REAL DIRECTORY)
            ======================================================== */}
        <section aria-labelledby="nearby-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#22272B] border border-[#343B42] text-[#FFF174]">
                <MapPin size={16} />
              </span>
              <h2 id="nearby-heading" className="text-lg sm:text-xl font-display font-bold text-[#FFFFFF]">
                {t('home.nearby_services', 'Nearby services & repair hubs')}
              </h2>
            </div>
            <button
              onClick={() => navigate('/nearby-services')}
              className="text-xs font-bold text-[#FFF174] hover:underline flex items-center gap-1"
            >
              <span>Explore Map</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 min-[340px]:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {[
              { label: 'Mechanics', icon: Wrench, count: 'Verified' },
              { label: 'OEM Centers', icon: ShieldCheck, count: 'KTM/RE' },
              { label: 'Hospitals', icon: Hospital, count: 'Trauma' },
              { label: 'Pharmacies', icon: Pill, count: 'Medical' },
              { label: 'Petrol Pumps', icon: Fuel, count: '24/7' },
              { label: 'Towing', icon: Navigation, count: 'Flatbed' }
            ].map((srv, idx) => {
              const SrvIcon = srv.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleVoiceRead(`Searching nearby ${srv.label}`);
                    navigate('/nearby-services');
                  }}
                  className="p-3 rounded-xl bg-[#22272B] hover:bg-[#2D3339] border border-[#343B42] hover:border-[#FFF174]/40 flex flex-col items-center justify-center text-center gap-1.5 transition-all min-h-[82px] cursor-pointer group"
                >
                  <SrvIcon size={18} className="text-[#FFF174] group-hover:scale-110 transition-transform" />
                  <div>
                    <strong className="text-xs font-display font-bold text-white block group-hover:text-[#FFF174] leading-tight">
                      {srv.label}
                    </strong>
                    <span className="text-[9px] font-mono text-[#B8C0C5] block">{srv.count}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            F. MY BIKE & GARAGE SNAPSHOT
            ======================================================== */}
        <section aria-labelledby="garage-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#22272B] border border-[#343B42] text-[#B1D8E3]">
                <BikeIcon size={16} />
              </span>
              <h2 id="garage-heading" className="text-lg sm:text-xl font-display font-bold text-[#FFFFFF]">
                {t('home.my_bike', 'My Bike & Garage')}
              </h2>
            </div>
            <button
              onClick={() => navigate('/rider/bikes')}
              className="text-xs font-bold text-[#FFF174] hover:underline flex items-center gap-1"
            >
              <span>Manage Garage</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="bg-[#191D20] border border-[#343B42] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {primaryBike ? (
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#22272B] border border-[#343B42] flex items-center justify-center text-[#FFF174] shrink-0">
                  <BikeIcon size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-base font-display font-bold text-white">
                      {primaryBike.brand} {primaryBike.model}
                    </strong>
                    <span className="text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/30">
                      PRIMARY
                    </span>
                  </div>
                  <p className="text-xs text-[#B8C0C5] font-mono mt-0.5">
                    Plate: <span className="text-white font-bold">{primaryBike.registrationNumber}</span> • Year {primaryBike.year}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <strong className="text-sm font-display font-bold text-white block">No motorcycles registered yet</strong>
                <p className="text-xs text-[#B8C0C5] mt-0.5">Add your motorcycle so roadside helpers know your model and parts.</p>
              </div>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/rider/bikes')}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#22272B] hover:bg-[#2D3339] border border-[#343B42] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
              >
                <Plus size={14} />
                <span>Add / Manage Bikes</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/services')}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#FFF174] hover:bg-yellow-400 text-black font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-colors min-h-[44px]"
              >
                <span>Book Service</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================
            G. RIDE PLANNING & ROUTE RESILIENCE
            ======================================================== */}
        <section aria-labelledby="ride-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#22272B] border border-[#343B42] text-[#10B981]">
                <Compass size={16} />
              </span>
              <h2 id="ride-heading" className="text-lg sm:text-xl font-display font-bold text-[#FFFFFF]">
                {t('home.ride_plan', 'Ride planning & mountain safety')}
              </h2>
            </div>
            <button
              onClick={() => navigate('/safe-ride')}
              className="text-xs font-bold text-[#10B981] hover:underline flex items-center gap-1"
            >
              <span>Cockpit</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
            {/* 1. Safe Ride Cockpit */}
            <div
              onClick={() => navigate('/safe-ride')}
              className="p-4 rounded-2xl bg-[#22272B] hover:bg-[#2D3339] border border-[#343B42] hover:border-[#10B981]/50 flex flex-col justify-between transition-all min-h-[120px] cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#10B981] uppercase">Live Journey</span>
                <strong className="text-sm font-display font-bold text-white block mt-0.5 group-hover:text-[#10B981]">
                  Start Safe Ride
                </strong>
                <p className="text-[11px] text-[#B8C0C5] mt-1">
                  1-tap 'I am safe' check-in, periodic arrival timer, and family WhatsApp sharing.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-[#10B981] mt-2">
                <span>Start tracker</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* 2. Remote Readiness & Offline Passes */}
            <div
              onClick={() => navigate('/remote-readiness')}
              className="p-4 rounded-2xl bg-[#22272B] hover:bg-[#2D3339] border border-[#343B42] hover:border-[#FFF174]/50 flex flex-col justify-between transition-all min-h-[120px] cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#FFF174] uppercase">Zero Signal Prep</span>
                <strong className="text-sm font-display font-bold text-white block mt-0.5 group-hover:text-[#FFF174]">
                  Remote Area Readiness
                </strong>
                <p className="text-[11px] text-[#B8C0C5] mt-1">
                  Download offline emergency card, check corridor stops, and prepare for dead zones.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-[#FFF174] mt-2">
                <span>Open guide</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* 3. Road Hazard Reports */}
            <div
              onClick={() => navigate('/road-hazards')}
              className="p-4 rounded-2xl bg-[#22272B] hover:bg-[#2D3339] border border-[#343B42] hover:border-[#F59E0B]/50 flex flex-col justify-between transition-all min-h-[120px] cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#F59E0B] uppercase">Rider Intel</span>
                <strong className="text-sm font-display font-bold text-white block mt-0.5 group-hover:text-[#F59E0B]">
                  Road Hazards & Landslides
                </strong>
                <p className="text-[11px] text-[#B8C0C5] mt-1">
                  Real-time rider alerts for landslides, oil spills, and mountain roadblocks.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-[#F59E0B] mt-2">
                <span>Check alerts</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
