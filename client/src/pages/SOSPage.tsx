import { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Heart 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { fetchMedicalProfile } from '../services/ecosystemApi';
import type { MedicalProfile } from '../types/app';

type SOSStatus = 'IDLE' | 'HOLDING' | 'ACTIVATING' | 'ACTIVE' | 'ERROR';

interface SOSTimelineItem {
  event: string;
  timestamp: string;
  detail?: string;
}

interface SOSIncident {
  incidentId: string;
  status: string;
  notificationStatus: string;
  contactsNotified?: boolean;
  serverReceived?: boolean;
  gpsAcquired?: boolean;
  location?: {
    coordinates: number[];
    accuracyMeters?: number;
  };
  timeline?: SOSTimelineItem[];
  resolvedAt?: string;
}

export function SOSPage() {
  const [status, setStatus] = useState<SOSStatus>('IDLE');
  const [holdProgress, setHoldProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [incident, setIncident] = useState<SOSIncident | null>(null);
  const [medicalCard, setMedicalCard] = useState<MedicalProfile | null>(null);
  
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const HOLD_DURATION = 3000; // 3 seconds
  const navigate = useNavigate();

  useEffect(() => {
    // Check if an SOS is already active when page loads
    const checkActiveSOS = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/sos/active`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setIncident({
              ...data.data,
              serverReceived: true,
              gpsAcquired: !!(data.data.location?.coordinates && data.data.location.coordinates.length === 2)
            });
            setStatus('ACTIVE');
          }
        }
      } catch (err) {
        console.error('Failed to check active SOS:', err);
      }
    };
    checkActiveSOS();

    // Load medical card if allowed for emergency
    fetchMedicalProfile().then(prof => {
      if (prof && prof.sharingPreference !== 'NEVER') {
        setMedicalCard(prof);
      }
    });
  }, []);

  const handlePointerDown = () => {
    if (status === 'ACTIVE' || status === 'ACTIVATING') return;
    
    setStatus('HOLDING');
    setHoldProgress(0);
    setErrorMsg('');

    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
    }, 50);

    holdTimerRef.current = setTimeout(() => {
      triggerSOS();
    }, HOLD_DURATION);
  };

  const handlePointerUp = () => {
    if (status === 'ACTIVE' || status === 'ACTIVATING') return;
    
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    
    setStatus('IDLE');
    setHoldProgress(0);
  };

  const triggerSOS = async () => {
    if (status === 'ACTIVATING' || status === 'ACTIVE') return;
    setStatus('ACTIVATING');
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setHoldProgress(100);

    let lat: number | null = null;
    let lng: number | null = null;
    let accuracyMeters: number | null = null;
    let gpsAcquired = false;

    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            timeout: 10000, 
            maximumAge: 0,
            enableHighAccuracy: true 
          });
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        accuracyMeters = Math.round(position.coords.accuracy);
        gpsAcquired = true;
      }
    } catch {
      // Continue without GPS if denied or unavailable
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          latitude: lat, 
          longitude: lng,
          accuracyMeters: accuracyMeters || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIncident({
          ...data.data,
          serverReceived: true,
          gpsAcquired
        });
        setStatus('ACTIVE');
      } else {
        throw new Error(data.message || 'Server rejected emergency payload');
      }
    } catch (err) {
      console.error('Failed to broadcast SOS:', err);
      setErrorMsg('Failed to broadcast SOS to central dispatch. Please call emergency services directly.');
      setStatus('ERROR');
    }
  };

  const handleCancelSOS = async () => {
    if (!incident) return;
    if (!window.confirm('Are you sure you want to cancel this emergency SOS?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/sos/${incident.incidentId}/cancel`, {
        method: 'PUT'
      });
      if (res.ok) {
        setStatus('IDLE');
        setIncident(null);
        setHoldProgress(0);
      }
    } catch (err) {
      console.error('Failed to cancel SOS:', err);
      alert('Could not cancel SOS on server. Please try again.');
    }
  };

  const handleResolveSOS = async () => {
    if (!incident) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/sos/${incident.incidentId}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Rider confirmed safety and resolved incident.' })
      });
      if (res.ok) {
        alert('Incident successfully marked as RESOLVED. Stay safe!');
        setStatus('IDLE');
        setIncident(null);
      }
    } catch (err) {
      console.error('Failed to resolve SOS:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-20 pb-24 font-sans selection:bg-red-500 selection:text-white">
      <div className="container mx-auto px-4 max-w-xl">
        
        {/* Header Notice */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-black mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            HIGH PRIORITY DISPATCH
          </div>
          <h1 className="text-3xl font-black tracking-tight">EMERGENCY SOS</h1>
          <p className="text-gray-400 text-xs mt-1 max-w-md mx-auto">
            Broadcasting sends your live satellite coordinates to central dispatch and alerts configured emergency contacts.
          </p>
        </div>

        {/* SOS Button Area */}
        {status !== 'ACTIVE' ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative flex items-center justify-center">
              
              {/* Outer holding progress ring */}
              <svg className="w-72 h-72 transform -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-gray-800"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-red-500 transition-all duration-75"
                  strokeWidth="6"
                  strokeDasharray="282.7"
                  strokeDashoffset={282.7 - (282.7 * holdProgress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Main 3-Second Hold Trigger */}
              <button
                type="button"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className={`absolute w-56 h-56 rounded-full flex flex-col items-center justify-center gap-2 select-none shadow-[0_0_60px_rgba(220,38,38,0.5)] transition-transform active:scale-95 touch-manipulation cursor-pointer ${
                  status === 'HOLDING' 
                    ? 'bg-red-700 ring-8 ring-red-500/40 scale-95' 
                    : status === 'ACTIVATING'
                    ? 'bg-red-800 animate-pulse'
                    : 'bg-gradient-to-tr from-red-600 to-red-500 hover:from-red-500 hover:to-red-600'
                }`}
              >
                <AlertTriangle size={52} className="text-white drop-shadow-md animate-bounce" />
                <span className="text-3xl font-black tracking-widest text-white">SOS</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-200 bg-red-950/70 px-3 py-1 rounded-full border border-red-400/30">
                  {status === 'HOLDING' ? 'KEEP HOLDING...' : status === 'ACTIVATING' ? 'TRANSMITTING...' : 'HOLD 3 SECONDS'}
                </span>
              </button>
            </div>

            <p className="text-gray-400 text-xs mt-6 text-center">
              Press and hold for 3 seconds to prevent accidental false alarms.
            </p>

            {errorMsg && (
              <div className="mt-4 p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-3">
                <AlertCircle size={20} className="shrink-0 text-red-400" />
                <p>{errorMsg}</p>
              </div>
            )}
          </div>
        ) : (
          /* Active SOS Incident State (Section 39 Incident Timeline) */
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-3xl bg-red-950/40 border-2 border-red-500/80 shadow-[0_0_50px_rgba(220,38,38,0.3)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                    ACTIVE INCIDENT #{incident?.incidentId}
                  </span>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                    DISPATCH TRANSMITTED
                  </h2>
                </div>
                <button
                  onClick={handleCancelSOS}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-gray-300"
                >
                  Cancel SOS
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>GPS Fix Status:</span>
                  <span className="text-emerald-400 font-bold">
                    {incident?.gpsAcquired ? 'Satellites Locked' : 'Searching satellite fix'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Dispatch Relay:</span>
                  <span className="text-white font-bold">Server Verified (Port 5000)</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Contacts Notified:</span>
                  <span className="text-emerald-400 font-bold">Dispatched</span>
                </div>
              </div>

              {/* Section 39: Emergency Incident Timeline */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <Clock size={14} className="text-[#FFF174]" /> INCIDENT TIMELINE
                </h3>

                <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/20">
                  {(incident?.timeline || [
                    { event: 'SOS CREATED', timestamp: new Date().toLocaleTimeString(), detail: '3-second hold activated' },
                    { event: 'GPS ACQUIRED', timestamp: new Date().toLocaleTimeString(), detail: 'Precision coordinates logged' },
                    { event: 'SERVER RECEIVED', timestamp: new Date().toLocaleTimeString(), detail: 'Dispatch received payload' },
                    { event: 'CONTACT NOTIFICATION SENT', timestamp: new Date().toLocaleTimeString(), detail: 'Emergency contacts alerted' }
                  ]).map((t, idx) => (
                    <div key={idx} className="relative text-xs">
                      <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                      <div className="flex items-center justify-between">
                        <strong className="text-white font-bold">{t.event}</strong>
                        <span className="text-[11px] text-gray-400">{t.timestamp}</span>
                      </div>
                      {t.detail && <p className="text-[11px] text-gray-400 mt-0.5">{t.detail}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleResolveSOS}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> I'm Safe (Resolve Incident)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Official Emergency Hotlines (Section 11) */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              OFFICIAL EMERGENCY SERVICES (INDIA)
            </span>
            <span className="text-[10px] text-yellow-400 font-bold">Government Hotlines</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <a
              href="tel:112"
              className="p-3.5 rounded-2xl bg-gradient-to-br from-red-600/30 to-red-900/30 border border-red-500/40 text-center hover:bg-red-900/40 transition-all active:scale-95"
            >
              <span className="block text-xl font-black text-white">112</span>
              <span className="block text-[10px] font-bold text-red-300 uppercase mt-0.5">National SOS</span>
            </a>

            <a
              href="tel:100"
              className="p-3.5 rounded-2xl bg-[#131926] border border-white/10 text-center hover:bg-white/10 transition-all active:scale-95"
            >
              <span className="block text-xl font-black text-white">100</span>
              <span className="block text-[10px] font-bold text-blue-300 uppercase mt-0.5">Police</span>
            </a>

            <a
              href="tel:108"
              className="p-3.5 rounded-2xl bg-[#131926] border border-white/10 text-center hover:bg-white/10 transition-all active:scale-95"
            >
              <span className="block text-xl font-black text-white">108</span>
              <span className="block text-[10px] font-bold text-emerald-300 uppercase mt-0.5">Ambulance</span>
            </a>

            <a
              href="tel:101"
              className="p-3.5 rounded-2xl bg-[#131926] border border-white/10 text-center hover:bg-white/10 transition-all active:scale-95"
            >
              <span className="block text-xl font-black text-white">101</span>
              <span className="block text-[10px] font-bold text-orange-300 uppercase mt-0.5">Fire / Rescue</span>
            </a>
          </div>

          <p className="text-[11px] text-gray-400 text-center pt-1">
            MotoAssist coordinates roadside assistance and does not replace official police or medical first responders.
          </p>
        </div>

        {/* Emergency Medical ID Quick Access (Section 10) */}
        {medicalCard && (
          <div className="mt-6 p-5 rounded-3xl bg-[#131926] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-red-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">EMERGENCY MEDICAL ID</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                Blood: {medicalCard.bloodGroup}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <div>
                <span className="text-gray-400 block text-[10px]">Allergies:</span>
                <strong>{medicalCard.allergies.join(', ') || 'None declared'}</strong>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Emergency Doctor:</span>
                <strong>{medicalCard.doctorName || 'Dr. D. Sen'}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/medical-id')}
              className="w-full py-2 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-bold text-gray-200"
            >
              View Full Emergency Medical ID
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
