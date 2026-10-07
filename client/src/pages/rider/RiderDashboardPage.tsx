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
    <div className="bg-[#090909] min-h-screen text-white pb-24 font-sans flex flex-col">

      {/* Main Container: Mobile phone width on small screens, expands dynamically to max-w-6xl on desktop */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12 flex-1 flex flex-col gap-6">
        
        {/* Desktop Welcome Banner */}
        <div className="hidden md:flex items-center justify-between bg-[#111111] border border-white/10 rounded-2xl p-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFF174]">RIDER COMMAND CENTER</span>
            <h1 className="text-2xl font-black tracking-tight mt-1">Welcome back, {user?.name || 'Rider'}</h1>
            <p className="text-gray-400 text-sm mt-1">24/7 Roadside Assistance & Emergency Network Active</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Radio size={14} className="animate-pulse" /> GPS Monitored
            </div>
            <Link to="/request-help" className="px-4 py-2 bg-[#FFF174] text-black font-bold text-sm rounded-xl hover:bg-yellow-400 transition-colors">
              New Request
            </Link>
          </div>
        </div>

        {/* Mobile Status Header */}
        <div className="md:hidden text-center mb-1">
          <h2 className="text-2xl font-black mb-1">Are you safe?</h2>
          <p className="text-gray-400 text-xs">Select an option below to get immediate assistance.</p>
        </div>

        {/* Active Request Alert (if present) */}
        {activeRequest && (
          <div className="border border-[#FFF174]/40 bg-[#FFF174]/10 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FFF174]"></div>
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-[#FFF174]" />
                <h3 className="font-black text-sm text-[#FFF174] uppercase tracking-wider">Active Roadside Request</h3>
              </div>
              <StatusBadge status={activeRequest.status} />
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-black text-lg text-white mb-1">{activeRequest.issue.replaceAll('_', ' ')}</p>
                <p className="text-xs text-gray-300 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#FFF174]" /> {activeRequest.approximateLocation || 'Live GPS tracked'}
                </p>
              </div>
              <button 
                onClick={() => navigate(`/requests/${activeRequest.id}`)}
                className="py-2.5 px-6 bg-[#FFF174] text-black font-black rounded-xl text-sm hover:bg-yellow-400 transition-colors shrink-0"
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
            className="md:col-span-1 relative overflow-hidden bg-gradient-to-br from-red-600 to-red-900 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-[0_10px_40px_rgba(220,38,38,0.35)] active:scale-95 hover:scale-[1.01] transition-transform text-center"
            style={{ minHeight: '160px' }}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent"></div>
            <ShieldAlert size={44} className="text-white drop-shadow-lg z-10 animate-pulse" />
            <span className="font-black text-3xl tracking-widest text-white drop-shadow-md z-10">SOS</span>
            <span className="text-red-100 text-xs font-bold uppercase tracking-wider z-10 bg-red-950/60 px-3 py-1 rounded-full border border-red-500/30">
              Hold for Emergency
            </span>
          </button>

          {/* Quick Service Actions */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/request-help')}
              className="bg-[#111111] border border-white/10 rounded-3xl p-5 flex flex-col items-center justify-center gap-2 active:scale-95 hover:bg-[#161616] hover:border-[#FFF174]/40 transition-all text-center shadow-md"
              style={{ minHeight: '150px' }}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFF174]/10 text-[#FFF174] flex items-center justify-center mb-1">
                <Wrench size={26} />
              </div>
              <span className="font-black text-base leading-tight">Request<br/>Assistance</span>
              <span className="text-gray-400 text-xs hidden sm:inline">Puncture, Tow, Fuel</span>
            </button>

            <button 
              onClick={() => navigate('/nearby-services')}
              className="bg-[#111111] border border-white/10 rounded-3xl p-5 flex flex-col items-center justify-center gap-2 active:scale-95 hover:bg-[#161616] hover:border-blue-400/40 transition-all text-center shadow-md"
              style={{ minHeight: '150px' }}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1">
                <MapIcon size={26} />
              </div>
              <span className="font-black text-base leading-tight">Nearby<br/>Repair Hubs</span>
              <span className="text-gray-400 text-xs hidden sm:inline">Live Map & Contacts</span>
            </button>
          </div>
        </div>

        {/* Start Safe Ride Strip */}
        <button 
          onClick={() => navigate('/safety')}
          className="w-full bg-[#111111] border border-white/10 rounded-2xl p-4 flex items-center gap-4 active:scale-95 hover:border-emerald-500/40 transition-all shadow-md"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-bold text-sm md:text-base">Start Safe Ride</h3>
            <p className="text-xs text-gray-400">Share live route & real-time ETA with emergency contacts</p>
          </div>
          <ChevronRight size={20} className="text-gray-500" />
        </button>

        {/* Garage & ICE Contacts Overview (Desktop / Tablet grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Garage Snapshot */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFF174]/10 text-[#FFF174] flex items-center justify-center">
                  <BikeIcon size={18} />
                </div>
                <h3 className="font-bold text-base">My Garage</h3>
              </div>
              <Link to="/rider/bikes" className="text-xs font-bold text-[#FFF174] hover:underline flex items-center gap-1">
                View All ({bikes.length}) <ChevronRight size={14} />
              </Link>
            </div>

            {primaryBike ? (
              <div className="bg-[#161616] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FFF174] bg-[#FFF174]/10 px-2 py-0.5 rounded">
                    Primary Motorcycle
                  </span>
                  <h4 className="font-black text-base text-white mt-1.5">{primaryBike.brand} {primaryBike.model}</h4>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">{primaryBike.registrationNumber}</p>
                </div>
                <Link to="/rider/bikes" className="text-xs text-gray-400 hover:text-white px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  Manage
                </Link>
              </div>
            ) : (
              <div className="bg-[#161616] border border-white/5 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-2">No motorcycles registered yet.</p>
                <Link to="/rider/bikes" className="inline-flex items-center gap-1 text-xs font-bold text-[#FFF174] hover:underline">
                  <Plus size={14} /> Add your motorcycle
                </Link>
              </div>
            )}
          </div>

          {/* Emergency Contacts Snapshot */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                  <PhoneCall size={18} />
                </div>
                <h3 className="font-bold text-base">Emergency Contacts (ICE)</h3>
              </div>
              <Link to="/rider/emergency-contacts" className="text-xs font-bold text-[#FFF174] hover:underline flex items-center gap-1">
                Manage ({contacts.length}) <ChevronRight size={14} />
              </Link>
            </div>

            {contacts.length > 0 ? (
              <div className="bg-[#161616] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Primary Contact</span>
                  <h4 className="font-bold text-sm text-white mt-0.5">{contacts[0].name} ({contacts[0].relationship})</h4>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">{contacts[0].phone}</p>
                </div>
                <a 
                  href={`tel:${contacts[0].phone}`} 
                  className="px-3 py-1.5 bg-red-500/20 text-red-300 font-bold text-xs rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors"
                >
                  Call ICE
                </a>
              </div>
            ) : (
              <div className="bg-[#161616] border border-white/5 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-2">No emergency contacts saved.</p>
                <Link to="/rider/emergency-contacts" className="inline-flex items-center gap-1 text-xs font-bold text-[#FFF174] hover:underline">
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
