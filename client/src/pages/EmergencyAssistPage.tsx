import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PhoneCall,
  MapPin,
  ArrowLeft,
  Heart,
  ChevronRight,
  Loader2,
  Wrench,
  Truck,
  ShieldAlert
} from 'lucide-react';
import { useUserLocation } from '../hooks/useUserLocation';
import { MedicalIdQuickModal } from '../components/MedicalIdQuickModal';
import {
  MountainContourPattern,
  AnimatedRoadLines,
  DualEmergencyGraphic
} from '../components/graphics';
import { EmergencyActionSheet, type EmergencyCategory } from '../components/EmergencyActionSheet';

export type HelpCategory = EmergencyCategory;

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

export function EmergencyAssistPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read category from URL parameter to allow browser back/forward and deep-linking
  const catParam = searchParams.get('cat') as EmergencyCategory | null;
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory | null>(catParam);

  // Modals
  const [showMedicalModal, setShowMedicalModal] = useState(false);

  // Manual landmark search state
  const [searchPlace, setSearchPlace] = useState('');
  const [showLandmarkSearch, setShowLandmarkSearch] = useState(false);

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

  const selectCategory = (cat: EmergencyCategory) => {
    setSelectedCategory(cat);
    setSearchParams(cat ? { cat } : {});
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSearchParams({});
  };

  const handleLocationRequest = () => {
    requestLocation('Your current location helps us find the right assistance.');
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchPlace.trim().length > 2) {
      setSearchLocation(searchPlace.trim());
      setShowLandmarkSearch(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A08] text-[#EFF2F7] flex flex-col font-sans selection:bg-red-500 selection:text-white pb-16 relative">
      <AnimatedRoadLines opacity={0.08} />
      <MountainContourPattern height={140} opacity={0.15} />

      {/* Medical ID Modal */}
      <MedicalIdQuickModal
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
      />

      {/* TOP EMERGENCY HEADER - ALWAYS VISIBLE */}
      <header className="sticky top-0 z-40 bg-[#150A0A]/95 border-b border-red-500/40 backdrop-blur-md px-3.5 py-2.5 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-[#A8A6A3] hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] px-2.5"
            aria-label="Return to home screen"
          >
            <ArrowLeft size={16} />
            <span>Home</span>
          </button>

          <div className="flex items-center gap-2 select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-red-300 font-display">
              EMERGENCY ASSIST
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMedicalModal(true)}
              className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold text-red-200 flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
              title="Emergency Medical ID"
              aria-label="Open Medical ID card"
            >
              <Heart size={14} className="text-red-400" />
              <span className="hidden sm:inline">Medical ID</span>
            </button>

            {/* Quick 112 Call in Top Bar */}
            <a
              href="tel:112"
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 shadow-[0_0_12px_rgba(239,68,68,0.5)] min-h-[44px] min-w-[44px] font-display"
              title="Immediate Call 112"
              aria-label="Call 112 National Emergency"
            >
              <PhoneCall size={14} />
              <span>112</span>
            </a>
          </div>
        </div>
      </header>

      {/* CATEGORY SELECTION VIEW - ALWAYS VISIBLE IN THE DOM */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pt-4 pb-8 space-y-4 relative z-10" aria-live="polite">
        
        {/* Header text */}
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-[#EFF2F7] tracking-tight font-display">
            What emergency are you facing?
          </h1>
          <p className="text-xs sm:text-sm text-[#A8A6A3] font-medium">
            Tap your issue below. Immediate actions appear directly in a focused overlay without scrolling.
          </p>
        </div>

        {/* Rapid Call 112 Card - Always Visible */}
        <section className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-800 via-red-600 to-red-800 border border-red-400/80 shadow-[0_0_25px_rgba(220,38,38,0.35)] text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <PhoneCall size={20} className="text-white animate-bounce" />
            </div>
            <div className="leading-tight">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-red-200 block">
                INDIA NATIONAL EMERGENCY
              </span>
              <strong className="text-sm sm:text-base font-black text-white block font-display">
                Call 112 for Police, Ambulance & Fire
              </strong>
            </div>
          </div>

          <a
            href="tel:112"
            className="px-4 py-2.5 rounded-xl bg-white text-red-700 hover:bg-red-50 active:scale-95 font-black text-xs uppercase tracking-wider shrink-0 transition-transform shadow-md flex items-center gap-1.5 min-h-[44px] font-display"
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

        {/* 6 TOUCH-FRIENDLY CATEGORY SELECTION CARDS */}
        <section className="space-y-2.5" aria-label="Select Emergency Category">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-400 px-1">
            <span>SELECT EMERGENCY CATEGORY</span>
            <span className="text-[11px] text-[#FFF174]">Tap to open overlay</span>
          </div>

          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
            {/* 1. Medical Assistance */}
            <button
              type="button"
              onClick={() => selectCategory('MEDICAL')}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] hover:bg-[#20211D] active:scale-[0.98] border-2 border-[#383A32] hover:border-red-500/80 transition-all cursor-pointer group flex flex-col justify-between min-h-[155px] sm:min-h-[168px] text-left shadow-lg shadow-black/25 relative overflow-hidden"
              aria-label="Medical Assistance - Accidents, injuries, trauma care"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Heart size={20} className="text-red-400" />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 shrink-0">
                    TRAUMA
                  </span>
                </div>
                <strong className="text-sm sm:text-base font-black text-[#EFF2F7] group-hover:text-red-300 transition-colors block font-display leading-tight">
                  Medical Assistance
                </strong>
                <p className="text-[11px] sm:text-xs text-[#A8A6A3] line-clamp-2 mt-1 leading-snug">
                  Accidents, injuries, 112 ambulance & emergency hospital finder.
                </p>
              </div>

              <div className="pt-2 border-t border-[#383A32]/60 flex items-center justify-between text-[11px] font-bold text-red-400">
                <span>Call 112 & Care</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* 2. Bike Breakdown */}
            <button
              type="button"
              onClick={() => selectCategory('BIKE_PROBLEM')}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] hover:bg-[#20211D] active:scale-[0.98] border-2 border-[#383A32] hover:border-[#FFF174]/80 transition-all cursor-pointer group flex flex-col justify-between min-h-[155px] sm:min-h-[168px] text-left shadow-lg shadow-black/25 relative overflow-hidden"
              aria-label="Bike Breakdown - Punctures, battery failure, engine problems, fuel and repairs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF174]/15 border border-[#FFF174]/30 flex items-center justify-center text-[#FFF174] shrink-0 group-hover:scale-105 transition-transform">
                    <Wrench size={20} />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shrink-0">
                    RESCUE
                  </span>
                </div>
                <strong className="text-sm sm:text-base font-black text-[#EFF2F7] group-hover:text-[#FFF174] transition-colors block font-display leading-tight">
                  Bike Breakdown
                </strong>
                <p className="text-[11px] sm:text-xs text-[#A8A6A3] line-clamp-2 mt-1 leading-snug">
                  Punctures, battery jumpstart, chain snaps & roadside mechanics.
                </p>
              </div>

              <div className="pt-2 border-t border-[#383A32]/60 flex items-center justify-between text-[11px] font-bold text-[#FFF174]">
                <span>Dispatch Help</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* 3. Personal Safety */}
            <button
              type="button"
              onClick={() => selectCategory('UNSAFE')}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] hover:bg-[#20211D] active:scale-[0.98] border-2 border-[#383A32] hover:border-amber-500/80 transition-all cursor-pointer group flex flex-col justify-between min-h-[155px] sm:min-h-[168px] text-left shadow-lg shadow-black/25 relative overflow-hidden"
              aria-label="Personal Safety - Threats, harassment, being followed or feeling unsafe"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                    <ShieldAlert size={20} />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                    SAFETY
                  </span>
                </div>
                <strong className="text-sm sm:text-base font-black text-[#EFF2F7] group-hover:text-amber-300 transition-colors block font-display leading-tight">
                  Personal Safety
                </strong>
                <p className="text-[11px] sm:text-xs text-[#A8A6A3] line-clamp-2 mt-1 leading-snug">
                  Police 112, emergency circle alert & safe haven checkpoints.
                </p>
              </div>

              <div className="pt-2 border-t border-[#383A32]/60 flex items-center justify-between text-[11px] font-bold text-amber-400">
                <span>Trigger Net</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* 4. Towing & Recovery */}
            <button
              type="button"
              onClick={() => selectCategory('TOWING')}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] hover:bg-[#20211D] active:scale-[0.98] border-2 border-[#383A32] hover:border-[#B1D8E3]/80 transition-all cursor-pointer group flex flex-col justify-between min-h-[155px] sm:min-h-[168px] text-left shadow-lg shadow-black/25 relative overflow-hidden"
              aria-label="Towing and Recovery - Dedicated 2-wheeler flatbeds"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-[#B1D8E3] shrink-0 group-hover:scale-105 transition-transform">
                    <Truck size={20} />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-[#B1D8E3] border border-blue-500/30 shrink-0">
                    FLATBED
                  </span>
                </div>
                <strong className="text-sm sm:text-base font-black text-[#EFF2F7] group-hover:text-[#B1D8E3] transition-colors block font-display leading-tight">
                  Towing & Recovery
                </strong>
                <p className="text-[11px] sm:text-xs text-[#A8A6A3] line-clamp-2 mt-1 leading-snug">
                  Dedicated motorcycle flatbed recovery with winch & wheel chocks.
                </p>
              </div>

              <div className="pt-2 border-t border-[#383A32]/60 flex items-center justify-between text-[11px] font-bold text-[#B1D8E3]">
                <span>Book Flatbed</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* 5. Nearby Support */}
            <button
              type="button"
              onClick={() => selectCategory('NEARBY_SUPPORT')}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] hover:bg-[#20211D] active:scale-[0.98] border-2 border-[#383A32] hover:border-emerald-400/80 transition-all cursor-pointer group flex flex-col justify-between min-h-[155px] sm:min-h-[168px] text-left shadow-lg shadow-black/25 relative overflow-hidden"
              aria-label="Nearby Support - Verified repair points, mechanics and fuel"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                    <MapPin size={20} />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    RADAR
                  </span>
                </div>
                <strong className="text-sm sm:text-base font-black text-[#EFF2F7] group-hover:text-emerald-300 transition-colors block font-display leading-tight">
                  Nearby Support
                </strong>
                <p className="text-[11px] sm:text-xs text-[#A8A6A3] line-clamp-2 mt-1 leading-snug">
                  Find verified 2-wheeler mechanics, OEM service hubs & 24/7 fuel.
                </p>
              </div>

              <div className="pt-2 border-t border-[#383A32]/60 flex items-center justify-between text-[11px] font-bold text-emerald-400">
                <span>Find Services</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* 6. Unsure / Need Multiple Types of Help */}
            <button
              type="button"
              onClick={() => selectCategory('BOTH')}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] hover:bg-[#20211D] active:scale-[0.98] border-2 border-red-500/40 hover:border-red-500 transition-all cursor-pointer group flex flex-col justify-between min-h-[155px] sm:min-h-[168px] text-left shadow-lg shadow-black/25 relative overflow-hidden"
              aria-label="Unsure / Need Multiple Types of Help - Combined medical and bike assistance or guided triage"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 group-hover:scale-105 transition-transform">
                    <DualEmergencyGraphic size={24} />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/40 shrink-0">
                    MULTI-NEED
                  </span>
                </div>
                <strong className="text-sm sm:text-base font-black text-[#EFF2F7] group-hover:text-purple-300 transition-colors block font-display leading-tight">
                  Unsure / Both
                </strong>
                <p className="text-[11px] sm:text-xs text-[#A8A6A3] line-clamp-2 mt-1 leading-snug">
                  Combined trauma & motorcycle rescue or guided triage diagnosis.
                </p>
              </div>

              <div className="pt-2 border-t border-[#383A32]/60 flex items-center justify-between text-[11px] font-bold text-purple-300">
                <span>Get Guidance</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </section>

        {/* Discreet Help Tip */}
        <div className="text-center text-[11px] text-gray-400 pt-2">
          <span>All emergency actions operate instantly without login or registration.</span>
        </div>
      </main>

      {/* REUSABLE CATEGORY OVERLAY BOTTOM SHEET / MODAL */}
      <EmergencyActionSheet
        isOpen={Boolean(selectedCategory)}
        onClose={handleBackToCategories}
        category={selectedCategory}
        onSelectCategory={selectCategory}
        coords={coords}
        accuracy={accuracy}
        address={address}
        onOpenLandmarkSearch={() => setShowLandmarkSearch(true)}
        onOpenMedicalId={() => setShowMedicalModal(true)}
      />
    </div>
  );
}
