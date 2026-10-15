import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PhoneCall,
  MapPin,
  ArrowLeft,
  Heart,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useUserLocation } from '../hooks/useUserLocation';
import { MedicalIdQuickModal } from '../components/MedicalIdQuickModal';
import { MountainContourPattern, AnimatedRoadLines } from '../components/graphics';
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
    <div className="min-h-screen bg-[#090909] text-white flex flex-col font-sans selection:bg-red-500 selection:text-white pb-16 relative">
      <AnimatedRoadLines opacity={0.12} />
      <MountainContourPattern height={140} opacity={0.2} />

      {/* Medical ID Modal */}
      <MedicalIdQuickModal
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
      />

      {/* TOP EMERGENCY HEADER - ALWAYS VISIBLE */}
      <header className="sticky top-0 z-40 bg-[#120808]/95 border-b border-red-500/40 backdrop-blur-md px-3.5 py-2.5 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer min-h-[40px] px-2"
            aria-label="Return to home screen"
          >
            <ArrowLeft size={16} />
            <span>Home</span>
          </button>

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

      {/* CATEGORY SELECTION VIEW - ALWAYS VISIBLE IN THE DOM (NEVER DISAPPEARS OR MOVES) */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pt-4 pb-8 space-y-4 relative z-10" aria-live="polite">
        
        {/* Header text */}
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            What emergency are you facing?
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 font-medium">
            Tap your issue below. Immediate actions appear directly in a focused overlay without scrolling.
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

        {/* 6 TOUCH-FRIENDLY CATEGORY SELECTION CARDS */}
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
