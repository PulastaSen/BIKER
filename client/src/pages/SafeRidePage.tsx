import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Play, 
  Square, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  BellRing
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

  // Safety Timer Trigger Prompt
  const [showSafetyPrompt, setShowSafetyPrompt] = useState(false);

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

    let startCoords: [number, number] = [88.3953, 26.7271];
    if ('geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        startCoords = [pos.coords.longitude, pos.coords.latitude];
      } catch {
        // default Siliguri hub
      }
    }

    const matchedDest = POPULAR_DESTINATIONS.find(d => d.name === destinationName);
    const destCoords: [number, number] = matchedDest ? [matchedDest.lng, matchedDest.lat] : [88.6138, 27.3389];

    const targetTime = new Date(Date.now() + durationMins * 60 * 1000).toISOString();

    const newRide = await startSafeRide({
      destination: { coordinates: destCoords, name: destinationName },
      startLocation: { coordinates: startCoords, address: 'Siliguri Highway Origin' },
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
      alert('Confirmed safe! Family members have been updated.');
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

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-20 pb-24 font-sans selection:bg-[#FFF174] selection:text-black">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FFF174] bg-[#FFF174]/10 px-3 py-1 rounded-full border border-[#FFF174]/20">
            <ShieldCheck size={14} /> Sentinel Mode
          </div>
        </div>

        {/* ACTIVE RIDE HUD (Sections 7 & 8) */}
        {activeRide ? (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#111622] border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)] space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                    ACTIVE SAFE RIDE #{activeRide.rideId}
                  </span>
                  <h1 className="text-2xl font-black text-white mt-0.5">
                    {activeRide.destination.name}
                  </h1>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black animate-pulse">
                  LIVE HUD
                </span>
              </div>

              {/* Dynamic Visual Route Illustration */}
              <div className="py-1">
                <RouteLine animated={true} />
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-gray-400 block text-[11px]">Expected Duration</span>
                  <strong className="text-white text-base">
                    {Math.floor(activeRide.estimatedDurationMinutes / 60)}h {activeRide.estimatedDurationMinutes % 60}m
                  </strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-gray-400 block text-[11px]">Safety Timer Target</span>
                  <strong className="text-[#FFF174] text-base">
                    {activeRide.expectedArrivalTime ? new Date(activeRide.expectedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Set'}
                  </strong>
                </div>
              </div>

              {/* Status details */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Family Sharing:</span>
                  <span className="text-emerald-400 font-bold">
                    {activeRide.sharedWithFamily ? `✓ Shared with ${familyMembers.length} members` : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">GPS Ping:</span>
                  <span className="text-white font-mono">
                    {activeRide.currentLocation ? `${activeRide.currentLocation.coordinates[1].toFixed(4)}, ${activeRide.currentLocation.coordinates[0].toFixed(4)}` : 'Fixing...'}
                  </span>
                </div>
              </div>

              {/* Safety Timer Check-in Trigger */}
              <div className="p-4 rounded-2xl bg-yellow-500/10 border border-[#FFF174]/30 flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-[#FFF174] block">Arrival Check-in Simulation</strong>
                  <span className="text-[11px] text-gray-400">Test the "Are you safe?" prompt anytime</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSafetyPrompt(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#FFF174] text-black font-bold text-xs"
                >
                  Prompt Now
                </button>
              </div>

              {/* End Ride Button */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleEndRide}
                  className="flex-1 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Square size={16} /> Complete Ride
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/sos')}
                  className="py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <AlertTriangle size={16} /> SOS
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* START SAFE RIDE FORM (Section 7) */
          <form onSubmit={handleStartRide} className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">START SAFE RIDE</h1>
              <p className="text-gray-400 text-xs mt-1">
                Configure destination, arrival timer, and family tracking before rolling out onto the highway.
              </p>
            </div>

            {/* Destination Selection */}
            <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <MapPin size={14} className="text-[#FFF174]" /> Ride Destination
              </h2>

              <div className="space-y-2">
                {POPULAR_DESTINATIONS.map(dest => (
                  <label
                    key={dest.name}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      destinationName === dest.name
                        ? 'bg-[#FFF174]/10 border-[#FFF174] text-white'
                        : 'bg-[#182030] border-white/10 text-gray-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
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

            {/* Section 8: Safety Timer Configuration */}
            <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Clock size={14} className="text-[#FFF174]" /> Safety Timer Deadline
                </h2>
                <span className="text-[10px] text-emerald-400 font-bold">Escalation Policy Active</span>
              </div>

              <p className="text-xs text-gray-400">
                "Notify me if I haven't arrived by this time." If you do not confirm safety upon reaching this timestamp, MotoAssist prompts your emergency contacts.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Expected Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={15}
                  max={720}
                  value={durationMins}
                  onChange={e => setDurationMins(parseInt(e.target.value, 10) || 60)}
                  className="w-full bg-[#182030] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
                <span className="text-[11px] text-[#FFF174] block mt-1">
                  Target Arrival: {new Date(Date.now() + durationMins * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="space-y-2 pt-2 text-xs text-gray-300">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyTimerEnabled}
                    onChange={e => setSafetyTimerEnabled(e.target.checked)}
                    className="rounded text-[#FFF174]"
                  />
                  <span>Prompt "Are you safe?" at target arrival deadline</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sharedWithFamily}
                    onChange={e => setSharedWithFamily(e.target.checked)}
                    className="rounded text-[#FFF174]"
                  />
                  <span>Share live progress with My Safety Circle ({familyMembers.length} contacts)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={starting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              {starting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Initiating Safe Ride Sentinel...</span>
                </>
              ) : (
                <>
                  <Play size={18} />
                  <span>START SAFE RIDE</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>

      {/* Section 8: Safety Timer "Are you safe?" Prompt Modal */}
      {showSafetyPrompt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111622] border-2 border-[#FFF174] rounded-3xl max-w-md w-full p-6 text-center space-y-5 animate-bounce-once">
            <div className="w-16 h-16 rounded-full bg-[#FFF174]/20 text-[#FFF174] flex items-center justify-center mx-auto">
              <BellRing size={32} className="animate-pulse" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FFF174] block">
                SAFETY TIMER DEADLINE REACHED
              </span>
              <h2 className="text-2xl font-black text-white mt-1">Are you safe?</h2>
              <p className="text-xs text-gray-400 mt-1">
                Your estimated arrival time has passed. Please confirm your safety to reset family escalation alerts.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleCheckIn('SAFE_CONFIRMED')}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
              >
                <CheckCircle2 size={18} /> I'm Safe
              </button>

              <button
                type="button"
                onClick={() => handleCheckIn('ESCALATED')}
                className="w-full py-3.5 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs uppercase tracking-wider"
              >
                Need Help (Mechanic / Towing)
              </button>

              <button
                type="button"
                onClick={() => navigate('/sos')}
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <AlertTriangle size={18} /> Emergency SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
