import { Wrench, HeartPulse, ShieldCheck, Truck, ChevronRight, ArrowRight } from 'lucide-react';

interface AssistanceGridProps {
  onSelectBikeHelp: () => void;
  onSelectMedicalHelp: () => void;
  onSelectSafety: () => void;
  onSelectTowing: () => void;
  onViewAll: () => void;
  className?: string;
}

/**
 * AssistanceGrid — Two-column 4-card assistance grid
 * 1. Bike Help (Yellow wrench)
 * 2. Medical Help (Pink medical heart pulse)
 * 3. Personal Safety (Blue shield check)
 * 4. Towing & Recovery (Purple recovery truck)
 */
export function AssistanceGrid({
  onSelectBikeHelp,
  onSelectMedicalHelp,
  onSelectSafety,
  onSelectTowing,
  onViewAll,
  className = '',
}: AssistanceGridProps) {
  return (
    <section aria-labelledby="need-assistance-heading" className={`space-y-3 md:space-y-4 ${className}`}>
      {/* Section Header: "Need assistance?" and "View all ->" */}
      <div className="flex items-center justify-between px-1">
        <h3
          id="need-assistance-heading"
          className="text-[16px] sm:text-[17px] md:text-[19px] font-display font-bold text-white tracking-tight"
        >
          Need assistance?
        </h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-[12px] md:text-[13px] font-semibold text-[#F5B041] hover:text-yellow-400 flex items-center gap-1 transition-colors cursor-pointer select-none"
        >
          <span>View all</span>
          <ArrowRight size={13} className="inline md:w-4 md:h-4" />
        </button>
      </div>

      {/* 2-Column Grid (Two squares below the banner) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:gap-4">
        {/* 1. Bike Help */}
        <div
          onClick={onSelectBikeHelp}
          className="p-3 sm:p-3.5 md:p-5 rounded-2xl bg-[#181D24] border border-white/5 hover:border-[#F5B041]/40 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between gap-2 md:gap-3 shadow-md group min-h-[76px] md:min-h-[92px]"
          role="button"
          tabIndex={0}
          aria-label="Bike Help: Puncture, battery, engine & more"
        >
          <div className="flex items-center gap-2.5 md:gap-3.5 min-w-0">
            {/* Yellow Wrench Icon */}
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-[#282215] border border-[#F5B041]/30 flex items-center justify-center shrink-0 shadow-sm">
              <Wrench size={18} className="text-[#F5B041] group-hover:scale-110 transition-transform md:w-5 md:h-5" />
            </div>
            <div className="flex flex-col min-w-0 leading-tight">
              <strong className="text-[13px] sm:text-[14px] md:text-[15px] font-bold text-white group-hover:text-[#F5B041] transition-colors truncate">
                Bike Help
              </strong>
              <span className="text-[10px] sm:text-[11px] md:text-[12px] text-[#8A96A3] mt-0.5 md:mt-1 line-clamp-2">
                Puncture, battery, engine & more
              </span>
            </div>
          </div>
          <ChevronRight size={14} className="text-[#6B7280] shrink-0 group-hover:translate-x-0.5 transition-transform md:w-4 md:h-4" />
        </div>

        {/* 2. Medical Help */}
        <div
          onClick={onSelectMedicalHelp}
          className="p-3 sm:p-3.5 md:p-5 rounded-2xl bg-[#181D24] border border-white/5 hover:border-[#F43F5E]/40 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between gap-2 md:gap-3 shadow-md group min-h-[76px] md:min-h-[92px]"
          role="button"
          tabIndex={0}
          aria-label="Medical Help: Hospital, ambulance, emergency care"
        >
          <div className="flex items-center gap-2.5 md:gap-3.5 min-w-0">
            {/* Pink Medical Icon */}
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-[#2D151D] border border-[#F43F5E]/30 flex items-center justify-center shrink-0 shadow-sm">
              <HeartPulse size={18} className="text-[#F43F5E] group-hover:scale-110 transition-transform md:w-5 md:h-5" />
            </div>
            <div className="flex flex-col min-w-0 leading-tight">
              <strong className="text-[13px] sm:text-[14px] md:text-[15px] font-bold text-white group-hover:text-[#F43F5E] transition-colors truncate">
                Medical Help
              </strong>
              <span className="text-[10px] sm:text-[11px] md:text-[12px] text-[#8A96A3] mt-0.5 md:mt-1 line-clamp-2">
                Hospital, ambulance, emergency care
              </span>
            </div>
          </div>
          <ChevronRight size={14} className="text-[#6B7280] shrink-0 group-hover:translate-x-0.5 transition-transform md:w-4 md:h-4" />
        </div>

        {/* 3. Personal Safety */}
        <div
          onClick={onSelectSafety}
          className="p-3 sm:p-3.5 md:p-5 rounded-2xl bg-[#181D24] border border-white/5 hover:border-[#38BDF8]/40 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between gap-2 md:gap-3 shadow-md group min-h-[76px] md:min-h-[92px]"
          role="button"
          tabIndex={0}
          aria-label="Personal Safety: Share location, contact family"
        >
          <div className="flex items-center gap-2.5 md:gap-3.5 min-w-0">
            {/* Blue Shield Icon */}
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-[#112530] border border-[#38BDF8]/30 flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck size={18} className="text-[#38BDF8] group-hover:scale-110 transition-transform md:w-5 md:h-5" />
            </div>
            <div className="flex flex-col min-w-0 leading-tight">
              <strong className="text-[13px] sm:text-[14px] md:text-[15px] font-bold text-white group-hover:text-[#38BDF8] transition-colors truncate">
                Personal Safety
              </strong>
              <span className="text-[10px] sm:text-[11px] md:text-[12px] text-[#8A96A3] mt-0.5 md:mt-1 line-clamp-2">
                Share location, contact family
              </span>
            </div>
          </div>
          <ChevronRight size={14} className="text-[#6B7280] shrink-0 group-hover:translate-x-0.5 transition-transform md:w-4 md:h-4" />
        </div>

        {/* 4. Towing & Recovery */}
        <div
          onClick={onSelectTowing}
          className="p-3 sm:p-3.5 md:p-5 rounded-2xl bg-[#181D24] border border-white/5 hover:border-[#C084FC]/40 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between gap-2 md:gap-3 shadow-md group min-h-[76px] md:min-h-[92px]"
          role="button"
          tabIndex={0}
          aria-label="Towing & Recovery: Breakdown, accident, vehicle towing"
        >
          <div className="flex items-center gap-2.5 md:gap-3.5 min-w-0">
            {/* Purple Towing Icon */}
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-[#241733] border border-[#C084FC]/30 flex items-center justify-center shrink-0 shadow-sm">
              <Truck size={18} className="text-[#C084FC] group-hover:scale-110 transition-transform md:w-5 md:h-5" />
            </div>
            <div className="flex flex-col min-w-0 leading-tight">
              <strong className="text-[13px] sm:text-[14px] md:text-[15px] font-bold text-white group-hover:text-[#C084FC] transition-colors truncate">
                Towing & Recovery
              </strong>
              <span className="text-[10px] sm:text-[11px] md:text-[12px] text-[#8A96A3] mt-0.5 md:mt-1 line-clamp-2">
                Breakdown, accident, vehicle towing
              </span>
            </div>
          </div>
          <ChevronRight size={14} className="text-[#6B7280] shrink-0 group-hover:translate-x-0.5 transition-transform md:w-4 md:h-4" />
        </div>
      </div>
    </section>
  );
}
