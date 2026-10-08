import { CheckCircle2, ArrowLeft, Navigation, PhoneCall } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getRequests } from '../utils/appStorage';
import type { HelpRequest } from '../types/app';

export function RequestSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateRequest = location.state?.request as HelpRequest | undefined;
  const latestRequest = getRequests()[0];
  const request = stateRequest || latestRequest;

  if (!request) {
    return (
      <main className="min-h-screen bg-[#090909] text-white flex items-center justify-center p-6 text-center">
        <div className="bg-[#121212] border border-white/10 p-8 rounded-3xl max-w-md w-full space-y-4">
          <h1 className="text-xl font-bold text-white">No active request found</h1>
          <p className="text-xs text-gray-400">Create a roadside assistance ticket to get started.</p>
          <Link
            to="/im-stranded"
            className="inline-block px-5 py-2.5 bg-[#FFF174] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-yellow-400"
          >
            I'm Stranded
          </Link>
        </div>
      </main>
    );
  }

  const providerName = request.assignedHelperName || 'Raj Motors & Mountain Towing';
  const providerDistance = '3.2 km';
  const providerEta = '12 min';
  const priceEstimate = '₹350 (Includes Call-out & Diagnosis)';

  return (
    <main className="min-h-screen bg-[#090909] text-white pt-6 pb-24 md:pb-16 font-sans">
      <div className="max-w-xl mx-auto px-4 space-y-5">
        
        {/* Navigation */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <Link to="/" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <span className="text-[10px] font-mono text-gray-400 font-bold">
            #{request.id}
          </span>
        </div>

        {/* Success Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.3)]">
            <CheckCircle2 size={32} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
            REQUEST RECEIVED
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Assistance Confirmed
          </h1>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Your request has been registered and dispatched to the service responder.
          </p>
        </div>

        {/* SECTION 10: The 6 Exact Required Fields */}
        <div className="p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-3.5 shadow-xl">
          
          {/* 1. Request Received & 6. Current Status */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <strong className="text-white">Status:</strong>
              <span className="text-emerald-300 font-bold uppercase">{request.status}</span>
            </div>
            <span className="text-emerald-400 font-bold">✓ Request received</span>
          </div>

          {/* 2. Provider */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5 text-xs">
            <span className="text-gray-400 uppercase text-[10px] font-bold">Provider</span>
            <strong className="text-white text-sm">{providerName}</strong>
          </div>

          {/* 3. Distance & 4. ETA */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-gray-400 uppercase text-[10px] font-bold block">Distance</span>
              <strong className="text-white text-sm mt-0.5 block">{providerDistance}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-gray-400 uppercase text-[10px] font-bold block">Estimated Arrival</span>
              <strong className="text-[#FFF174] text-sm mt-0.5 block">{providerEta}</strong>
            </div>
          </div>

          {/* 5. Price Estimate */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-xs flex items-center justify-between">
            <span className="text-gray-400 uppercase text-[10px] font-bold">Price Estimate</span>
            <strong className="text-[#FFF174] text-sm font-black">{priceEstimate}</strong>
          </div>

          {/* Actions: Track Live or Call */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="tel:+919832012345"
              className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors text-center"
            >
              <PhoneCall size={14} className="text-emerald-400" />
              <span>Call Provider</span>
            </a>
            <button
              type="button"
              onClick={() => navigate(`/requests/${request.id}`)}
              className="py-3 px-4 rounded-xl bg-[#FFF174] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Navigation size={14} />
              <span>Track Live</span>
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
