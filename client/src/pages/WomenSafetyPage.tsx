import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  PhoneCall, 
  Users, 
  Clock, 
  Eye, 
  EyeOff, 
  Building2, 
  Navigation,
  ArrowLeft,
  VolumeX
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchFamilyCircle } from '../services/ecosystemApi';
import type { FamilyMember } from '../types/app';
import { API_BASE_URL } from '../config/api';

export function WomenSafetyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [sharingActive, setSharingActive] = useState(false);
  const [silentSOSActive, setSilentSOSActive] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchFamilyCircle().then(members => setFamilyMembers(members));

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const triggerSilentSOS = async () => {
    if (!window.confirm('Trigger Silent SOS? An emergency incident will be dispatched immediately without playing sound.')) {
      return;
    }

    setSilentSOSActive(true);
    try {
      await fetch(`${API_BASE_URL}/api/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: currentCoords?.lat,
          longitude: currentCoords?.lng,
          userId: user?.id
        })
      });
      alert('Silent SOS broadcasted. Emergency contacts and police coordinate alerted.');
    } catch {
      alert('Failed to transmit silent alert. Please dial 112 directly.');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-20 pb-24 font-sans selection:bg-purple-500 selection:text-white">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            <ShieldAlert size={14} /> Enhanced Shield Mode
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black">WOMEN RIDER SAFETY</h1>
          <p className="text-gray-400 text-xs mt-1">
            Proactive security, discreet emergency alarms, route monitoring, and vetted safe havens across highway corridors.
          </p>
        </div>

        {/* Priority Emergency Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Silent SOS Button */}
          <button
            type="button"
            onClick={triggerSilentSOS}
            className={`p-5 rounded-3xl border text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between ${
              silentSOSActive 
                ? 'bg-red-950/60 border-red-500 text-red-200' 
                : 'bg-gradient-to-br from-red-600/30 to-purple-900/30 border-red-500/40 hover:border-red-400'
            }`}
            style={{ minHeight: '140px' }}
          >
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg">
              <VolumeX size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">NO ALARM SOUND</span>
              <strong className="text-base font-black text-white block mt-0.5">SILENT SOS</strong>
              <span className="text-[11px] text-gray-300 block">Instant stealth broadcast</span>
            </div>
          </button>

          {/* National Women Helpline 1091 / 112 */}
          <a
            href="tel:1091"
            className="p-5 rounded-3xl bg-gradient-to-br from-purple-900/30 to-[#182030] border border-purple-500/40 hover:border-purple-400 text-left transition-all active:scale-95 flex flex-col justify-between"
            style={{ minHeight: '140px' }}
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg">
              <PhoneCall size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block">NATIONAL HELPLINE</span>
              <strong className="text-base font-black text-white block mt-0.5">1091 CALL</strong>
              <span className="text-[11px] text-gray-300 block">Women Police Emergency</span>
            </div>
          </a>
        </div>

        {/* Live Location Sharing Control (Section 5) */}
        <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {sharingActive ? <Eye size={18} className="text-emerald-400" /> : <EyeOff size={18} className="text-gray-400" />}
              <h2 className="text-xs font-black uppercase tracking-wider text-white">Live Route & Location Sharing</h2>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              sharingActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-gray-400'
            }`}>
              {sharingActive ? 'BROADCASTING ACTIVE' : 'SHARING OFF'}
            </span>
          </div>

          <p className="text-xs text-gray-400">
            You hold total control over location sharing. Coordinates are never tracked invisibly or shared without your active authorization.
          </p>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setSharingActive(!sharingActive)}
              className={`px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                sharingActive 
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
              }`}
            >
              {sharingActive ? (
                <>
                  <EyeOff size={16} /> Stop Location Sharing
                </>
              ) : (
                <>
                  <Navigation size={16} /> Share Live Location with Family
                </>
              )}
            </button>
          </div>
        </div>

        {/* Safety Tools Grid */}
        <div className="space-y-3 mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
            PROACTIVE SAFETY PROTOCOLS
          </h2>

          {/* Safety Timer Link */}
          <div 
            onClick={() => navigate('/safe-ride')}
            className="p-4 rounded-2xl bg-[#111622] border border-white/10 hover:border-[#FFF174]/40 flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FFF174]/20 text-[#FFF174]">
                <Clock size={20} />
              </div>
              <div>
                <strong className="text-sm font-bold text-white block">Safety Arrival Timer</strong>
                <span className="text-xs text-gray-400">Prompt: "Are you safe?" if trip extends past deadline</span>
              </div>
            </div>
            <span className="text-xs text-[#FFF174] font-bold">Configure →</span>
          </div>

          {/* Safe Waiting Havens */}
          <div 
            onClick={() => navigate('/emergency-services')}
            className="p-4 rounded-2xl bg-[#111622] border border-white/10 hover:border-blue-400/40 flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                <Building2 size={20} />
              </div>
              <div>
                <strong className="text-sm font-bold text-white block">Nearby Safe Waiting Havens</strong>
                <span className="text-xs text-gray-400">Well-lit 24/7 petrol pumps, dhabas & police outposts</span>
              </div>
            </div>
            <span className="text-xs text-blue-400 font-bold">Locate →</span>
          </div>

          {/* Family Safety Circle */}
          <div 
            onClick={() => navigate('/safety-circle')}
            className="p-4 rounded-2xl bg-[#111622] border border-white/10 hover:border-purple-400/40 flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <Users size={20} />
              </div>
              <div>
                <strong className="text-sm font-bold text-white block">Trusted Family Circle ({familyMembers.length} active)</strong>
                <span className="text-xs text-gray-400">Parents, partner, siblings connected to emergency alerts</span>
              </div>
            </div>
            <span className="text-xs text-purple-400 font-bold">Manage →</span>
          </div>
        </div>

      </div>
    </div>
  );
}
