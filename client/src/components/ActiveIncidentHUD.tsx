import { PhoneCall, Navigation, XCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ActiveIncidentHUDProps {
  requestId: string;
  issueCategory?: string;
  providerName?: string;
  providerPhone?: string;
  distance?: string;
  eta?: string;
  status: string; // 'REQUESTED' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED'
  onCancel?: () => void;
  className?: string;
}

export function ActiveIncidentHUD({
  requestId,
  issueCategory = 'Roadside Help',
  providerName = 'Raj Motors',
  providerPhone = '+91 98320 12345',
  distance = '3.2 km',
  eta = '12 min',
  status = 'EN_ROUTE',
  onCancel,
  className = '',
}: ActiveIncidentHUDProps) {
  const navigate = useNavigate();

  const isAccepted = ['ACCEPTED', 'ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(status);
  const isEnRoute = ['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(status);

  return (
    <div
      className={`rounded-3xl bg-gradient-to-br from-[#1C1508] via-[#121212] to-[#0A0A0A] border-2 border-[#FFF174]/60 p-5 sm:p-6 shadow-[0_0_35px_rgba(255,241,116,0.2)] text-white space-y-4 ${className}`}
      role="region"
      aria-label="Active Assistance Incident Status"
    >
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[#FFF174] animate-ping" />
          <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase text-[#FFF174]">
            HELP IS ON THE WAY
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
          #{requestId}
        </span>
      </div>

      {/* 3-Step Live Progress Indicator */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        {/* Step 1: Request received */}
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <CheckCircle2 size={16} className="shrink-0" />
          <span className="text-[11px] sm:text-xs">Request received</span>
        </div>

        {/* Step 2: Helper accepted */}
        <div
          className={`flex items-center gap-1.5 font-bold ${
            isAccepted ? 'text-emerald-400' : 'text-gray-400'
          }`}
        >
          {isAccepted ? (
            <CheckCircle2 size={16} className="shrink-0" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse ml-1 shrink-0" />
          )}
          <span className="text-[11px] sm:text-xs">
            {isAccepted ? 'Helper accepted' : 'Awaiting helper'}
          </span>
        </div>

        {/* Step 3: En route */}
        <div
          className={`flex items-center gap-1.5 font-bold ${
            isEnRoute ? 'text-[#FFF174]' : 'text-gray-500'
          }`}
        >
          {isEnRoute ? (
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFF174] animate-ping ml-1 shrink-0" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-gray-600 ml-1 shrink-0" />
          )}
          <span className="text-[11px] sm:text-xs">En route</span>
        </div>
      </div>

      {/* Provider Snapshot Card */}
      <div className="bg-black/50 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
            {issueCategory}
          </span>
          <strong className="text-base sm:text-lg font-black text-white block">
            {providerName}
          </strong>
          <div className="flex items-center gap-3 text-xs text-gray-300 mt-1">
            <span className="font-semibold text-white">{distance}</span>
            <span className="text-gray-500">•</span>
            <span className="text-[#FFF174] font-bold">ETA {eta}</span>
          </div>
        </div>

        {/* Tactile Action Buttons: [Call] [Track] [Cancel] */}
        <div className="flex items-center gap-2 pt-1 sm:pt-0">
          <a
            href={`tel:${providerPhone}`}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-white/10 transition-all min-h-[44px]"
            aria-label={`Call helper at ${providerPhone}`}
          >
            <PhoneCall size={14} className="text-emerald-400" />
            <span>Call</span>
          </a>

          <button
            type="button"
            onClick={() => navigate(`/requests/${requestId}`)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#FFF174] hover:bg-yellow-400 active:scale-95 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,241,116,0.3)] min-h-[44px] cursor-pointer"
          >
            <Navigation size={14} />
            <span>Track</span>
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 active:scale-95 text-red-300 font-bold text-xs uppercase tracking-wider border border-red-500/30 transition-all min-h-[44px] cursor-pointer"
              title="Cancel request"
            >
              <XCircle size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
