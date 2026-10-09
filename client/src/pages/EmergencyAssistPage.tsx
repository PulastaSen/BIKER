import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  HelpCircle,
  MapPin,
  ArrowLeft,
  Heart,
  ChevronRight,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useUserLocation } from '../hooks/useUserLocation';
import { FeelingUnsafeModal } from '../components/FeelingUnsafeModal';
import { MedicalIdQuickModal } from '../components/MedicalIdQuickModal';
import { MountainContourPattern, AnimatedRoadLines } from '../components/graphics';

type HelpCategory = 'MEDICAL' | 'BIKE_PROBLEM' | 'UNSAFE' | 'TOWING' | 'NOT_SURE' | null;

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

  const [selectedCategory, setSelectedCategory] = useState<HelpCategory>(null);
  const [showUnsafeModal, setShowUnsafeModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [searchPlace, setSearchPlace] = useState('');
  const [showLandmarkSearch, setShowLandmarkSearch] = useState(false);

  // Guided diagnosis for "I'm not sure"
  const [engineCranks, setEngineCranks] = useState<'YES' | 'NO' | null>(null);
  const [bikeRolls, setBikeRolls] = useState<'YES' | 'NO' | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);

  // Immediate dispatch submission state
  const [dispatchPending, setDispatchPending] = useState(false);
  const [dispatchConfirmed, setDispatchConfirmed] = useState(false);
  const [riderNote, setRiderNote] = useState('');

  // Geolocation without automatic silent fallbacks or forced launch requests
  const {
    accuracy,
    status: locStatus,
    updatedText,
    address,
    requestLocation,
    setSearchLocation,
  } = useUserLocation(false);

  const handleCategoryClick = (cat: HelpCategory) => {
    setSelectedCategory(cat);
    if (cat === 'UNSAFE') {
      setShowUnsafeModal(true);
    }
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

  const handleDiagnose = () => {
    if (bikeRolls === 'NO') {
      setDiagnosisResult('Mechanical or Chain/Brake Lock: We recommend a Flatbed Tow Truck.');
    } else if (engineCranks === 'NO') {
      setDiagnosisResult('Electrical / Battery Failure: Mobile mechanic with jump starter needed.');
    } else {
      setDiagnosisResult('Engine or Fuel System: On-site roadside mechanic diagnosis recommended.');
    }
  };

  const handleDispatchAssistance = () => {
    setDispatchPending(true);
    setTimeout(() => {
      setDispatchPending(false);
      setDispatchConfirmed(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col font-sans selection:bg-red-500 selection:text-white pb-24 md:pb-16 relative">
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

      {/* TOP EMERGENCY HEADER */}
      <header className="sticky top-0 z-40 bg-[#140808]/95 border-b border-red-500/40 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-gray-200 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Exit Emergency</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-black text-xs sm:text-sm text-red-300 tracking-wider uppercase">
              EMERGENCY ASSIST MODE
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowMedicalModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold text-red-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Emergency Medical ID"
          >
            <Heart size={14} className="text-red-400" />
            <span className="hidden sm:inline">Medical ID</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 pt-5 space-y-5 relative z-10">
        
        {/* HERO TITLE SECTION */}
        <section className="space-y-1.5 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Let's get you help.
          </h1>
          <p className="text-sm text-gray-300 font-medium">
            Choose what is happening. You can change your choice later.
          </p>
        </section>

        {/* PROMINENT CALL 112 ACTION (National Emergency India) */}
        <section className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-600 via-red-600 to-red-700 border-2 border-red-400 shadow-[0_0_30px_rgba(220,38,38,0.45)] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <PhoneCall size={24} className="text-white animate-bounce" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-red-100 block">
                NATIONAL EMERGENCY SERVICES (INDIA)
              </span>
              <strong className="text-lg sm:text-xl font-black text-white block">
                Immediate Police, Ambulance & Fire: 112
              </strong>
              <span className="text-[11px] text-red-100/90 block">
                Tapping dials 112 on your device via phone network.
              </span>
            </div>
          </div>

          <a
            href="tel:112"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-red-700 hover:bg-red-50 active:scale-95 font-black text-sm uppercase tracking-wider text-center shadow-lg transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            <PhoneCall size={18} />
            <span>Call 112 Now</span>
          </a>
        </section>

        {/* SECTION 4: LOCATION ACCESS DURING EMERGENCY */}
        <section className="p-4 rounded-2xl bg-[#121212] border border-white/10 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FFF174] shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-300 block">
                  Your current location helps us find the right assistance.
                </span>
                <span className="text-[11px] text-gray-400 block mt-0.5">
                  {locStatus === 'active' && (
                    <span className="text-emerald-400 font-semibold">
                      📍 Location acquired. {accuracy ? `(Accuracy ±${accuracy}m)` : ''} • Updated {updatedText}
                    </span>
                  )}
                  {locStatus === 'requesting' && (
                    <span className="text-yellow-400 font-semibold flex items-center gap-1.5">
                      <Loader2 size={12} className="animate-spin inline" /> Finding your location…
                    </span>
                  )}
                  {locStatus === 'denied' && (
                    <span className="text-amber-400 font-semibold">
                      ⚠️ Location access is turned off.
                    </span>
                  )}
                  {locStatus === 'searched' && (
                    <span className="text-emerald-400 font-semibold">
                      📍 Landmark set: {address}
                    </span>
                  )}
                  {locStatus === 'idle' && (
                    <span className="text-gray-400">GPS not requested yet. Tap below to share location.</span>
                  )}
                </span>
              </div>
            </div>

            {locStatus !== 'active' && (
              <button
                type="button"
                onClick={handleLocationRequest}
                className="px-3 py-1.5 rounded-xl bg-[#FFF174] text-black font-bold text-xs hover:bg-yellow-400 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                {locStatus === 'denied' ? 'Enable location' : 'Find Location'}
              </button>
            )}
          </div>

          {/* Fallback actions if denied or unavailable */}
          {(locStatus === 'denied' || locStatus === 'unavailable' || showLandmarkSearch) && (
            <div className="pt-2 border-t border-white/10 space-y-2.5 animate-in fade-in duration-200">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={searchPlace}
                  onChange={(e) => setSearchPlace(e.target.value)}
                  placeholder="Search place, town, milestone or highway junction..."
                  className="flex-1 bg-[#181818] border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFF174]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Set Landmark
                </button>
              </form>

              {/* Quick Landmark Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-gray-500 w-full">Quick Siliguri & Himalayan corridors:</span>
                {HIGHWAY_LANDMARKS.slice(0, 4).map((lm) => (
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

          {locStatus !== 'denied' && !showLandmarkSearch && (
            <button
              type="button"
              onClick={() => setShowLandmarkSearch(true)}
              className="text-[11px] text-gray-400 hover:text-[#FFF174] underline underline-offset-4 cursor-pointer"
            >
              Or search for a place or landmark manually
            </button>
          )}
        </section>

        {/* 5 LARGE TOUCH-FRIENDLY CATEGORY CARDS */}
        <section className="space-y-3" aria-label="Emergency Help Categories">
          <div className="text-xs font-black uppercase tracking-wider text-gray-400 px-1">
            SELECT WHAT IS HAPPENING
          </div>

          {/* 1. 🚑 Medical emergency */}
          <button
            type="button"
            onClick={() => handleCategoryClick('MEDICAL')}
            className={`w-full p-5 rounded-3xl text-left border-2 transition-all cursor-pointer group flex items-center justify-between gap-4 ${
              selectedCategory === 'MEDICAL'
                ? 'bg-red-950/50 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.35)]'
                : 'bg-[#141414] hover:bg-[#1a1414] border-white/10 hover:border-red-500/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                🚑
              </div>
              <div>
                <strong className="text-lg font-black text-white group-hover:text-red-300 transition-colors block">
                  Medical emergency
                </strong>
                <span className="text-xs text-gray-400 block mt-0.5">
                  For accidents, injuries or urgent medical assistance.
                </span>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  Priority Dispatch • 108 Ambulance Alert
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0" />
          </button>

          {/* 2. 🔧 Bike problem */}
          <button
            type="button"
            onClick={() => handleCategoryClick('BIKE_PROBLEM')}
            className={`w-full p-5 rounded-3xl text-left border-2 transition-all cursor-pointer group flex items-center justify-between gap-4 ${
              selectedCategory === 'BIKE_PROBLEM'
                ? 'bg-yellow-950/40 border-[#FFF174] shadow-[0_0_25px_rgba(255,241,116,0.3)]'
                : 'bg-[#141414] hover:bg-[#1c1c14] border-white/10 hover:border-[#FFF174]/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                🔧
              </div>
              <div>
                <strong className="text-lg font-black text-white group-hover:text-[#FFF174] transition-colors block">
                  Bike problem
                </strong>
                <span className="text-xs text-gray-400 block mt-0.5">
                  For punctures, battery failure, engine problems, fuel and repairs.
                </span>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                  Mechanic on-site • Mobile tools
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-[#FFF174] group-hover:translate-x-1 transition-all shrink-0" />
          </button>

          {/* 3. ⚠️ I feel unsafe */}
          <button
            type="button"
            onClick={() => handleCategoryClick('UNSAFE')}
            className={`w-full p-5 rounded-3xl text-left border-2 transition-all cursor-pointer group flex items-center justify-between gap-4 ${
              selectedCategory === 'UNSAFE'
                ? 'bg-amber-950/50 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
                : 'bg-[#141414] hover:bg-[#1c1612] border-white/10 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                ⚠️
              </div>
              <div>
                <strong className="text-lg font-black text-white group-hover:text-amber-300 transition-colors block">
                  I feel unsafe
                </strong>
                <span className="text-xs text-gray-400 block mt-0.5">
                  For threats, harassment, being followed or feeling unsafe.
                </span>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Instant Siren • WhatsApp Live Circle • Call 112
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
          </button>

          {/* 4. 🚚 I need towing */}
          <button
            type="button"
            onClick={() => handleCategoryClick('TOWING')}
            className={`w-full p-5 rounded-3xl text-left border-2 transition-all cursor-pointer group flex items-center justify-between gap-4 ${
              selectedCategory === 'TOWING'
                ? 'bg-blue-950/40 border-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.3)]'
                : 'bg-[#141414] hover:bg-[#12161c] border-white/10 hover:border-blue-400/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                🚚
              </div>
              <div>
                <strong className="text-lg font-black text-white group-hover:text-blue-300 transition-colors block">
                  I need towing
                </strong>
                <span className="text-xs text-gray-400 block mt-0.5">
                  For motorcycles that cannot safely be ridden.
                </span>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Hydraulic Flatbed • Secure Straps • Winch
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
          </button>

          {/* 5. ❓ I'm not sure */}
          <button
            type="button"
            onClick={() => handleCategoryClick('NOT_SURE')}
            className={`w-full p-5 rounded-3xl text-left border-2 transition-all cursor-pointer group flex items-center justify-between gap-4 ${
              selectedCategory === 'NOT_SURE'
                ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_25px_rgba(192,132,252,0.3)]'
                : 'bg-[#141414] hover:bg-[#18141c] border-white/10 hover:border-purple-400/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                ❓
              </div>
              <div>
                <strong className="text-lg font-black text-white group-hover:text-purple-300 transition-colors block">
                  I'm not sure
                </strong>
                <span className="text-xs text-gray-400 block mt-0.5">
                  For users who cannot identify the problem.
                </span>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  30-Second Guided Symptom Diagnostic
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all shrink-0" />
          </button>
        </section>

        {/* ACTIVE DIRECT HELP FLOW ACCORDING TO SELECTION */}
        {selectedCategory === 'NOT_SURE' && (
          <section className="p-5 rounded-3xl bg-[#161616] border border-purple-500/40 space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-black text-purple-300 flex items-center gap-2">
              <HelpCircle size={18} />
              <span>30-Second Guided Problem Check</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold block">1. When you press the starter, does the engine crank or turn over?</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEngineCranks('YES')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                      engineCranks === 'YES' ? 'bg-[#FFF174] text-black border-[#FFF174]' : 'bg-white/5 text-gray-300 border-white/10'
                    }`}
                  >
                    Yes, it cranks
                  </button>
                  <button
                    type="button"
                    onClick={() => setEngineCranks('NO')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                      engineCranks === 'NO' ? 'bg-[#FFF174] text-black border-[#FFF174]' : 'bg-white/5 text-gray-300 border-white/10'
                    }`}
                  >
                    No, complete silence / click
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold block">2. Can you safely push the motorcycle in neutral, or is it locked?</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBikeRolls('YES')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                      bikeRolls === 'YES' ? 'bg-[#FFF174] text-black border-[#FFF174]' : 'bg-white/5 text-gray-300 border-white/10'
                    }`}
                  >
                    Rolls freely
                  </button>
                  <button
                    type="button"
                    onClick={() => setBikeRolls('NO')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                      bikeRolls === 'NO' ? 'bg-[#FFF174] text-black border-[#FFF174]' : 'bg-white/5 text-gray-300 border-white/10'
                    }`}
                  >
                    Wheels locked / Stuck
                  </button>
                </div>
              </div>

              {engineCranks && bikeRolls && !diagnosisResult && (
                <button
                  type="button"
                  onClick={handleDiagnose}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 font-bold text-white rounded-xl cursor-pointer"
                >
                  Analyze Problem
                </button>
              )}

              {diagnosisResult && (
                <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-200 space-y-2">
                  <strong className="block font-bold">Suggested Course of Action:</strong>
                  <p className="text-xs text-gray-200">{diagnosisResult}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* DIRECT DISPATCH ACTION (Zero Login Barrier) */}
        {selectedCategory && selectedCategory !== 'UNSAFE' && (
          <section className="p-5 rounded-3xl bg-[#141414] border border-white/15 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center justify-between">
              <span>CONFIRM RESCUE DISPATCH</span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                No account required
              </span>
            </h3>

            <div className="space-y-2">
              <label htmlFor="riderEmergencyNote" className="text-xs text-gray-300 block font-bold">
                Optional note or landmark details:
              </label>
              <textarea
                id="riderEmergencyNote"
                rows={2}
                value={riderNote}
                onChange={(e) => setRiderNote(e.target.value)}
                placeholder="e.g. Red KTM parked on shoulder near river crossing, tyre completely flat..."
                className="w-full bg-[#181818] border border-white/20 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFF174]"
              />
            </div>

            {dispatchConfirmed ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-center space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                <strong className="block text-base font-black">Help is being dispatched!</strong>
                <p className="text-xs text-gray-300">
                  Nearest available verified Himalayan roadside partner alerted. Keep your mobile phone line clear.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <a
                    href="tel:112"
                    className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl"
                  >
                    Call 112 if condition worsens
                  </a>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-white/10 text-white font-bold text-xs rounded-xl hover:bg-white/20"
                  >
                    View Status
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDispatchAssistance}
                disabled={dispatchPending}
                className="w-full py-4 rounded-2xl bg-[#FFF174] hover:bg-yellow-400 active:scale-98 text-black font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(255,241,116,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {dispatchPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>COORDINATING NEAREST RESCUE...</span>
                  </>
                ) : (
                  <>
                    <span>REQUEST IMMEDIATE ASSISTANCE</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            )}
          </section>
        )}

      </main>
    </div>
  );
}
