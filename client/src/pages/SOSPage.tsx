import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, MapPin, X, PhoneCall, Zap, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

type SOSStatus = 'IDLE' | 'HOLDING' | 'ACTIVATING' | 'ACTIVE' | 'ERROR';

interface SOSIncident {
  incidentId: string;
  status: string;
  notificationStatus: string;
  contactsNotified?: boolean;
  serverReceived?: boolean;
  gpsAcquired?: boolean;
  location?: {
    coordinates: number[];
  };
}

export function SOSPage() {
  const [status, setStatus] = useState<SOSStatus>('IDLE');
  const [holdProgress, setHoldProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [incident, setIncident] = useState<SOSIncident | null>(null);
  
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
        gpsAcquired = true;
      } else {
        throw new Error('Geolocation not supported');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('Geolocation unavailable during SOS:', message);
      gpsAcquired = false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng })
      });
      
      const data = await response.json();
      if (data.success) {
        setIncident({
          ...data.data,
          serverReceived: true,
          gpsAcquired
        });
        setStatus('ACTIVE');
        return;
      }
    } catch {
      // Local offline fallback
    }

    // High-priority local emergency activation fallback (truthful without fake coordinates)
    const fallbackIncident: SOSIncident = {
      incidentId: `SOS-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'ACTIVE',
      notificationStatus: 'Offline Local Emergency Stored',
      contactsNotified: false,
      serverReceived: false,
      gpsAcquired,
      location: lat && lng ? {
        coordinates: [lng, lat]
      } : undefined
    };
    setIncident(fallbackIncident);
    setStatus('ACTIVE');
  };

  const cancelSOS = async () => {
    if (!incident) return;
    
    const confirm = window.confirm("Are you sure you want to cancel the SOS? Emergency services may already be en route.");
    if (!confirm) return;

    try {
      await fetch(`${API_BASE_URL}/api/sos/${incident.incidentId}/cancel`, {
        method: 'PUT'
      });
    } catch {
      // Cancelled locally
    }
    setStatus('IDLE');
    setIncident(null);
    setHoldProgress(0);
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col font-sans relative overflow-hidden pt-20">
      {/* Background Effect */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${status === 'ACTIVE' ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-[#EF4444]/10 animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#090909_80%)]"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 flex-1 flex flex-col max-w-2xl">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center justify-center gap-3">
            <AlertTriangle className={status === 'ACTIVE' ? 'text-[#EF4444] animate-bounce' : 'text-[#FFF174]'} size={36} />
            EMERGENCY SOS
          </h1>
          <p className="text-gray-400">
            {status === 'ACTIVE' ? 'Help is being coordinated.' : 'For severe accidents, medical emergencies, or threats to safety.'}
          </p>
        </div>

        {/* ERROR STATE */}
        {status === 'ERROR' && (
          <div className="bg-[#EF4444]/20 border border-[#EF4444] rounded-xl p-6 mb-8 text-center animate-shake">
            <h3 className="text-xl font-bold text-[#EF4444] mb-2">SOS Activation Failed</h3>
            <p className="text-white mb-4">{errorMsg}</p>
            <button 
              onClick={() => setStatus('IDLE')}
              className="px-6 py-2 bg-[#EF4444] text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {/* MAIN SOS INTERFACE */}
        {['IDLE', 'HOLDING', 'ACTIVATING'].includes(status) && (
          <div className="flex-1 flex flex-col items-center justify-center">
            
            <div className="relative mb-12">
              {/* Progress Ring */}
              <svg className="w-64 h-64 transform -rotate-90">
                <circle 
                  cx="128" cy="128" r="120" 
                  stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" 
                />
                <circle 
                  cx="128" cy="128" r="120" 
                  stroke={status === 'ACTIVATING' ? '#EF4444' : '#FFF174'} 
                  strokeWidth="8" fill="none"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={2 * Math.PI * 120 * (1 - holdProgress / 100)}
                  className="transition-all duration-75 ease-linear"
                />
              </svg>

              {/* The Button */}
              <button
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onContextMenu={(e) => e.preventDefault()} // Prevent context menu on long press
                className={`absolute inset-4 rounded-full flex flex-col items-center justify-center touch-none select-none transition-all duration-300 shadow-2xl
                  ${status === 'HOLDING' ? 'bg-[#FFF174] scale-95 shadow-[#FFF174]/50' : ''}
                  ${status === 'ACTIVATING' ? 'bg-[#EF4444] text-white animate-pulse' : ''}
                  ${status === 'IDLE' ? 'bg-[#111111] border-2 border-gray-700 hover:border-[#FFF174]/50 hover:bg-gray-800' : ''}
                `}
              >
                {status === 'ACTIVATING' ? (
                  <span className="text-2xl font-black text-white">ACTIVATING...</span>
                ) : (
                  <>
                    <span className={`text-2xl font-black mb-1 ${status === 'HOLDING' ? 'text-black' : 'text-[#EF4444]'}`}>
                      SOS
                    </span>
                    <span className={`text-sm font-bold tracking-widest ${status === 'HOLDING' ? 'text-black/70' : 'text-gray-400'}`}>
                      HOLD 3 SEC
                    </span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center space-y-4 text-sm text-gray-500 max-w-sm">
              <p>Holding this button will instantly share your GPS location with emergency contacts and nearby providers.</p>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 text-left">
                <Shield className="text-[#FFF174] shrink-0" size={20} />
                <p>False alarms can be cancelled within 10 seconds. Abuse of the SOS system may lead to account suspension.</p>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE SOS STATE */}
        {status === 'ACTIVE' && incident && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <div className="bg-[#111111] border border-[#EF4444]/50 rounded-2xl p-6 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#EF4444] animate-pulse"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[#EF4444] mb-1">SOS ACTIVE</h2>
                  <p className="text-gray-400 font-mono text-sm">Incident #{incident.incidentId}</p>
                </div>
                <div className="px-3 py-1 bg-[#EF4444]/20 text-[#EF4444] font-bold rounded text-sm animate-pulse">
                  BROADCASTING
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {/* Status 1: SOS Created */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300">1. SOS Incident</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Created (#{incident.incidentId})
                  </span>
                </div>

                {/* Status 2: GPS Status */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300">2. GPS Acquisition</span>
                  {incident.gpsAcquired ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Coordinates Locked
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertCircle size={14} /> Unavailable (No GPS)
                    </span>
                  )}
                </div>

                {/* Status 3: Server Received */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300">3. Backend Dispatch</span>
                  {incident.serverReceived !== false ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Server Confirmed
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertCircle size={14} /> Local Device Stored
                    </span>
                  )}
                </div>

                {/* Status 4: Contacts Notification */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300">4. Emergency Contacts</span>
                  {incident.contactsNotified ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Notified via SMS
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertCircle size={14} /> Gateway Pending (Call Direct)
                    </span>
                  )}
                </div>
              </div>

              {!incident.contactsNotified && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mb-6 flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle size={18} className="shrink-0 text-amber-400 mt-0.5" />
                  <p>
                    <strong>Safety Notice:</strong> Automated SMS gateway requires live credentials. Please place a direct phone call to 112 or your emergency contacts below immediately.
                  </p>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="space-y-3">
                <a href="tel:112" className="w-full flex items-center justify-center gap-2 p-4 bg-[#EF4444] text-white font-black rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-900/30">
                  <PhoneCall size={20} />
                  CALL NATIONAL EMERGENCY (112)
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <a href="tel:108" className="flex items-center justify-center gap-2 p-3 bg-white/10 text-white font-bold text-xs rounded-xl hover:bg-white/20 transition-colors border border-white/10">
                    <PhoneCall size={16} className="text-rose-400" /> CALL AMBULANCE (108)
                  </a>
                  <a href="tel:100" className="flex items-center justify-center gap-2 p-3 bg-white/10 text-white font-bold text-xs rounded-xl hover:bg-white/20 transition-colors border border-white/10">
                    <PhoneCall size={16} className="text-blue-400" /> CALL POLICE (100)
                  </a>
                </div>
                
                <button 
                  onClick={() => navigate('/request-help')}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/10"
                >
                  <Zap size={20} />
                  REQUEST ROAD ASSISTANCE
                </button>
                
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'MotoAssist Emergency SOS',
                        text: `I have an emergency! Incident: ${incident.incidentId}. Location: ${incident.location ? 'Attached' : 'Unknown'}`,
                        url: window.location.href,
                      }).catch(console.error);
                    } else {
                      alert('Sharing is not supported on this browser.');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-white/5 text-gray-300 font-bold rounded-xl hover:bg-white/10 transition-colors"
                >
                  <MapPin size={20} />
                  SHARE LOCATION
                </button>
              </div>
            </div>

            <button 
              onClick={cancelSOS}
              className="mt-auto mx-auto flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-bold text-sm"
            >
              <X size={16} />
              CANCEL SOS INCIDENT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
