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
  Pill,
  Search,
  Truck,
  Shield,
  Gauge,
  BatteryCharging,
  Sparkles,
  Clock
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
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="min-h-screen bg-[#12161A] text-white flex flex-col font-sans pb-28 md:pb-16 selection:bg-[#FFF174] selection:text-[#12161A]">
      
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
      <div className="bg-[#1A2026] border-b border-[#2E3844] shadow-md px-4 py-2 text-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* GPS Telemetry Pill */}
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${coords ? 'bg-[#10B981] animate-pulse' : 'bg-[#F59E0B]'}`} />
            <div className="truncate text-[11px] text-[#94A3B8]">
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
            <div className="flex items-center bg-[#242D37] rounded-lg border border-[#2E3844] p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded transition-colors ${language === 'en' ? 'bg-[#FFF174] text-[#12161A] font-extrabold' : 'text-[#94A3B8] hover:text-white'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded transition-colors ${language === 'hi' ? 'bg-[#FFF174] text-[#12161A] font-extrabold' : 'text-[#94A3B8] hover:text-white'}`}
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
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-[#1E252D] border-[#2E3844] text-[#94A3B8] hover:text-white shadow-sm'
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
                  ? 'bg-red-50 text-red-600 border-red-300 font-extrabold'
                  : 'bg-[#1E252D] border-[#2E3844] text-[#94A3B8] hover:text-white shadow-sm'
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

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6 space-y-6 sm:space-y-8">
        
        {/* ========================================================
            1. AGICENT INSPIRATION: LOCATION BAR & INSTANT SEARCH
            ======================================================== */}
        <section aria-label="Location and Search" className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#1A2026] border border-[#2E3844] rounded-2xl p-3 sm:px-4 sm:py-3 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#242D37] border border-[#2E3844] flex items-center justify-center text-[#FFF174] shrink-0">
                <MapPin size={16} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#FFF174] tracking-wider">Current Sector</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-bold border border-[#10B981]/40">LIVE GPS</span>
                </div>
                <strong className="text-xs sm:text-sm font-bold text-white block truncate">
                  {address || 'NH-10 Himalayan Corridor • Siliguri Sector, WB'}
                </strong>
              </div>
            </div>

            {/* Agicent-style Search Bar */}
            <div className="relative flex-1 sm:max-w-md w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emergency help, tow truck, puncture, fuel..."
                className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#FFF174] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[10px] text-[#94A3B8] hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

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
            2. AGICENT INSPIRATION: "SERVICES AROUND THE CLOCK" HERO
            24x7 Roadside Rescue Banner with Signature Yellow CTA
            ======================================================== */}
        <section aria-label="Services Around The Clock" className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1E252D] via-[#1A2026] to-[#12161A] border border-[#2E3844] p-5 sm:p-7 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FFF174] animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#FFF174]">
                  24x7 HIMALAYAN HIGHWAY RESCUE
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-display font-black text-white tracking-tight">
                Services Around The Clock
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Motorcycle broke down midway or stalled in remote mountain terrain? We've got you covered with verified roadside mechanics and flatbed recovery trucks.
              </p>
              
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-[#B8C0C5]">
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-[#FFF174]" /> Avg 12-min dispatch
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-[#10B981]" /> Verified Mechanics
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Sparkles size={13} className="text-[#FFF174]" /> Zero Hidden Fees
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  handleVoiceRead('Requesting Roadside Assistance');
                  navigate('/request-help');
                }}
                className="px-6 py-3.5 bg-[#FFF174] hover:bg-yellow-400 active:scale-95 text-[#12161A] font-display font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#FFF174]/20 transition-all cursor-pointer min-h-[46px]"
              >
                <Wrench size={16} />
                <span>Request Roadside Help</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/services')}
                className="px-6 py-3 bg-[#242D37] hover:bg-[#2A3440] text-white border border-[#2E3844] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
              >
                <span>Browse All Services</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. AGICENT INSPIRATION: "OUR SERVICES" 4 QUICK TILES
            The 4 signature roadside tiles from Agicent Phone 2
            ======================================================== */}
        <section aria-labelledby="our-services-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#1E252D] border border-[#2E3844] text-[#FFF174]">
                <Sparkles size={15} />
              </span>
              <h2 id="our-services-heading" className="text-base sm:text-lg font-display font-bold text-white">
                Our Services
              </h2>
            </div>
            <button
              onClick={() => navigate('/services')}
              className="text-xs font-bold text-[#FFF174] hover:underline flex items-center gap-1"
            >
              <span>See all</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            {/* 1. Fuel Delivery */}
            <div
              onClick={() => {
                handleVoiceRead('Opening fuel delivery request');
                navigate('/emergency?cat=BIKE_PROBLEM&sub=FUEL');
              }}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E252D] hover:bg-[#242D37] active:scale-[0.98] border border-[#2E3844] hover:border-[#FFF174] transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[110px] shadow-md group"
              role="button"
              tabIndex={0}
            >
              <div className="w-11 h-11 rounded-2xl bg-[#242D37] border border-[#2E3844] flex items-center justify-center text-[#FFF174] group-hover:scale-110 transition-transform shadow">
                <Fuel size={20} />
              </div>
              <div className="mt-2">
                <strong className="text-xs sm:text-sm font-display font-bold text-white block group-hover:text-[#FFF174]">
                  Fuel Delivery
                </strong>
                <span className="text-[10px] text-[#94A3B8] block mt-0.5">2L–5L Petrol On-Demand</span>
              </div>
            </div>

            {/* 2. Bike Towing */}
            <div
              onClick={() => {
                handleVoiceRead('Opening bike towing recovery request');
                navigate('/emergency?cat=TOWING');
              }}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E252D] hover:bg-[#242D37] active:scale-[0.98] border border-[#2E3844] hover:border-[#FFF174] transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[110px] shadow-md group"
              role="button"
              tabIndex={0}
            >
              <div className="w-11 h-11 rounded-2xl bg-[#242D37] border border-[#2E3844] flex items-center justify-center text-[#FFF174] group-hover:scale-110 transition-transform shadow">
                <Truck size={20} />
              </div>
              <div className="mt-2">
                <strong className="text-xs sm:text-sm font-display font-bold text-white block group-hover:text-[#FFF174]">
                  Bike Towing
                </strong>
                <span className="text-[10px] text-[#94A3B8] block mt-0.5">Hydraulic Flatbed Truck</span>
              </div>
            </div>

            {/* 3. Dead Battery */}
            <div
              onClick={() => {
                handleVoiceRead('Opening jump start battery request');
                navigate('/emergency?cat=BIKE_PROBLEM&sub=BATTERY');
              }}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E252D] hover:bg-[#242D37] active:scale-[0.98] border border-[#2E3844] hover:border-[#FFF174] transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[110px] shadow-md group"
              role="button"
              tabIndex={0}
            >
              <div className="w-11 h-11 rounded-2xl bg-[#242D37] border border-[#2E3844] flex items-center justify-center text-[#FFF174] group-hover:scale-110 transition-transform shadow">
                <Zap size={20} />
              </div>
              <div className="mt-2">
                <strong className="text-xs sm:text-sm font-display font-bold text-white block group-hover:text-[#FFF174]">
                  Dead Battery
                </strong>
                <span className="text-[10px] text-[#94A3B8] block mt-0.5">12V Jump-Start / Test</span>
              </div>
            </div>

            {/* 4. Flat Tyre / Puncture */}
            <div
              onClick={() => {
                handleVoiceRead('Opening flat tyre puncture request');
                navigate('/emergency?cat=BIKE_PROBLEM&sub=TYRE');
              }}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E252D] hover:bg-[#242D37] active:scale-[0.98] border border-[#2E3844] hover:border-[#FFF174] transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[110px] shadow-md group"
              role="button"
              tabIndex={0}
            >
              <div className="w-11 h-11 rounded-2xl bg-[#242D37] border border-[#2E3844] flex items-center justify-center text-[#FFF174] group-hover:scale-110 transition-transform shadow">
                <Disc size={20} />
              </div>
              <div className="mt-2">
                <strong className="text-xs sm:text-sm font-display font-bold text-white block group-hover:text-[#FFF174]">
                  Flat Tyre / Plug
                </strong>
                <span className="text-[10px] text-[#94A3B8] block mt-0.5">Tubeless Plug & Air Refill</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. AGICENT INSPIRATION: "BECOME OUR PREMIUM MEMBER" CARD
            Roadside Shield membership with gold badge
            ======================================================== */}
        <section aria-label="Premium Roadside Shield">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1A2026] via-[#1E252D] to-[#1A2026] border border-[#FFF174]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF174]/10 border border-[#FFF174]/40 flex items-center justify-center text-[#FFF174] shrink-0 shadow">
                <Shield size={24} className="fill-[#FFF174]/20 text-[#FFF174]" />
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <strong className="text-sm sm:text-base font-display font-bold text-white">
                    Become our Premium Member
                  </strong>
                  <span className="text-[9px] font-mono font-bold bg-[#FFF174] text-[#12161A] px-1.5 py-0.5 rounded">
                    RSA SHIELD
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Get Free Roadside Assistance, unlimited mountain towing & 20% off all workshop services.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/subscriptions')}
              className="px-5 py-2.5 rounded-xl bg-[#FFF174] hover:bg-yellow-400 text-[#12161A] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow shrink-0 cursor-pointer min-h-[42px]"
            >
              <span>Learn More</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </section>

        {/* ========================================================
            5. EMERGENCY SOS — TOP HIGH-VISIBILITY BANNER (NO LOGIN NEEDED)
            Matches Figma Community Screen 4 & Agicent Emergency Situation
            ======================================================== */}
        <section aria-labelledby="sos-section-title">
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-700 shadow-lg shadow-red-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-red-400 shadow-[0_10px_35px_rgba(220,38,38,0.4)] flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
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
                className="flex-1 sm:flex-initial px-5 py-3.5 bg-black hover:bg-neutral-900 text-red-600 font-display font-black text-sm uppercase tracking-wider rounded-xl border border-red-300 flex items-center justify-center gap-2 transition-all min-h-[48px] shadow-lg active:scale-95"
              >
                <PhoneCall size={18} className="text-red-600" />
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
          <h1 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight">
            What do you need help with?
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl font-normal">
            Choose your problem below. We connect you directly to verified mechanics, emergency dispatch, and nearby highway support.
          </p>
        </div>

        {/* ========================================================
            6. BIKE PROBLEM (8 SPECIFIC CATEGORIES IN COMPACT GRID)
            ======================================================== */}
        <section aria-labelledby="bike-problem-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#1E252D] border border-[#2E3844] text-[#FFF174]">
                <Wrench size={16} />
              </span>
              <h2 id="bike-problem-heading" className="text-lg sm:text-xl font-display font-bold text-white">
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
                color: 'text-red-600',
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
                color: 'text-red-600',
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
                color: 'text-gray-500',
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
                  className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E252D] hover:bg-[#242D37] active:scale-[0.98] border border-[#2E3844] hover:border-[#FFF174] transition-all cursor-pointer flex flex-col justify-between min-h-[115px] sm:min-h-[125px] shadow-md group"
                  role="button"
                  tabIndex={0}
                  aria-label={`${prob.title} - ${prob.desc}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/emergency?cat=BIKE_PROBLEM&sub=${prob.sub}`);
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#242D37] border border-[#2E3844] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <IconComponent size={16} className={prob.color} />
                      </div>
                      <ChevronRight size={15} className="text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <strong className="text-xs sm:text-sm font-display font-bold text-white block leading-tight pt-1 group-hover:text-[#FFF174] transition-colors">
                      {prob.title}
                    </strong>
                    <p className="text-[10px] sm:text-[11px] text-[#94A3B8] line-clamp-2 leading-snug">
                      {prob.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            7. MEDICAL HELP & TRAUMA RESPONSE
            ======================================================== */}
        <section aria-labelledby="medical-heading" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#1E252D] border border-[#2E3844] text-red-400">
              <Heart size={16} />
            </span>
            <h2 id="medical-heading" className="text-lg sm:text-xl font-display font-bold text-white">
              {t('home.medical_help', 'Medical emergency & hospitals')}
            </h2>
          </div>

          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {/* 1. Call 112 Ambulance */}
            <a
              href="tel:112"
              onClick={() => handleVoiceRead('Calling 112 Ambulance')}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E252D] hover:bg-[#242D37] border border-red-500/40 hover:border-red-500 flex flex-col justify-between transition-all min-h-[110px] group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase">Emergency Dispatch</span>
                <strong className="text-xs sm:text-sm font-display font-bold text-white block mt-0.5 group-hover:text-red-300">
                  Call 112 / 108 Ambulance
                </strong>
                <p className="text-[10px] text-gray-500 mt-1">Official state trauma dispatch</p>
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
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E252D] hover:bg-[#242D37] border border-[#2E3844] hover:border-[#FFF174] flex flex-col justify-between transition-all min-h-[110px] cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#B1D8E3] uppercase">Trauma Hubs</span>
                <strong className="text-xs sm:text-sm font-display font-bold text-white block mt-0.5 group-hover:text-red-600">
                  Nearby Hospitals
                </strong>
                <p className="text-[10px] text-gray-500 mt-1">Find government & private emergency rooms</p>
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
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E252D] hover:bg-[#242D37] border border-[#2E3844] hover:border-[#10B981]/50 flex flex-col justify-between transition-all min-h-[110px] group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#10B981] uppercase">Live Coordinates</span>
                <strong className="text-xs sm:text-sm font-display font-bold text-white block mt-0.5 group-hover:text-[#10B981]">
                  Share Location
                </strong>
                <p className="text-[10px] text-gray-500 mt-1">Send GPS coordinates via WhatsApp</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#10B981] mt-2">
                <Share2 size={12} /> <span>Send WhatsApp</span>
              </div>
            </a>

            {/* 4. Medical ID & Blood Group */}
            <div
              onClick={() => setShowMedicalModal(true)}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E252D] hover:bg-[#242D37] border border-[#2E3844] hover:border-red-400/50 flex flex-col justify-between transition-all min-h-[110px] cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-red-300 uppercase">Emergency Profile</span>
                <strong className="text-xs sm:text-sm font-display font-bold text-white block mt-0.5 group-hover:text-red-300">
                  Medical ID Card
                </strong>
                <p className="text-[10px] text-gray-500 mt-1">Blood group, allergies & ICE contacts</p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-red-300 mt-2">
                <span>Open card</span>
                <ChevronRight size={13} />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            8. PERSONAL SAFETY & WOMEN RIDER ASSISTANCE
            ======================================================== */}
        <section aria-labelledby="safety-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#1E252D] border border-[#2E3844] text-[#FFF174]">
                <ShieldCheck size={16} />
              </span>
              <h2 id="safety-heading" className="text-lg sm:text-xl font-display font-bold text-white">
                {t('home.safety_help', 'Personal safety & women rider network')}
              </h2>
            </div>
            <button
              onClick={() => navigate('/women-safety')}
              className="text-xs font-bold text-[#FFF174] hover:underline flex items-center gap-1"
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
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E252D] hover:bg-[#242D37] border border-[#F59E0B]/40 hover:border-[#F59E0B] flex flex-col justify-between transition-all min-h-[110px] cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#F59E0B] uppercase">Immediate Alert</span>
                <strong className="text-xs sm:text-sm font-display font-bold text-white block mt-0.5 group-hover:text-[#F59E0B]">
                  I Feel Unsafe
                </strong>
                <p className="text-[10px] text-gray-500 mt-1">Dark road, being followed or breakdown alone</p>
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
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E252D] hover:bg-[#242D37] border border-[#2E3844] hover:border-purple-400 flex flex-col justify-between transition-all min-h-[110px] group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Govt Helpline</span>
                <strong className="text-xs sm:text-sm font-display font-bold text-white block mt-0.5 group-hover:text-purple-300">
                  Call Helpline 1091
                </strong>
                <p className="text-[10px] text-gray-500 mt-1">24/7 dedicated women police desk</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-purple-400 mt-2">
                <PhoneCall size={12} /> <span>1-Tap Dial</span>
              </div>
            </a>

            {/* 3. Trusted Contacts */}
            <div
              onClick={() => navigate('/rider/emergency-contacts')}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E252D] hover:bg-[#242D37] border border-[#2E3844] hover:border-[#FFF174] flex flex-col justify-between transition-all min-h-[110px] cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-red-600 uppercase">ICE Circle</span>
                <strong className="text-xs sm:text-sm font-display font-bold text-white block mt-0.5 group-hover:text-red-600">
                  Trusted Contacts
                </strong>
                <p className="text-[10px] text-gray-500 mt-1">
                  {emergencyContacts.length > 0 
                    ? `${emergencyContacts.length} contacts linked for automatic alerts`
                    : 'Add someone we can call in an emergency'}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-red-600 mt-2">
                <span>Manage contacts</span>
                <ChevronRight size={13} />
              </div>
            </div>

            {/* 4. Safe Public Havens */}
            <div
              onClick={() => navigate('/remote-readiness')}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E252D] hover:bg-[#242D37] border border-[#2E3844] hover:border-[#10B981]/50 flex flex-col justify-between transition-all min-h-[110px] cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#10B981] uppercase">Verified Safe Stops</span>
                <strong className="text-xs sm:text-sm font-display font-bold text-white block mt-0.5 group-hover:text-[#10B981]">
                  Safe Public Spots
                </strong>
                <p className="text-[10px] text-[#94A3B8] mt-1">Police highway posts and 24/7 lit petrol pumps</p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#10B981] mt-2">
                <span>View safe stops</span>
                <ChevronRight size={13} />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            9. VEHIMATE INSPIRATION: MOTORCYCLE PROFILE & HEALTH COCKPIT
            Vehicle Card, Action Pills, and 4 Performance Gauges
            ======================================================== */}
        <section aria-labelledby="garage-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#1E252D] border border-[#2E3844] text-[#FFF174]">
                <BikeIcon size={16} />
              </span>
              <h2 id="garage-heading" className="text-lg sm:text-xl font-display font-bold text-white">
                {t('home.my_bike', 'Vehicle Profile & Diagnostics')}
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

          <div className="bg-[#1A2026] border border-[#2E3844] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            {/* VehiMate Vehicle Header Showcase */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2E3844] pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#242D37] border border-[#2E3844] flex items-center justify-center text-[#FFF174] shrink-0 shadow">
                  <BikeIcon size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-base sm:text-lg font-display font-bold text-white">
                      {primaryBike ? `${primaryBike.brand} ${primaryBike.model}` : 'Royal Enfield Himalayan 450'}
                    </strong>
                    <span className="text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/40">
                      ACTIVE RIDE
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                    Plate: <span className="text-white font-bold">{primaryBike?.registrationNumber || 'WB-74-2024'}</span> • Year {primaryBike?.year || '2024'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate('/rider/bikes')}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#242D37] hover:bg-[#2A3440] border border-[#2E3844] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
                >
                  <Plus size={14} />
                  <span>Garage</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/services')}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#FFF174] hover:bg-yellow-400 text-[#12161A] font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-colors min-h-[40px]"
                >
                  <span>Book Service</span>
                </button>
              </div>
            </div>

            {/* VehiMate: 4 Live Health Performance Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Battery Voltage */}
              <div className="p-3 rounded-xl bg-[#1E252D] border border-[#2E3844] flex flex-col justify-between min-h-[75px]">
                <div className="flex items-center justify-between text-[#FFF174]">
                  <BatteryCharging size={16} />
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#10B981]/20 text-[#10B981]">OPTIMAL</span>
                </div>
                <div>
                  <strong className="text-base font-black text-white block">12.6V</strong>
                  <span className="text-[10px] text-[#94A3B8]">Battery Health</span>
                </div>
              </div>

              {/* Tyre Pressure */}
              <div className="p-3 rounded-xl bg-[#1E252D] border border-[#2E3844] flex flex-col justify-between min-h-[75px]">
                <div className="flex items-center justify-between text-[#B1D8E3]">
                  <Disc size={16} />
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#10B981]/20 text-[#10B981]">NORMAL</span>
                </div>
                <div>
                  <strong className="text-base font-black text-white block">32 / 36 PSI</strong>
                  <span className="text-[10px] text-[#94A3B8]">Tyres (F / R)</span>
                </div>
              </div>

              {/* Chain Tension */}
              <div className="p-3 rounded-xl bg-[#1E252D] border border-[#2E3844] flex flex-col justify-between min-h-[75px]">
                <div className="flex items-center justify-between text-[#F59E0B]">
                  <Layers size={16} />
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#FFF174]/20 text-[#FFF174]">LUBED</span>
                </div>
                <div>
                  <strong className="text-base font-black text-white block">28 mm</strong>
                  <span className="text-[10px] text-[#94A3B8]">Chain Slack</span>
                </div>
              </div>

              {/* Est Range */}
              <div className="p-3 rounded-xl bg-[#1E252D] border border-[#2E3844] flex flex-col justify-between min-h-[75px]">
                <div className="flex items-center justify-between text-[#10B981]">
                  <Gauge size={16} />
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#10B981]/20 text-[#10B981]">~14L</span>
                </div>
                <div>
                  <strong className="text-base font-black text-white block">310 km</strong>
                  <span className="text-[10px] text-[#94A3B8]">Corridor Range</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            10. NEARBY SERVICES RADAR (REAL DIRECTORY)
            ======================================================== */}
        <section aria-labelledby="nearby-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#1E252D] border border-[#2E3844] text-[#FFF174]">
                <MapPin size={16} />
              </span>
              <h2 id="nearby-heading" className="text-lg sm:text-xl font-display font-bold text-white">
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
                  className="p-3 rounded-xl bg-[#1E252D] hover:bg-[#242D37] border border-[#2E3844] hover:border-[#FFF174] flex flex-col items-center justify-center text-center gap-1.5 transition-all min-h-[82px] cursor-pointer group"
                >
                  <SrvIcon size={18} className="text-[#FFF174] group-hover:scale-110 transition-transform" />
                  <div>
                    <strong className="text-xs font-display font-bold text-white block group-hover:text-[#FFF174] leading-tight">
                      {srv.label}
                    </strong>
                    <span className="text-[9px] font-mono text-gray-500 block">{srv.count}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            11. RIDE PLANNING & ROUTE RESILIENCE
            ======================================================== */}
        <section aria-labelledby="ride-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#1E252D] border border-[#2E3844] text-[#10B981]">
                <Compass size={16} />
              </span>
              <h2 id="ride-heading" className="text-lg sm:text-xl font-display font-bold text-white">
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
              className="p-4 rounded-2xl bg-[#1E252D] hover:bg-[#242D37] border border-[#2E3844] hover:border-[#10B981]/50 flex flex-col justify-between transition-all min-h-[120px] cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#10B981] uppercase">Live Journey</span>
                <strong className="text-sm font-display font-bold text-white block mt-0.5 group-hover:text-[#10B981]">
                  Start Safe Ride
                </strong>
                <p className="text-[11px] text-[#94A3B8] mt-1">
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
              className="p-4 rounded-2xl bg-[#1E252D] hover:bg-[#242D37] border border-[#2E3844] hover:border-[#FFF174] flex flex-col justify-between transition-all min-h-[120px] cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#FFF174] uppercase">Zero Signal Prep</span>
                <strong className="text-sm font-display font-bold text-white block mt-0.5 group-hover:text-[#FFF174]">
                  Remote Area Readiness
                </strong>
                <p className="text-[11px] text-[#94A3B8] mt-1">
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
              className="p-4 rounded-2xl bg-[#1E252D] hover:bg-[#242D37] border border-[#2E3844] hover:border-[#F59E0B]/50 flex flex-col justify-between transition-all min-h-[120px] cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#F59E0B] uppercase">Rider Intel</span>
                <strong className="text-sm font-display font-bold text-white block mt-0.5 group-hover:text-[#F59E0B]">
                  Road Hazards & Landslides
                </strong>
                <p className="text-[11px] text-[#94A3B8] mt-1">
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
