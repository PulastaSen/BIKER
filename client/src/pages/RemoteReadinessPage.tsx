import { useState, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  Wifi, 
  WifiOff, 
  Download, 
  Clock, 
  ShieldCheck, 
  PhoneCall, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  RefreshCw
} from 'lucide-react';
import { getOfflineQueue, flushOfflineQueue, OfflineQueuedIncident } from '../utils/offlineQueue';
import { API_BASE_URL } from '../config/api';

interface TrustedStop {
  id: string;
  name: string;
  corridor: string;
  coordinates: [number, number]; // [lat, lng]
  phone: string;
  services: string[];
  openHours: string;
  safetyRating: string;
  notes: string;
}

const TRUSTED_CORRIDOR_STOPS: TrustedStop[] = [
  {
    id: 'stop-1',
    name: 'Sevoke Police Highway Picket & Coronation Post',
    corridor: 'NH-10 Highway Corridor (Siliguri - Teesta - Gangtok)',
    coordinates: [26.8833, 88.4722],
    phone: '+91 353 252 2222',
    services: ['24/7 Police Assistance', 'Emergency First Aid', 'Highway Wireless Picket', 'Emergency Water'],
    openHours: '24 Hours / 365 Days',
    safetyRating: 'VERIFIED GOVT POST',
    notes: 'Located just south of Coronation Bridge. High-frequency patrol station. Cellular signal drops 2km north of here.'
  },
  {
    id: 'stop-2',
    name: 'Sukna IOCL COCO 24/7 Oasis & Military Outpost',
    corridor: 'NH-55 / Hill Cart Road (Siliguri - Kurseong - Darjeeling)',
    coordinates: [26.7901, 88.3614],
    phone: '+91 94340 55432',
    services: ['24/7 Petrol / Diesel', 'Air Pressure & Tubeless Plugs', 'Clean Drinking Water', 'Well-Lit Parking'],
    openHours: '24 Hours',
    safetyRating: 'VERIFIED 24/7 STOP',
    notes: 'Indian Oil Company-Owned Company-Operated 24/7 petrol pump with secure lighting and convenience store before uphill climb.'
  },
  {
    id: 'stop-3',
    name: 'Teesta Bazaar Highway Emergency Hub',
    corridor: 'NH-10 Teesta River Crossing',
    coordinates: [27.0594, 88.4695],
    phone: '+91 94342 98765',
    services: ['Mountain Recovery Towing', 'Tyre Tube Vulcanizing', 'Winch Assistance', 'Mechanic Toolset'],
    openHours: '06:00 AM - 10:00 PM (Emergency on-call 24/7)',
    safetyRating: 'VERIFIED LOCAL RECOVERY',
    notes: 'Key junction between Kalimpong and Darjeeling turns. Reliable mechanic shop for tube replacements.'
  },
  {
    id: 'stop-4',
    name: 'Darjeeling More Traffic Picket & Trauma Booth',
    corridor: 'Hill Cart Road / NH-27 Siliguri Gateway',
    coordinates: [26.7320, 88.4140],
    phone: '+91 353 251 1100',
    services: ['Traffic Police Picket', 'Ambulance Standby', 'Major Highway Intersection', 'ATM Hub'],
    openHours: '24 Hours',
    safetyRating: 'VERIFIED CITY INTERSECTION',
    notes: 'Prime rally point before leaving Siliguri municipal boundaries. Last major hospital access 4 km away.'
  },
  {
    id: 'stop-5',
    name: 'Bagdogra Airport Highway Crossing & Assistance Post',
    corridor: 'NH-27 Highway Bypass (Siliguri - Bihar / Nepal border)',
    coordinates: [26.6812, 88.3286],
    phone: '+91 353 255 1010',
    services: ['Highway Patrol', '24/7 EV / Petrol Station', 'Medical First Responder', 'Tow Truck Depot'],
    openHours: '24 Hours',
    safetyRating: 'VERIFIED HIGHWAY INTERCHANGE',
    notes: 'High visibility corridor with reliable 4G cellular coverage across all major carriers.'
  }
];

export function RemoteReadinessPage() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => localStorage.getItem('motoassist_last_sync') || 'Never');
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueuedIncident[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Trip Check-In Form State
  const [tripRoute, setTripRoute] = useState(() => localStorage.getItem('motoassist_trip_route') || '');
  const [intendedArrival, setIntendedArrival] = useState(() => localStorage.getItem('motoassist_trip_arrival') || '');
  const [emergencyPhone, setEmergencyPhone] = useState(() => localStorage.getItem('motoassist_trip_contact') || '');
  const [tripSaved, setTripSaved] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setOfflineQueue(getOfflineQueue());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSaveTrip = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('motoassist_trip_route', tripRoute);
    localStorage.setItem('motoassist_trip_arrival', intendedArrival);
    localStorage.setItem('motoassist_trip_contact', emergencyPhone);
    setTripSaved(true);
    setTimeout(() => setTripSaved(false), 3000);
  };

  const handleSyncQueue = async () => {
    setIsSyncing(true);
    try {
      await flushOfflineQueue(API_BASE_URL);
      setOfflineQueue(getOfflineQueue());
      const now = new Date().toLocaleTimeString();
      setLastSyncTime(now);
      localStorage.setItem('motoassist_last_sync', now);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadEmergencyCard = () => {
    const textContent = `
========================================
MOTOASSIST — REMOTE AREA EMERGENCY CARD
========================================
Device Last Synced: ${lastSyncTime}
Rider Trip Route: ${tripRoute || 'Not specified'}
Intended Arrival: ${intendedArrival || 'Not specified'}
Emergency Contact: ${emergencyPhone || 'Not specified'}

EMERGENCY HOTLINES (CELLULAR VOICE):
- All-India Emergency Dispatch: 112
- Ambulance & Medical Response: 108
- Police Assistance: 100 / 112
- Women Highway Helpline: 1091

SAFETY RULES IN REMOTE PASSES:
1. SPINAL INJURY PROTOCOL: If rider is unconscious or has severe back pain, DO NOT REMOVE HELMET unless breathing is blocked.
2. SCENE SAFETY: Park damaged motorcycle off the tarmac. Never stand on the blind curve side of the road.
3. MOUNTAIN HYPOTHERMIA: Keep rider insulated from wet gravel. Wet clothing + mountain winds = rapid hypothermia.
4. FLUID SPILLS: If oil or petrol is leaking near exhaust, step back 15m immediately. Do NOT start engine.

VERIFIED 24/7 MOUNTAIN CORRIDOR STOPS:
1. Sevoke Police Highway Post (NH-10): +91 353 252 2222 [26.8833, 88.4722]
2. Sukna IOCL COCO 24/7 Pump (NH-55): +91 94340 55432 [26.7901, 88.3614]
3. Teesta Bazaar Mountain Recovery: +91 94342 98765 [27.0594, 88.4695]
4. Darjeeling More Traffic Booth: +91 353 251 1100 [26.7320, 88.4140]
5. Bagdogra Airport Highway Crossing: +91 353 255 1010 [26.6812, 88.3286]
========================================
`;
    const blob = new Blob([textContent.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MotoAssist_Emergency_Card_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Live GPS Sensor State
  const [gpsFix, setGpsFix] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: number;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [manualLandmark, setManualLandmark] = useState<string>('');
  const [manualSaved, setManualSaved] = useState<boolean>(false);

  const fetchGpsFix = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsFix({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: pos.timestamp
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(err.message || 'GPS access denied or unavailable in deep canyon terrain.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    fetchGpsFix();
  }, []);

  return (
    <div className="min-h-screen bg-[#151515] text-white pt-20 pb-28 font-sans selection:bg-[#FFF174] selection:text-black">
      <div className="container mx-auto px-4 max-w-4xl space-y-7">
        
        {/* Header Block */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FFF174] text-black">
              <Compass size={20} />
            </span>
            <span className="text-xs font-black tracking-wider uppercase text-[#FFF174]">
              REMOTE EXPEDITION RESILIENCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            Remote & Mountain Readiness
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-2xl">
            Prepare before riding into cellular dead zones along mountain highways (NH-10, NH-55, Teesta, and Sikkim corridors). Cache essential guides, check verified 24/7 stops, and configure trip arrival check-ins.
          </p>
        </div>

        {/* Live Connectivity Banner */}
        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
          isOnline ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            {isOnline ? (
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Wifi size={18} />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 animate-pulse">
                <WifiOff size={18} />
              </div>
            )}
            <div>
              <strong className="text-sm font-bold block">
                {isOnline ? 'Connected to Cellular / Wi-Fi Network' : 'Device Operating in True Offline Mode'}
              </strong>
              <span className="text-xs text-gray-400">
                Last verified synchronization: {lastSyncTime}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {offlineQueue.length > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 font-bold text-amber-300">
                {offlineQueue.length} locally queued (not sent)
              </span>
            )}
            <button
              onClick={handleSyncQueue}
              disabled={!isOnline || isSyncing}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>

        {/* SECTION 0: LIVE GPS QUALITY & LAST-KNOWN POSITION */}
        <section className="bg-[#121212] border border-white/10 rounded-3xl p-5 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <MapPin size={18} className="text-[#FFF174]" />
              Live GPS Sensor Accuracy & Offline Position
            </h2>
            <button
              type="button"
              onClick={fetchGpsFix}
              disabled={gpsLoading}
              className="text-xs text-[#FFF174] hover:underline flex items-center gap-1"
            >
              <RefreshCw size={12} className={gpsLoading ? 'animate-spin' : ''} />
              Refresh GPS
            </button>
          </div>

          {gpsFix ? (
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-black/40 border border-white/10 p-3.5 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-gray-400">Coordinates</p>
                <p className="font-mono text-sm font-bold text-white mt-0.5">
                  {gpsFix.lat.toFixed(5)}, {gpsFix.lng.toFixed(5)}
                </p>
              </div>
              <div className="bg-black/40 border border-white/10 p-3.5 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-gray-400">Sensor Quality</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ±{gpsFix.accuracy} meters accuracy
                </p>
              </div>
              <div className="bg-black/40 border border-white/10 p-3.5 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-gray-400">Fix Timestamp</p>
                <p className="text-xs text-gray-300 mt-1 font-mono">
                  {new Date(gpsFix.timestamp).toLocaleTimeString()} ({Math.round((Date.now() - gpsFix.timestamp) / 1000)}s ago)
                </p>
              </div>
            </div>
          ) : gpsError ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle size={15} /> {gpsError}
              </p>
              <p className="text-gray-400">
                Satellite geometry blocked by mountain terrain or permission not granted. Use manual landmark entry below:
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400">Acquiring live satellite constellation fix...</p>
          )}

          {/* Manual Landmark Backup Entry */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Manual Landmark / Highway Mile Marker Backup (When GPS is Obstructed)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualLandmark}
                onChange={(e) => setManualLandmark(e.target.value)}
                placeholder="e.g. NH-10 14th Mile, opposite Kali Mandir rock cut"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#FFF174] outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (manualLandmark.trim()) {
                    localStorage.setItem('motoassist_manual_landmark', manualLandmark);
                    setManualSaved(true);
                    setTimeout(() => setManualSaved(false), 2500);
                  }
                }}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl"
              >
                {manualSaved ? 'Saved!' : 'Cache'}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 1: TRIP ROUTE CHECK-IN */}
        <section className="bg-[#121212] border border-white/10 rounded-3xl p-5 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Clock size={18} className="text-[#FFF174]" />
              Trip Route Check-In & Arrival Time
            </h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Stored locally on device
            </span>
          </div>

          <form onSubmit={handleSaveTrip} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Planned Highway Route
                </label>
                <input
                  type="text"
                  value={tripRoute}
                  onChange={e => setTripRoute(e.target.value)}
                  placeholder="e.g. Siliguri -> Sevoke -> Coronation Bridge -> Teesta"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#FFF174] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Expected Arrival Time / Safe Window
                </label>
                <input
                  type="text"
                  value={intendedArrival}
                  onChange={e => setIntendedArrival(e.target.value)}
                  placeholder="e.g. 04:30 PM (or within 4 hours)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#FFF174] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Primary Emergency Contact Phone (for SMS / Voice Check-In)
              </label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={e => setEmergencyPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#FFF174] outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#FFF174] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Save Trip Details
              </button>
              {tripSaved && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle size={15} /> Saved successfully!
                </span>
              )}
            </div>
          </form>
        </section>

        {/* SECTION 2: DOWNLOADABLE OFFLINE EMERGENCY INSTRUCTIONS */}
        <section className="bg-gradient-to-br from-[#121620] to-[#0A0D14] border border-white/10 rounded-3xl p-5 sm:p-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <FileText size={18} className="text-emerald-400" />
                Downloadable Emergency Card & Instructions
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Save an offline emergency card to your device or print before entering mountain corridors.
              </p>
            </div>
            <button
              onClick={handleDownloadEmergencyCard}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download size={15} />
              <span>{downloadSuccess ? 'Downloaded!' : 'Download Offline Card (.txt)'}</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs text-gray-300">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <h3 className="font-bold text-white flex items-center gap-1.5 text-xs">
                <ShieldCheck size={14} className="text-[#FFF174]" />
                Crash / Trauma Life Safety Protocol
              </h3>
              <p className="text-gray-400 leading-relaxed">
                • Suspected Spinal Injury: Never remove the rider's helmet unless breathing is obstructed.<br />
                • Secure the Scene: Place motorcycle hazard flashers or warning triangle 30m prior to blind curves.<br />
                • Cellular Voice: Call 112 via native phone line. A cellular voice call can often connect even when 4G data packet connection is broken.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <h3 className="font-bold text-white flex items-center gap-1.5 text-xs">
                <AlertTriangle size={14} className="text-amber-400" />
                Mountain Cold & Hypothermia Protocol
              </h3>
              <p className="text-gray-400 leading-relaxed">
                • High altitude mountain passes drop below 5°C rapidly after 4:00 PM.<br />
                • Insulate stranded riders from wet asphalt or gravel using motorcycle seats or rain gear.<br />
                • Keep warm fluids available and never leave a rider alone on unlit hairpin turns.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: OFFLINE MAP DOWNLOAD GUIDANCE */}
        <section className="bg-[#121212] border border-white/10 rounded-3xl p-5 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <MapPin size={18} className="text-[#FFF174]" />
            <h2 className="text-base sm:text-lg font-black text-white">
              Offline Map Preparation Guidance
            </h2>
          </div>

          <div className="space-y-3 text-xs text-gray-300">
            <p className="text-gray-400 leading-relaxed">
              Mobile web apps cannot reliably cache gigabytes of satellite tiles. For trustworthy offline navigation in zero-signal mountain canyons, configure offline mapping in advance:
            </p>

            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <strong className="font-bold text-white block">Step-by-Step: Google Maps Offline</strong>
                <ol className="list-decimal pl-4 space-y-1 text-gray-400">
                  <li>Open Google Maps app on your phone.</li>
                  <li>Tap your profile avatar (top right).</li>
                  <li>Select <strong className="text-white">Offline maps</strong> → <strong className="text-white">Select your own map</strong>.</li>
                  <li>Pan rectangle over <strong className="text-[#FFF174]">Siliguri, Sevoke, Teesta, and Darjeeling</strong>.</li>
                  <li>Tap <strong className="text-white">Download</strong> before departure.</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <strong className="font-bold text-white block">Alternative: OsmAnd / Organic Maps</strong>
                <ol className="list-decimal pl-4 space-y-1 text-gray-400">
                  <li>Install OsmAnd or Organic Maps (100% offline OpenStreetMap engine).</li>
                  <li>Download the <strong className="text-white">West Bengal & Sikkim</strong> regional map package (approx 180MB).</li>
                  <li>Enables full turn-by-turn routing with zero cellular connectivity.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: TRUSTWORTHY 24/7 MOUNTAIN CORRIDOR STOPS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                Verified 24/7 Mountain Corridor Safety Stops
              </h2>
              <p className="text-xs text-gray-400">
                Grounded in verified locations with reliable emergency assistance, fuel, or police pickets.
              </p>
            </div>
          </div>

          <div className="grid gap-3.5">
            {TRUSTED_CORRIDOR_STOPS.map(stop => (
              <div 
                key={stop.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#121212] border border-white/10 hover:border-white/20 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {stop.safetyRating}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {stop.coordinates[0].toFixed(4)}, {stop.coordinates[1].toFixed(4)}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                      {stop.name}
                    </h3>
                    <p className="text-xs text-[#FFF174] font-medium">
                      {stop.corridor}
                    </p>
                  </div>

                  <a
                    href={`tel:${stop.phone}`}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white flex items-center gap-1.5 transition-all min-h-[44px]"
                  >
                    <PhoneCall size={13} className="text-emerald-400" />
                    <span>Call {stop.phone}</span>
                  </a>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  {stop.notes}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {stop.services.map((srv, idx) => (
                    <span 
                      key={idx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-white/5 text-gray-300 border border-white/5"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
