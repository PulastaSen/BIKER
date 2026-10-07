import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Battery, Droplets, MapPin, Navigation, AlertCircle, ArrowLeft, Star, ShieldCheck, Loader2, Edit3, RefreshCw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getHelperProfiles, saveRequest, getBikes } from '../utils/appStorage';
import { API_BASE_URL } from '../config/api';

const CATEGORIES = [
  { id: 'Puncture', icon: <AlertCircle />, label: 'Puncture', desc: 'Flat tyre or air leak' },
  { id: 'Breakdown', icon: <Wrench />, label: 'Breakdown', desc: 'Engine stopped working' },
  { id: 'Battery', icon: <Battery />, label: 'Battery', desc: 'Dead battery or electrical' },
  { id: 'Fuel', icon: <Droplets />, label: 'Out of Fuel', desc: 'Need emergency petrol' },
  { id: 'Towing', icon: <Navigation />, label: 'Towing', desc: 'Move bike to safety' },
  { id: 'Accident', icon: <AlertCircle />, label: 'Accident', desc: 'Collision or crash' },
];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

interface ServiceProvider {
  id: string;
  name: string;
  verified?: boolean;
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
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualLandmark, setManualLandmark] = useState('');
  const [manualCoords, setManualCoords] = useState<{ lat: string; lng: string }>({ lat: '26.7271', lng: '88.3953' });
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const requestLocation = () => {
    setLocating(true);
    setLocationError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocating(false);
          handleNext();
        },
        error => {
          setLocating(false);
          const errorText = error.code === error.PERMISSION_DENIED
            ? 'Your location is unavailable because GPS permission was denied.'
            : 'Your location is unavailable. Unable to determine your GPS position.';
          setLocationError(errorText);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setLocating(false);
      setLocationError('Your location is unavailable. Geolocation is not supported by your browser.');
    }
  };

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualCoords.lat);
    const lng = parseFloat(manualCoords.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setLocation({ lat, lng });
      setLocationError(null);
      handleNext();
    } else if (manualLandmark.trim().length > 3) {
      // User specified landmark
      setLocation({ lat: 26.7271, lng: 88.3953 });
      setLocationError(null);
      handleNext();
    } else {
      alert('Please enter a valid highway location or coordinates.');
    }
  };

  const loadFallbackProviders = () => {
    const helpers = getHelperProfiles();
    const fallbackList = helpers.map((h, idx) => ({
      id: h.id,
      name: h.businessName || `Mechanic Hub #${idx + 1}`,
      verified: h.verificationStatus === 'VERIFIED',
      rating: h.rating || 4.9,
      distance: `${(1.4 + idx * 1.2).toFixed(1)} km`,
      estimatedArrival: `${10 + idx * 4}-${16 + idx * 4} mins`,
      services: h.skills && h.skills.length > 0 ? h.skills : ['Breakdown Repair', 'Puncture Repair', 'Emergency Fuel'],
      startingPrice: 250 + idx * 50,
      isOpen: h.isAvailable ?? true
    }));
    setProviders(fallbackList);
  };

  useEffect(() => {
    if (step === 3 && location) {
      fetch(`${API_BASE_URL}/api/assistance/providers/nearby?lat=${location.lat}&lng=${location.lng}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.length > 0) {
            setProviders(data.data);
          } else {
            loadFallbackProviders();
          }
        })
        .catch(() => {
          loadFallbackProviders();
        });
    }
  }, [step, location]);

  const submitRequest = async () => {
    if (!category || !location || !selectedProvider) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/assistance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemCategory: category,
          location: { coordinates: [location.lng, location.lat] },
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

    // Offline / Fallback Storage Integration
    const userBikes = user ? getBikes(user.id) : [];
    const activeBike = userBikes.find(b => b.isPrimary) || userBikes[0] || {
      id: 'bike-def',
      userId: user?.id || 'user-rider-1',
      brand: 'KTM',
      model: '390 Adventure',
      registrationNumber: 'WB 74 AB 8921',
      year: 2025,
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
      description: `${category} emergency assistance requested near coordinates (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`,
      status: 'OPEN' as const,
      assignedHelperId: selectedProvider.id,
      assignedHelperName: selectedProvider.name,
      locationShared: true,
      latitude: location.lat,
      longitude: location.lng,
      approximateLocation: `Siliguri Corridor (${location.lat.toFixed(3)}°N, ${location.lng.toFixed(3)}°E)`,
      createdAt: new Date().toISOString()
    };
    saveRequest(newReq);
    setLoading(false);
    navigate(`/requests/${newReqId}`);
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white pt-24 pb-12 font-sans overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-3xl">
        
        <header className="mb-8 relative z-20">
          {step > 1 ? (
            <button 
              onClick={handleBack} 
              aria-label="Go back to previous step"
              className="flex items-center text-gray-300 hover:text-white mb-6 p-2 -ml-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF174]"
            >
              <ArrowLeft className="mr-2" size={20} /> Back
            </button>
          ) : (
            <div className="h-10 mb-2"></div>
          )}
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-4" aria-label="Request help progress steps">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-1 flex items-center">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${step === i ? 'bg-[#FFF174] text-black ring-4 ring-[#FFF174]/20' : step > i ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}
                  aria-current={step === i ? 'step' : undefined}
                >
                  {step > i ? '✓' : i}
                </div>
                {i < 3 && <div className={`flex-1 h-1 mx-2 rounded-full ${step > i ? 'bg-green-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        </header>

        <main id="main-content">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.section key="step1" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <h1 className="text-4xl md:text-5xl font-black mb-3 text-gray-50">What do you need help with?</h1>
                <p className="text-gray-300 text-lg mb-8">Select the category that best describes your issue.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Assistance categories">
                  {CATEGORIES.map(cat => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => { setCategory(cat.id); handleNext(); }}
                        className={`p-6 rounded-2xl border text-left transition-all group ${isSelected ? 'border-[#FFF174] bg-[#FFF174]/10' : 'border-white/10 bg-[#111111] hover:border-white/30'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF174]`}
                      >
                        <div className="flex items-center mb-3">
                          <div className={`p-3 rounded-xl ${isSelected ? 'bg-[#FFF174] text-black' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
                            {cat.icon}
                          </div>
                          <h2 className="ml-4 font-bold text-xl">{cat.label}</h2>
                        </div>
                        <p className={`text-sm ${isSelected ? 'text-gray-200' : 'text-gray-400'}`}>{cat.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section key="step2" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="text-center py-12">
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 relative">
                  {locating && (
                    <motion.div 
                      className="absolute inset-0 border-2 border-[#FFF174] rounded-full"
                      animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <MapPin className="text-[#FFF174]" size={40} aria-hidden="true" />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-50">Confirm Location</h1>
                <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">We need your coordinates to dispatch the nearest provider accurately.</p>

                {locationError && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-8 text-left max-w-lg mx-auto">
                    <div className="flex items-center gap-3 mb-2 text-amber-400 font-bold text-lg">
                      <AlertCircle size={22} />
                      <h3>Your location is unavailable.</h3>
                    </div>
                    <p className="text-gray-300 text-sm mb-5 leading-relaxed">{locationError}</p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={requestLocation}
                        className="px-5 py-2.5 bg-[#FFF174] text-black font-black text-xs rounded-xl hover:bg-yellow-400 transition-colors flex items-center gap-2"
                      >
                        <RefreshCw size={14} /> Enable Location / Retry
                      </button>
                      <button
                        onClick={() => setShowManualInput(prev => !prev)}
                        className="px-5 py-2.5 bg-white/10 text-white font-bold text-xs rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/10"
                      >
                        <Edit3 size={14} /> Enter Location Manually
                      </button>
                    </div>
                  </div>
                )}

                {showManualInput && (
                  <form onSubmit={handleManualLocationSubmit} className="bg-[#111111] border border-white/10 rounded-2xl p-6 mb-8 text-left max-w-lg mx-auto space-y-4">
                    <h3 className="font-bold text-white text-base">Enter Roadside Location</h3>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        Highway Milestone / Landmark
                      </label>
                      <input
                        type="text"
                        value={manualLandmark}
                        onChange={e => setManualLandmark(e.target.value)}
                        placeholder="e.g. NH-10 Corridor, Sevoke Road Milestone 12"
                        className="w-full px-4 py-3 bg-[#181818] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFF174] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Latitude</label>
                        <input
                          type="text"
                          value={manualCoords.lat}
                          onChange={e => setManualCoords(prev => ({ ...prev, lat: e.target.value }))}
                          placeholder="26.7271"
                          className="w-full px-4 py-3 bg-[#181818] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFF174] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Longitude</label>
                        <input
                          type="text"
                          value={manualCoords.lng}
                          onChange={e => setManualCoords(prev => ({ ...prev, lng: e.target.value }))}
                          placeholder="88.3953"
                          className="w-full px-4 py-3 bg-[#181818] border border-white/10 rounded-xl text-white text-sm focus:border-[#FFF174] focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#FFF174] text-black font-black text-sm rounded-xl hover:bg-yellow-400 transition-colors uppercase tracking-wider"
                    >
                      Confirm Location & Find Providers
                    </button>
                  </form>
                )}
                
                {!locationError && !showManualInput && (
                  <div className="flex flex-col items-center gap-4">
                    <button 
                      onClick={requestLocation}
                      disabled={locating}
                      aria-busy={locating}
                      className="inline-flex items-center justify-center px-8 py-5 bg-[#FFF174] text-black font-black text-lg rounded-xl hover:bg-yellow-400 hover:scale-105 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400/50 w-full sm:w-auto shadow-[0_0_30px_rgba(255,241,116,0.2)] disabled:opacity-70 disabled:hover:scale-100"
                    >
                      {locating ? (
                        <><Loader2 className="animate-spin mr-3" size={24} /> LOCATING...</>
                      ) : (
                        <><Navigation className="mr-3" size={24} /> SHARE GPS LOCATION</>
                      )}
                    </button>

                    <button 
                      type="button"
                      onClick={() => setShowManualInput(true)}
                      className="text-sm text-gray-400 hover:text-[#FFF174] underline flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 size={14} /> Enter Location Manually
                    </button>
                  </div>
                )}
              </motion.section>
            )}

            {step === 3 && (
              <motion.section key="step3" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <h1 className="text-4xl md:text-5xl font-black mb-3 text-gray-50">Select a Provider</h1>
                <p className="text-gray-300 text-lg mb-8">Choose a mechanic or towing service to dispatch to your location.</p>
                
                {providers.length === 0 ? (
                  <div className="text-center py-12">
                    <Loader2 className="animate-spin text-[#FFF174] mx-auto mb-4" size={40} />
                    <p className="text-gray-400">Finding nearby mechanics...</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-8" role="radiogroup" aria-label="Available providers">
                    {providers.map(p => {
                      const isSelected = selectedProvider?.id === p.id;
                      return (
                        <button 
                          key={p.id}
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedProvider(p)}
                          className={`w-full text-left p-6 rounded-2xl border transition-all ${isSelected ? 'border-[#FFF174] bg-[#FFF174]/10' : 'border-white/10 bg-[#111111] hover:border-white/30'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF174]`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-50">
                                {p.name}
                                {p.verified && <ShieldCheck size={18} className="text-[#22C55E]" aria-label="Verified Provider" />}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-300 mt-1">
                                <span className="flex items-center" aria-label={`Rating: ${p.rating} stars`}><Star size={14} className="text-[#FFF174] mr-1" aria-hidden="true" /> {p.rating}</span>
                                <span>{p.distance} away</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400 uppercase tracking-wide">ETA</p>
                              <p className="font-bold text-[#FFF174] text-lg">{p.estimatedArrival}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4" aria-label="Services offered">
                            {p.services?.map((s: string) => (
                              <span key={s} className="px-3 py-1 bg-white/10 text-xs font-bold rounded-lg text-gray-200">{s}</span>
                            ))}
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-white/10">
                            <span className="text-sm font-bold text-gray-200">Starts from ₹{p.startingPrice}</span>
                            <span className={`text-xs font-black tracking-widest uppercase px-3 py-1 rounded-lg ${p.isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {p.isOpen ? 'AVAILABLE' : 'CLOSED'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <AnimatePresence>
                  {selectedProvider && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                      <button 
                        onClick={submitRequest}
                        disabled={loading || !selectedProvider.isOpen}
                        aria-busy={loading}
                        className="w-full flex items-center justify-center py-5 bg-[#FFF174] text-black font-black text-xl rounded-xl hover:bg-yellow-400 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400/50 shadow-[0_0_30px_rgba(255,241,116,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <><Loader2 className="animate-spin mr-3" size={24} /> REQUESTING...</>
                        ) : !selectedProvider.isOpen ? (
                          'PROVIDER IS CLOSED'
                        ) : (
                          <>REQUEST {selectedProvider.name.toUpperCase()} <ChevronRight className="ml-2" size={24} /></>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            )}
            
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
