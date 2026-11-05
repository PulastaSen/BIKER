import { PhoneCall, Navigation, XCircle, CheckCircle2, Clock, AlertTriangle, MessageCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ActiveIncidentHUDProps {
  requestId: string;
  issueCategory?: string;
  providerName?: string;
  providerPhone?: string;
  providerVehicle?: string;
  providerRating?: string | number;
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
  providerVehicle = 'White Recovery Flatbed • WB-74-9812',
  providerRating = '4.8',
  distance = '2.4 km away',
  eta = '12 mins',
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

  // Status banner title
  const bannerTitle = isOfflineLocal
    ? 'OFFLINE INCIDENT — SAVED ON DEVICE'
    : isCancelled
    ? 'INCIDENT CANCELLED'
    : isUnfulfilled
    ? 'NO PROVIDER AVAILABLE IN SECTOR'
    : isAccepted
    ? 'CONFIRMED RESCUE DISPATCHED'
    : 'SEARCHING FOR NEARBY RESCUE TRUCK';

  const bannerColor = isOfflineLocal
    ? 'text-amber-400'
    : isCancelled
    ? 'text-gray-400'
    : isUnfulfilled
    ? 'text-red-400'
    : isAccepted
    ? 'text-[#10B981]'
    : 'text-[#FFF174]';

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl bg-[#1A2026] border-2 ${
        isUnfulfilled ? 'border-red-500/50' : isAccepted ? 'border-[#FFF174]/70' : 'border-[#2E3844]'
      } p-4 sm:p-5 shadow-2xl text-white space-y-3.5 sm:space-y-4 ${className}`}
      role="region"
      aria-label="Active Assistance Incident Status"
    >
      {/* Top Header & Incident ID */}
      <div className="flex items-center justify-between border-b border-[#2E3844] pb-3">
        <div className="flex items-center gap-2.5">
          <span className={`w-3 h-3 rounded-full ${isAccepted ? 'bg-[#10B981] animate-ping' : isUnfulfilled ? 'bg-red-500' : 'bg-[#FFF174] animate-pulse'}`} />
          <h2 className={`text-xs sm:text-sm font-black tracking-wider uppercase ${bannerColor}`}>
            {bannerTitle}
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold text-[#94A3B8] bg-[#242D37] px-2.5 py-1 rounded-full border border-[#2E3844]">
          #{requestId}
        </span>
      </div>

      {/* Agicent Inspiration: Arrival ETA Badge */}
      {isAccepted && (
        <div className="flex items-center justify-between bg-[#12161A] border border-[#2E3844] rounded-xl px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#FFF174]" />
            <span className="text-xs sm:text-sm font-bold text-white">Your Tow Vehicle Is Arriving In</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-[#FFF174] text-[#12161A] font-black text-xs sm:text-sm shadow-md animate-pulse">
            {eta}
          </span>
        </div>
      )}

      {/* 3-Step Live Progress Indicator */}
      <div className="grid grid-cols-3 gap-2 text-xs bg-[#12161A] p-2.5 rounded-xl border border-[#2E3844]">
        {/* Step 1: Request received */}
        <div className="flex items-center gap-1.5 text-[#10B981] font-bold">
          <CheckCircle2 size={15} className="shrink-0" />
          <span className="text-[11px] sm:text-xs">
            {isOfflineLocal ? 'Local Draft' : 'Logged'}
          </span>
        </div>

        {/* Step 2: Helper accepted */}
        <div
          className={`flex items-center gap-1.5 font-bold ${
            isAccepted ? 'text-[#10B981]' : isSearching ? 'text-[#FFF174]' : 'text-gray-400'
          }`}
        >
          {isAccepted ? (
            <CheckCircle2 size={15} className="shrink-0" />
          ) : isSearching ? (
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFF174] animate-pulse ml-0.5 shrink-0" />
          ) : (
            <Clock size={14} className="shrink-0 text-gray-500" />
          )}
          <span className="text-[11px] sm:text-xs">
            {isAccepted ? 'Accepted' : isSearching ? 'Matching' : 'Pending'}
          </span>
        </div>

        {/* Step 3: En route */}
        <div
          className={`flex items-center gap-1.5 font-bold ${
            isEnRoute ? 'text-[#10B981]' : 'text-gray-500'
          }`}
        >
          {isEnRoute ? (
            <CheckCircle2 size={15} className="shrink-0" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-gray-600 ml-0.5 shrink-0" />
          )}
          <span className="text-[11px] sm:text-xs">En route</span>
        </div>
      </div>

      {/* Provider Snapshot Card (Agicent Phone 3 Driver Card layout) */}
      <div className="bg-[#1E252D] border border-[#2E3844] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          {/* Driver Avatar with Star */}
          {isAccepted && (
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-[#2E3844] border-2 border-[#FFF174] flex items-center justify-center font-black text-white text-base">
                {(providerName || 'Joseph Gonzalez').charAt(0)}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-[#12161A] border border-[#2E3844] text-[#FFF174] px-1.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-0.5 shadow">
                <Star size={9} className="fill-[#FFF174] text-[#FFF174]" /> {providerRating}
              </span>
            </div>
          )}

          <div>
            <span className="text-[10px] font-black uppercase text-[#94A3B8] tracking-wider block">
              {issueCategory}
            </span>

            {isAccepted && providerName ? (
              <>
                <strong className="text-sm sm:text-base font-bold text-white block">
                  {providerName}
                </strong>
                <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                  {providerVehicle} {distance ? `• ${distance}` : ''}
                </p>
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
              <div className="mt-1 text-xs text-[#94A3B8] flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#FFF174] animate-pulse" />
                <span>Querying verified recovery trucks within service radius...</span>
              </div>
            )}
          </div>
        </div>

        {/* Tactile Action Buttons: [Call] [WhatsApp] [Cancel] [Details] */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0 w-full sm:w-auto">
          {isAccepted && providerPhone ? (
            <>
              <a
                href={`tel:${providerPhone}`}
                className="w-10 h-10 rounded-xl bg-[#12161A] hover:bg-[#242D37] active:scale-95 text-[#10B981] border border-[#2E3844] flex items-center justify-center transition-all shadow shrink-0"
                aria-label={`Call helper at ${providerPhone}`}
                title="Call Rescue Provider"
              >
                <PhoneCall size={16} />
              </a>

              <a
                href={`https://wa.me/${providerPhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-[#12161A] hover:bg-[#242D37] active:scale-95 text-emerald-400 border border-[#2E3844] flex items-center justify-center transition-all shadow shrink-0"
                aria-label="Chat on WhatsApp"
                title="WhatsApp Rescue Provider"
              >
                <MessageCircle size={16} />
              </a>
            </>
          ) : (
            <a
              href="tel:112"
              className="px-3.5 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-red-500/40 min-h-[40px]"
              aria-label="Call Emergency Services 112"
            >
              <PhoneCall size={14} className="text-red-400" />
              <span>Call 112</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => navigate(`/requests/${requestId}`)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#FFF174] hover:bg-yellow-400 active:scale-95 text-[#12161A] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow min-h-[40px] cursor-pointer"
          >
            <Navigation size={14} />
            <span>Map & Track</span>
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 active:scale-95 text-red-300 font-bold text-xs uppercase tracking-wider border border-red-500/40 transition-all min-h-[40px] cursor-pointer"
              title="Cancel booking"
            >
              <XCircle size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
