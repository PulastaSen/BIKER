import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  MessageCircle,
  Users
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
import { buildWhatsAppRideShareUrl, buildWhatsAppImSafeUrl } from '../utils/whatsappShare';

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

  // 3-Step Setup Form (Section 18)
  const [destinationName, setDestinationName] = useState('Gangtok, Sikkim (NH-10)');
  const [customDestination, setCustomDestination] = useState('');
  const [durationMins, setDurationMins] = useState(260);
  const [sharedWithFamily, setSharedWithFamily] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showSafetyPrompt, setShowSafetyPrompt] = useState(false);
  const [imSafeFeedback, setImSafeFeedback] = useState(false);

  const { coords, accuracy } = useUserLocation(true);

  useEffect(() => {
    fetchActiveRide().then(ride => {
      setActiveRide(ride);
      setLoading(false);
    });

    fetchFamilyCircle().then(members => {
      if (members && members.length > 0) {
        setFamilyMembers(members);
      } else {
        setFamilyMembers([
          {
            id: 'fam-1',
            userId: 'rider-1',
            name: 'Mom',
            relationship: 'PARENT',
            phone: '+91 98765 11111',
            canViewLiveRide: true,
            notifyOnSOS: true,
            notifyOnSafetyTimer: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'fam-2',
            userId: 'rider-1',
            name: 'Dad',
            relationship: 'PARENT',
            phone: '+91 98765 22222',
            canViewLiveRide: true,
            notifyOnSOS: true,
            notifyOnSafetyTimer: true,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    });
  }, []);

  // Periodic Safety Check Timer evaluation
  useEffect(() => {
    if (!activeRide) return;

    const timerInterval = setInterval(() => {
      if (activeRide.expectedArrivalTime) {
        const target = new Date(activeRide.expectedArrivalTime).getTime();
        if (Date.now() > target) {
          setShowSafetyPrompt(true);
        }
      }
    }, 15000);

    return () => clearInterval(timerInterval);
  }, [activeRide]);

  // Live Location loop during active ride (only if real coords exist)
  useEffect(() => {
    if (!activeRide) return;

    const interval = setInterval(() => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
          updateRideLocation(activeRide.rideId, [pos.coords.longitude, pos.coords.latitude]);
        });
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [activeRide]);

  const handleStartRide = async (e: React.FormEvent) => {
    e.preventDefault();
    setStarting(true);

    const effectiveDest = customDestination.trim() || destinationName;

    // Real start coordinates or empty (never fake coordinates)
    const startCoords: [number, number] = coords ? [coords.lng, coords.lat] : [0, 0];

    const matchedDest = POPULAR_DESTINATIONS.find(d => d.name === effectiveDest);
    const destCoords: [number, number] = matchedDest ? [matchedDest.lng, matchedDest.lat] : [0, 0];

    const targetTime = new Date(Date.now() + durationMins * 60 * 1000).toISOString();

    const newRide = await startSafeRide({
      destination: { coordinates: destCoords, name: effectiveDest },
      startLocation: { coordinates: startCoords, address: 'Current Location' },
      estimatedDurationMinutes: durationMins,
      sharedWithFamily,
      sharedFamilyIds: familyMembers.map(m => m.id),
      safetyTimerEnabled: true,
      safetyTimerTarget: targetTime
    });

    setStarting(false);
    if (newRide) {
      setActiveRide(newRide);
    }
  };

  const handleEndRide = async () => {
    if (!activeRide) return;
    if (window.confirm('Finish this Safe Ride session?')) {
      await endSafeRide(activeRide.rideId);
      setActiveRide(null);
      setShowSafetyPrompt(false);
    }
  };

  // Section 19: One-tap "I'm Safe"
  const handleImSafeCheckIn = async () => {
    if (!activeRide) return;
    await checkInSafetyTimer(activeRide.rideId, 'SAFE_CONFIRMED');
    setShowSafetyPrompt(false);
    setImSafeFeedback(true);
    setTimeout(() => setImSafeFeedback(false), 3500);

    // Open WhatsApp with calm "🟢 Pulasta is safe" message
    const imSafeUrl = buildWhatsAppImSafeUrl({
      phone: familyMembers[0]?.phone,
      riderName: 'Pulasta',
      destination: activeRide.destination.name
    });
    window.open(imSafeUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center text-white">
        <Loader2 size={32} className="animate-spin text-[#FFF174]" />
      </div>
    );
  }

  const effectiveDestName = activeRide ? activeRide.destination.name : (customDestination.trim() || destinationName);
  const activeEta = activeRide?.expectedArrivalTime
    ? new Date(activeRide.expectedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : `${durationMins} min`;

  const whatsAppShareUrl = buildWhatsAppRideShareUrl({
    latitude: coords?.lat,
    longitude: coords?.lng,
    destination: effectiveDestName,
    eta: activeEta,
    riderName: 'Pulasta',
  });

  return (
    <div className="min-h-screen bg-[#090909] text-white pt-4 pb-24 md:pb-16 font-sans selection:bg-[#FFF174] selection:text-black">
      <div className="container mx-auto px-4 max-w-xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            SAFE RIDE COCKPIT
          </span>
        </div>

        {/* ========================================================
            ACTIVE SAFE RIDE HUD (Section 18 & 19 Specification)
            ======================================================== */}
        {activeRide ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            
            {/* SAFETY TIMER PROMPT (Section 20) */}
            {showSafetyPrompt && (
              <div className="p-5 rounded-3xl bg-amber-950/60 border-2 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.3)] space-y-3">
                <div className="flex items-center gap-2.5 text-amber-300">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                  <strong className="text-sm font-black">Are you safe?</strong>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Expected arrival reached. Unable to confirm rider safety. Please tap I'm Safe or request emergency help.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1 text-xs font-black">
                  <button
                    type="button"
                    onClick={handleImSafeCheckIn}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 size={14} /> I'm Safe
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/im-stranded')}
                    className="py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Need Help
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/sos')}
                    className="py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    🚨 SOS
                  </button>
                </div>
              </div>
            )}

            {/* MAIN ACTIVE RIDE CARD */}
            <div className="p-6 rounded-3xl bg-[#121A12] border-2 border-emerald-500/50 shadow-[0_0_35px_rgba(16,185,129,0.2)] space-y-4">
              
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    🏍️ SAFE RIDE ACTIVE
                  </h1>
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  LIVE
                </span>
              </div>

              {/* Destination & Target ETA */}
              <div className="grid grid-cols-2 gap-3 bg-black/40 p-4 rounded-2xl border border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Destination</span>
                  <strong className="text-base text-white block mt-0.5 truncate">{activeRide.destination.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Expected Arrival</span>
                  <strong className="text-base text-[#FFF174] block mt-0.5">{activeEta}</strong>
                </div>
              </div>

              {/* Status Indicators: Location sharing ON • Family informed */}
              <div className="p-3 rounded-xl bg-black/30 border border-emerald-500/20 text-xs flex items-center justify-between text-emerald-200">
                <span className="flex items-center gap-1.5 font-semibold">
                  <MapPin size={14} className="text-emerald-400" />
                  <span>📍 Location sharing ON{accuracy ? ` (±${accuracy}m)` : ''}</span>
                </span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <Users size={14} className="text-blue-400" />
                  <span>👨👩👧 Family informed</span>
                </span>
              </div>

              <RouteLine className="opacity-30" />

              {/* SECTION 19: ONE-TAP "I'M SAFE" BUTTON */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleImSafeCheckIn}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
                >
                  <CheckCircle2 size={18} />
                  <span>✅ I'M SAFE (1-Tap Check-In)</span>
                </button>

                {imSafeFeedback && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-400/40 text-emerald-300 text-xs text-center font-bold animate-in fade-in">
                    🟢 Safety confirmed! Family informed.
                  </div>
                )}

                {/* Secondary Actions: [NEED HELP] & [END RIDE] */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/im-stranded')}
                    className="py-3 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle size={15} />
                    <span>[ NEED HELP ]</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEndRide}
                    className="py-3 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>[ END RIDE ]</span>
                  </button>
                </div>
              </div>

              {/* Share Status with Family via WhatsApp */}
              <div className="pt-1 border-t border-white/10">
                <a
                  href={whatsAppShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle size={15} className="text-emerald-400" />
                  <span>Share Route Status via WhatsApp</span>
                </a>
              </div>

            </div>
          </div>
        ) : (
          /* ========================================================
             SHORT 3-STEP START SAFE RIDE FORM (Section 18)
             Step 1: Where are you going?
             Step 2: Who should know?
             Step 3: Expected arrival?
             ======================================================== */
          <form onSubmit={handleStartRide} className="space-y-4 animate-in fade-in duration-150">
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Start Safe Ride
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Share your journey with trusted contacts. One tap confirms you're safe.
              </p>
            </div>

            {/* STEP 1: WHERE ARE YOU GOING? */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-300 block">
                STEP 1: WHERE ARE YOU GOING?
              </span>

              <div className="space-y-1.5">
                {POPULAR_DESTINATIONS.map((d) => (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => {
                      setDestinationName(d.name);
                      setCustomDestination('');
                      setDurationMins(d.durationMins);
                    }}
                    className={`w-full p-3 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer flex justify-between items-center ${
                      destinationName === d.name && !customDestination
                        ? 'bg-emerald-500/20 border-emerald-400 text-white'
                        : 'bg-black/40 border-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    <span>{d.name}</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{d.durationMins} min</span>
                  </button>
                ))}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Or enter custom town / destination..."
                  value={customDestination}
                  onChange={(e) => setCustomDestination(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                />
              </div>
            </div>

            {/* STEP 2: WHO SHOULD KNOW? */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-gray-300">
                  STEP 2: WHO SHOULD KNOW?
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">No app required</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {familyMembers.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex justify-between items-center">
                    <div>
                      <strong className="text-white block font-bold">{m.name}</strong>
                      <span className="text-[10px] text-gray-400">{m.relationship} • {m.phone}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                      WhatsApp / SMS
                    </span>
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-2.5 pt-1 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sharedWithFamily}
                  onChange={(e) => setSharedWithFamily(e.target.checked)}
                  className="w-4 h-4 accent-[#FFF174]"
                />
                <span>Share start message with contacts</span>
              </label>
            </div>

            {/* STEP 3: EXPECTED ARRIVAL? */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-300 block">
                STEP 3: EXPECTED ARRIVAL?
              </span>

              <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                {[45, 90, 150, 240].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMins(mins)}
                    className={`py-2.5 rounded-xl border transition-all cursor-pointer ${
                      durationMins === mins
                        ? 'bg-[#FFF174] text-black border-[#FFF174]'
                        : 'bg-black/40 border-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* START BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={starting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-98 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
              >
                {starting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Initiating Safe Ride...</span>
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    <span>[ START SAFE RIDE ]</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
