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
  ArrowRight, 
  ArrowLeft, 
  Search, 
  CheckCircle2, 
  Navigation, 
  Heart, 
  PhoneCall, 
  Loader2,
  Building2,
  ShieldAlert,
  Shuffle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserLocation } from '../hooks/useUserLocation';
import { createAssistanceRequest } from '../services/ecosystemApi';
import { saveRequest, getBikes } from '../utils/appStorage';
import type { Bike, HelpCategory } from '../types/app';
import { EmergencyTypeSelector } from '../components/EmergencyTypeSelector';
import { EmergencyMap, type MapFilterCategory } from '../components/EmergencyMap';

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

  // Steps: 1: WHAT KIND OF HELP DO YOU NEED? -> 2: WHERE ARE YOU? -> 3: CONDITIONAL DISPATCH
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory>('MECHANICAL');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Motorcycle Mechanic');
  const [searchPlace, setSearchPlace] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Guided diagnosis state (Section 8: "I'M NOT SURE")
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

  const handleCategorySelect = (category: HelpCategory) => {
    setSelectedCategory(category);
    if (category === 'UNKNOWN') {
      setShowGuidedQuestions(true);
      return;
    }
    // Set appropriate default subcategory
    if (category === 'MECHANICAL') setSelectedSubcategory('Motorcycle Mechanic');
    else if (category === 'MEDICAL') setSelectedSubcategory('108 Ambulance Dispatch');
    else if (category === 'SAFETY') setSelectedSubcategory('National Police (112)');
    else if (category === 'RECOVERY') setSelectedSubcategory('Flatbed Towing Truck');
    else if (category === 'BOTH') setSelectedSubcategory('Combined Medical & Towing Rescue');
    
    setStep(2);
  };

  const handleFinishGuidedDiagnosis = () => {
    let resolvedCategory: HelpCategory = 'MECHANICAL';
    let resolvedSub = 'Motorcycle Mechanic';

    if (bikeStarts === 'NO' && warningLight === 'NO') {
      resolvedCategory = 'MECHANICAL';
      resolvedSub = 'Battery Jump & Electrical';
    } else if (bikeStarts === 'NO' && warningLight === 'YES') {
      resolvedCategory = 'MECHANICAL';
      resolvedSub = 'Motorcycle Mechanic';
    } else if (bikeStarts === 'YES') {
      resolvedCategory = 'MECHANICAL';
      resolvedSub = 'Roadside Repair';
    } else {
      resolvedCategory = 'RECOVERY';
      resolvedSub = 'Flatbed Towing Truck';
    }

    setSelectedCategory(resolvedCategory);
    setSelectedSubcategory(resolvedSub);
    setShowGuidedQuestions(false);
    setStep(2);
  };

  const handleRequestUseLocation = () => {
    requestLocation('Location access is needed to find nearby emergency help.');
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

  const handleProceedToSubcategory = () => {
    if (!hasLocation) {
      setErrorMsg('Please activate GPS location or select a landmark.');
      return;
    }
    setErrorMsg(null);
    setStep(3);
  };

  const mapFilterForCategory: MapFilterCategory = 
    selectedCategory === 'MECHANICAL' ? 'MECHANICAL' :
    selectedCategory === 'MEDICAL' ? 'MEDICAL' :
    selectedCategory === 'SAFETY' ? 'EMERGENCY' :
    selectedCategory === 'RECOVERY' ? 'TOWING' :
    selectedCategory === 'BOTH' ? 'ALL' : 'ALL';

  const handleConfirmAndDispatch = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const effectiveAddress = address || searchPlace.trim() || 'Himalayan Corridor Location';
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
        problemCategory: selectedSubcategory,
        helpCategory: selectedCategory,
        subcategory: selectedSubcategory,
        urgency: selectedCategory === 'MEDICAL' || selectedCategory === 'BOTH' ? 'CRITICAL' : 'HIGH',
        description: `Stranded rider request: [${selectedCategory}] - ${selectedSubcategory} at ${effectiveAddress}`,
        location: {
          coordinates: effectiveCoords || [0, 0],
          address: effectiveAddress,
          accuracyMeters: accuracy || 15
        },
        towingDetails: selectedCategory === 'RECOVERY' || selectedCategory === 'BOTH'
          ? { towingType: 'FLATBED', pickupAddress: effectiveAddress }
          : undefined,
        medicalDetails: selectedCategory === 'MEDICAL' || selectedCategory === 'BOTH'
          ? { medicalUrgency: 'HIGH', injuryDescription: 'Roadside medical assistance requested' }
          : undefined
      });

      if (res && res.id) {
        saveRequest({
          id: res.id,
          riderId: user?.id || 'guest-rider',
          riderName: user?.name || 'Rider',
          riderPhone: user?.phone || '+91 98765 43210',
          issue: selectedCategory,
          helpCategory: selectedCategory,
          description: `Stranded rider: [${selectedCategory}] - ${selectedSubcategory}`,
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
        throw new Error('Dispatch ticket creation failed');
      }
    } catch {
      // Local fallback ticket
      const fallbackId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
      saveRequest({
        id: fallbackId,
        riderId: user?.id || 'guest-rider',
        riderName: user?.name || 'Rider',
        riderPhone: user?.phone || '+91 98765 43210',
        issue: selectedCategory,
        helpCategory: selectedCategory,
        description: `Stranded rider: [${selectedCategory}] - ${selectedSubcategory}`,
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
            <span className={step >= 1 ? 'text-[#FFF174]' : ''}>1. Help Type</span>
            <span>•</span>
            <span className={step >= 2 ? 'text-[#FFF174]' : ''}>2. Location & Map</span>
            <span>•</span>
            <span className={step === 3 ? 'text-[#FFF174]' : ''}>3. Dispatch</span>
          </div>
        </div>

        {/* ========================================================
            STEP 1: WHAT KIND OF HELP DO YOU NEED? (Sections 7, 8, 9)
            ======================================================== */}
        {step === 1 && !showGuidedQuestions && (
          <section className="space-y-4 animate-in fade-in duration-150">
            <EmergencyTypeSelector
              selectedCategory={selectedCategory}
              onSelect={handleCategorySelect}
            />
          </section>
        )}

        {/* GUIDED DIAGNOSIS MODAL/SECTION (When "I'M NOT SURE" chosen) */}
        {step === 1 && showGuidedQuestions && (
          <section className="p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FFF174] block">
                GUIDED SAFETY TRIAGE
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">
                Let's figure it out together
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Answer two simple questions to determine the appropriate rescue service.
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
                  Recommended: {bikeStarts === 'NO' ? 'Battery & Electrical Rescue' : 'Roadside Mechanic'}
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
            STEP 2: WHERE ARE YOU? + EMERGENCY MAP (Section 10 & 11)
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
                Pinpoint your location to locate nearby verified responders.
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
                  <span className="font-bold block">Location permission off.</span>
                  <span>Please search your town, road or highway landmark below.</span>
                </div>
              )}
            </div>

            {/* OPTION 2: SEARCH PLACE / LANDMARK */}
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

              {/* Popular landmarks */}
              <div className="flex flex-wrap gap-1.5 pt-1">
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

            {/* SECTION 10 & 11: MOTOASSIST EMERGENCY MAP PREVIEW */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-gray-400 block">
                NEARBY EMERGENCY MAP ({selectedCategory})
              </label>
              <EmergencyMap
                riderCoords={coords ? { lat: coords.lat, lng: coords.lng } : undefined}
                height="280px"
                initialFilter={mapFilterForCategory}
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleProceedToSubcategory}
              className="w-full py-4 rounded-2xl bg-[#FFF174] hover:bg-yellow-400 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#FFF174]/15"
            >
              <span>Next: Confirm Specific Service</span>
              <ArrowRight size={16} />
            </button>
          </section>
        )}

        {/* ========================================================
            STEP 3: CONDITIONAL HELP FLOW (Sections 8 & 9)
            ======================================================== */}
        {step === 3 && (
          <section className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                STEP 3 OF 3: {selectedCategory}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                {selectedCategory === 'BOTH' ? 'Combined Medical & Bike Recovery' : 'Select Assistance Service'}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                {selectedCategory === 'BOTH'
                  ? 'One unified incident coordinates both emergency medical triage and roadside recovery.'
                  : 'Choose the exact resource you require for priority dispatch.'}
              </p>
            </div>

            {/* CONDITIONAL OPTIONS PER SELECTED CATEGORY */}
            {selectedCategory === 'MECHANICAL' && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Motorcycle Mechanic', desc: 'On-site breakdown repair', icon: <Wrench size={18} /> },
                  { label: 'OEM Service Center', desc: 'Authorized diagnostics & spares', icon: <Building2 size={18} /> },
                  { label: 'Tire / Puncture Shop', desc: 'Tubeless puncture & air leak', icon: <Disc size={18} /> },
                  { label: 'Battery Assistance', desc: 'Jump start or fresh battery', icon: <BatteryCharging size={18} /> },
                  { label: 'Emergency Fuel', desc: 'Highway petrol delivery', icon: <Fuel size={18} /> },
                  { label: 'Flatbed Towing', desc: 'Secure carrier transport', icon: <Truck size={18} /> }
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setSelectedSubcategory(item.label)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedSubcategory === item.label
                        ? 'bg-[#FFF174]/20 border-[#FFF174] text-white shadow-md'
                        : 'bg-[#121212] border-white/10 text-gray-300 hover:border-white/30'
                    }`}
                  >
                    <div className={selectedSubcategory === item.label ? 'text-[#FFF174]' : 'text-gray-400'}>
                      {item.icon}
                    </div>
                    <div className="mt-2">
                      <strong className="block text-xs font-black text-white">{item.label}</strong>
                      <span className="block text-[10px] text-gray-400 mt-0.5">{item.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedCategory === 'MEDICAL' && (
              <div className="space-y-2.5">
                <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-red-300 font-bold">
                    <Heart size={18} />
                    <span>Immediate Medical Dispatch Resources:</span>
                  </div>
                  <p className="text-gray-300 text-[11px]">
                    Official emergency services can be dialled immediately while MotoAssist alerts verified trauma centers.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <a
                      href="tel:108"
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall size={14} /> Call 108 Ambulance
                    </a>
                    <a
                      href="tel:112"
                      className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <ShieldAlert size={14} /> Call 112 Police
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    '108 Emergency Ambulance',
                    'Nearest Trauma Hospital',
                    '24/7 Pharmacy & First Aid',
                    'Medical Emergency Escort'
                  ].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        selectedSubcategory === sub
                          ? 'bg-red-950/60 border-red-500 text-white ring-1 ring-red-500'
                          : 'bg-[#141414] border-white/10 text-gray-300 hover:border-white/30'
                      }`}
                    >
                      <strong className="block text-xs font-bold text-white">{sub}</strong>
                      <span className="text-[10px] text-red-300">Priority triage</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedCategory === 'SAFETY' && (
              <div className="space-y-2.5">
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <ShieldAlert size={18} />
                    <span>Safety Escalation & Protection:</span>
                  </div>
                  <p className="text-gray-300 text-[11px]">
                    If in immediate danger or feeling pursued, tap below to contact highway emergency services immediately.
                  </p>
                  <a
                    href="tel:112"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <PhoneCall size={15} /> Immediate Call 112 Police
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    'National Police (112)',
                    'Alert Family Circle',
                    'Safe Haven / Verified Beat',
                    'Escort Support'
                  ].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        selectedSubcategory === sub
                          ? 'bg-amber-950/60 border-amber-500 text-white ring-1 ring-amber-500'
                          : 'bg-[#141414] border-white/10 text-gray-300 hover:border-white/30'
                      }`}
                    >
                      <strong className="block text-xs font-bold text-white">{sub}</strong>
                      <span className="text-[10px] text-amber-300">Active monitoring</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedCategory === 'BOTH' && (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-xs space-y-3">
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <Shuffle size={18} />
                  <span>Section 9: Combined Crash Response Protocol</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  One single incident handles all aspects of your emergency. MotoAssist coordinates medical care first, followed by motorcycle recovery:
                </p>
                <div className="space-y-1 text-gray-300 text-[11px] pl-2 border-l-2 border-purple-500">
                  <div>1. Immediate Medical Ambulance (108) priority</div>
                  <div>2. Nearest Hospital Trauma Notification</div>
                  <div>3. Trusted Family Safety Notification</div>
                  <div>4. Flatbed Motorcycle Recovery & Towing</div>
                </div>
                <div className="flex gap-2 pt-1">
                  <a
                    href="tel:108"
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                  >
                    Call 108
                  </a>
                  <a
                    href="tel:112"
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                  >
                    Call 112
                  </a>
                </div>
              </div>
            )}

            {selectedCategory === 'RECOVERY' && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  'Flatbed Towing Truck',
                  'Mountain Carrier Recovery',
                  'Ditch / Off-Road Winch',
                  'Transport to OEM Workshop'
                ].map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      selectedSubcategory === sub
                        ? 'bg-blue-950/60 border-blue-500 text-white ring-1 ring-blue-500'
                        : 'bg-[#141414] border-white/10 text-gray-300 hover:border-white/30'
                    }`}
                  >
                    <strong className="block text-xs font-bold text-white">{sub}</strong>
                    <span className="text-[10px] text-blue-300">Carrier dispatch</span>
                  </button>
                ))}
              </div>
            )}

            {/* INCIDENT SNAPSHOT SUMMARY (Section 6) */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-xs space-y-1.5 text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">Emergency Type:</span>
                <span className="font-bold text-white">{selectedCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Service:</span>
                <span className="font-bold text-[#FFF174]">{selectedSubcategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Location:</span>
                <span className="font-bold text-white truncate max-w-[200px]">
                  {address || searchPlace || 'GPS Device Coordinates'}
                </span>
              </div>
            </div>

            {/* DISPATCH CONFIRMATION BUTTON */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmAndDispatch}
              className="w-full py-4 rounded-2xl bg-[#FFF174] hover:bg-yellow-400 active:scale-98 disabled:opacity-50 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#FFF174]/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Dispatching Responders...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Dispatch Rescue</span>
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
