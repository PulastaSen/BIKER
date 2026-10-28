import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRequests, getBikes, getEmergencyContacts } from '../../utils/appStorage';
import type { HelpRequest, Bike, EmergencyContact } from '../../types/app';
import { StatusBadge } from '../../components/StatusBadge';
import {
  ShieldAlert,
  Wrench,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  Map as MapIcon,
  Bike as BikeIcon,
  PhoneCall,
  Plus,
  Radio,
  Heart,
  Navigation
} from 'lucide-react';

export function RiderDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeRequest, setActiveRequest] = useState<HelpRequest | undefined>();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    if (user) {
      const allRequests = getRequests();
      const userReqs = allRequests.filter((r) => r.riderId === user.id);
      const active = userReqs.find((r) => r.status === 'OPEN' || r.status === 'HELPER_OFFERED' || r.status === 'IN_PROGRESS');
      setActiveRequest(active);

      setBikes(getBikes(user.id));
      setContacts(getEmergencyContacts(user.id));
    }
  }, [user]);

  const primaryBike = bikes.find(b => b.isPrimary) || bikes[0];

  return (
    <div className="bg-[#090A08] min-h-screen text-[#EFF2F7] pb-28 font-sans flex flex-col">

      {/* Main Container: Mobile phone width on small screens, expands dynamically to max-w-6xl on desktop */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12 flex-1 flex flex-col gap-6">
        
        {/* Desktop Welcome Banner */}
        <div className="hidden md:flex items-center justify-between bg-[#151613] border border-[#383A32] rounded-2xl p-6 shadow-xl">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFF174]">RIDER COMMAND CENTER</span>
            <h1 className="text-2xl font-display font-black tracking-tight mt-1 text-[#EFF2F7]">Welcome back, {user?.name || 'Rider'}</h1>
            <p className="text-[#A8A6A3] text-sm mt-1">24/7 Roadside Assistance & Emergency Network Active</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-mono font-bold">
              <Radio size={14} className="animate-pulse" /> GPS Monitored
            </div>
            <Link to="/request-help" className="px-5 py-2.5 bg-[#FFF174] text-black font-display font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#ffe83b] transition-colors min-h-[44px] flex items-center">
              New Request
            </Link>
          </div>
        </div>

        {/* Mobile Status Header */}
        <div className="md:hidden text-center mb-1">
          <h2 className="text-2xl font-display font-black mb-1 text-[#EFF2F7]">Are you safe?</h2>
          <p className="text-[#A8A6A3] text-xs">Select an option below to get immediate assistance.</p>
        </div>

        {/* Active Request Alert (if present) */}
        {activeRequest && (
          <div className="border-2 border-[#DFF127]/50 bg-[#151613] rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#DFF127]"></div>
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-[#DFF127]" />
                <h3 className="font-display font-bold text-xs text-[#DFF127] uppercase tracking-widest">Active Roadside Request</h3>
              </div>
              <StatusBadge status={activeRequest.status} />
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-display font-black text-lg text-[#EFF2F7] mb-1">{activeRequest.issue.replaceAll('_', ' ')}</p>
                <p className="text-xs text-[#A8A6A3] flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#FFF174]" /> {activeRequest.approximateLocation || 'Live GPS tracked'}
                </p>
              </div>
              <button 
                onClick={() => navigate(`/requests/${activeRequest.id}`)}
                className="py-2.5 px-6 bg-[#DFF127] text-black font-display font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-[#cde016] transition-colors shrink-0 min-h-[44px]"
              >
                Track Assistance Live
              </button>
            </div>
          </div>
        )}

        {/* Core Emergency Hero: Prominent SOS Action */}
        <section className="relative overflow-hidden bg-gradient-to-r from-red-900 via-red-600 to-red-800 rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_10px_40px_rgba(239,68,68,0.3)] border border-red-500/50">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <ShieldAlert size={28} className="text-white animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-200 block">
                NATIONAL POLICE & RESCUE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                Emergency Distress SOS
              </h2>
              <p className="text-xs text-red-100 max-w-md hidden sm:block">
                Hold for 2.5s or tap to trigger national emergency broadcast and notify trusted circle.
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => navigate('/sos')}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-red-50 text-red-700 font-display font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
          >
            <ShieldAlert size={18} />
            <span>TRIGGER SOS 112</span>
          </button>
        </section>

        {/* Responsive Core Features Grid: 2 columns on mobile, 4 columns on desktop */}
        <section className="space-y-3" aria-labelledby="quick-actions-heading">
          <div className="flex items-center justify-between">
            <h2 id="quick-actions-heading" className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFF174]">
              RIDER SERVICES & SHORTCUTS
            </h2>
            <span className="text-[11px] text-[#A8A6A3]">Quick Access</span>
          </div>

          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {/* 1. Request Assistance */}
            <button 
              type="button"
              onClick={() => navigate('/request-help')}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] border border-[#383A32] hover:bg-[#20211D] hover:border-[#FFF174]/60 transition-all text-left flex flex-col justify-between min-h-[128px] sm:min-h-[140px] cursor-pointer group active:scale-[0.98] shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#FFF174]/10 text-[#FFF174] flex items-center justify-center border border-[#FFF174]/30 group-hover:scale-105 transition-transform">
                  <Wrench size={20} />
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FFF174]/15 text-[#FFF174] border border-[#FFF174]/30">
                  RESCUE
                </span>
              </div>
              <div>
                <strong className="font-display font-black text-sm text-[#EFF2F7] group-hover:text-[#FFF174] transition-colors block">
                  Request Assistance
                </strong>
                <p className="text-[11px] text-[#A8A6A3] line-clamp-1 mt-0.5">Puncture, battery, fuel, tow</p>
              </div>
            </button>

            {/* 2. Nearby Repair Hubs */}
            <button 
              type="button"
              onClick={() => navigate('/nearby-services')}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] border border-[#383A32] hover:bg-[#20211D] hover:border-[#B1D8E3]/60 transition-all text-left flex flex-col justify-between min-h-[128px] sm:min-h-[140px] cursor-pointer group active:scale-[0.98] shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#B1D8E3]/10 text-[#B1D8E3] flex items-center justify-center border border-[#B1D8E3]/30 group-hover:scale-105 transition-transform">
                  <MapIcon size={20} />
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-[#B1D8E3] border border-blue-500/30">
                  RADAR
                </span>
              </div>
              <div>
                <strong className="font-display font-black text-sm text-[#EFF2F7] group-hover:text-[#B1D8E3] transition-colors block">
                  Nearby Repair Hubs
                </strong>
                <p className="text-[11px] text-[#A8A6A3] line-clamp-1 mt-0.5">Live map, mechanics & fuel</p>
              </div>
            </button>

            {/* 3. Start Safe Ride */}
            <button 
              type="button"
              onClick={() => navigate('/safe-ride')}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] border border-[#383A32] hover:bg-[#20211D] hover:border-[#10B981]/60 transition-all text-left flex flex-col justify-between min-h-[128px] sm:min-h-[140px] cursor-pointer group active:scale-[0.98] shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center border border-[#10B981]/30 group-hover:scale-105 transition-transform">
                  <Navigation size={20} />
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  LIVE
                </span>
              </div>
              <div>
                <strong className="font-display font-black text-sm text-[#EFF2F7] group-hover:text-[#10B981] transition-colors block">
                  Start Safe Ride
                </strong>
                <p className="text-[11px] text-[#A8A6A3] line-clamp-1 mt-0.5">Share live route & ETA</p>
              </div>
            </button>

            {/* 4. Help Request History */}
            <button 
              type="button"
              onClick={() => navigate('/rider/requests')}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] border border-[#383A32] hover:bg-[#20211D] hover:border-[#DFF127]/60 transition-all text-left flex flex-col justify-between min-h-[128px] sm:min-h-[140px] cursor-pointer group active:scale-[0.98] shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#DFF127]/10 text-[#DFF127] flex items-center justify-center border border-[#DFF127]/30 group-hover:scale-105 transition-transform">
                  <Clock size={20} />
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-yellow-500/15 text-[#DFF127] border border-yellow-500/30">
                  LOGS
                </span>
              </div>
              <div>
                <strong className="font-display font-black text-sm text-[#EFF2F7] group-hover:text-[#DFF127] transition-colors block">
                  Help Requests Log
                </strong>
                <p className="text-[11px] text-[#A8A6A3] line-clamp-1 mt-0.5">Active & past dispatches</p>
              </div>
            </button>

            {/* 5. My Garage */}
            <button 
              type="button"
              onClick={() => navigate('/rider/bikes')}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] border border-[#383A32] hover:bg-[#20211D] hover:border-[#FFF174]/60 transition-all text-left flex flex-col justify-between min-h-[128px] sm:min-h-[140px] cursor-pointer group active:scale-[0.98] shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#FFF174]/10 text-[#FFF174] flex items-center justify-center border border-[#FFF174]/30 group-hover:scale-105 transition-transform">
                  <BikeIcon size={20} />
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-gray-300 border border-white/20">
                  {bikes.length} BIKES
                </span>
              </div>
              <div>
                <strong className="font-display font-black text-sm text-[#EFF2F7] group-hover:text-[#FFF174] transition-colors block">
                  My Garage
                </strong>
                <p className="text-[11px] text-[#A8A6A3] line-clamp-1 mt-0.5">Motorcycles & QR tags</p>
              </div>
            </button>

            {/* 6. Emergency Contacts */}
            <button 
              type="button"
              onClick={() => navigate('/rider/emergency-contacts')}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] border border-[#383A32] hover:bg-[#20211D] hover:border-red-500/60 transition-all text-left flex flex-col justify-between min-h-[128px] sm:min-h-[140px] cursor-pointer group active:scale-[0.98] shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/30 group-hover:scale-105 transition-transform">
                  <PhoneCall size={20} />
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">
                  {contacts.length} ICE
                </span>
              </div>
              <div>
                <strong className="font-display font-black text-sm text-[#EFF2F7] group-hover:text-red-300 transition-colors block">
                  Emergency Contacts
                </strong>
                <p className="text-[11px] text-[#A8A6A3] line-clamp-1 mt-0.5">Family & trusted circle</p>
              </div>
            </button>

            {/* 7. Subscriptions / RSA Plans */}
            <button 
              type="button"
              onClick={() => navigate('/subscriptions')}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] border border-[#383A32] hover:bg-[#20211D] hover:border-[#10B981]/60 transition-all text-left flex flex-col justify-between min-h-[128px] sm:min-h-[140px] cursor-pointer group active:scale-[0.98] shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  SHIELD
                </span>
              </div>
              <div>
                <strong className="font-display font-black text-sm text-[#EFF2F7] group-hover:text-emerald-400 transition-colors block">
                  RSA Subscriptions
                </strong>
                <p className="text-[11px] text-[#A8A6A3] line-clamp-1 mt-0.5">Zero-cost rescues</p>
              </div>
            </button>

            {/* 8. Medical ID & Profile */}
            <button 
              type="button"
              onClick={() => navigate('/rider/profile')}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#151613] border border-[#383A32] hover:bg-[#20211D] hover:border-red-500/60 transition-all text-left flex flex-col justify-between min-h-[128px] sm:min-h-[140px] cursor-pointer group active:scale-[0.98] shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/30 group-hover:scale-105 transition-transform">
                  <Heart size={20} />
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">
                  PROFILE
                </span>
              </div>
              <div>
                <strong className="font-display font-black text-sm text-[#EFF2F7] group-hover:text-red-300 transition-colors block">
                  Medical ID & Account
                </strong>
                <p className="text-[11px] text-[#A8A6A3] line-clamp-1 mt-0.5">Blood group, allergies, ICE</p>
              </div>
            </button>
          </div>
        </section>

        {/* Garage & ICE Contacts Overview (Responsive 2-column Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Garage Snapshot */}
          <div className="bg-[#151613] border border-[#383A32] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FFF174]/10 text-[#FFF174] flex items-center justify-center border border-[#FFF174]/20">
                  <BikeIcon size={16} />
                </div>
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#EFF2F7]">My Garage</h3>
              </div>
              <Link to="/rider/bikes" className="text-xs font-mono font-bold text-[#FFF174] hover:underline flex items-center gap-1 min-h-[44px]">
                View All ({bikes.length}) <ChevronRight size={13} />
              </Link>
            </div>

            {primaryBike ? (
              <div className="bg-[#20211D] border border-[#383A32] rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#FFF174] bg-[#FFF174]/10 px-1.5 py-0.5 rounded border border-[#FFF174]/20">
                    Primary Ride
                  </span>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-[#EFF2F7] mt-1 truncate">{primaryBike.brand} {primaryBike.model}</h4>
                  <p className="text-[11px] font-mono text-[#A8A6A3]">{primaryBike.registrationNumber}</p>
                </div>
                <Link to="/rider/bikes" className="text-xs text-[#EFF2F7] hover:text-[#FFF174] px-3 py-1.5 bg-[#151613] rounded-lg border border-[#383A32] min-h-[40px] flex items-center shrink-0">
                  Manage
                </Link>
              </div>
            ) : (
              <div className="bg-[#20211D] border border-[#383A32] rounded-xl p-3.5 text-center">
                <p className="text-xs text-[#A8A6A3] mb-1.5">No motorcycles registered yet.</p>
                <Link to="/rider/bikes" className="inline-flex items-center gap-1 text-xs font-bold text-[#FFF174] hover:underline min-h-[40px]">
                  <Plus size={14} /> Add your motorcycle
                </Link>
              </div>
            )}
          </div>

          {/* Emergency Contacts Snapshot */}
          <div className="bg-[#151613] border border-[#383A32] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center border border-[#EF4444]/30">
                  <PhoneCall size={16} />
                </div>
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#EFF2F7]">Emergency Contacts (ICE)</h3>
              </div>
              <Link to="/rider/emergency-contacts" className="text-xs font-mono font-bold text-[#FFF174] hover:underline flex items-center gap-1 min-h-[44px]">
                Manage ({contacts.length}) <ChevronRight size={13} />
              </Link>
            </div>

            {contacts.length > 0 ? (
              <div className="bg-[#20211D] border border-[#383A32] rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[9px] font-mono text-[#A8A6A3] uppercase tracking-wider">Primary Contact</span>
                  <h4 className="font-bold text-xs sm:text-sm text-[#EFF2F7] mt-0.5 truncate">{contacts[0].name} ({contacts[0].relationship})</h4>
                  <p className="text-[11px] font-mono text-[#A8A6A3]">{contacts[0].phone}</p>
                </div>
                <a 
                  href={`tel:${contacts[0].phone}`} 
                  className="px-3 py-1.5 bg-[#EF4444]/20 text-[#EF4444] font-display font-bold text-xs uppercase tracking-wider rounded-lg border border-[#EF4444]/40 hover:bg-[#EF4444]/30 transition-colors min-h-[40px] flex items-center shrink-0"
                >
                  Call ICE
                </a>
              </div>
            ) : (
              <div className="bg-[#20211D] border border-[#383A32] rounded-xl p-3.5 text-center">
                <p className="text-xs text-[#A8A6A3] mb-1.5">No emergency contacts saved.</p>
                <Link to="/rider/emergency-contacts" className="inline-flex items-center gap-1 text-xs font-bold text-[#FFF174] hover:underline min-h-[40px]">
                  <Plus size={14} /> Add ICE Contact
                </Link>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
