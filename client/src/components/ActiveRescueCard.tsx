import { Truck, Check, Navigation, Phone, MessageSquare, ShieldCheck } from 'lucide-react';
import { FlatbedTruckGraphic } from './FlatbedTruckGraphic';
import type { HelpRequest } from '../types/app';

interface ActiveRescueCardProps {
  request?: HelpRequest;
  onTrackOnMap: () => void;
  onRequestHelp?: () => void;
  className?: string;
}

/**
 * ActiveRescueCard — Exact reproduction of the green-bordered Active Rescue card
 * with White Recovery Flatbed, WB-74-9812, 2.4 km away, 12 min ETA,
 * 4-stage timeline (Logged -> Accepted -> En Route -> Arriving),
 * Track on Map, Call, and Chat buttons.
 *
 * Integrates real HelpRequest data when active, and displays the matching
 * empty state when no rescue is active as mandated by Section 7.
 */
export function ActiveRescueCard({
  request,
  onTrackOnMap,
  onRequestHelp,
  className = '',
}: ActiveRescueCardProps) {
  // If no active request, render empty state in the exact same design system
  if (!request) {
    return (
      <div
        className={`w-full rounded-2xl bg-[#131917] border border-emerald-500/40 p-4 sm:p-5 shadow-lg space-y-3.5 select-none ${className}`}
        role="region"
        aria-label="No Active Rescue — Network Standby"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Truck size={18} />
            <span className="text-white font-display font-bold">Your Active Rescue</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0A2518] border border-emerald-500/40 text-xs font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Standby 24/7</span>
          </div>
        </div>

        {/* Empty State Body */}
        <div className="flex items-center gap-3 py-1">
          <div className="w-11 h-11 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} className="text-emerald-400" />
          </div>
          <div className="leading-tight">
            <strong className="text-xs sm:text-sm font-bold text-white block">
              No Active Rescue Incident
            </strong>
            <p className="text-[11px] text-[#8A96A3] mt-0.5">
              All systems clear. Emergency flatbeds & mountain rescue mechanics are on standby in Siliguri Sector.
            </p>
          </div>
        </div>

        {/* Action Button */}
        {onRequestHelp && (
          <button
            type="button"
            onClick={onRequestHelp}
            className="w-full py-2.5 px-4 rounded-xl bg-[#F5B041] hover:bg-yellow-400 active:scale-95 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Truck size={16} />
            <span>Request Roadside Rescue</span>
          </button>
        )}
      </div>
    );
  }

  // Active Rescue Data Mapping
  const providerTitle =
    request.assignedHelperName?.split('(')[0]?.trim() ||
    (request.towingRequired ? 'White Recovery Flatbed' : 'Siliguri Auto Care & Rescue');

  const vehiclePlate = 'WB-74-9812';
  const distance = '2.4 km away';
  const etaTime = '12 min';
  const providerPhone = request.assignedHelperPhone || '+91 98320 12345';
  const rawStatus = request.status;

  // Determine Timeline Progress
  const isAccepted = ['HELPER_OFFERED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'RESOLVED'].includes(rawStatus);
  const isEnRoute = ['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'RESOLVED'].includes(rawStatus) || rawStatus === 'HELPER_OFFERED';

  const statusLabel = isAccepted ? 'Confirmed' : 'Searching';

  return (
    <div
      className={`w-full rounded-2xl bg-[#131917] border-2 border-emerald-500/70 shadow-[0_0_18px_rgba(16,185,129,0.18)] p-4 sm:p-5 space-y-3.5 select-none ${className}`}
      role="region"
      aria-label="Your Active Rescue Status Card"
    >
      {/* 1. Top Header Row: Green Tow Truck + Title + Confirmed Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Truck size={18} />
          <span className="text-white font-display font-bold">Your Active Rescue</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0A2518] border border-emerald-500/40 text-xs font-semibold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* 2. Middle Details Row: Flatbed Truck Graphic + Info + ETA Box */}
      <div className="flex items-center justify-between gap-3 pt-0.5">
        {/* Left: Realistic White Recovery Flatbed Graphic */}
        <div className="shrink-0 flex items-center justify-center">
          <FlatbedTruckGraphic width={84} height={50} />
        </div>

        {/* Center: Vehicle Details & Distance */}
        <div className="flex-1 min-w-0 leading-tight">
          <h4 className="text-[13px] sm:text-[14px] font-bold text-white truncate font-sans">
            {providerTitle || 'White Recovery Flatbed'}
          </h4>
          <p className="text-[11px] sm:text-[12px] text-[#8A96A3] mt-0.5 truncate font-sans">
            {vehiclePlate} · {distance}
          </p>
        </div>

        {/* Right: ETA Badge Box */}
        <div className="shrink-0 bg-[#1C2224] border border-white/10 rounded-xl px-2.5 py-1.5 text-center min-w-[62px] shadow-sm">
          <span className="text-[14px] sm:text-[15px] font-bold text-[#F5B041] block leading-none font-sans">
            {etaTime}
          </span>
          <span className="text-[9px] font-bold text-[#8A96A3] uppercase tracking-wider block mt-1 leading-none font-sans">
            ETA
          </span>
        </div>
      </div>

      {/* 3. Progress Timeline: Logged → Accepted → En Route → Arriving */}
      <div className="pt-2 pb-1" aria-label="Rescue Dispatch Timeline">
        <div className="flex items-center justify-between relative px-2">
          {/* Node 1: Logged */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-sm">
              <Check size={12} strokeWidth={3} />
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1.5">
              Logged
            </span>
          </div>

          {/* Line 1 */}
          <div
            className={`flex-1 h-[2px] mx-1 -mt-4 transition-colors ${
              isAccepted ? 'bg-emerald-500' : 'bg-[#2E3640]'
            }`}
          />

          {/* Node 2: Accepted */}
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                isAccepted
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'bg-[#181D24] border border-white/20 text-gray-500'
              }`}
            >
              {isAccepted ? <Check size={12} strokeWidth={3} /> : null}
            </div>
            <span
              className={`text-[10px] font-semibold mt-1.5 ${
                isAccepted ? 'text-emerald-400' : 'text-gray-500'
              }`}
            >
              Accepted
            </span>
          </div>

          {/* Line 2 */}
          <div
            className={`flex-1 h-[2px] mx-1 -mt-4 transition-colors ${
              isEnRoute ? 'bg-emerald-500' : 'bg-[#2E3640]'
            }`}
          />

          {/* Node 3: En Route (Active Stage with Yellow Pulsing Ring) */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-5 h-5 rounded-full border-2 border-yellow-400 bg-[#1D2224] flex items-center justify-center shadow-[0_0_8px_rgba(250,204,21,0.5)]">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            </div>
            <span className="text-[10px] text-yellow-400 font-bold mt-1.5">
              En Route
            </span>
          </div>

          {/* Line 3 */}
          <div className="flex-1 h-[2px] mx-1 -mt-4 bg-[#2E3640]" />

          {/* Node 4: Arriving */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-5 h-5 rounded-full border border-gray-600 bg-[#1A1F24]" />
            <span className="text-[10px] text-gray-500 font-medium mt-1.5">
              Arriving
            </span>
          </div>
        </div>
      </div>

      {/* 4. Action Buttons Row: Track on Map (Yellow) + Call (Phone) + Chat (Message) */}
      <div className="flex items-center gap-2.5 pt-1">
        {/* Main Prominent Yellow Tracking Button */}
        <button
          type="button"
          onClick={onTrackOnMap}
          className="flex-1 h-11 px-4 rounded-xl bg-[#F5B041] hover:bg-yellow-400 active:scale-95 text-black font-extrabold text-[13px] sm:text-[14px] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer font-sans"
        >
          <Navigation size={15} className="rotate-45 shrink-0 fill-black" />
          <span>Track on Map</span>
        </button>

        {/* Call Provider Button */}
        <a
          href={`tel:${providerPhone.replace(/\s+/g, '')}`}
          className="w-11 h-11 rounded-xl bg-[#1C2326] hover:bg-[#252D32] border border-white/10 active:scale-95 flex items-center justify-center text-emerald-400 transition-colors shrink-0 shadow-sm"
          title={`Call Provider (${providerPhone})`}
          aria-label="Call Assistance Provider"
        >
          <Phone size={18} />
        </a>

        {/* Chat Provider Button */}
        <a
          href={`https://wa.me/${providerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            `Hi, checking status on MotoAssist rescue #${request.id} for vehicle ${vehiclePlate}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 rounded-xl bg-[#1C2326] hover:bg-[#252D32] border border-white/10 active:scale-95 flex items-center justify-center text-white transition-colors shrink-0 shadow-sm"
          title="Chat via WhatsApp"
          aria-label="Chat with Assistance Provider"
        >
          <MessageSquare size={18} />
        </a>
      </div>
    </div>
  );
}
