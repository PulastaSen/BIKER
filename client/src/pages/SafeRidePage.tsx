import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Play, 
  Square, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  MessageCircle
} from 'lucide-react';
import { 
  startSafeRide, 
  fetchActiveRide, 
  updateRideLocation, 
  checkInSafetyTimer, 
  endSafeRide,
  fetchFamilyCircle
} from '../services/ecosystemApi';
import type { SafeRideSession, FamilyMember } from '../types/app';
import { RouteLine } from '../components/graphics';
import { useUserLocation } from '../hooks/useUserLocation';
import { buildWhatsAppRideShareUrl } from '../utils/whatsappShare';

const POPULAR_DESTINATIONS = [
  { name: 'Gangtok, Sikkim (NH-10)', lat: 27.3389, lng: 88.6138, durationMins: 260 },
  { name: 'Darjeeling via Rohini (Hill Cart Rd)', lat: 27.0410, lng: 88.2663, durationMins: 180 },
  { name: 'Kalimpong via Teesta (NH-10)', lat: 27.0667, lng: 88.4667, durationMins: 150 },
  { name: 'Mirik Lake Corridor', lat: 26.8920, lng: 88.1790, durationMins: 120 },
  { name: 'Sevoke Coronation Bridge', lat: 26.8990, lng: 88.4350, durationMins: 45 }
];

export function SafeRidePage() {
  const navigate = useNavigate();

  const [activeRide, setActiveRide] = useState<SafeRideSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // Planning Form
  const [destinationName, setDestinationName] = useState('Gangtok, Sikkim (NH-10)');
  const [durationMins, setDurationMins] = useState(260);
  const [sharedWithFamily, setSharedWithFamily] = useState(true);
  const [safetyTimerEnabled, setSafetyTimerEnabled] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showSafetyPrompt, setShowSafetyPrompt] = useState(false);

  const { coords, accuracy } = useUserLocation(true);

  useEffect(() => {
    fetchActiveRide().then(ride => {
      setActiveRide(ride);
      setLoading(false);
    });

    fetchFamilyCircle().then(members => setFamilyMembers(members));
  }, []);

  // Live Location Tracker Loop during active ride
  useEffect(() => {
    if (!activeRide) return;

    const interval = setInterval(() => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
          updateRideLocation(activeRide.rideId, [pos.coords.longitude, pos.coords.latitude]);
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [activeRide]);

  const handleStartRide = async (e: React.FormEvent) => {
    e.preventDefault();
    setStarting(true);

    const startCoords: [number, number] = coords
      ? [coords.lng, coords.lat]
      : [88.3953, 26.7271];

    const matchedDest = POPULAR_DESTINATIONS.find(d => d.name === destinationName);
    const destCoords: [number, number] = matchedDest ? [matchedDest.lng, matchedDest.lat] : [88.6138, 27.3389];

    const targetTime = new Date(Date.now() + durationMins * 60 * 1000).toISOString();

    const newRide = await startSafeRide({
      destination: { coordinates: destCoords, name: destinationName },
      startLocation: { coordinates: startCoords, address: 'Highway Origin' },
      estimatedDurationMinutes: durationMins,
      sharedWithFamily,
      sharedFamilyIds: familyMembers.map(m => m.id),
      safetyTimerEnabled,
      safetyTimerTarget: targetTime
    });

    setStarting(false);
    if (newRide) {
      setActiveRide(newRide);
    }
  };

  const handleEndRide = async () => {
    if (!activeRide) return;
    if (window.confirm('End this safe ride session?')) {
      await endSafeRide(activeRide.rideId);
      setActiveRide(null);
    }
  };

  const handleCheckIn = async (status: 'SAFE_CONFIRMED' | 'ESCALATED') => {
    if (!activeRide) return;
    await checkInSafetyTimer(activeRide.rideId, status);
    setShowSafetyPrompt(false);
    if (status === 'SAFE_CONFIRMED') {
      alert('Confirmed safe! Family members and emergency timer updated.');
    } else {
      navigate('/sos');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-white">
        <Loader2 size={32} className="animate-spin text-[#FFF174]" />
      </div>
    );
  }

  const activeEta = activeRide?.expectedArrivalTime
    ? new Date(activeRide.expectedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : `${durationMins}m`;

  const whatsAppShareUrl = buildWhatsAppRideShareUrl({
    latitude: coords?.lat,
    longitude: coords?.lng,
    destination: activeRide ? activeRide.destination.name : destinationName,
    eta: activeEta,
    riderName: 'I',
  });

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-4 pb-24 md:pb-16 font-sans selection:bg-[#FFF174] selection:text-black">
      <div className="container mx-auto px-4 max-w-xl space-y-5">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            SAFE RIDE HUD
          </span>
        </div>

        {/* Contextual Rides Toolbar (Section 1 Requirement) */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30"
          >
            Safe Ride HUD
          </button>
          <button
            type="button"
            onClick={() => navigate('/route-coverage')}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs border border-white/10 transition-colors"
          >
            Corridor Coverage
          </button>
          <button
            type="button"
            onClick={() => navigate('/road-hazards')}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs border border-white/10 transition-colors"
          >
            Road Hazards Feed
          </button>
          <button
            type="button"
            onClick={() => navigate('/safety-circle')}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs border border-white/10 transition-colors"
          >
            Safety Circle
          </button>
        </div>

        {/* ACTIVE SAFE RIDE HUD */}
        {activeRide ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            
            {/* Safety Prompt Banner if target time passed */}
            {showSafetyPrompt && (
              <div className="p-5 rounded-3xl bg-amber-950/60 border-2 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.3)] space-y-3">
                <div className="flex items-center gap-2.5 text-amber-300">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                  <strong className="text-sm font-black">SAFETY CHECK: Have you arrived safely?</strong>
                </div>
                <p className="text-xs text-amber-200/80">
                  Your safety timer target was reached. Please confirm you are safe.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCheckIn('SAFE_CONFIRMED')}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={15} /> Yes, I am safe
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCheckIn('ESCALATED')}
                    className="py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle size={15} /> Need Help (SOS)
                  </button>
                </div>
              </div>
            )}

            {/* Active Ride Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121A14] to-[#0E1210] border-2 border-emerald-500/60 shadow-[0_0_40px_rgba(16,185,129,0.2)] space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-black uppercase text-emerald-300 tracking-wider">
                    SAFE RIDE IN PROGRESS
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-mono">#{activeRide.rideId}</span>
              </div>

              {/* Destination & ETA */}
              <div className="grid grid-cols-2 gap-3 bg-black/40 p-4 rounded-2xl border border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Destination</span>
                  <strong className="text-sm text-white block mt-0.5 truncate">{activeRide.destination.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Target ETA</span>
                  <strong className="text-sm text-[#FFF174] block mt-0.5">{activeEta}</strong>
                </div>
              </div>

              <RouteLine className="opacity-30" />

              {/* Share With Family (Section 13: WhatsApp direct link) */}
              <div className="pt-1">
                <a
                  href={whatsAppShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <MessageCircle size={16} />
                  <span>Share Ride Status via WhatsApp</span>
                </a>
              </div>

              {/* Actions: Complete Ride or SOS */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleEndRide}
                  className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Square size={14} /> End Ride
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/sos')}
                  className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <AlertTriangle size={14} /> Emergency SOS
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* START SAFE RIDE FORM (Section 4: Share with Family → Safety Timer → ETA) */
          <form onSubmit={handleStartRide} className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Start Safe Ride</h1>
              <p className="text-gray-400 text-xs mt-1">
                Share live route telemetry and configure safety timer arrival check-in.
              </p>
            </div>

            {/* Destination Selection */}
            <div className="p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <MapPin size={14} className="text-[#FFF174]" /> Select Corridor Destination
              </span>

              <div className="space-y-2">
                {POPULAR_DESTINATIONS.map(dest => (
                  <label
                    key={dest.name}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      destinationName === dest.name
                        ? 'bg-[#FFF174]/15 border-[#FFF174] text-white'
                        : 'bg-black/30 border-white/10 text-gray-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="destChoice"
                        checked={destinationName === dest.name}
                        onChange={() => {
                          setDestinationName(dest.name);
                          setDurationMins(dest.durationMins);
                        }}
                        className="text-[#FFF174] focus:ring-0"
                      />
                      <strong className="text-xs font-bold text-white">{dest.name}</strong>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      ~{Math.floor(dest.durationMins / 60)}h {dest.durationMins % 60}m
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Safety Timer & ETA */}
            <div className="p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <Clock size={14} className="text-[#FFF174]" /> Safety Timer & ETA
                </span>
                <span className="text-[11px] text-[#FFF174] font-bold">
                  Target: {new Date(Date.now() + durationMins * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">
                  Expected Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={15}
                  max={720}
                  value={durationMins}
                  onChange={e => setDurationMins(parseInt(e.target.value, 10) || 60)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div className="space-y-2 pt-1 text-xs text-gray-300">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyTimerEnabled}
                    onChange={e => setSafetyTimerEnabled(e.target.checked)}
                    className="rounded text-[#FFF174]"
                  />
                  <span>Prompt arrival check-in at target time</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sharedWithFamily}
                    onChange={e => setSharedWithFamily(e.target.checked)}
                    className="rounded text-[#FFF174]"
                  />
                  <span>Enable direct WhatsApp ride sharing link</span>
                </label>
              </div>
            </div>

            {/* Location Status pill */}
            <div className="text-xs text-gray-400 flex items-center gap-2 px-1">
              <span className={`w-2 h-2 rounded-full ${coords ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{coords ? `GPS ready (±${accuracy || 12}m)` : 'GPS initializing...'}</span>
            </div>

            <button
              type="submit"
              disabled={starting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              {starting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Starting telemetry...</span>
                </>
              ) : (
                <>
                  <Play size={18} />
                  <span>Start Safe Ride</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
