import { Siren, ChevronRight } from 'lucide-react';

interface SOSButtonProps {
  onTriggerSOS: () => void;
  className?: string;
}

/**
 * SOSButton — Exact reproduction of the prominent red glowing SOS button
 * "SOS · GET HELP NOW" with siren beacon and illuminated red border.
 */
export function SOSButton({ onTriggerSOS, className = '' }: SOSButtonProps) {
  return (
    <button
      type="button"
      onClick={onTriggerSOS}
      className={`w-full h-[52px] px-5 rounded-full bg-gradient-to-r from-[#C62828] via-[#E53935] to-[#B71C1C] border border-red-400/80 shadow-[0_0_22px_rgba(239,68,68,0.55)] hover:shadow-[0_0_28px_rgba(239,68,68,0.75)] active:scale-[0.98] transition-all flex items-center justify-between text-white group cursor-pointer select-none ${className}`}
      aria-label="SOS Get Help Now — Immediate Emergency Rescue"
    >
      {/* Left Emergency Siren Beacon */}
      <div className="flex items-center justify-center shrink-0">
        <Siren size={20} className="text-white group-hover:rotate-12 transition-transform" />
      </div>

      {/* Center Action Typography */}
      <span className="font-display font-black tracking-wider text-[14px] sm:text-[15px] uppercase text-white">
        SOS · GET HELP NOW
      </span>

      {/* Right Chevron Navigation Arrow */}
      <div className="flex items-center justify-center shrink-0">
        <ChevronRight size={20} className="text-white/90 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  );
}
