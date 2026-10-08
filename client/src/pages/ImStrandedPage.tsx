import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  MapPin, 
  Wrench, 
  Truck, 
  Fuel, 
  BatteryCharging, 
  Disc, 
  Award, 
  HeartPulse, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Navigation,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createAssistanceRequest } from '../services/ecosystemApi';
import { saveRequest } from '../utils/appStorage';

const INCIDENT_REASONS = [
  { id: 'Accident', label: 'Accident', desc: 'Collision, fall, or crash event' },
  { id: 'Puncture', label: 'Puncture', desc: 'Flat tyre, puncture or air valve leak' },
  { id: 'Battery dead', label: 'Battery dead', desc: 'Self-start not cranking, battery drained' },
  { id: 'Out of fuel', label: 'Out of fuel', desc: 'Tank dry, fuel cut-off on highway' },
  { id: 'Engine problem', label: 'Engine problem', desc: 'Abnormal noise, seized, or won\'t rev' },
  { id: 'Electrical problem', label: 'Electrical problem', desc: 'Headlight, fuse, or ignition cutout' },
  { id: 'Chain problem', label: 'Chain problem', desc: 'Snapped chain, loose link, sprocket slip' },
  { id: 'Brake problem', label: 'Brake problem', desc: 'Spongy lever, worn pads, fluid leak' },
  { id: 'Lost/locked key', label: 'Lost/locked key', desc: 'Key misplaced, snapped or lock jammed' },
  { id: 'Overheating', label: 'Overheating', desc: 'Coolant boiling, radiator warning light' },
  { id: 'Bike won\'t start', label: 'Bike won\'t start', desc: 'Engine cranks but doesn\'t fire' },
  { id: 'Crash damage', label: 'Crash damage', desc: 'Bent fork, cracked wheel rim, broken bar' },
  { id: 'Other', label: 'Other', desc: 'Mechanical, chassis, or unlisted issue' },
  { id: 'I don\'t know', label: 'I don\'t know', desc: 'Unsure of mechanical diagnosis' }
];

const SERVICE_OPTIONS = [
  { id: 'Mechanic', label: 'Mechanic', icon: <Wrench size={22} />, desc: 'On-spot roadside troubleshooting & repair' },
  { id: 'Towing', label: 'Towing', icon: <Truck size={22} />, desc: 'Safe motorcycle carrier or flatbed rescue' },
  { id: 'Fuel', label: 'Fuel', icon: <Fuel size={22} />, desc: 'Emergency 3L/5L petrol delivery' },
  { id: 'Battery assistance', label: 'Battery assistance', icon: <BatteryCharging size={22} />, desc: 'Jump-start or battery swap on road' },
  { id: 'Puncture repair', label: 'Puncture repair', icon: <Disc size={22} />, desc: 'Tubeless mushroom plug or tube replacement' },
  { id: 'OEM service', label: 'OEM service', icon: <Award size={22} />, desc: 'Authorized KTM, RE, Honda, Triumph care' },
  { id: 'Ambulance', label: 'Ambulance', icon: <HeartPulse size={22} />, desc: 'Immediate medical ambulance discovery & 108' },
  { id: 'Emergency services', label: 'Emergency services', icon: <ShieldAlert size={22} />, desc: 'Police 100 / National 112 hotline dispatch' },
  { id: 'Family notification', label: 'Family notification', icon: <Users size={22} />, desc: 'Auto-broadcast status to Safety Circle' },
  { id: 'Other', label: 'Other', icon: <HelpCircle size={22} />, desc: 'Custom assistance requirement' }
];

export function ImStrandedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedIncident, setSelectedIncident] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  
  // Real GPS state
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    lastUpdated: Date;
    address?: string;
  } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [manualLat, setManualLat] = useState('26.7271');
  const [manualLng, setManualLng] = useState('88.3953');

  // Service requested
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Price estimate
  const isTowingSelected = selectedServices.includes('Towing');
  const estimatedPricing = {
    calloutFee: 150,
    travelFee: 100,
    serviceFee: isTowingSelected ? 500 : 100,
    estimatedTotal: isTowingSelected ? 750 : 350
  };

  const acquireGPS = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!('geolocation' in navigator)) {
      setGpsLoading(false);
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          lastUpdated: new Date()
        });
        setGpsLoading(false);
        setGpsError(null);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission denied. Please enable GPS permissions in browser settings.');
        } else if (err.code === err.TIMEOUT) {
          setGpsError('GPS acquisition timed out. Please check signal or enter location manually.');
        } else {
          setGpsError('Your location is unavailable. Unable to determine satellite coordinates.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    // Acquire location when reaching Step 2
    if (step === 2 && !location && !gpsLoading && !gpsError) {
      acquireGPS();
    }
  }, [step]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setLocation({
        latitude: lat,
        longitude: lng,
        accuracy: 50,
        lastUpdated: new Date(),
        address: manualAddress || 'Manually entered highway location'
      });
      setGpsError(null);
      setManualMode(false);
    }
  };

  const toggleService = (srvId: string) => {
    if (selectedServices.includes(srvId)) {
      setSelectedServices(selectedServices.filter(s => s !== srvId));
    } else {
      setSelectedServices([...selectedServices, srvId]);
    }
  };

  const handleSubmitRequest = async () => {
    if (!location) {
      alert('Location is required to coordinate roadside rescue.');
      return;
    }

    setSubmitting(true);
    const reqPayload = {
      problemCategory: selectedIncident || 'Breakdown',
      description: `${selectedServices.join(', ')}. ${description}`.trim(),
      location: {
        coordinates: [location.longitude, location.latitude] as [number, number],
        address: location.address || `GPS: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
        accuracyMeters: location.accuracy,
      },
      towingDetails: isTowingSelected ? {
        towingType: 'MOTORCYCLE_CARRIER' as const,
        pickupAddress: location.address || 'Breakdown spot'
      } : undefined,
      estimatedPrice: {
        ...estimatedPricing,
        isAvailable: true,
        disclaimer: 'Final price may change if additional parts or work are required.'
      }
    };

    const result = await createAssistanceRequest(reqPayload);
    setSubmitting(false);

    if (result && (result.id || result.requestId)) {
      const targetId = result.requestId || result.id;
      // Also save to local storage as secondary fallback cache
      saveRequest({
        id: targetId,
        riderId: user?.id || 'user-rider-1',
        riderName: user?.name || 'Rider in Need',
        riderPhone: user?.phone || '+91 98765 43210',
        bike: {
          id: 'bike-primary',
          userId: user?.id || 'user-rider-1',
          brand: 'KTM',
          model: '390 Adventure',
          registrationNumber: 'WB 74 AB 8921',
          year: 2025,
          fuelType: 'PETROL'
        },
        issue: selectedIncident,
        description: reqPayload.description,
        approximateLocation: reqPayload.location.address,
        locationShared: true,
        latitude: location.latitude,
        longitude: location.longitude,
        status: 'REQUESTED',
        createdAt: new Date().toISOString()
      });
      navigate(`/requests/${targetId}`);
    } else {
      alert('Unable to transmit request to dispatch backend. Please dial official emergency hotline 112 or local mechanics directly.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white pb-24 font-sans">
      {/* Top Emergency Header */}
      <header className="sticky top-0 z-30 bg-[#111622]/95 backdrop-blur-md border-b border-red-500/20 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg animate-pulse">
              <AlertTriangle size={22} />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-red-400 font-black block">RESCUE MODE</span>
              <h1 className="text-lg font-black tracking-tight leading-tight">I'M STRANDED</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-gray-300">
              Step {step} of 4
            </span>
            <button
              onClick={() => navigate('/')}
              className="text-xs text-gray-400 hover:text-white px-2 py-1"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Progress Track */}
      <div className="max-w-2xl mx-auto px-4 pt-3">
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-gradient-to-r from-red-500 to-[#FFF174]' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* STEP 1: WHAT HAPPENED? */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">Step 1</p>
              <h2 className="text-2xl font-black">WHAT HAPPENED?</h2>
              <p className="text-gray-400 text-sm mt-1">Select the primary issue with your motorcycle so we dispatch the right equipment.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INCIDENT_REASONS.map(reason => {
                const isSelected = selectedIncident === reason.id;
                return (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setSelectedIncident(reason.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'bg-red-500/15 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                        : 'bg-[#131926] border-white/10 hover:border-white/20 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-sm font-bold text-white">{reason.label}</strong>
                      {isSelected && <CheckCircle2 size={16} className="text-red-400" />}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{reason.desc}</p>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Additional Details (Optional)
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Broken clutch cable near Sevoke Checkpost, tyre bead popped off rim..."
                className="w-full bg-[#131926] border border-white/10 rounded-2xl p-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                rows={2}
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={!selectedIncident}
                onClick={() => setStep(2)}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  selectedIncident
                    ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg cursor-pointer'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Continue to Location</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DETERMINE REAL LOCATION */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">Step 2</p>
              <h2 className="text-2xl font-black">WHERE ARE YOU STRANDED?</h2>
              <p className="text-gray-400 text-sm mt-1">We require your real satellite coordinates to route nearest mechanics or tow trucks.</p>
            </div>

            {/* GPS Status Card */}
            <div className="bg-[#131926] border border-white/10 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Navigation size={16} className="text-[#FFF174]" /> Real Geolocation Status
                </span>
                {location && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    GPS Locked
                  </span>
                )}
              </div>

              {gpsLoading && (
                <div className="py-8 text-center space-y-3">
                  <Loader2 size={36} className="animate-spin text-[#FFF174] mx-auto" />
                  <p className="text-sm font-semibold">Acquiring high-accuracy satellite fix...</p>
                  <p className="text-xs text-gray-400">Please stay still and ensure clear sky view.</p>
                </div>
              )}

              {gpsError && !location && (
                <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm font-bold text-white block">Your location is unavailable.</strong>
                      <p className="text-xs text-red-200 mt-1">{gpsError}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={acquireGPS}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                    >
                      Enable Location / Retry
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualMode(true)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                    >
                      Enter Location Manually
                    </button>
                  </div>
                </div>
              )}

              {location && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Coordinates:</span>
                      <strong className="text-white font-mono">{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>GPS Accuracy:</span>
                      <strong className="text-emerald-400">±{location.accuracy} meters</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Last Updated:</span>
                      <span className="text-gray-300">{location.lastUpdated.toLocaleTimeString()}</span>
                    </div>
                    {location.address && (
                      <div className="pt-2 border-t border-white/5 text-xs text-gray-300">
                        <span className="text-gray-400 block mb-0.5">Landmark:</span>
                        {location.address}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={acquireGPS}
                      className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-gray-300 flex items-center justify-center gap-1.5"
                    >
                      <Navigation size={14} /> Refresh GPS Fix
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualMode(true)}
                      className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-gray-300"
                    >
                      Edit Manually
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Manual Location Input Drawer */}
            {manualMode && (
              <form onSubmit={handleManualSubmit} className="bg-[#182030] border border-blue-500/30 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin size={16} className="text-blue-400" /> Enter Location Manually
                  </h3>
                  <button
                    type="button"
                    onClick={() => setManualMode(false)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Highway / Landmark Address</label>
                  <input
                    type="text"
                    required
                    value={manualAddress}
                    onChange={e => setManualAddress(e.target.value)}
                    placeholder="e.g. NH-10 near 29th Mile checkpost, Siliguri"
                    className="w-full bg-[#111622] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Latitude</label>
                    <input
                      type="text"
                      value={manualLat}
                      onChange={e => setManualLat(e.target.value)}
                      className="w-full bg-[#111622] border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Longitude</label>
                    <input
                      type="text"
                      value={manualLng}
                      onChange={e => setManualLng(e.target.value)}
                      className="w-full bg-[#111622] border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white"
                >
                  Set Manual Location
                </button>
              </form>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                disabled={!location}
                onClick={() => setStep(3)}
                className={`flex-1 ml-3 py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  location
                    ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 text-white shadow-lg cursor-pointer'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Select Services Needed</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: WHAT DO YOU NEED? */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">Step 3</p>
              <h2 className="text-2xl font-black">WHAT DO YOU NEED?</h2>
              <p className="text-gray-400 text-sm mt-1">Select one or more services required to assist you.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SERVICE_OPTIONS.map(srv => {
                const isSelected = selectedServices.includes(srv.id);
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => toggleService(srv.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[#FFF174]/15 border-[#FFF174] text-white shadow-[0_0_20px_rgba(255,241,116,0.15)]'
                        : 'bg-[#131926] border-white/10 hover:border-white/20 text-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${
                      isSelected ? 'bg-[#FFF174] text-black' : 'bg-white/10 text-gray-300'
                    }`}>
                      {srv.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-bold text-white">{srv.label}</strong>
                        {isSelected && <CheckCircle2 size={16} className="text-[#FFF174]" />}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{srv.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                disabled={selectedServices.length === 0}
                onClick={() => setStep(4)}
                className={`flex-1 ml-3 py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  selectedServices.length > 0
                    ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 text-white shadow-lg cursor-pointer'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Review & Confirm</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: TRANSPARENT PRICING & CONFIRMATION */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">Step 4</p>
              <h2 className="text-2xl font-black">CONFIRM ASSISTANCE REQUEST</h2>
              <p className="text-gray-400 text-sm mt-1">Review breakdown details and transparent pricing estimate before dispatch.</p>
            </div>

            {/* Summary Card */}
            <div className="bg-[#131926] border border-white/10 rounded-3xl p-5 space-y-4">
              <div className="border-b border-white/10 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Issue</span>
                <strong className="text-base font-bold text-white">{selectedIncident}</strong>
                {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
              </div>

              <div className="border-b border-white/10 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Services Requested</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedServices.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-semibold text-gray-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Location Coordinates</span>
                <p className="text-xs text-gray-300 font-mono mt-0.5">
                  {location?.latitude.toFixed(5)}, {location?.longitude.toFixed(5)} (±{location?.accuracy}m)
                </p>
                {location?.address && <p className="text-xs text-gray-400 mt-0.5">{location.address}</p>}
              </div>
            </div>

            {/* Transparent Pricing Card (Section 3 Requirement) */}
            <div className="bg-gradient-to-br from-[#171E2E] to-[#121622] border border-[#FFF174]/30 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#FFF174] block">ESTIMATED PRICING</span>
                  <span className="text-xs text-gray-400">Pre-dispatch estimate</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FFF174]/20 text-[#FFF174]">
                  Transparent Rates
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-gray-300">
                  <span>Call-out fee</span>
                  <span>₹{estimatedPricing.calloutFee}</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Travel allowance</span>
                  <span>₹{estimatedPricing.travelFee}</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Base repair / towing</span>
                  <span>₹{estimatedPricing.serviceFee}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex items-center justify-between text-white font-black text-base">
                  <span>ESTIMATED TOTAL</span>
                  <span className="text-[#FFF174]">₹{estimatedPricing.estimatedTotal}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5 text-xs text-gray-400">
                <Info size={16} className="text-[#FFF174] shrink-0 mt-0.5" />
                <p>
                  Final price may change if additional parts or work are required. You will receive an itemized digital receipt upon completion.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitRequest}
                className="flex-1 ml-3 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Transmitting to Dispatch...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={18} />
                    <span>Submit Assistance Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
