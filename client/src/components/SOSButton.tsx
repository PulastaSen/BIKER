import { Siren, ChevronRight } from 'lucide-react';

interface SOSButtonProps {
  onTriggerSOS: () => void;
  className?: string;
}

/**
 * SOSButton — Prominent red glowing SOS button
 * "SOS · GET HELP NOW" with siren beacon and illuminated red border.
 */
export function SOSButton({ onTriggerSOS, className = '' }: SOSButtonProps) {
  return (
    <button
      type="button"
      onClick={onTriggerSOS}
      className={`w-full h-[52px] md:h-[58px] px-5 md:px-7 rounded-full bg-gradient-to-r from-[#C62828] via-[#E53935] to-[#B71C1C] border border-red-400/80 shadow-[0_0_22px_rgba(239,68,68,0.55)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)] active:scale-[0.98] transition-all flex items-center justify-between text-white group cursor-pointer select-none ${className}`}
      aria-label="SOS Get Help Now — Immediate Emergency Rescue"
    >
      {/* Left Emergency Siren Beacon */}
      <div className="flex items-center justify-center shrink-0">
        <Siren size={20} className="text-white group-hover:rotate-12 transition-transform md:w-6 md:h-6" />
      </div>

      {/* Center Action Typography */}
      <span className="font-display font-black tracking-wider text-[14px] sm:text-[15px] md:text-[16px] uppercase text-white">
        SOS · GET HELP NOW
      </span>

      {/* Right Chevron Navigation Arrow */}
      <div className="flex items-center justify-center shrink-0">
        <ChevronRight size={20} className="text-white/90 group-hover:translate-x-1 transition-transform md:w-6 md:h-6" />
      </div>
    </button>
  );
}
