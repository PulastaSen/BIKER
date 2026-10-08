import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  MapPin, 
  Disc, 
  BatteryCharging, 
  Fuel, 
  Wrench, 
  Truck, 
  TriangleAlert, 
  HelpCircle,
  Link as ChainIcon,
  ArrowRight,
  ArrowLeft,
  Search,
  CheckCircle2,
  Navigation,
  Heart,
  PhoneCall,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserLocation } from '../hooks/useUserLocation';
import { createAssistanceRequest } from '../services/ecosystemApi';
import { saveRequest, getBikes } from '../utils/appStorage';
import type { Bike } from '../types/app';

// 8 Issues specified in Section 10
const STRANDED_ISSUES = [
  { id: 'Puncture', label: '🛞 Puncture', desc: 'Flat tyre, puncture or air leak', icon: Disc, color: 'text-amber-400' },
  { id: 'Battery', label: '🔋 Battery', desc: 'Dead battery, won\'t crank', icon: BatteryCharging, color: 'text-yellow-400' },
  { id: 'Fuel', label: '⛽ Out of Fuel', desc: 'Out of fuel on highway', icon: Fuel, color: 'text-emerald-400' },
  { id: 'Bike Problem', label: '🔧 Bike Problem', desc: 'Engine stopped or strange noise', icon: Wrench, color: 'text-blue-400' },
  { id: 'Chain Problem', label: '⛓️ Chain Problem', desc: 'Broken chain or sprocket jam', icon: ChainIcon, color: 'text-orange-400' },
  { id: 'Towing', label: '🚚 Need Towing', desc: 'Flatbed or carrier rescue needed', icon: Truck, color: 'text-purple-400' },
  { id: 'Accident', label: '💥 Accident', desc: 'Crash or collision on road', icon: TriangleAlert, color: 'text-red-400' },
  { id: 'I Don\'t Know', label: '❓ I Don\'t Know', desc: 'Unsure, guided diagnosis', icon: HelpCircle, color: 'text-gray-300' }
];

const HELP_TYPES = [
  { id: 'Mechanic', label: 'Mechanic', desc: 'On-site breakdown repair', icon: Wrench },
  { id: 'Towing', label: 'Towing', desc: 'Flatbed or carrier transport', icon: Truck },
  { id: 'Fuel', label: 'Fuel Delivery', desc: 'Emergency petrol to location', icon: Fuel },
  { id: 'Battery', label: 'Battery Jump', desc: 'Jump start or fresh battery', icon: BatteryCharging },
  { id: 'Medical', label: 'Medical Help', desc: 'Ambulance or first aid', icon: Heart },
  { id: 'Emergency', label: 'Emergency 112', desc: 'Police or highway patrol', icon: PhoneCall },
];

const COMMON_LANDMARKS = [
  'Sevoke Road Checkpost',
  'Coronation Bridge (NH-10)',
  'Bagdogra Airport Bypass',
  'Sukna Forest Checkpost',
  'Hill Cart Road / Darjeeling More',
  'Matigara Highway Crossing',
  'Teesta Bazaar Junction',
  'Kurseong Rohini Road'
];

export function ImStrandedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Steps: 1: WHAT HAPPENED? -> 2: WHERE ARE YOU? -> 3: WHAT HELP DO YOU NEED?
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [selectedHelp, setSelectedHelp] = useState<string>('Mechanic');
  const [searchPlace, setSearchPlace] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // "I Don't Know" guided diagnosis questions (Section 11)
  const [showGuidedQuestions, setShowGuidedQuestions] = useState(false);
  const [bikeStarts, setBikeStarts] = useState<'YES' | 'NO' | null>(null);
  const [warningLight, setWarningLight] = useState<'YES' | 'NO' | 'NOT_SURE' | null>(null);

  const {
    coords,
    accuracy,
    status: locStatus,
    updatedText,
    address,
    requestLocation,
    setSearchLocation,
  } = useUserLocation(false);

  const handleSelectIssue = (issueId: string) => {
    if (issueId === 'I Don\'t Know') {
      setShowGuidedQuestions(true);
      return;
    }
    setSelectedIssue(issueId);
    // Pre-select appropriate help type
    if (issueId === 'Towing') setSelectedHelp('Towing');
    else if (issueId === 'Fuel') setSelectedHelp('Fuel');
    else if (issueId === 'Battery') setSelectedHelp('Battery');
    else if (issueId === 'Accident') setSelectedHelp('Towing');
    else setSelectedHelp('Mechanic');
    setStep(2);
  };

  const handleFinishGuidedDiagnosis = () => {
    let resolvedIssue = 'Bike Problem';
    let resolvedHelp = 'Mechanic';

    if (bikeStarts === 'NO' && warningLight === 'NO') {
      resolvedIssue = 'Battery';
      resolvedHelp = 'Battery';
    } else if (bikeStarts === 'NO' && warningLight === 'YES') {
      resolvedIssue = 'Bike Problem';
      resolvedHelp = 'Mechanic';
    } else if (bikeStarts === 'YES') {
      resolvedIssue = 'Bike Problem';
      resolvedHelp = 'Mechanic';
    } else {
      resolvedIssue = 'Towing';
      resolvedHelp = 'Towing';
    }

    setSelectedIssue(resolvedIssue);
    setSelectedHelp(resolvedHelp);
    setShowGuidedQuestions(false);
    setStep(2);
  };

  const handleRequestUseLocation = () => {
    requestLocation('Location access is needed to find nearby help.');
  };

  const handleSelectLandmark = (landmark: string) => {
    setSearchLocation(landmark);
    setSearchPlace(landmark);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPlace.trim().length > 2) {
      setSearchLocation(searchPlace.trim());
    }
  };

  const hasLocation = Boolean(coords || address || searchPlace.trim());

  const handleProceedToHelp = () => {
    if (!hasLocation) {
      setErrorMsg('Please use your current location or search a place.');
      return;
    }
    setErrorMsg(null);
    setStep(3);
  };

  const handleConfirmAndDispatch = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const effectiveAddress = address || searchPlace.trim() || 'Highway Corridor';
    const effectiveCoords: [number, number] | undefined = coords
      ? [coords.lng, coords.lat]
      : undefined;

    // Load registered bike or default
    const bikes = getBikes();
    const defaultBike: Bike = bikes.length > 0 ? bikes[0] : {
      id: 'bike-default',
      userId: user?.id || 'guest-rider',
      brand: 'KTM',
      model: 'Adventure 250',
      registrationNumber: 'WB-74-AX-1024',
      year: 2023,
      fuelType: 'PETROL'
    };

    try {
      const res = await createAssistanceRequest({
        problemCategory: selectedIssue,
        description: `Stranded rider reported: ${selectedIssue} (Need: ${selectedHelp}) at ${effectiveAddress}`,
        location: {
          coordinates: effectiveCoords || [0, 0], // Never invent fake location
          address: effectiveAddress,
          accuracyMeters: accuracy || 15
        },
        towingDetails: selectedHelp === 'Towing' ? { towingType: 'FLATBED', pickupAddress: effectiveAddress } : undefined
      });

      if (res && res.id) {
        saveRequest({
          id: res.id,
          riderId: user?.id || 'guest-rider',
          riderName: user?.name || 'Rider',
          riderPhone: user?.phone || '+91 98765 43210',
          issue: selectedIssue.toUpperCase().replace(/\s+/g, '_'),
          description: `Stranded rider reported: ${selectedIssue} at ${effectiveAddress}`,
          bike: defaultBike,
          approximateLocation: effectiveAddress,
          locationShared: Boolean(coords),
          latitude: coords?.lat,
          longitude: coords?.lng,
          status: 'OPEN',
          createdAt: new Date().toISOString()
        });

        navigate(`/requests/${res.id}`);
      } else {
        throw new Error('Could not create assistance ticket');
      }
    } catch {
      // Local fallback ticket
      const fallbackId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
      saveRequest({
        id: fallbackId,
        riderId: user?.id || 'guest-rider',
        riderName: user?.name || 'Rider',
        riderPhone: user?.phone || '+91 98765 43210',
        issue: selectedIssue.toUpperCase().replace(/\s+/g, '_'),
        description: `Stranded rider reported: ${selectedIssue} at ${effectiveAddress}`,
        bike: defaultBike,
        approximateLocation: effectiveAddress,
        locationShared: Boolean(coords),
        latitude: coords?.lat,
        longitude: coords?.lng,
        status: 'OPEN',
        createdAt: new Date().toISOString()
      });
      navigate(`/requests/${fallbackId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white pt-4 pb-24 md:pb-16 font-sans selection:bg-[#FFF174] selection:text-black">
      <div className="container mx-auto px-4 max-w-xl space-y-4">
        
        {/* Navigation & Step Indicator */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => {
              if (showGuidedQuestions) setShowGuidedQuestions(false);
              else if (step === 3) setStep(2);
              else if (step === 2) setStep(1);
              else navigate('/');
            }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> {step === 1 && !showGuidedQuestions ? 'Back to Home' : 'Back'}
          </button>
          
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
            <span className={step >= 1 ? 'text-[#FFF174]' : ''}>1. Issue</span>
            <span>•</span>
            <span className={step >= 2 ? 'text-[#FFF174]' : ''}>2. Location</span>
            <span>•</span>
            <span className={step === 3 ? 'text-[#FFF174]' : ''}>3. Dispatch</span>
          </div>
        </div>

        {/* ========================================================
            STEP 1: WHAT HAPPENED? (Section 10)
            ======================================================== */}
        {step === 1 && !showGuidedQuestions && (
          <section className="space-y-3.5 animate-in fade-in duration-150">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                STEP 1 OF 3
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                What happened?
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Tap your issue for immediate roadside triage.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STRANDED_ISSUES.map((issue) => {
                return (
                  <button
                    key={issue.id}
                    type="button"
                    onClick={() => handleSelectIssue(issue.id)}
                    className="p-4 rounded-2xl bg-[#121212] hover:bg-[#181818] active:scale-[0.98] border border-white/10 hover:border-[#FFF174]/50 text-left transition-all cursor-pointer flex items-center justify-between group min-h-[64px]"
                  >
                    <div>
                      <span className="block text-base font-black text-white group-hover:text-[#FFF174] transition-colors">
                        {issue.label}
                      </span>
                      <span className="block text-[11px] text-gray-400 mt-0.5">
                        {issue.desc}
                      </span>
                    </div>
                    <ArrowRight size={16} className="text-gray-500 group-hover:text-[#FFF174] group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================
            SECTION 11: "I DON'T KNOW" GUIDED DIAGNOSIS
            ======================================================== */}
        {step === 1 && showGuidedQuestions && (
          <section className="p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FFF174] block">
                GUIDED DIAGNOSIS
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">
                Let's figure it out together
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Answer two simple questions to identify what help you need.
              </p>
            </div>

            {/* Question 1: Does the bike start? */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 block">
                1. Does the bike start?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBikeStarts('YES')}
                  className={`py-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    bikeStarts === 'YES'
                      ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                      : 'bg-black/40 border-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  YES (Cranks or idles)
                </button>
                <button
                  type="button"
                  onClick={() => setBikeStarts('NO')}
                  className={`py-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    bikeStarts === 'NO'
                      ? 'bg-red-600/30 border-red-400 text-red-200'
                      : 'bg-black/40 border-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  NO (Dead or clicks)
                </button>
              </div>
            </div>

            {/* Question 2: Do you see any warning light? */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 block">
                2. Do you see any warning light on the console?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setWarningLight('YES')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    warningLight === 'YES'
                      ? 'bg-amber-600/30 border-amber-400 text-amber-200'
                      : 'bg-black/40 border-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  YES
                </button>
                <button
                  type="button"
                  onClick={() => setWarningLight('NO')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    warningLight === 'NO'
                      ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                      : 'bg-black/40 border-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  NO
                </button>
                <button
                  type="button"
                  onClick={() => setWarningLight('NOT_SURE')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    warningLight === 'NOT_SURE'
                      ? 'bg-blue-600/30 border-blue-400 text-blue-200'
                      : 'bg-black/40 border-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  NOT SURE
                </button>
              </div>
            </div>

            {/* Suggested resolution banner */}
            {bikeStarts !== null && warningLight !== null && (
              <div className="p-3.5 rounded-2xl bg-[#1A1A1A] border border-[#FFF174]/30 space-y-2 text-xs">
                <strong className="text-white block font-bold">
                  Recommended: {bikeStarts === 'NO' ? 'Battery & Electrical Rescue' : 'Mechanic Inspection'}
                </strong>
                <p className="text-gray-400">
                  {bikeStarts === 'NO'
                    ? 'Likely discharged battery, alternator or ignition fuse issue.'
                    : 'Engine fires but bike cannot safely proceed. Roadside mechanic recommended.'}
                </p>
                <button
                  type="button"
                  onClick={handleFinishGuidedDiagnosis}
                  className="w-full py-3 bg-[#FFF174] text-black font-black text-xs uppercase tracking-wider rounded-xl mt-1 cursor-pointer hover:bg-yellow-400"
                >
                  Proceed with this recommendation
                </button>
              </div>
            )}
          </section>
        )}

        {/* ========================================================
            STEP 2: WHERE ARE YOU? (Section 10)
            [USE MY CURRENT LOCATION] or [SEARCH LOCATION]
            ======================================================== */}
        {step === 2 && (
          <section className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                STEP 2 OF 3
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                Where are you?
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Help dispatched to your exact phone location or landmark.
              </p>
            </div>

            {/* OPTION 1: [USE MY CURRENT LOCATION] */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-300 block">
                OPTION 1: DEVICE GPS
              </span>

              {locStatus === 'active' ? (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                      <MapPin size={16} className="text-emerald-400" />
                      <span>📍 Location Active</span>
                    </div>
                    <span className="text-[11px] text-gray-300 block mt-0.5">
                      {accuracy ? `Accuracy: ±${accuracy}m • ` : ''}
                      Updated: {updatedText || 'Just now'}
                    </span>
                  </div>
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestUseLocation}
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  <Navigation size={18} />
                  <span>[ USE MY CURRENT LOCATION ]</span>
                </button>
              )}

              {locStatus === 'denied' && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200">
                  <span className="font-bold block">Location access is off.</span>
                  <span>Please search your town, road or highway landmark below.</span>
                </div>
              )}
            </div>

            {/* OPTION 2: [SEARCH LOCATION] */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-300 block">
                OPTION 2: SEARCH PLACE / LANDMARK
              </span>

              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchPlace}
                    onChange={(e) => setSearchPlace(e.target.value)}
                    placeholder="Search town, road, petrol pump or landmark..."
                    className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFF174]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchPlace.trim().length < 3}
                  className="px-4 py-2.5 rounded-xl bg-[#FFF174] disabled:opacity-50 text-black font-black text-xs transition-colors cursor-pointer"
                >
                  Set
                </button>
              </form>

              {/* Quick Landmarks */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  Popular Highway Points:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_LANDMARKS.slice(0, 4).map((lm) => (
                    <button
                      key={lm}
                      type="button"
                      onClick={() => handleSelectLandmark(lm)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        searchPlace === lm
                          ? 'bg-[#FFF174] text-black border-[#FFF174] font-bold'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                      }`}
                    >
                      {lm}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CONTINUE BUTTON */}
            <button
              type="button"
              onClick={handleProceedToHelp}
              className="w-full py-4 rounded-2xl bg-[#FFF174] hover:bg-yellow-400 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#FFF174]/15"
            >
              <span>Next: Select Help Needed</span>
              <ArrowRight size={16} />
            </button>
          </section>
        )}

        {/* ========================================================
            STEP 3: WHAT HELP DO YOU NEED? (Section 10)
            Mechanic • Towing • Fuel • Battery • Medical • Emergency
            ======================================================== */}
        {step === 3 && (
          <section className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                STEP 3 OF 3
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                What help do you need?
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Choose the required service for instant dispatch.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {HELP_TYPES.map((h) => {
                const isSelected = selectedHelp === h.id;
                const Icon = h.icon;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedHelp(h.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#FFF174]/20 border-[#FFF174] text-white shadow-md'
                        : 'bg-[#121212] border-white/10 text-gray-300 hover:border-white/30'
                    }`}
                  >
                    <Icon size={20} className={isSelected ? 'text-[#FFF174]' : 'text-gray-400'} />
                    <div className="mt-2">
                      <strong className="block text-sm font-black text-white">{h.label}</strong>
                      <span className="block text-[10px] text-gray-400 mt-0.5">{h.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* SUMMARY SUMMARY */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-xs space-y-1.5 text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">Issue:</span>
                <span className="font-bold text-white">{selectedIssue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Location:</span>
                <span className="font-bold text-white truncate max-w-[200px]">
                  {address || searchPlace || 'Device Location'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Service:</span>
                <span className="font-bold text-[#FFF174]">{selectedHelp}</span>
              </div>
            </div>

            {/* CONFIRM AND DISPATCH BUTTON */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmAndDispatch}
              className="w-full py-4 rounded-2xl bg-[#FFF174] hover:bg-yellow-400 active:scale-98 disabled:opacity-50 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#FFF174]/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Finding Help Near You...</span>
                </>
              ) : (
                <>
                  <span>Dispatch Roadside Help</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </section>
        )}

      </div>
    </div>
  );
}
