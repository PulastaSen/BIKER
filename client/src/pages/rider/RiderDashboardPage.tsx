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
  Radio
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

        {/* Core Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* SOS Card */}
          <button 
            onClick={() => navigate('/sos')}
            className="md:col-span-1 relative overflow-hidden bg-gradient-to-br from-[#EF4444] to-[#991B1B] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-[0_10px_40px_rgba(239,68,68,0.25)] active:scale-95 hover:scale-[1.01] transition-transform text-center min-h-[160px] border border-[#EF4444]/40"
          >
            <ShieldAlert size={44} className="text-white drop-shadow-lg z-10 animate-pulse" />
            <span className="font-display font-black text-3xl tracking-widest text-white drop-shadow-md z-10">SOS 112</span>
            <span className="text-white text-xs font-mono font-bold uppercase tracking-wider z-10 bg-black/40 px-3 py-1 rounded-full border border-white/20">
              Hold for Emergency
            </span>
          </button>

          {/* Quick Service Actions */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/request-help')}
              className="bg-[#151613] border border-[#383A32] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 active:scale-95 hover:bg-[#20211D] hover:border-[#FFF174]/40 transition-all text-center shadow-md min-h-[150px]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FFF174]/10 text-[#FFF174] flex items-center justify-center mb-1 border border-[#FFF174]/20">
                <Wrench size={24} />
              </div>
              <span className="font-display font-bold text-sm leading-tight text-[#EFF2F7] uppercase tracking-wider">Request<br/>Assistance</span>
              <span className="text-[#A8A6A3] text-xs hidden sm:inline">Puncture, Tow, Fuel</span>
            </button>

            <button 
              onClick={() => navigate('/nearby-services')}
              className="bg-[#151613] border border-[#383A32] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 active:scale-95 hover:bg-[#20211D] hover:border-[#B1D8E3]/40 transition-all text-center shadow-md min-h-[150px]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#B1D8E3]/10 text-[#B1D8E3] flex items-center justify-center mb-1 border border-[#B1D8E3]/20">
                <MapIcon size={24} />
              </div>
              <span className="font-display font-bold text-sm leading-tight text-[#EFF2F7] uppercase tracking-wider">Nearby<br/>Repair Hubs</span>
              <span className="text-[#A8A6A3] text-xs hidden sm:inline">Live Map & Contacts</span>
            </button>
          </div>
        </div>

        {/* Start Safe Ride Strip */}
        <button 
          onClick={() => navigate('/safety')}
          className="w-full bg-[#151613] border border-[#383A32] rounded-2xl p-4 flex items-center gap-4 active:scale-95 hover:border-[#10B981]/40 transition-all shadow-md min-h-[64px]"
        >
          <div className="w-11 h-11 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0 border border-[#10B981]/30">
            <ShieldCheck size={24} />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-display font-bold text-sm md:text-base text-[#EFF2F7]">Start Safe Ride</h3>
            <p className="text-xs text-[#A8A6A3]">Share live route & real-time ETA with emergency contacts</p>
          </div>
          <ChevronRight size={20} className="text-[#A8A6A3]" />
        </button>

        {/* Garage & ICE Contacts Overview (Desktop / Tablet grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Garage Snapshot */}
          <div className="bg-[#151613] border border-[#383A32] rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFF174]/10 text-[#FFF174] flex items-center justify-center border border-[#FFF174]/20">
                  <BikeIcon size={18} />
                </div>
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#EFF2F7]">My Garage</h3>
              </div>
              <Link to="/rider/bikes" className="text-xs font-mono font-bold text-[#FFF174] hover:underline flex items-center gap-1 min-h-[44px]">
                View All ({bikes.length}) <ChevronRight size={14} />
              </Link>
            </div>

            {primaryBike ? (
              <div className="bg-[#20211D] border border-[#383A32] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFF174] bg-[#FFF174]/10 px-2 py-0.5 rounded border border-[#FFF174]/20">
                    Primary Motorcycle
                  </span>
                  <h4 className="font-display font-bold text-sm text-[#EFF2F7] mt-1.5">{primaryBike.brand} {primaryBike.model}</h4>
                  <p className="text-xs font-mono text-[#A8A6A3] mt-0.5">{primaryBike.registrationNumber}</p>
                </div>
                <Link to="/rider/bikes" className="text-xs text-[#EFF2F7] hover:text-[#FFF174] px-3 py-1.5 bg-[#151613] rounded-lg border border-[#383A32] min-h-[44px] flex items-center">
                  Manage
                </Link>
              </div>
            ) : (
              <div className="bg-[#20211D] border border-[#383A32] rounded-xl p-4 text-center">
                <p className="text-xs text-[#A8A6A3] mb-2">No motorcycles registered yet.</p>
                <Link to="/rider/bikes" className="inline-flex items-center gap-1 text-xs font-bold text-[#FFF174] hover:underline min-h-[44px]">
                  <Plus size={14} /> Add your motorcycle
                </Link>
              </div>
            )}
          </div>

          {/* Emergency Contacts Snapshot */}
          <div className="bg-[#151613] border border-[#383A32] rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center border border-[#EF4444]/30">
                  <PhoneCall size={18} />
                </div>
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#EFF2F7]">Emergency Contacts (ICE)</h3>
              </div>
              <Link to="/rider/emergency-contacts" className="text-xs font-mono font-bold text-[#FFF174] hover:underline flex items-center gap-1 min-h-[44px]">
                Manage ({contacts.length}) <ChevronRight size={14} />
              </Link>
            </div>

            {contacts.length > 0 ? (
              <div className="bg-[#20211D] border border-[#383A32] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#A8A6A3] uppercase tracking-wider">Primary Contact</span>
                  <h4 className="font-bold text-sm text-[#EFF2F7] mt-0.5">{contacts[0].name} ({contacts[0].relationship})</h4>
                  <p className="text-xs font-mono text-[#A8A6A3] mt-0.5">{contacts[0].phone}</p>
                </div>
                <a 
                  href={`tel:${contacts[0].phone}`} 
                  className="px-3.5 py-2 bg-[#EF4444]/20 text-[#EF4444] font-display font-bold text-xs uppercase tracking-wider rounded-lg border border-[#EF4444]/40 hover:bg-[#EF4444]/30 transition-colors min-h-[44px] flex items-center"
                >
                  Call ICE
                </a>
              </div>
            ) : (
              <div className="bg-[#20211D] border border-[#383A32] rounded-xl p-4 text-center">
                <p className="text-xs text-[#A8A6A3] mb-2">No emergency contacts saved.</p>
                <Link to="/rider/emergency-contacts" className="inline-flex items-center gap-1 text-xs font-bold text-[#FFF174] hover:underline min-h-[44px]">
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
