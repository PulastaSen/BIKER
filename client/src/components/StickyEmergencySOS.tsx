import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export function StickyEmergencySOS() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const HOLD_DURATION = 2500; // 2.5 seconds hold to prevent accidental activation

  // Hide on dedicated emergency pages to avoid redundancy
  const isEmergencyPage =
    location.pathname === '/sos' ||
    location.pathname === '/emergency' ||
    location.pathname === '/emergency-assist' ||
    location.pathname === '/entry' ||
    location.pathname === '/accident-assistant';

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (isEmergencyPage) return null;

  const startHold = () => {
    setIsHolding(true);
    setHoldProgress(0);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
    }, 40);

    holdTimerRef.current = setTimeout(() => {
      setIsHolding(false);
      setHoldProgress(100);
      navigate('/sos');
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsHolding(false);
    setHoldProgress(0);
  };

  return (
    <div className="fixed bottom-[74px] md:bottom-6 right-4 md:right-8 z-40 flex items-center gap-2 select-none">
      <div
        className="relative group cursor-pointer"
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        onTouchCancel={cancelHold}
        role="button"
        tabIndex={0}
        aria-label="Emergency SOS - Press and hold to activate"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate('/sos');
          }
        }}
      >
        {/* Subtle Outer Emergency Glow */}
        <span
          className="absolute -inset-1 rounded-full bg-red-600/40 blur-md animate-pulse pointer-events-none"
          aria-hidden="true"
        />

        {/* Progress Ring during Hold */}
        <div className="relative flex items-center gap-2.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_4px_25px_rgba(220,38,38,0.6)] border border-red-400/50 active:scale-95 transition-all overflow-hidden">
          {/* Fill overlay based on hold progress */}
          <div
            className="absolute inset-0 bg-red-950/80 transition-all pointer-events-none"
            style={{ width: `${100 - holdProgress}%`, right: 0, left: 'auto' }}
          />

          <div className="relative z-10 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              {isHolding ? (
                <AlertTriangle size={14} className="text-white animate-bounce" />
              ) : (
                <ShieldAlert size={15} className="text-white" />
              )}
            </span>
            <div className="flex flex-col text-left leading-tight">
              <span className="font-black text-white text-xs sm:text-sm">
                {isHolding ? `HOLD... ${Math.round((holdProgress / 100) * 3)}s` : 'SOS'}
              </span>
              <span className="text-[9px] text-red-200 lowercase tracking-normal font-medium">
                {isHolding ? 'Release to cancel' : 'Need emergency help?'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
