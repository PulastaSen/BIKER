import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Navigation, 
  ShieldAlert, 
  Zap, 
  AlertTriangle,
  User, 
  MapPin, 
  RefreshCw,
  Bike as BikeIcon,
  Users,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRequests, getBikes } from '../utils/appStorage';
import { fetchFamilyCircle } from '../services/ecosystemApi';
import type { HelpRequest, Bike, FamilyMember } from '../types/app';
import { useUserLocation } from '../hooks/useUserLocation';
import { ActiveIncidentHUD } from '../components/ActiveIncidentHUD';
import { FeelingUnsafeModal } from '../components/FeelingUnsafeModal';
import { MedicalIdQuickModal } from '../components/MedicalIdQuickModal';
import { CrashDetectionModal } from '../components/CrashDetectionModal';
import { crashDetector } from '../services/crashDetection';
import type { CrashDetectionEvent } from '../types/app';

export function ResponsiveHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeRequest, setActiveRequest] = useState<HelpRequest | undefined>();
  const [showUnsafeModal, setShowUnsafeModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Primary Bike & Family state
  const [primaryBike, setPrimaryBike] = useState<Bike | null>(null);
  const [familyNames, setFamilyNames] = useState<string>('Mom • Dad • Partner');

  // Section 22-25: Crash Detection state & listeners
  const [detectedCrashEvent, setDetectedCrashEvent] = useState<CrashDetectionEvent | null>(null);

  // Real Geolocation hook without silent fallbacks
  const {
    accuracy,
    status: locStatus,
    requestLocation,
    setSearchLocation,
    address,
  } = useUserLocation(true);

  useEffect(() => {
    // Start active motion sensor monitoring for potential crash events
    crashDetector.startMonitoring();
    const unsubCrash = crashDetector.addListener((event) => {
      // Trigger confirmation countdown for medium or high confidence events
      if (event.confidence === 'HIGH' || event.confidence === 'MEDIUM') {
        setDetectedCrashEvent(event);
      }
    });

    return () => {
      unsubCrash();
    };
  }, []);

  useEffect(() => {
    // Check if user has active help requests
    if (user) {
      const all = getRequests();
      const userReq = all.find(
        (r) =>
          r.riderId === user.id &&
          (r.status === 'OPEN' || r.status === 'HELPER_OFFERED' || r.status === 'IN_PROGRESS')
      );
      setActiveRequest(userReq);
    }

    // Load registered bike
    const bikes = getBikes();
    if (bikes.length > 0) {
      setPrimaryBike(bikes[0]);
    } else {
      setPrimaryBike({
        id: 'default-ktm',
        userId: user?.id || 'guest',
        brand: 'KTM',
        model: 'Adventure 250',
        registrationNumber: 'WB-74-AX-1024',
        year: 2023,
        fuelType: 'PETROL'
      });
    }

    // Load family contacts
    fetchFamilyCircle().then((members: FamilyMember[]) => {
      if (members && members.length > 0) {
        setFamilyNames(members.map((m) => m.name).join(' • '));
      }
    });
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 2) {
      setSearchLocation(searchQuery.trim());
      setShowLocationSearch(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const riderDisplayName = user?.name ? user.name.split(' ')[0] : 'Pulasta';

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col font-sans relative selection:bg-[#FFF174] selection:text-black pb-24 md:pb-16">
      
      {/* SECTION 22-25: Crash Detection Modal (10s confirmation dial) */}
      <CrashDetectionModal
        event={detectedCrashEvent}
        onDismiss={() => setDetectedCrashEvent(null)}
        onEscalateSOS={() => {
          setDetectedCrashEvent(null);
          navigate('/sos');
        }}
      />

      {/* Feeling Unsafe Modal Flow */}
      <FeelingUnsafeModal
        isOpen={showUnsafeModal}
        onClose={() => setShowUnsafeModal(false)}
        primaryContactPhone="+91 98765 43210"
        primaryContactName="Mom / Trusted Circle"
      />

      {/* Quick Medical ID Modal */}
      <MedicalIdQuickModal
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
      />

      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 bg-[#090909]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 select-none group">
            <span className="w-8 h-8 rounded-xl bg-[#FFF174] text-black flex items-center justify-center font-black group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,241,116,0.3)]">
              <Navigation size={18} />
            </span>
            <span className="font-black text-lg tracking-tight text-white uppercase">
              MOTO<span className="text-[#FFF174]">ASSIST</span>
            </span>
          </Link>

          {/* User Profile Avatar / Login */}
          <div className="flex items-center gap-2">
            <Link
              to="/safety-profile"
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 flex items-center gap-1.5 transition-colors"
              title="Configure Safety Profile"
            >
              <User size={14} className="text-[#FFF174]" />
              <span className="hidden sm:inline">Safety Profile</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 pt-5 space-y-4">
        
        {/* ACTIVE INCIDENT HUD (if active request exists, it is the FIRST thing visible!) */}
        {activeRequest ? (
          <ActiveIncidentHUD
            requestId={activeRequest.id}
            issueCategory={activeRequest.issue.replaceAll('_', ' ')}
            status={activeRequest.status === 'HELPER_OFFERED' ? 'ACCEPTED' : 'EN_ROUTE'}
            distance="2.8 km"
            eta="11 min"
            providerName="Raj Motors & Towing"
            providerPhone="+91 98320 12345"
            onCancel={() => setActiveRequest(undefined)}
          />
        ) : null}

        {/* SECTION 2: GREETING & DUAL SAFETY STATUS */}
        <section className="space-y-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {getGreeting()}, {riderDisplayName}
            </h1>
          </div>

          {/* Status Row: 🟢 You're safe • 📍 Location ready */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>🟢 You're safe</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141414] border border-white/10 text-gray-300 font-semibold">
              <MapPin size={13} className={locStatus === 'active' || locStatus === 'searched' ? 'text-emerald-400' : 'text-amber-400'} />
              <span>
                {locStatus === 'active' 
                  ? `📍 Location ready${accuracy ? ` (±${accuracy}m)` : ''}`
                  : locStatus === 'searched'
                  ? `📍 ${address || 'Location set'}`
                  : locStatus === 'denied'
                  ? '⚠️ Location access off'
                  : '📍 Location updating...'}
              </span>
              {locStatus !== 'active' && (
                <button
                  type="button"
                  onClick={() => requestLocation()}
                  className="text-[#FFF174] hover:underline ml-1 cursor-pointer"
                  title="Enable location"
                >
                  <RefreshCw size={11} className="inline" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* INLINE LOCATION SEARCH IF TOGGLED */}
        {showLocationSearch && (
          <form onSubmit={handleSearchSubmit} className="flex gap-2 animate-in fade-in duration-150">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search place, town or landmark..."
              className="flex-1 bg-[#161616] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFF174]"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#FFF174] text-black font-bold text-xs rounded-xl hover:bg-yellow-400 cursor-pointer"
            >
              Set Place
            </button>
          </form>
        )}

        {/* SECTION 2 PROMPT: "WHAT DO YOU NEED RIGHT NOW?" */}
        <div className="pt-2">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-gray-300">
            WHAT DO YOU NEED RIGHT NOW?
          </h2>
        </div>

        {/* ========================================================
            PRIMARY ACTIONS SECTION (Sections 1 & 2 Layout)
            ======================================================== */}
        <section className="space-y-3" aria-label="Primary Actions">
          
          {/* 1. HERO CARD: 🚨 SOS (HOLD FOR EMERGENCY) */}
          <button
            type="button"
            onClick={() => navigate('/sos')}
            className="w-full p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-[0.98] text-white text-center flex flex-col items-center justify-center gap-1 shadow-[0_0_35px_rgba(220,38,38,0.45)] border-2 border-red-400/60 transition-all cursor-pointer group min-h-[110px]"
            aria-label="🚨 SOS - Hold for emergency"
          >
            <div className="flex items-center justify-center gap-2 mb-0.5">
              <ShieldAlert size={28} className="text-white animate-pulse" />
              <span className="text-2xl sm:text-3xl font-black tracking-widest text-white">
                🚨 SOS
              </span>
            </div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-red-100 bg-red-950/60 px-3 py-1 rounded-full border border-red-300/30">
              HOLD FOR EMERGENCY
            </span>
          </button>

          {/* 2. SIDE-BY-SIDE: 🆘 I'M STRANDED | ⚠️ FEELING UNSAFE */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* 🆘 I'M STRANDED */}
            <button
              type="button"
              onClick={() => navigate('/im-stranded')}
              className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#FFF174] to-[#F2DF42] hover:from-[#FFF69B] hover:to-[#FFF174] active:scale-[0.98] text-black text-left flex flex-col justify-between shadow-[0_0_20px_rgba(255,241,116,0.25)] transition-all cursor-pointer group min-h-[105px]"
              aria-label="🆘 I'm Stranded"
            >
              <div className="w-9 h-9 rounded-xl bg-black/15 flex items-center justify-center shrink-0 mb-2">
                <Zap size={22} className="text-black" />
              </div>
              <div>
                <span className="block text-base sm:text-lg font-black tracking-tight leading-tight">
                  🆘 I'M STRANDED
                </span>
                <span className="block text-[11px] text-gray-800 font-semibold mt-0.5">
                  Puncture, fuel, towing
                </span>
              </div>
            </button>

            {/* ⚠️ FEELING UNSAFE */}
            <button
              type="button"
              onClick={() => setShowUnsafeModal(true)}
              className="p-4 sm:p-5 rounded-3xl bg-[#1A1212] hover:bg-[#251717] active:scale-[0.98] text-white text-left flex flex-col justify-between border-2 border-amber-500/50 shadow-md transition-all cursor-pointer group min-h-[105px]"
              aria-label="⚠️ Feeling Unsafe"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mb-2">
                <AlertTriangle size={20} />
              </div>
              <div>
                <span className="block text-base sm:text-lg font-black text-amber-300 tracking-tight leading-tight">
                  ⚠️ FEELING UNSAFE
                </span>
                <span className="block text-[11px] text-gray-400 font-medium mt-0.5">
                  Alert family • Call 112
                </span>
              </div>
            </button>
          </div>

          {/* 3. WIDE CARD: 🏍️ START SAFE RIDE */}
          <button
            type="button"
            onClick={() => navigate('/safe-ride')}
            className="w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#141C14] to-[#0F160F] hover:from-[#1C261C] hover:to-[#131C13] active:scale-[0.98] text-white font-black text-left flex items-center justify-between border border-emerald-500/30 shadow-md transition-all cursor-pointer group min-h-[82px]"
            aria-label="🏍️ Start Safe Ride - Share your ride with people you trust"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-emerald-500/30">
                <Navigation size={22} />
              </div>
              <div>
                <span className="block text-base sm:text-lg font-black text-emerald-300">
                  🏍️ START SAFE RIDE
                </span>
                <span className="block text-[11px] text-gray-400 font-normal">
                  Share your ride with people you trust
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </section>

        {/* ========================================================
            SECONDARY CONTROL CARDS (Section 2 Concept)
            MY BIKE + SAFETY CIRCLE
            ======================================================== */}
        <section className="pt-2 space-y-2.5" aria-label="Rider Setup Summary">
          
          {/* MY BIKE CARD */}
          <Link
            to="/save-my-bike"
            className="p-4 rounded-2xl bg-[#121212] border border-white/10 hover:border-white/20 flex items-center justify-between transition-colors group block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#FFF174] shrink-0 border border-white/10">
                <BikeIcon size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                  MY BIKE
                </span>
                <strong className="text-sm font-black text-white group-hover:text-[#FFF174] transition-colors block">
                  {primaryBike ? `${primaryBike.brand} ${primaryBike.model}` : 'KTM Adventure 250'}
                </strong>
                <span className="text-[11px] text-emerald-400 font-bold block mt-0.5">
                  🟢 Ready for ride
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-500 group-hover:text-white transition-colors" />
          </Link>

          {/* SAFETY CIRCLE CARD */}
          <Link
            to="/safety-circle"
            className="p-4 rounded-2xl bg-[#121212] border border-white/10 hover:border-white/20 flex items-center justify-between transition-colors group block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                  SAFETY CIRCLE
                </span>
                <strong className="text-sm font-black text-white group-hover:text-blue-300 transition-colors block">
                  {familyNames}
                </strong>
                <span className="text-[11px] text-gray-400 block mt-0.5">
                  External WhatsApp & SMS alerts enabled
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-500 group-hover:text-white transition-colors" />
          </Link>

          {/* UNIFIED SETUP ONCE BANNER */}
          <Link
            to="/safety-profile"
            className="p-3.5 rounded-2xl bg-[#161616] border border-white/10 hover:border-[#FFF174]/40 flex items-center justify-between transition-all group block text-xs"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-[#FFF174] shrink-0" />
              <div>
                <strong className="text-gray-200 group-hover:text-white block font-bold">
                  My Safety Profile
                </strong>
                <span className="text-[10px] text-gray-400 block">
                  Set up once • MotoAssist knows who you are, your bike & medical ID
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#FFF174] bg-[#FFF174]/10 px-2 py-1 rounded-lg">
              Manage
            </span>
          </Link>
        </section>

      </main>
    </div>
  );
}
