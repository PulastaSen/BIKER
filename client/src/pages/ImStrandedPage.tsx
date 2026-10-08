import { useState } from 'react';
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
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserLocation } from '../hooks/useUserLocation';
import { createAssistanceRequest } from '../services/ecosystemApi';
import { saveRequest } from '../utils/appStorage';
import type { Bike } from '../types/app';

const STRANDED_ISSUES = [
  { id: 'Puncture', label: 'Puncture', desc: 'Flat tyre, puncture or air leak', icon: Disc, color: 'text-amber-400' },
  { id: 'Battery', label: 'Battery', desc: 'Dead battery, won\'t crank', icon: BatteryCharging, color: 'text-yellow-400' },
  { id: 'Fuel', label: 'Fuel', desc: 'Out of fuel on highway', icon: Fuel, color: 'text-emerald-400' },
  { id: 'Bike Problem', label: 'Bike Problem', desc: 'Engine stopped or strange noise', icon: Wrench, color: 'text-blue-400' },
  { id: 'Towing', label: 'Towing', desc: 'Flatbed or carrier rescue needed', icon: Truck, color: 'text-purple-400' },
  { id: 'Accident', label: 'Accident', desc: 'Crash or collision on road', icon: TriangleAlert, color: 'text-red-400' },
  { id: 'I Don\'t Know', label: 'I Don\'t Know', desc: 'Unsure, need diagnosis', icon: HelpCircle, color: 'text-gray-300' }
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

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [searchPlace, setSearchPlace] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    setSelectedIssue(issueId);
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

  const handleConfirmAndDispatch = async () => {
    if (!hasLocation) {
      setErrorMsg('Please use your current location or search a place.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const effectiveAddress = address || searchPlace.trim() || 'Himalayan Corridor';
    const effectiveCoords: [number, number] | undefined = coords
      ? [coords.lng, coords.lat]
      : undefined;

    const defaultBike: Bike = {
      id: 'bike-default',
      userId: user?.id || 'guest-rider',
      brand: 'Royal Enfield',
      model: 'Himalayan',
      registrationNumber: 'WB-74-TEMP',
      year: 2023,
      fuelType: 'PETROL'
    };

    try {
      const res = await createAssistanceRequest({
        problemCategory: selectedIssue,
        description: `Stranded rider reported: ${selectedIssue} at ${effectiveAddress}`,
        location: {
          coordinates: effectiveCoords || [88.3953, 26.7271],
          address: effectiveAddress,
          accuracyMeters: accuracy || 15
        },
        towingDetails: selectedIssue === 'Towing' ? { towingType: 'FLATBED', pickupAddress: effectiveAddress } : undefined
      });

      if (res && res.id) {
        // Save to local cache as well
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
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('Dispatch API fallback:', error);
      // Fallback local ticket
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
    <div className="min-h-screen bg-[#090909] text-white flex flex-col font-sans selection:bg-[#FFF174] selection:text-black pt-4 pb-24 md:pb-16">
      <div className="max-w-xl w-full mx-auto px-4 sm:px-6 space-y-5">
        
        {/* Navigation & Step Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => (step === 2 ? setStep(1) : navigate('/'))}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{step === 2 ? 'Back to Problem' : 'Back to Home'}</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
            <span className={step === 1 ? 'text-[#FFF174]' : 'text-emerald-400'}>
              {step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
            </span>
          </div>
        </div>

        {/* STEP 1: WHAT HAPPENED? */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FFF174] block">
                FAST TRIAGE
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                What happened?
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Select your problem for instant roadside matching.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {STRANDED_ISSUES.map((issue) => {
                const Icon = issue.icon;
                const isSelected = selectedIssue === issue.id;
                return (
                  <button
                    key={issue.id}
                    type="button"
                    onClick={() => handleSelectIssue(issue.id)}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all active:scale-[0.99] cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFF174]/15 border-[#FFF174] text-white'
                        : 'bg-[#121212] border-white/10 text-gray-300 hover:border-white/20 hover:bg-[#161616]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Icon size={20} className={issue.color} />
                      </div>
                      <div>
                        <strong className="block text-sm sm:text-base font-black text-white">
                          {issue.label}
                        </strong>
                        <span className="block text-[11px] text-gray-400 mt-0.5">
                          {issue.desc}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                {selectedIssue} SELECTED
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                Where are you?
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Location access is needed to find nearby help.
              </p>
            </div>

            {/* ACTION 1: [Use My Location] */}
            <div className="p-4 rounded-3xl bg-[#121212] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-gray-300 tracking-wider">
                  Option 1: Device GPS
                </span>
                {locStatus === 'active' && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    GPS LOCKED
                  </span>
                )}
              </div>

              {locStatus === 'active' ? (
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <MapPin size={16} className="text-emerald-400" />
                    <span>📍 Location Active</span>
                  </div>
                  <div className="text-[11px] text-emerald-300/80">
                    Accuracy: ±{accuracy || 12}m • Updated: {updatedText}
                  </div>
                </div>
              ) : locStatus === 'denied' ? (
                <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 space-y-2">
                  <span className="font-bold block">Location access is turned off.</span>
                  <span className="text-[11px] block text-amber-300/80">
                    Turn on location permissions in your browser or search your landmark below.
                  </span>
                  <button
                    type="button"
                    onClick={handleRequestUseLocation}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 text-black font-bold text-xs"
                  >
                    Enable Location
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestUseLocation}
                  disabled={locStatus === 'requesting'}
                  className="w-full py-4 rounded-2xl bg-[#FFF174] hover:bg-yellow-400 active:scale-98 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,241,116,0.3)] disabled:opacity-60"
                >
                  {locStatus === 'requesting' ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Requesting browser location...</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={16} />
                      <span>Use My Location</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* ACTION 2: [Search place / landmark] */}
            <div className="p-4 rounded-3xl bg-[#121212] border border-white/10 space-y-3">
              <span className="text-xs font-black uppercase text-gray-300 tracking-wider block">
                Option 2: Search place / landmark
              </span>

              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchPlace}
                    onChange={(e) => setSearchPlace(e.target.value)}
                    placeholder="Search place, town or landmark..."
                    className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFF174]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {/* Quick Landmark Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase text-gray-500 block">
                  Popular Highway Landmarks
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_LANDMARKS.map((landmark) => (
                    <button
                      key={landmark}
                      type="button"
                      onClick={() => handleSelectLandmark(landmark)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                        searchPlace === landmark
                          ? 'bg-[#FFF174] text-black border-[#FFF174] font-bold'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {landmark}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2.5">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CONFIRM & DISPATCH BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmAndDispatch}
                disabled={isSubmitting || !hasLocation}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-98 text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(220,38,38,0.4)] border border-red-400/50 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Dispatching Help...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Confirm & Find Help Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
