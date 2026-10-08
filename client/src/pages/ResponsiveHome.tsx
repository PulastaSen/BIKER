import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Navigation, 
  ShieldAlert, 
  Zap, 
  Wrench, 
  Truck, 
  Fuel, 
  BatteryCharging, 
  Heart, 
  Building2, 
  Users, 
  Shield, 
  Bike, 
  Clock, 
  ChevronRight, 
  User, 
  CheckCircle2, 
  Radio, 
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRequests, getBikes } from '../utils/appStorage';
import type { HelpRequest, Bike as BikeType } from '../types/app';
import { MountainBackground, RoadPattern, StatusIndicator } from '../components/graphics';
import { OnboardingFlow } from '../components/OnboardingFlow';

export function ResponsiveHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeRequest, setActiveRequest] = useState<HelpRequest | undefined>();
  const [primaryBike, setPrimaryBike] = useState<BikeType | undefined>();
  const [gpsReady, setGpsReady] = useState(false);

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

      const userBikes = getBikes(user.id);
      if (userBikes.length > 0) {
        setPrimaryBike(userBikes.find((b) => b.isPrimary) || userBikes[0]);
      }
    }

    // Passive GPS check for status indicator
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setGpsReady(true),
        () => setGpsReady(false),
        { timeout: 5000, maximumAge: 60000 }
      );
    }
  }, [user]);

  const quickActions = [
    {
      title: 'Mechanic',
      sub: 'Verified repair',
      icon: Wrench,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10 border-amber-400/20',
      path: '/nearby-services?type=Mechanic',
    },
    {
      title: 'Towing',
      sub: 'Flatbed recovery',
      icon: Truck,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10 border-blue-400/20',
      path: '/save-my-bike',
    },
    {
      title: 'Fuel Delivery',
      sub: 'Emergency 3L/5L',
      icon: Fuel,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10 border-emerald-400/20',
      path: '/nearby-services?type=Fuel',
    },
    {
      title: 'Battery Jump',
      sub: 'Start or swap',
      icon: BatteryCharging,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10 border-yellow-400/20',
      path: '/nearby-services?type=Battery',
    },
    {
      title: 'Ambulance',
      sub: 'Emergency 108',
      icon: Heart,
      color: 'text-red-400',
      bg: 'bg-red-400/10 border-red-400/20',
      path: '/emergency-services',
    },
    {
      title: 'Hospitals',
      sub: 'Trauma care',
      icon: Building2,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10 border-purple-400/20',
      path: '/emergency-services',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col font-sans relative selection:bg-[#FFF174] selection:text-black pb-28 md:pb-16">
      {/* 4-Step Friendly Onboarding for First-time users */}
      <OnboardingFlow />

      {/* TOP MOBILE APP HEADER */}
      <header className="sticky top-0 z-30 bg-[#090909]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 select-none group">
            <span className="w-8 h-8 rounded-xl bg-[#FFF174] text-black flex items-center justify-center font-black group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,241,116,0.3)]">
              <Navigation size={18} />
            </span>
            <span className="font-black text-lg tracking-tight text-white">
              Moto<span className="text-[#FFF174]">Assist</span>
            </span>
          </Link>

          {/* Location Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                gpsReady ? 'bg-emerald-400 animate-pulse' : 'bg-[#FFF174]'
              }`}
            />
            <span className="font-semibold text-gray-300 truncate max-w-[140px] sm:max-w-xs">
              Siliguri & Himalayas
            </span>
          </div>

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

      {/* MAIN MOBILE-FIRST CONTENT CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 space-y-6">
        {/* HERO SECTION */}
        <section className="relative rounded-[32px] bg-gradient-to-br from-[#141414] via-[#101010] to-[#0A0A0A] border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl">
          <MountainBackground opacity={0.2} height={180} />
          <RoadPattern opacity={0.1} />

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-[11px] font-black uppercase tracking-wider text-red-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>24/7 Roadside Rescue Network</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.08]">
              Ride safer.<br />
              <span className="text-[#FFF174]">Get help faster.</span>
            </h1>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Immediate motorcycle roadside rescue, verified mechanics, flatbed towing, and live family safety across Himalayan highway corridors.
            </p>

            {/* PRIMARY HERO ACTIONS (SOS & I'M STRANDED - High Tactile Buttons) */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* PRIMARY 1: 🚨 SOS BUTTON */}
              <button
                type="button"
                onClick={() => navigate('/sos')}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-[0.98] text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(220,38,38,0.5)] border border-red-400/50 transition-all cursor-pointer group"
                aria-label="Emergency SOS - Need Immediate Rescue"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldAlert size={20} className="text-white" />
                </div>
                <div className="text-left leading-tight">
                  <span className="block text-base sm:text-lg font-black tracking-wide">🚨 SOS EMERGENCY</span>
                  <span className="block text-[10px] text-red-200 lowercase tracking-normal font-medium">
                    hold or tap for immediate dispatch
                  </span>
                </div>
              </button>

              {/* PRIMARY 2: 🆘 I'M STRANDED BUTTON */}
              <button
                type="button"
                onClick={() => navigate('/im-stranded')}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-[#FFF174] to-[#FCEB50] hover:from-[#FFF69B] hover:to-[#FFF174] active:scale-[0.98] text-black font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,241,116,0.35)] transition-all cursor-pointer group"
                aria-label="I'm Stranded - Fast Breakdown Triage"
              >
                <div className="w-8 h-8 rounded-xl bg-black/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Zap size={20} className="text-black" />
                </div>
                <div className="text-left leading-tight">
                  <span className="block text-base sm:text-lg font-black tracking-wide">🆘 I'M STRANDED</span>
                  <span className="block text-[10px] text-gray-800 lowercase tracking-normal font-semibold">
                    puncture • towing • battery • fuel
                  </span>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* CURRENT STATUS CARD */}
        <section aria-label="Current Road Safety Status">
          {activeRequest ? (
            <div className="rounded-2xl p-4 sm:p-5 bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                <div>
                  <strong className="block text-sm sm:text-base font-black text-white">
                    Assistance in Progress: {activeRequest.issue.replaceAll('_', ' ')}
                  </strong>
                  <p className="text-xs text-amber-200 mt-0.5">
                    Provider assigned • Tap to view real-time location & helper contact
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/requests/${activeRequest.id}`)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400 text-black font-black text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Track Live</span>
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="rounded-2xl p-4 sm:p-5 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <StatusIndicator state="online" size="sm" text="SAFE" />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white block">
                    You're safe • No active incidents
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Himalayan corridor telemetry & Safety Circle active
                  </span>
                </div>
              </div>
              <Link
                to="/safe-ride"
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-gray-200 transition-colors shrink-0 flex items-center gap-1"
              >
                <span>Start Ride</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </section>

        {/* QUICK ACTIONS: NEARBY HELP (6 Tactile Cards) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Wrench size={15} className="text-[#FFF174]" /> Nearby Assistance
            </h2>
            <Link to="/nearby-services" className="text-xs font-bold text-[#FFF174] hover:underline flex items-center gap-1">
              <span>View Map</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {quickActions.map((qa) => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.title}
                  type="button"
                  onClick={() => navigate(qa.path)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2.5 transition-all hover:scale-[1.02] active:scale-95 bg-[#121212] ${qa.bg} cursor-pointer group`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Icon size={20} className={qa.color} />
                  </div>
                  <div>
                    <strong className="block text-xs sm:text-sm font-black text-white">
                      {qa.title}
                    </strong>
                    <span className="text-[10px] text-gray-400 block mt-0.5 font-medium">
                      {qa.sub}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* SAFETY CENTER (Family Circle, Safe Ride, Medical ID, Women Safety) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Shield size={15} className="text-[#FFF174]" /> Safety Center
            </h2>
            <Link to="/safety" className="text-xs font-bold text-[#FFF174] hover:underline flex items-center gap-1">
              <span>All Protocols</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Safety Circle */}
            <div
              onClick={() => navigate('/safety-circle')}
              className="p-4 rounded-2xl bg-[#121212] border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer flex items-start gap-3.5 group"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 transition-transform">
                <Users size={22} />
              </div>
              <div className="flex-1">
                <strong className="text-sm font-bold text-white block group-hover:text-[#FFF174] transition-colors">
                  Safety Circle
                </strong>
                <p className="text-xs text-gray-400 mt-0.5">
                  Live location sharing with parents & trusted contacts during rides.
                </p>
              </div>
            </div>

            {/* Live Safe Ride */}
            <div
              onClick={() => navigate('/safe-ride')}
              className="p-4 rounded-2xl bg-[#121212] border border-white/10 hover:border-[#FFF174]/40 transition-all cursor-pointer flex items-start gap-3.5 group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#FFF174]/15 border border-[#FFF174]/30 flex items-center justify-center shrink-0 text-[#FFF174] group-hover:scale-105 transition-transform">
                <Radio size={22} />
              </div>
              <div className="flex-1">
                <strong className="text-sm font-bold text-white block group-hover:text-[#FFF174] transition-colors">
                  Safe Ride HUD
                </strong>
                <p className="text-xs text-gray-400 mt-0.5">
                  Route telemetry, arrival ETA countdown & deviation monitoring.
                </p>
              </div>
            </div>

            {/* Medical ID */}
            <div
              onClick={() => navigate('/medical-id')}
              className="p-4 rounded-2xl bg-[#121212] border border-white/10 hover:border-red-500/40 transition-all cursor-pointer flex items-start gap-3.5 group"
            >
              <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400 group-hover:scale-105 transition-transform">
                <Heart size={22} />
              </div>
              <div className="flex-1">
                <strong className="text-sm font-bold text-white block group-hover:text-red-400 transition-colors">
                  Medical ID
                </strong>
                <p className="text-xs text-gray-400 mt-0.5">
                  Encrypted clinical blood group, allergy & emergency doctor data.
                </p>
              </div>
            </div>

            {/* Women Safety */}
            <div
              onClick={() => navigate('/women-safety')}
              className="p-4 rounded-2xl bg-[#121212] border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer flex items-start gap-3.5 group"
            >
              <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400 group-hover:scale-105 transition-transform">
                <Shield size={22} />
              </div>
              <div className="flex-1">
                <strong className="text-sm font-bold text-white block group-hover:text-purple-400 transition-colors">
                  Women Rider Safety
                </strong>
                <p className="text-xs text-gray-400 mt-0.5">
                  Discreet SOS, verified night escorts & police safe havens.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MY BIKE GARAGE PREVIEW */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Bike size={15} className="text-[#FFF174]" /> My Machine
            </h2>
            <Link
              to={user ? '/rider/bikes' : '/save-my-bike'}
              className="text-xs font-bold text-[#FFF174] hover:underline flex items-center gap-1"
            >
              <span>{primaryBike ? 'Manage' : 'Add Bike'}</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="p-5 rounded-3xl bg-[#121212] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FFF174] shrink-0">
                <Bike size={24} />
              </div>
              <div>
                <strong className="text-base font-bold text-white block">
                  {primaryBike ? `${primaryBike.brand} ${primaryBike.model}` : 'Royal Enfield Himalayan / KTM 390'}
                </strong>
                <div className="flex items-center gap-2.5 text-xs text-gray-400 mt-0.5">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Health 96%
                  </span>
                  <span>•</span>
                  <span>{primaryBike?.registrationNumber || 'Himalayan Spec'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/ai-bike-assistant"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} className="text-[#FFF174]" />
                <span>AI Diagnostics</span>
              </Link>
              <Link
                to="/pre-ride-check"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Pre-Ride Check</span>
              </Link>
            </div>
          </div>
        </section>

        {/* CORRIDOR ACTIVITY & HAZARDS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Clock size={15} className="text-[#FFF174]" /> Corridor Status
            </h2>
            <Link to="/road-hazards" className="text-xs font-bold text-[#FFF174] hover:underline flex items-center gap-1">
              <span>Hazard Feed</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-2">
            {[
              { route: 'NH-10 Sevoke Checkpost to Teesta', status: 'Clear Corridor', time: '5m ago', color: 'text-emerald-400', dot: 'bg-emerald-400' },
              { route: 'Rohini Road (Kurseong ascent)', status: 'Patch roadwork active • Reduced speed', time: '22m ago', color: 'text-amber-400', dot: 'bg-amber-400' },
              { route: 'Matigara & Bagdogra Bypass', status: '18 Verified helpers on standby', time: '1h ago', color: 'text-blue-400', dot: 'bg-blue-400' },
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#121212] border border-white/5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${item.dot} shrink-0`} />
                  <div>
                    <strong className="text-gray-200 block">{item.route}</strong>
                    <span className={`${item.color} text-[11px]`}>{item.status}</span>
                  </div>
                </div>
                <span className="text-gray-500 text-[11px] shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
