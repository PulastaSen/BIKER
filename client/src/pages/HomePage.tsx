import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Zap, 
  Wrench, 
  Truck, 
  Heart, 
  ShieldCheck, 
  Navigation, 
  PhoneCall, 
  MapPin, 
  RefreshCw, 
  ChevronRight, 
  HelpCircle,
  Radio,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRequests } from '../utils/appStorage';
import type { HelpRequest } from '../types/app';
import { useUserLocation } from '../hooks/useUserLocation';
import { ActiveIncidentHUD } from '../components/ActiveIncidentHUD';
import { FeelingUnsafeModal } from '../components/FeelingUnsafeModal';
import { MedicalIdQuickModal } from '../components/MedicalIdQuickModal';
import { CrashDetectionModal } from '../components/CrashDetectionModal';
import { crashDetector } from '../services/crashDetection';
import type { CrashDetectionEvent } from '../types/app';
import { 
  RouteArcMotif, 
  AnimatedRoadLines,
  MountainContourPattern
} from '../components/graphics';
import heroImage from '../assets/images/motoassist-hero.jpg';

const HIGHWAY_LANDMARKS = [
  'Sevoke Road Checkpost',
  'Coronation Bridge (NH-10)',
  'Bagdogra Airport Bypass',
  'Sukna Forest Crossing',
  'Hill Cart Road / Darjeeling More',
  'Teesta Bazaar Junction',
  'Matigara Highway Crossing',
  'Kurseong Rohini Road'
];

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeRequest, setActiveRequest] = useState<HelpRequest | undefined>();
  const [showUnsafeModal, setShowUnsafeModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedCrashEvent, setDetectedCrashEvent] = useState<CrashDetectionEvent | null>(null);

  // Real Geolocation hook without silent fallbacks
  const {
    accuracy,
    status: locStatus,
    requestLocation,
    setSearchLocation,
    address,
  } = useUserLocation(true);

  // Crash detection listener
  useEffect(() => {
    crashDetector.startMonitoring();
    const unsubCrash = crashDetector.addListener((event) => {
      if (event.confidence === 'HIGH' || event.confidence === 'MEDIUM') {
        setDetectedCrashEvent(event);
      }
    });

    return () => {
      unsubCrash();
    };
  }, []);

  // Load active requests
  useEffect(() => {
    if (user) {
      const all = getRequests();
      const userReq = all.find(
        (r) =>
          r.riderId === user.id &&
          (r.status === 'OPEN' || r.status === 'HELPER_OFFERED' || r.status === 'IN_PROGRESS' || r.status === 'SEARCHING')
      );
      setActiveRequest(userReq);
    }
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 2) {
      setSearchLocation(searchQuery.trim());
      setShowLocationSearch(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A08] text-[#EFF2F7] flex flex-col font-sans relative selection:bg-[#FFF174] selection:text-[#090A08] pb-24 md:pb-12">
      {/* Background Graphic Patterns */}
      <AnimatedRoadLines opacity={0.06} />
      <MountainContourPattern height={180} opacity={0.15} />

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
        primaryContactPhone="+91 98765 43210"
        primaryContactName="Mom / Trusted Circle"
      />

      {/* Medical ID Modal */}
      <MedicalIdQuickModal
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6 space-y-6 sm:space-y-8 relative z-10">
        
        {/* ACTIVE INCIDENT HUD: Renders at the very top if rider has an ongoing rescue */}
        {activeRequest && (
          <ActiveIncidentHUD
            requestId={activeRequest.id}
            issueCategory={activeRequest.issue.replaceAll('_', ' ')}
            status={activeRequest.status === 'HELPER_OFFERED' ? 'ACCEPTED' : activeRequest.status}
            distance="2.4 km away"
            eta="12 mins"
            providerName="Raj Motors Mountain Rescue"
            providerPhone="+91 98320 12345"
            onCancel={() => setActiveRequest(undefined)}
          />
        )}

        {/* ========================================================
            1. AUTOMOTIVE HERO SECTION (Section 3 Requirement)
            ======================================================== */}
        <section 
          className="relative rounded-3xl overflow-hidden border border-[#383A32] bg-[#151613] p-4 sm:p-7 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          aria-labelledby="hero-heading"
        >
          {/* Background Layered Image with controlled crop & organic charcoal gradient */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img 
              src={heroImage} 
              alt="Motorcycle touring mountain road" 
              className="w-full h-full object-cover object-center opacity-30 md:opacity-40 scale-105 transition-transform duration-1000"
              loading="eager"
            />
            {/* Layered Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#090A08] via-[#090A08]/90 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151613] via-transparent to-[#090A08]/80" />
            
            {/* Subtle Chartreuse Route Arc in background */}
            <div className="absolute top-1/3 -right-20 w-96 h-96 bg-[#DFF127]/5 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-5">
            
            {/* Telemetry & Highway Sector Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#20211D] border border-[#383A32] text-[10px] sm:text-[11px] font-mono tracking-wider text-[#DFF127] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#DFF127] animate-pulse" />
                <span className="font-bold">24/7 ROADSIDE RESCUE</span>
                <span className="text-[#545347]">•</span>
                <span className="text-[#A8A6A3]">SILIGURI & HIMALAYAS</span>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#151613]/80 border border-[#383A32] text-[11px] font-mono text-[#A8A6A3]">
                <Radio size={12} className="text-[#10B981]" />
                <span>NH-10 • NH-31 • FOOTHILLS</span>
              </div>
            </div>

            {/* Clear Headline */}
            <div className="space-y-1.5 sm:space-y-2">
              <h1 id="hero-heading" className="text-2xl sm:text-4xl md:text-5xl font-black text-[#EFF2F7] tracking-tight leading-[1.1] font-display">
                Help for the road ahead.
              </h1>
              <p className="text-xs sm:text-base text-[#A8A6A3] leading-relaxed max-w-xl font-normal">
                Specialized motorcycle roadside rescue across Siliguri highway corridors and mountain passes. 
                Verified mechanics, hydraulic motorcycle flatbeds, and instant trauma support when stranded.
              </p>
            </div>

            {/* Tactile Primary & Secondary Actions (Never pushed below image on mobile) */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              {/* PRIMARY ACTION: I NEED HELP */}
              <button
                type="button"
                onClick={() => navigate('/emergency')}
                className="px-5 py-3.5 sm:px-6 sm:py-4 min-h-[48px] rounded-2xl bg-[#FFF174] hover:bg-[#FCEB50] active:scale-[0.98] text-[#090A08] font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(255,241,116,0.3)] transition-all cursor-pointer font-display border border-[#FFF174]"
                aria-label="I NEED HELP - Immediate motorcycle breakdown or medical assistance"
              >
                <Zap size={16} className="text-[#090A08] fill-current" />
                <span>I NEED HELP</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#DFF127]" />
              </button>

              {/* SECONDARY ACTION: EXPLORE SUPPORT */}
              <button
                type="button"
                onClick={() => navigate('/services')}
                className="px-5 py-3.5 sm:px-6 sm:py-4 min-h-[48px] rounded-2xl bg-[#20211D] hover:bg-[#2A2C26] active:scale-[0.98] text-[#EFF2F7] font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 border border-[#383A32] hover:border-[#A8A6A3]/40 transition-all cursor-pointer"
                aria-label="EXPLORE SUPPORT - Browse services and coverage"
              >
                <Compass size={16} className="text-[#FFF174]" />
                <span>EXPLORE SUPPORT</span>
              </button>

              {/* QUICK DIRECT 112 CALL */}
              <a
                href="tel:112"
                className="px-4 py-3.5 sm:py-4 min-h-[48px] rounded-2xl bg-red-600/20 hover:bg-red-600/30 active:scale-[0.98] text-red-200 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-red-500/50 transition-all shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                title="Immediate 112 Emergency Call"
                aria-label="Direct Call 112 Emergency"
              >
                <PhoneCall size={15} className="text-red-400" />
                <span>Call 112</span>
              </a>
            </div>

            {/* Route Arc Overlay Visual */}
            <div className="pt-1 max-w-md hidden sm:block">
              <RouteArcMotif color="#FFF174" accentColor="#DFF127" />
            </div>

          </div>
        </section>

        {/* ========================================================
            2. REAL LOCATION & STATUS STRIP (Honest GPS / Landmark)
            ======================================================== */}
        <section className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] border border-[#383A32] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0 animate-pulse" />
            <div className="truncate">
              <span className="font-bold text-[#EFF2F7] mr-2">Network Status: Active</span>
              <span className="text-[#A8A6A3]">
                {locStatus === 'active' 
                  ? `📍 GPS Acquired${accuracy ? ` (±${accuracy}m)` : ''} • Coordinates Grounded`
                  : locStatus === 'searched'
                  ? `📍 Sector Landmark: ${address}`
                  : locStatus === 'denied'
                  ? '⚠️ GPS disabled • Using milestone lookup'
                  : '📍 Acquiring mountain sector telemetry…'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {locStatus !== 'active' && (
              <button
                type="button"
                onClick={() => requestLocation()}
                className="px-3 py-1.5 rounded-lg bg-[#20211D] hover:bg-[#2A2C26] text-[#FFF174] font-bold text-xs border border-[#383A32] flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
              >
                <RefreshCw size={12} />
                <span>Find GPS</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowLocationSearch(!showLocationSearch)}
              className="px-3 py-1.5 rounded-lg bg-[#20211D] hover:bg-[#2A2C26] text-[#A8A6A3] hover:text-white font-medium text-xs border border-[#383A32] transition-colors cursor-pointer min-h-[36px]"
            >
              {showLocationSearch ? 'Close' : 'Set Landmark'}
            </button>
          </div>

          {/* Quick Landmark Dropdown / Form */}
          {showLocationSearch && (
            <div className="w-full pt-3 mt-1 border-t border-[#383A32] space-y-2 animate-in fade-in duration-150">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search milestone, bridge, junction or pass..."
                  className="flex-1 bg-[#090A08] border border-[#383A32] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFF174]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FFF174] text-[#090A08] font-bold text-xs rounded-xl hover:bg-yellow-400 cursor-pointer"
                >
                  Set Location
                </button>
              </form>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-[#A8A6A3] w-full">Corridor milestones:</span>
                {HIGHWAY_LANDMARKS.slice(0, 5).map((lm) => (
                  <button
                    key={lm}
                    type="button"
                    onClick={() => {
                      setSearchLocation(lm);
                      setSearchQuery(lm);
                      setShowLocationSearch(false);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#20211D] hover:bg-[#2A2C26] border border-[#383A32] text-[#A8A6A3] hover:text-white cursor-pointer"
                  >
                    {lm}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ========================================================
            3. SERVICE OVERVIEW GRID (Section 3 Requirement - 6 Cards)
            ======================================================== */}
        <section className="space-y-3.5" aria-labelledby="services-overview-heading">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#FFF174] block">
                SPECIALIZED MOTORCYCLE SUPPORT
              </span>
              <h2 id="services-overview-heading" className="text-xl sm:text-2xl font-black text-[#EFF2F7] tracking-tight font-display">
                Emergency & Roadside Services
              </h2>
            </div>
            <Link
              to="/services"
              className="text-xs font-bold text-[#FFF174] hover:underline flex items-center gap-1 group"
            >
              <span>View Catalogue</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
            
            {/* Card 1: Medical Assistance */}
            <div
              onClick={() => navigate('/emergency?cat=MEDICAL')}
              className="p-3.5 sm:p-5 rounded-2xl bg-[#151613] hover:bg-[#20211D] active:scale-[0.98] border border-[#383A32] hover:border-red-500/60 transition-all cursor-pointer group flex flex-col justify-between min-h-[155px] sm:min-h-[168px] shadow-md"
              role="button"
              tabIndex={0}
              aria-label="Medical Assistance - Trauma care, ambulance and hospital finder"
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/emergency?cat=MEDICAL'); }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Heart size={20} className="text-red-400" />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">
                    TRAUMA
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-[#EFF2F7] group-hover:text-red-300 transition-colors font-display leading-tight">
                  Medical Assistance
                </h3>
                <p className="text-[11px] sm:text-xs text-[#A8A6A3] mt-1 line-clamp-2 leading-snug">
                  Call 112, emergency trauma hospital locator, and Medical ID card.
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#383A32]/60 flex items-center justify-between text-[11px] text-red-400 font-bold">
                <span>Immediate response</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Bike Breakdown */}
            <div
              onClick={() => navigate('/emergency?cat=BIKE_PROBLEM')}
              className="p-3.5 sm:p-5 rounded-2xl bg-[#151613] hover:bg-[#20211D] active:scale-[0.98] border border-[#383A32] hover:border-[#FFF174]/60 transition-all cursor-pointer group flex flex-col justify-between min-h-[155px] sm:min-h-[168px] shadow-md"
              role="button"
              tabIndex={0}
              aria-label="Bike Breakdown - Puncture, battery, chain and mechanical fix"
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/emergency?cat=BIKE_PROBLEM'); }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF174]/10 border border-[#FFF174]/30 flex items-center justify-center text-[#FFF174] shrink-0 group-hover:scale-105 transition-transform">
                    <Wrench size={20} />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
                    RESCUE
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-[#EFF2F7] group-hover:text-[#FFF174] transition-colors font-display leading-tight">
                  Bike Breakdown
                </h3>
                <p className="text-[11px] sm:text-xs text-[#A8A6A3] mt-1 line-clamp-2 leading-snug">
                  Punctures, jumpstarts, chain snaps, clutch cable fixes & fuel drops.
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#383A32]/60 flex items-center justify-between text-[11px] text-[#FFF174] font-bold">
                <span>Dispatch mechanic</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Personal Safety */}
            <div
              onClick={() => setShowUnsafeModal(true)}
              className="p-3.5 sm:p-5 rounded-2xl bg-[#151613] hover:bg-[#20211D] active:scale-[0.98] border border-[#383A32] hover:border-amber-500/60 transition-all cursor-pointer group flex flex-col justify-between min-h-[155px] sm:min-h-[168px] shadow-md"
              role="button"
              tabIndex={0}
              aria-label="Personal Safety - Alert trusted circle and call 112"
              onKeyDown={(e) => { if (e.key === 'Enter') setShowUnsafeModal(true); }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    SAFETY
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-[#EFF2F7] group-hover:text-amber-300 transition-colors font-display leading-tight">
                  Personal Safety
                </h3>
                <p className="text-[11px] sm:text-xs text-[#A8A6A3] mt-1 line-clamp-2 leading-snug">
                  Feeling unsafe or stranded in dark stretches. Alert contacts & call 112.
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#383A32]/60 flex items-center justify-between text-[11px] text-amber-400 font-bold">
                <span>Trigger safety net</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Towing and Recovery */}
            <div
              onClick={() => navigate('/emergency?cat=TOWING')}
              className="p-3.5 sm:p-5 rounded-2xl bg-[#151613] hover:bg-[#20211D] active:scale-[0.98] border border-[#383A32] hover:border-[#B1D8E3]/60 transition-all cursor-pointer group flex flex-col justify-between min-h-[155px] sm:min-h-[168px] shadow-md"
              role="button"
              tabIndex={0}
              aria-label="Towing & Recovery - Specialized motorcycle flatbeds"
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/emergency?cat=TOWING'); }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#B1D8E3] shrink-0 group-hover:scale-105 transition-transform">
                    <Truck size={20} />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/15 text-[#B1D8E3] border border-blue-500/30">
                    FLATBED
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-[#EFF2F7] group-hover:text-[#B1D8E3] transition-colors font-display leading-tight">
                  Towing & Recovery
                </h3>
                <p className="text-[11px] sm:text-xs text-[#A8A6A3] mt-1 line-clamp-2 leading-snug">
                  Dedicated motorcycle flatbeds with wheel chocks and mountain winch.
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#383A32]/60 flex items-center justify-between text-[11px] text-[#B1D8E3] font-bold">
                <span>Book recovery</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 5: Nearby Support */}
            <div
              onClick={() => navigate('/nearby-services')}
              className="p-3.5 sm:p-5 rounded-2xl bg-[#151613] hover:bg-[#20211D] active:scale-[0.98] border border-[#383A32] hover:border-[#DFF127]/60 transition-all cursor-pointer group flex flex-col justify-between min-h-[155px] sm:min-h-[168px] shadow-md"
              role="button"
              tabIndex={0}
              aria-label="Nearby Support - Verified repair points and fuel"
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/nearby-services'); }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#DFF127]/10 border border-[#DFF127]/30 flex items-center justify-center text-[#DFF127] shrink-0 group-hover:scale-105 transition-transform">
                    <MapPin size={20} />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#DFF127]/15 text-[#DFF127] border border-[#DFF127]/30">
                    RADAR
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-[#EFF2F7] group-hover:text-[#DFF127] transition-colors font-display leading-tight">
                  Nearby Support
                </h3>
                <p className="text-[11px] sm:text-xs text-[#A8A6A3] mt-1 line-clamp-2 leading-snug">
                  Explore verified 2-wheeler mechanics, authorized OEM hubs & 24/7 fuel.
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#383A32]/60 flex items-center justify-between text-[11px] text-[#DFF127] font-bold">
                <span>Open interactive map</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 6: Guided Triage / Uncertain Needs */}
            <div
              onClick={() => navigate('/troubleshoot')}
              className="p-3.5 sm:p-5 rounded-2xl bg-[#151613] hover:bg-[#20211D] active:scale-[0.98] border border-[#383A32] hover:border-purple-400/60 transition-all cursor-pointer group flex flex-col justify-between min-h-[155px] sm:min-h-[168px] shadow-md"
              role="button"
              tabIndex={0}
              aria-label="Guided Triage - Diagnose bike problem step by step"
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/troubleshoot'); }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 group-hover:scale-105 transition-transform">
                    <HelpCircle size={20} />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    DIAGNOSTIC
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-[#EFF2F7] group-hover:text-purple-300 transition-colors font-display leading-tight">
                  Guided Triage & Diagnosis
                </h3>
                <p className="text-[11px] sm:text-xs text-[#A8A6A3] mt-1 line-clamp-2 leading-snug">
                  Not sure what happened? 3 guided checks to pinpoint exact rescue.
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#383A32]/60 flex items-center justify-between text-[11px] text-purple-300 font-bold">
                <span>Start diagnosis</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================
            4. TRUST & PROCESS JOURNEY (Section 3 Requirement)
            ======================================================== */}
        <section 
          className="rounded-3xl bg-[#151613] border border-[#383A32] p-6 sm:p-8 space-y-6"
          aria-labelledby="process-heading"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#DFF127] block">
              THE MOTOASSIST JOURNEY
            </span>
            <h2 id="process-heading" className="text-xl sm:text-3xl font-black text-[#EFF2F7] tracking-tight font-display">
              How roadside assistance works.
            </h2>
            <p className="text-xs sm:text-sm text-[#A8A6A3] max-w-xl">
              Transparent, zero-fuss rescue coordinated across regional highway sectors without login delays.
            </p>
          </div>

          {/* 4 Connected Route Steps with vector lines */}
          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 relative">
            
            {/* Step 1 */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#20211D] border border-[#383A32] space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FFF174] text-[#090A08] font-black text-xs flex items-center justify-center font-mono">
                  01
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-[#DFF127] font-bold">NO DELAY</span>
              </div>
              <h3 className="text-xs sm:text-sm font-black text-[#EFF2F7] font-display pt-1">
                Tell us what happened
              </h3>
              <p className="text-[11px] sm:text-xs text-[#A8A6A3] leading-relaxed line-clamp-2">
                Tap your exact issue: puncture, dead battery, chain, fuel, towing, or trauma care.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#20211D] border border-[#383A32] space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#2A2C26] text-[#FFF174] border border-[#383A32] font-black text-xs flex items-center justify-center font-mono">
                  02
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-[#10B981] font-bold">GPS READY</span>
              </div>
              <h3 className="text-xs sm:text-sm font-black text-[#EFF2F7] font-display pt-1">
                Confirm your location
              </h3>
              <p className="text-[11px] sm:text-xs text-[#A8A6A3] leading-relaxed line-clamp-2">
                Instant GPS fix or choose from recognizable mountain milestones like bridges.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#20211D] border border-[#383A32] space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#2A2C26] text-[#FFF174] border border-[#383A32] font-black text-xs flex items-center justify-center font-mono">
                  03
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-[#FFF174] font-bold">VERIFIED</span>
              </div>
              <h3 className="text-xs sm:text-sm font-black text-[#EFF2F7] font-display pt-1">
                Find suitable help
              </h3>
              <p className="text-[11px] sm:text-xs text-[#A8A6A3] leading-relaxed line-clamp-2">
                Connect directly with verified on-duty roadside mechanics or hydraulic flatbeds.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#20211D] border border-[#383A32] space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#DFF127] text-[#090A08] font-black text-xs flex items-center justify-center font-mono">
                  04
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-[#DFF127] font-bold">TRANSPARENT</span>
              </div>
              <h3 className="text-xs sm:text-sm font-black text-[#EFF2F7] font-display pt-1">
                Follow live updates
              </h3>
              <p className="text-[11px] sm:text-xs text-[#A8A6A3] leading-relaxed line-clamp-2">
                Track status, ETA, technician contact, and standard rate card with zero surprise fees.
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================
            5. RIDER TOOLKIT & MOUNTAIN READINESS STRIP
            ======================================================== */}
        <section className="grid grid-cols-1 min-[340px]:grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          
          <Link
            to="/remote-readiness"
            className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] hover:bg-[#20211D] border border-[#383A32] hover:border-[#FFF174]/40 flex flex-col justify-between transition-all group min-h-[96px]"
          >
            <Compass size={18} className="text-[#FFF174] mb-1.5 group-hover:scale-110 transition-transform" />
            <div>
              <span className="block text-xs font-black text-[#EFF2F7] group-hover:text-[#FFF174]">Remote Readiness</span>
              <span className="block text-[10px] text-[#A8A6A3] mt-0.5">Offline pass guide</span>
            </div>
          </Link>

          <Link
            to="/safe-ride"
            className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] hover:bg-[#20211D] border border-[#383A32] hover:border-[#10B981]/40 flex flex-col justify-between transition-all group min-h-[96px]"
          >
            <Navigation size={18} className="text-[#10B981] mb-1.5 group-hover:scale-110 transition-transform" />
            <div>
              <span className="block text-xs font-black text-[#EFF2F7] group-hover:text-[#10B981]">Start Safe Ride</span>
              <span className="block text-[10px] text-[#A8A6A3] mt-0.5">Live route sharing</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setShowMedicalModal(true)}
            className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] hover:bg-[#20211D] border border-[#383A32] hover:border-red-500/40 flex flex-col justify-between transition-all group text-left cursor-pointer min-h-[96px]"
          >
            <Heart size={18} className="text-red-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div>
              <span className="block text-xs font-black text-[#EFF2F7] group-hover:text-red-300">Medical ID Card</span>
              <span className="block text-[10px] text-[#A8A6A3] mt-0.5">Blood group & ICE</span>
            </div>
          </button>

          <Link
            to="/ops"
            className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] hover:bg-[#20211D] border border-[#383A32] hover:border-[#DFF127]/40 flex flex-col justify-between transition-all group min-h-[96px]"
          >
            <Radio size={18} className="text-[#DFF127] mb-1.5 group-hover:scale-110 transition-transform" />
            <div>
              <span className="block text-xs font-black text-[#EFF2F7] group-hover:text-[#DFF127]">Ops Command</span>
              <span className="block text-[10px] text-[#A8A6A3] mt-0.5">Live dispatch desk</span>
            </div>
          </Link>

        </section>

      </main>
    </div>
  );
}
