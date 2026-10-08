import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Navigation, 
  ShieldAlert, 
  Zap, 
  Wrench, 
  Radio, 
  AlertTriangle,
  User, 
  MapPin, 
  RefreshCw,
  Search,
  Bike,
  Shield,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRequests } from '../utils/appStorage';
import type { HelpRequest } from '../types/app';
import { useUserLocation } from '../hooks/useUserLocation';
import { ActiveIncidentHUD } from '../components/ActiveIncidentHUD';
import { FeelingUnsafeModal } from '../components/FeelingUnsafeModal';
import { MedicalIdQuickModal } from '../components/MedicalIdQuickModal';

export function ResponsiveHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeRequest, setActiveRequest] = useState<HelpRequest | undefined>();
  const [showUnsafeModal, setShowUnsafeModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Real Geolocation hook without silent fallbacks
  const {
    accuracy,
    status: locStatus,
    errorReason,
    updatedText,
    requestLocation,
    setSearchLocation,
    address,
  } = useUserLocation(true);

  useEffect(() => {
    // Check if user has active help requests
    if (user) {
      const all = getRequests();
      const userReq = all.find(
        (r) =>
          r.riderId === user.id &&
          (r.status === 'OPEN' || r.status === 'HELPER_OFFERED' || r.status === 'IN_PROGRESS')
      );
      setActiveRequest(userReq);
    }
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 2) {
      setSearchLocation(searchQuery.trim());
      setShowLocationSearch(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col font-sans relative selection:bg-[#FFF174] selection:text-black pb-24 md:pb-16">
      
      {/* Feeling Unsafe Modal Flow */}
      <FeelingUnsafeModal
        isOpen={showUnsafeModal}
        onClose={() => setShowUnsafeModal(false)}
        primaryContactPhone="+91 98765 43210"
        primaryContactName="Mom / Trusted Circle"
      />

      {/* Quick Medical ID Modal */}
      <MedicalIdQuickModal
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
      />

      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 bg-[#090909]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 select-none group">
            <span className="w-8 h-8 rounded-xl bg-[#FFF174] text-black flex items-center justify-center font-black group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,241,116,0.3)]">
              <Navigation size={18} />
            </span>
            <span className="font-black text-lg tracking-tight text-white uppercase">
              MOTO<span className="text-[#FFF174]">ASSIST</span>
            </span>
          </Link>

          {/* User Profile Avatar / Login */}
          <div className="flex items-center gap-2">
            {user ? (
              <Link
                to={user.role === 'HELPER' ? '/helper/dashboard' : '/rider/profile'}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-gray-200 transition-colors"
                title="Your Profile"
              >
                <User size={16} />
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-gray-200 border border-white/10 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-5 space-y-5">
        
        {/* ACTIVE INCIDENT HUD (if active request exists, it is the FIRST thing visible!) */}
        {activeRequest ? (
          <ActiveIncidentHUD
            requestId={activeRequest.id}
            issueCategory={activeRequest.issue.replaceAll('_', ' ')}
            status={activeRequest.status === 'HELPER_OFFERED' ? 'ACCEPTED' : 'EN_ROUTE'}
            distance="2.8 km"
            eta="11 min"
            providerName="Raj Motors & Towing"
            providerPhone="+91 98320 12345"
            onCancel={() => setActiveRequest(undefined)}
          />
        ) : (
          /* GREEN "YOU'RE SAFE" STATUS BADGE */
          <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-xs sm:text-sm text-emerald-300">
                🟢 You're safe
              </span>
            </div>
            <span className="text-[11px] text-gray-400 hidden sm:inline">
              Emergency dispatch on standby
            </span>
          </div>
        )}

        {/* LOCATION STATUS BAR (Section 6) */}
        <section
          className="p-3.5 rounded-2xl bg-[#121212] border border-white/10 text-xs text-gray-300 flex flex-wrap items-center justify-between gap-2.5"
          aria-label="Location status"
        >
          <div className="flex items-center gap-2">
            <MapPin size={16} className={locStatus === 'active' || locStatus === 'searched' ? 'text-emerald-400' : 'text-amber-400'} />
            {locStatus === 'active' ? (
              <span className="font-semibold text-white">
                📍 Location Active
                {accuracy ? ` • Accuracy: ±${accuracy}m` : ''}
                {updatedText ? ` • Updated: ${updatedText}` : ''}
              </span>
            ) : locStatus === 'searched' ? (
              <span className="font-semibold text-white">
                📍 Location: {address || 'Custom Landmark'}
              </span>
            ) : locStatus === 'denied' ? (
              <span className="text-amber-300 font-semibold">
                Location access is turned off.
              </span>
            ) : (
              <span className="text-gray-400 font-medium">
                {errorReason || 'Acquiring your location...'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {locStatus !== 'active' && (
              <button
                type="button"
                onClick={() => requestLocation()}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-bold text-[#FFF174] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>Enable Location</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowLocationSearch(!showLocationSearch)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-gray-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Search size={12} />
              <span>Search Location</span>
            </button>
          </div>
        </section>

        {/* INLINE LOCATION SEARCH BAR IF TOGGLED */}
        {showLocationSearch && (
          <form onSubmit={handleSearchSubmit} className="flex gap-2 animate-in fade-in duration-150">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search place, town or highway landmark..."
              className="flex-1 bg-[#161616] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFF174]"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#FFF174] text-black font-bold text-xs rounded-xl hover:bg-yellow-400 cursor-pointer"
            >
              Set Place
            </button>
          </form>
        )}

        {/* "WHAT DO YOU NEED?" HEADLINE */}
        <div className="pt-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            What do you need?
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Tap a primary action for instant response.
          </p>
        </div>

        {/* PRIMARY ACTIONS GRID (Section 3 Requirement) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1" aria-label="Primary Emergency and Assistance Actions">
          
          {/* 1. 🚨 SOS */}
          <button
            type="button"
            onClick={() => navigate('/sos')}
            className="w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-[0.98] text-white font-black text-left flex items-center justify-between shadow-[0_0_30px_rgba(220,38,38,0.45)] border border-red-400/50 transition-all cursor-pointer group min-h-[82px]"
            aria-label="🚨 SOS - Immediate emergency dispatch"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldAlert size={26} className="text-white" />
              </div>
              <div>
                <span className="block text-lg sm:text-xl font-black tracking-wide">
                  🚨 SOS
                </span>
                <span className="block text-[11px] text-red-200 font-medium">
                  Hold 3s • Ambulance, 112 & Medical ID
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-white/80 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 2. 🆘 I'M STRANDED */}
          <button
            type="button"
            onClick={() => navigate('/im-stranded')}
            className="w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#FFF174] to-[#FCEB50] hover:from-[#FFF69B] hover:to-[#FFF174] active:scale-[0.98] text-black font-black text-left flex items-center justify-between shadow-[0_0_25px_rgba(255,241,116,0.3)] transition-all cursor-pointer group min-h-[82px]"
            aria-label="🆘 I'm Stranded - Fast breakdown triage"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-black/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Zap size={26} className="text-black" />
              </div>
              <div>
                <span className="block text-lg sm:text-xl font-black tracking-wide">
                  🆘 I'm Stranded
                </span>
                <span className="block text-[11px] text-gray-800 font-semibold">
                  Puncture, battery, fuel or towing
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-black/80 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 3. ⚠️ FEELING UNSAFE */}
          <button
            type="button"
            onClick={() => setShowUnsafeModal(true)}
            className="w-full p-4 sm:p-5 rounded-3xl bg-[#1A1212] hover:bg-[#241717] active:scale-[0.98] text-white font-black text-left flex items-center justify-between border-2 border-amber-500/50 shadow-md transition-all cursor-pointer group min-h-[82px]"
            aria-label="⚠️ Feeling Unsafe - Alert family, 112 and find safe place"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-amber-500/30">
                <AlertTriangle size={24} />
              </div>
              <div>
                <span className="block text-base sm:text-lg font-black text-amber-300">
                  ⚠️ Feeling Unsafe
                </span>
                <span className="block text-[11px] text-gray-400 font-medium">
                  Alert family • Share location • Call 112
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 4. 🔧 FIND HELP */}
          <button
            type="button"
            onClick={() => navigate('/nearby-services')}
            className="w-full p-4 sm:p-5 rounded-3xl bg-[#121212] hover:bg-[#181818] active:scale-[0.98] text-white font-black text-left flex items-center justify-between border border-white/10 shadow-md transition-all cursor-pointer group min-h-[82px]"
            aria-label="🔧 Find Help - Browse nearby mechanics and workshops"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-[#FFF174] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Wrench size={24} />
              </div>
              <div>
                <span className="block text-base sm:text-lg font-black text-white">
                  🔧 Find Help
                </span>
                <span className="block text-[11px] text-gray-400 font-medium">
                  Verified mechanics, OEM centers & towing
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 5. 🏍️ START SAFE RIDE (Span full on desktop) */}
          <button
            type="button"
            onClick={() => navigate('/safe-ride')}
            className="sm:col-span-2 w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#141A14] to-[#111611] hover:from-[#1A241A] hover:to-[#141C14] active:scale-[0.98] text-white font-black text-left flex items-center justify-between border border-emerald-500/30 shadow-md transition-all cursor-pointer group min-h-[78px]"
            aria-label="🏍️ Start Safe Ride - Route telemetry, ETA and family share"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-emerald-500/30">
                <Radio size={24} />
              </div>
              <div>
                <span className="block text-base sm:text-lg font-black text-emerald-300">
                  🏍️ Start Safe Ride
                </span>
                <span className="block text-[11px] text-gray-400 font-medium">
                  Share live route with family • Safety timer • ETA monitor
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </section>

        {/* CONTEXTUAL SECONDARY HUB (Compact 2-card row: Garage & Medical ID) */}
        <section className="pt-2 grid grid-cols-2 gap-3 text-xs" aria-label="Contextual Shortcuts">
          <Link
            to="/save-my-bike"
            className="p-3.5 rounded-2xl bg-[#121212] border border-white/10 hover:border-white/20 flex items-center gap-2.5 transition-colors group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#FFF174] shrink-0">
              <Bike size={18} />
            </div>
            <div className="overflow-hidden">
              <strong className="block text-gray-200 group-hover:text-white truncate">My Garage</strong>
              <span className="text-[10px] text-gray-400 truncate block">Bikes, towing & tools</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setShowMedicalModal(true)}
            className="p-3.5 rounded-2xl bg-[#121212] border border-white/10 hover:border-red-500/30 flex items-center gap-2.5 transition-colors text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
              <Shield size={18} />
            </div>
            <div className="overflow-hidden">
              <strong className="block text-gray-200 group-hover:text-red-300 truncate">Medical ID</strong>
              <span className="text-[10px] text-gray-400 truncate block">Emergency health data</span>
            </div>
          </button>
        </section>

      </main>
    </div>
  );
}
