import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Battery, 
  Droplets, 
  MapPin, 
  Navigation, 
  AlertCircle, 
  ArrowLeft, 
  Star, 
  ShieldCheck, 
  Loader2, 
  RefreshCw, 
  Search,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getHelperProfiles, saveRequest, getBikes } from '../utils/appStorage';
import { API_BASE_URL } from '../config/api';
import { useUserLocation } from '../hooks/useUserLocation';

const CATEGORIES = [
  { id: 'Puncture', icon: <AlertCircle />, label: 'Puncture', desc: 'Flat tyre or air leak' },
  { id: 'Breakdown', icon: <Wrench />, label: 'Breakdown', desc: 'Engine stopped working' },
  { id: 'Battery', icon: <Battery />, label: 'Battery', desc: 'Dead battery or electrical' },
  { id: 'Fuel', icon: <Droplets />, label: 'Out of Fuel', desc: 'Need emergency petrol' },
  { id: 'Towing', icon: <Navigation />, label: 'Towing', desc: 'Move bike to safety' },
  { id: 'Accident', icon: <AlertCircle />, label: 'Accident', desc: 'Collision or crash' },
];

const COMMON_LANDMARKS = [
  'Sevoke Road Checkpost',
  'Coronation Bridge (NH-10)',
  'Bagdogra Airport Bypass',
  'Sukna Forest Gate',
  'Hill Cart Road / Darjeeling More',
  'Matigara Highway Crossing'
];

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
};

interface ServiceProvider {
  id: string;
  name: string;
  verified?: boolean;
  isDemo?: boolean;
  rating?: number;
  distance?: string;
  estimatedArrival?: string;
  services?: string[];
  startingPrice?: number;
  isOpen?: boolean;
}

export function RequestHelpPage() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [searchPlace, setSearchPlace] = useState('');
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    coords,
    accuracy,
    status: locStatus,
    updatedText,
    address,
    requestLocation,
    setSearchLocation,
  } = useUserLocation(false);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSelectLandmark = (landmark: string) => {
    setSearchLocation(landmark);
    setSearchPlace(landmark);
    handleNext();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPlace.trim().length > 2) {
      setSearchLocation(searchPlace.trim());
      handleNext();
    }
  };

  const loadFallbackProviders = () => {
    const helpers = getHelperProfiles();
    const fallbackList = helpers.map((h, idx) => ({
      id: h.id,
      name: h.businessName || `Mechanic Hub #${idx + 1}`,
      verified: h.verificationStatus === 'VERIFIED',
      isDemo: true,
      rating: h.rating || 4.8,
      distance: `${(1.4 + idx * 1.2).toFixed(1)} km`,
      estimatedArrival: `${10 + idx * 4}-${16 + idx * 4} mins`,
      services: h.skills && h.skills.length > 0 ? h.skills.slice(0, 3) : ['Breakdown Repair', 'Puncture Repair', 'Fuel Delivery'],
      startingPrice: 250 + idx * 50,
      isOpen: h.isAvailable ?? true
    }));
    setProviders(fallbackList);
  };

  useEffect(() => {
    if (step === 3) {
      if (coords) {
        fetch(`${API_BASE_URL}/api/assistance/providers/nearby?lat=${coords.lat}&lng=${coords.lng}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data && data.data.length > 0) {
              setProviders(data.data);
            } else {
              loadFallbackProviders();
            }
          })
          .catch(() => loadFallbackProviders());
      } else {
        loadFallbackProviders();
      }
    }
  }, [step, coords]);

  const submitRequest = async () => {
    if (!category || !selectedProvider) return;
    setLoading(true);

    const effectiveAddress = address || searchPlace.trim() || 'Himalayan Corridor';
    const effectiveCoords = coords ? [coords.lng, coords.lat] : undefined;

    try {
      const res = await fetch(`${API_BASE_URL}/api/assistance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemCategory: category,
          location: { 
            type: 'Point',
            coordinates: effectiveCoords || [0, 0],
            address: effectiveAddress,
            accuracyMeters: accuracy || 15
          },
          providerId: selectedProvider.id
        })
      });
      const data = await res.json();
      if (data.success && data.data?.requestId) {
        navigate(`/requests/${data.data.requestId}`);
        return;
      }
    } catch {
      // Local fallback below
    }

    const userBikes = user ? getBikes(user.id) : [];
    const activeBike = userBikes.find(b => b.isPrimary) || userBikes[0] || {
      id: 'bike-def',
      userId: user?.id || 'user-rider-1',
      brand: 'Royal Enfield',
      model: 'Himalayan',
      registrationNumber: 'WB 74 AB 8921',
      year: 2024,
      fuelType: 'PETROL' as const
    };

    const newReqId = `REQ-${Date.now().toString().slice(-6)}`;
    const newReq = {
      id: newReqId,
      riderId: user?.id || 'user-rider-1',
      riderName: user?.name || 'Rider',
      riderPhone: user?.phone || '+91 98765 43210',
      bike: activeBike,
      issue: category,
      description: `${category} emergency assistance requested at ${effectiveAddress}`,
      status: 'OPEN' as const,
      assignedHelperId: selectedProvider.id,
      assignedHelperName: selectedProvider.name,
      locationShared: true,
      latitude: coords?.lat,
      longitude: coords?.lng,
      approximateLocation: effectiveAddress,
      createdAt: new Date().toISOString()
    };
    saveRequest(newReq);
    setLoading(false);
    navigate(`/requests/${newReqId}`);
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white pt-4 pb-24 md:pb-16 font-sans">
      <div className="container mx-auto px-4 max-w-2xl space-y-5">
        
        {/* Step Navigation Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-3">
          <button 
            type="button"
            onClick={step > 1 ? handleBack : () => navigate('/')} 
            className="flex items-center text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="mr-1.5" size={16} /> Back
          </button>
          
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
            <span>Step {step} of 3</span>
          </div>
        </header>

        <main id="main-content">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: CATEGORY */}
            {step === 1 && (
              <motion.section key="step1" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">What do you need help with?</h1>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Select the category that best describes your issue.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Assistance categories">
                  {CATEGORIES.map(cat => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => { setCategory(cat.id); handleNext(); }}
                        className={`p-4 rounded-2xl border text-left transition-all group cursor-pointer ${isSelected ? 'border-[#FFF174] bg-[#FFF174]/15' : 'border-white/10 bg-[#121212] hover:border-white/20'}`}
                      >
                        <div className="flex items-center mb-2">
                          <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-[#FFF174] text-black' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
                            {cat.icon}
                          </div>
                          <h2 className="ml-3 font-bold text-base text-white">{cat.label}</h2>
                        </div>
                        <p className="text-xs text-gray-400">{cat.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* STEP 2: LOCATION (Per Section 5 & 6: Use My Location or Search place / landmark) */}
            {step === 2 && (
              <motion.section key="step2" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-5">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">Confirm Location</h1>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Location access is needed to find nearby help.</p>
                </div>

                {/* Option 1: Device GPS */}
                <div className="p-4 rounded-3xl bg-[#121212] border border-white/10 space-y-3">
                  <span className="text-xs font-black uppercase text-gray-300 tracking-wider block">
                    Option 1: Device GPS
                  </span>

                  {locStatus === 'active' ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                          <MapPin size={16} className="text-emerald-400" />
                          <span>📍 Location Active</span>
                        </div>
                        <span className="text-[11px] text-emerald-300/80">
                          Accuracy: ±{accuracy || 12}m • Updated: {updatedText}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-4 py-2 bg-[#FFF174] text-black font-black text-xs rounded-xl hover:bg-yellow-400 cursor-pointer"
                      >
                        Use Location →
                      </button>
                    </div>
                  ) : locStatus === 'denied' ? (
                    <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 space-y-2">
                      <span className="font-bold block">Location access is turned off.</span>
                      <span className="text-[11px] block text-amber-300/80">
                        Enable permissions or search your place / landmark below.
                      </span>
                      <button
                        type="button"
                        onClick={() => requestLocation('Location access is needed to find nearby help.')}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 text-black font-bold text-xs"
                      >
                        Enable Location
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        requestLocation('Location access is needed to find nearby help.');
                      }}
                      className="w-full py-4 rounded-2xl bg-[#FFF174] hover:bg-yellow-400 active:scale-98 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_20px_rgba(255,241,116,0.25)]"
                    >
                      {locStatus === 'requesting' ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Locating...</span>
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

                {/* Option 2: Search place / landmark */}
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
                        placeholder="Search town, road or landmark..."
                        className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFF174]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={searchPlace.trim().length < 3}
                      className="px-4 py-2.5 rounded-xl bg-[#FFF174] disabled:opacity-50 text-black font-bold text-xs transition-colors cursor-pointer"
                    >
                      Continue
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {COMMON_LANDMARKS.map((lm) => (
                      <button
                        key={lm}
                        type="button"
                        onClick={() => handleSelectLandmark(lm)}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        {lm}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}

            {/* STEP 3: SELECT PROVIDER */}
            {step === 3 && (
              <motion.section key="step3" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">Select a Provider</h1>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Choose a mechanic or towing partner near your location.</p>
                </div>
                
                {providers.length === 0 ? (
                  <div className="text-center py-12">
                    <Loader2 className="animate-spin text-[#FFF174] mx-auto mb-3" size={32} />
                    <p className="text-gray-400 text-xs">Finding available responders...</p>
                  </div>
                ) : (
                  <div className="space-y-3" role="radiogroup" aria-label="Available providers">
                    {providers.map(p => {
                      const isSelected = selectedProvider?.id === p.id;
                      return (
                        <button 
                          key={p.id}
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedProvider(p)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'border-[#FFF174] bg-[#FFF174]/10 shadow-[0_0_20px_rgba(255,241,116,0.15)]' : 'border-white/10 bg-[#121212] hover:border-white/20'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-base font-bold flex items-center gap-1.5 text-white">
                                {p.name}
                                {p.isDemo ? (
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                                    DEMO
                                  </span>
                                ) : (
                                  <ShieldCheck size={16} className="text-emerald-400" />
                                )}
                              </h3>
                              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                <span className="flex items-center text-[#FFF174] font-bold"><Star size={12} fill="#FFF174" className="mr-0.5" /> {p.rating}</span>
                                <span>•</span>
                                <span className="text-white font-medium">{p.distance || 'Nearby'}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">ETA</span>
                              <strong className="text-sm font-bold text-[#FFF174]">{p.estimatedArrival || '15 min'}</strong>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {p.services?.slice(0, 3).map((s: string) => (
                              <span key={s} className="px-2 py-0.5 bg-white/5 border border-white/10 text-[10px] rounded text-gray-300">{s}</span>
                            ))}
                          </div>

                          <div className="flex justify-between items-center pt-2.5 border-t border-white/10 text-xs">
                            <span className="text-gray-300 font-semibold">Starts from ₹{p.startingPrice || 350}</span>
                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              AVAILABLE
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                {selectedProvider && (
                  <div className="pt-2">
                    <button 
                      onClick={submitRequest}
                      disabled={loading}
                      className="w-full flex items-center justify-center py-4 bg-[#FFF174] hover:bg-yellow-400 text-black font-black text-base uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_25px_rgba(255,241,116,0.3)] active:scale-98 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <><Loader2 className="animate-spin mr-2" size={20} /> DISPATCHING...</>
                      ) : (
                        <>REQUEST {selectedProvider.name.toUpperCase()} <ChevronRight className="ml-1.5" size={20} /></>
                      )}
                    </button>
                  </div>
                )}
              </motion.section>
            )}
            
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
