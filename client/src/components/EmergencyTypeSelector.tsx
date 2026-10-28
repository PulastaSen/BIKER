import React from 'react';
import { 
  Wrench, 
  HeartPulse, 
  ShieldAlert, 
  Truck, 
  Shuffle, 
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import type { HelpCategory } from '../types/app';

interface EmergencyTypeSelectorProps {
  selectedCategory: HelpCategory | null;
  onSelect: (category: HelpCategory) => void;
}

interface CategoryOption {
  id: HelpCategory;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  borderClass: string;
  bgClass: string;
  activeBgClass: string;
  badgeText: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'MECHANICAL',
    title: '🔧 MECHANICAL',
    subtitle: 'Mechanic, OEM, puncture, battery, fuel, roadside fix',
    icon: <Wrench size={26} className="text-[#FFF174]" />,
    borderClass: 'hover:border-[#FFF174]/70',
    bgClass: 'bg-[#151515]',
    activeBgClass: 'bg-[#FFF174]/15 border-[#FFF174] ring-2 ring-[#FFF174]/40',
    badgeText: 'Puncture • Battery • Engine'
  },
  {
    id: 'MEDICAL',
    title: '🚑 MEDICAL',
    subtitle: 'Ambulance (108), hospital, doctor, pharmacy, first aid',
    icon: <HeartPulse size={26} className="text-red-400" />,
    borderClass: 'hover:border-red-500/70',
    bgClass: 'bg-[#181111]',
    activeBgClass: 'bg-red-950/40 border-red-500 ring-2 ring-red-500/40',
    badgeText: 'Trauma • Ambulance • ICU'
  },
  {
    id: 'SAFETY',
    title: '🛡️ SAFETY / EMERGENCY',
    subtitle: 'Call 112, police, followed, feeling unsafe, safe haven',
    icon: <ShieldAlert size={26} className="text-amber-400" />,
    borderClass: 'hover:border-amber-500/70',
    bgClass: 'bg-[#181510]',
    activeBgClass: 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/40',
    badgeText: 'Police 112 • Safe Haven'
  },
  {
    id: 'RECOVERY',
    title: '🛠️ BIKE RECOVERY',
    subtitle: 'Towing truck, flatbed carrier, stranded bike transport',
    icon: <Truck size={26} className="text-blue-400" />,
    borderClass: 'hover:border-blue-500/70',
    bgClass: 'bg-[#10141A]',
    activeBgClass: 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/40',
    badgeText: 'Flatbed • Towing Truck'
  },
  {
    id: 'BOTH',
    title: '🔀 BOTH (MEDICAL + BIKE)',
    subtitle: 'Crash coordination: medical rescue + bike towing in 1 flow',
    icon: <Shuffle size={26} className="text-purple-400" />,
    borderClass: 'hover:border-purple-500/70',
    bgClass: 'bg-[#16111C]',
    activeBgClass: 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/40',
    badgeText: 'Coordinated Crash Response'
  },
  {
    id: 'UNKNOWN',
    title: "❓ I'M NOT SURE",
    subtitle: 'Guided diagnosis with simple questions to determine help',
    icon: <HelpCircle size={26} className="text-gray-300" />,
    borderClass: 'hover:border-white/50',
    bgClass: 'bg-[#141414]',
    activeBgClass: 'bg-white/10 border-white/60 ring-2 ring-white/20',
    badgeText: 'Guided Safety Triage'
  }
];

export function EmergencyTypeSelector({ selectedCategory, onSelect }: EmergencyTypeSelectorProps) {
  return (
    <div className="space-y-3" role="region" aria-label="Help Category Selection">
      <div className="text-left">
        <label className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-1">
          WHAT KIND OF HELP DO YOU NEED?
        </label>
        <p className="text-[11px] text-gray-400">
          Select what best describes your situation to filter the right emergency responders.
        </p>
      </div>

      <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-2 sm:gap-2.5">
        {CATEGORY_OPTIONS.map((opt) => {
          const isSelected = selectedCategory === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`p-3 sm:p-4 rounded-2xl border text-left transition-all active:scale-98 flex flex-col justify-between min-h-[140px] cursor-pointer relative ${
                isSelected
                  ? opt.activeBgClass
                  : `${opt.bgClass} border-white/10 ${opt.borderClass}`
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                    {opt.icon}
                  </div>
                  {isSelected && (
                    <div className="text-white animate-in zoom-in-75">
                      <CheckCircle2 size={18} className="text-[#FFF174]" />
                    </div>
                  )}
                </div>

                <strong className="text-xs sm:text-sm font-black text-white tracking-tight block truncate">
                  {opt.title}
                </strong>
                <p className="text-[10px] sm:text-[11px] text-gray-300 leading-snug mt-1 line-clamp-2">
                  {opt.subtitle}
                </p>
              </div>

              <div className="mt-2 pt-1 border-t border-white/10">
                <span className="inline-block px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-gray-300 uppercase truncate max-w-full">
                  {opt.badgeText}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
