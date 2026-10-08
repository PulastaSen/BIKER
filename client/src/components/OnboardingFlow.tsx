import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Wrench, Users, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { MountainBackground } from './graphics';

const ONBOARDING_KEY = 'motoassist_onboarding_completed_v1';

const SCREENS = [
  {
    icon: Shield,
    color: 'text-[#FFF174]',
    bgBadge: 'bg-[#FFF174]/15 border-[#FFF174]/30',
    tag: 'WELCOME TO MOTOASSIST',
    title: 'Your roadside companion.',
    desc: 'Never ride alone on Himalayan corridors or highway turns. Transparent breakdown help & verified mechanics at your fingertips.',
  },
  {
    icon: Wrench,
    color: 'text-amber-400',
    bgBadge: 'bg-amber-400/15 border-amber-400/30',
    tag: 'STRANDED & BREAKDOWN RESCUE',
    title: 'Get help when your bike breaks down.',
    desc: 'Puncture, dead battery, or snapped chain? Tap "I\'m Stranded" to broadcast your real GPS location to local verified mechanics and flatbed tow trucks.',
  },
  {
    icon: Users,
    color: 'text-emerald-400',
    bgBadge: 'bg-emerald-400/15 border-emerald-400/30',
    tag: 'FAMILY SAFETY CIRCLE',
    title: 'Keep your family informed during rides.',
    desc: 'Share live GPS route beacons, departure ETA, and route deviation alerts with loved ones. Peace of mind from departure to destination.',
  },
  {
    icon: AlertTriangle,
    color: 'text-red-400',
    bgBadge: 'bg-red-400/15 border-red-400/30',
    tag: 'CRITICAL EMERGENCY RESPONSE',
    title: 'Emergency? SOS gets you to the right help faster.',
    desc: 'Press and hold SOS for 3 seconds. Dispatches your phone\'s current location and coordinates with emergency responders.',
  },
];

export function OnboardingFlow() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleFinish = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentIndex < SCREENS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  if (!isOpen) return null;

  const current = SCREENS[currentIndex];
  const Icon = current.icon;
  const isLast = currentIndex === SCREENS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-[#111111] border border-white/15 rounded-[32px] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col justify-between min-h-[460px]"
      >
        <MountainBackground opacity={0.15} height={140} />

        {/* Top bar with step indicators & skip */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex gap-1.5">
            {SCREENS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-7 bg-[#FFF174]'
                    : i < currentIndex
                    ? 'w-3 bg-white/40'
                    : 'w-3 bg-white/15'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleFinish}
            className="text-xs font-bold text-gray-400 hover:text-white transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Main slide content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center my-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 text-left"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${current.bgBadge}`}>
                <Icon size={28} className={current.color} />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFF174] block mb-1">
                  {current.tag}
                </span>
                <h2 className="text-2xl font-black text-white leading-tight">
                  {current.title}
                </h2>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed">
                {current.desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="relative z-10 pt-4 flex items-center justify-between gap-3 border-t border-white/10">
          <div className="text-xs font-semibold text-gray-500">
            {currentIndex + 1} of {SCREENS.length}
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-3.5 rounded-2xl bg-[#FFF174] hover:bg-[#FCEB50] text-black font-black text-sm tracking-wide flex items-center gap-2 active:scale-95 transition-all shadow-[0_0_25px_rgba(255,241,116,0.3)]"
          >
            {isLast ? (
              <>
                <span>GET STARTED</span>
                <Check size={18} />
              </>
            ) : (
              <>
                <span>CONTINUE</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
