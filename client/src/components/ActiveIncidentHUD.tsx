import { PhoneCall, Navigation, XCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ActiveIncidentHUDProps {
  requestId: string;
  issueCategory?: string;
  providerName?: string;
  providerPhone?: string;
  distance?: string;
  eta?: string;
  status: string; // 'DRAFT_LOCAL' | 'SUBMITTED' | 'ACKNOWLEDGED' | 'SEARCHING' | 'OFFERED' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'UNFULFILLED_NO_PROVIDER' | 'CANCELLED'
  onCancel?: () => void;
  className?: string;
}

export function ActiveIncidentHUD({
  requestId,
  issueCategory = 'Roadside Help',
  providerName,
  providerPhone,
  distance,
  eta,
  status = 'SUBMITTED',
  onCancel,
  className = '',
}: ActiveIncidentHUDProps) {
  const navigate = useNavigate();

  const isOfflineLocal = status === 'DRAFT_LOCAL';
  const isCancelled = status === 'CANCELLED';
  const isUnfulfilled = status === 'UNFULFILLED_NO_PROVIDER';
  const isSearching = ['SUBMITTED', 'REQUESTED', 'ACKNOWLEDGED', 'SEARCHING', 'OFFERED', 'ASSIGNED'].includes(status);
  const isAccepted = ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'RESOLVED'].includes(status);
  const isEnRoute = ['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'RESOLVED'].includes(status);

  // Truthful status banner title
  const bannerTitle = isOfflineLocal
    ? 'OFFLINE INCIDENT — SAVED ON DEVICE'
    : isCancelled
    ? 'INCIDENT CANCELLED'
    : isUnfulfilled
    ? 'NO PROVIDER AVAILABLE IN SECTOR'
    : isAccepted
    ? 'CONFIRMED PROVIDER DISPATCHED'
    : 'SEARCHING FOR NEARBY PROVIDER';

  const bannerColor = isOfflineLocal
    ? 'text-amber-400'
    : isCancelled
    ? 'text-gray-400'
    : isUnfulfilled
    ? 'text-red-400'
    : isAccepted
    ? 'text-emerald-400'
    : 'text-[#FFF174]';

  return (
    <div
      className={`rounded-3xl bg-gradient-to-br from-[#1C1508] via-[#121212] to-[#0A0A0A] border-2 ${
        isUnfulfilled ? 'border-red-500/50' : isAccepted ? 'border-emerald-500/50' : 'border-[#FFF174]/60'
      } p-5 sm:p-6 shadow-[0_0_35px_rgba(255,241,116,0.15)] text-white space-y-4 ${className}`}
      role="region"
      aria-label="Active Assistance Incident Status"
    >
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <span className={`w-3 h-3 rounded-full ${isAccepted ? 'bg-emerald-400 animate-ping' : isUnfulfilled ? 'bg-red-500' : 'bg-[#FFF174] animate-pulse'}`} />
          <h2 className={`text-xs sm:text-sm font-black tracking-wider uppercase ${bannerColor}`}>
            {bannerTitle}
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
          <span className="text-[11px] sm:text-xs">
            {isOfflineLocal ? 'Local Draft' : 'Logged'}
          </span>
        </div>

        {/* Step 2: Helper accepted */}
        <div
          className={`flex items-center gap-1.5 font-bold ${
            isAccepted ? 'text-emerald-400' : isSearching ? 'text-[#FFF174]' : 'text-gray-400'
          }`}
        >
          {isAccepted ? (
            <CheckCircle2 size={16} className="shrink-0" />
          ) : isSearching ? (
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFF174] animate-pulse ml-1 shrink-0" />
          ) : (
            <Clock size={15} className="shrink-0 text-gray-500" />
          )}
          <span className="text-[11px] sm:text-xs">
            {isAccepted ? 'Accepted' : isSearching ? 'Matching' : 'Pending'}
          </span>
        </div>

        {/* Step 3: En route */}
        <div
          className={`flex items-center gap-1.5 font-bold ${
            isEnRoute ? 'text-emerald-400' : 'text-gray-500'
          }`}
        >
          {isEnRoute ? (
            <CheckCircle2 size={16} className="shrink-0" />
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

          {isAccepted && providerName ? (
            <>
              <strong className="text-base sm:text-lg font-black text-white block">
                {providerName}
              </strong>
              <div className="flex items-center gap-3 text-xs text-gray-300 mt-1">
                {distance && <span className="font-semibold text-white">{distance}</span>}
                {distance && eta && <span className="text-gray-500">•</span>}
                {eta && <span className="text-[#FFF174] font-bold">ETA {eta}</span>}
              </div>
            </>
          ) : isOfflineLocal ? (
            <div className="mt-1 flex items-center gap-2 text-xs text-amber-300">
              <AlertTriangle size={15} className="shrink-0 text-amber-400" />
              <span>Offline queue. Request will sync automatically when signal restores.</span>
            </div>
          ) : isUnfulfilled ? (
            <div className="mt-1 text-xs text-red-300">
              <span>No provider accepted in this sector. Direct 112 calling advised.</span>
            </div>
          ) : (
            <div className="mt-1 text-xs text-gray-300 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span>Querying verified 2-wheeler workshops within service radius...</span>
            </div>
          )}
        </div>

        {/* Tactile Action Buttons: [Call] [Track] [Cancel] */}
        <div className="flex items-center gap-2 pt-1 sm:pt-0">
          {isAccepted && providerPhone ? (
            <a
              href={`tel:${providerPhone}`}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-white/10 transition-all min-h-[44px]"
              aria-label={`Call helper at ${providerPhone}`}
            >
              <PhoneCall size={14} className="text-emerald-400" />
              <span>Call</span>
            </a>
          ) : (
            <a
              href="tel:112"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-red-500/40 min-h-[44px]"
              aria-label="Call Emergency Services 112"
            >
              <PhoneCall size={14} className="text-red-400" />
              <span>Call 112</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => navigate(`/requests/${requestId}`)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#FFF174] hover:bg-yellow-400 active:scale-95 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,241,116,0.3)] min-h-[44px] cursor-pointer"
          >
            <Navigation size={14} />
            <span>Details</span>
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
