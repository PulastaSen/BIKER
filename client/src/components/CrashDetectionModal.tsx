import { useState, useEffect } from 'react';
import { AlertTriangle, PhoneCall, Check, BellRing } from 'lucide-react';
import type { CrashDetectionEvent } from '../types/app';
import { API_BASE_URL } from '../config/api';

interface CrashDetectionModalProps {
  event: CrashDetectionEvent | null;
  onDismiss: () => void;
  onEscalateSOS: () => void;
}

export function CrashDetectionModal({ event, onDismiss, onEscalateSOS }: CrashDetectionModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [isDismissing, setIsDismissing] = useState(false);
  const [escalated, setEscalated] = useState(false);

  useEffect(() => {
    if (!event) return;
    setSecondsLeft(10);
    setEscalated(false);

    // Audio/haptic notification if available
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeoutEscalation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [event]);

  if (!event) return null;

  const handleTimeoutEscalation = async () => {
    setEscalated(true);
    try {
      await fetch(`${API_BASE_URL}/api/crash/${event.eventId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userResponse: 'TIMEOUT_NO_RESPONSE', notes: '10s countdown expired without rider input' })
      });
    } catch {
      // offline
    }
    // Auto-prompt emergency escalation
    onEscalateSOS();
  };

  const handleImOk = async () => {
    setIsDismissing(true);
    try {
      await fetch(`${API_BASE_URL}/api/crash/${event.eventId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userResponse: 'CONFIRMED_SAFE', notes: 'False alarm - rider confirmed safe' })
      });
    } catch {
      // offline
    }
    onDismiss();
  };

  const handleSendSOS = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/crash/${event.eventId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userResponse: 'CONFIRMED_CRASH', notes: 'Rider confirmed emergency assistance needed' })
      });
    } catch {
      // offline
    }
    onEscalateSOS();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="crash-modal-title"
    >
      <div className="w-full max-w-sm rounded-3xl bg-[#140D0D] border-2 border-red-500/60 p-6 text-center space-y-5 shadow-[0_0_50px_rgba(239,68,68,0.35)]">
        
        {/* Urgent Warning Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-400 animate-pulse">
            <AlertTriangle size={32} />
          </div>
          <h2 id="crash-modal-title" className="text-xl font-black text-white uppercase tracking-tight">
            ⚠ Possible Crash Detected
          </h2>
          <p className="text-xs text-gray-300">
            We detected unusual sudden movement ({event.impactForceG ? `${event.impactForceG}G impact` : 'motion shock'}).
          </p>
        </div>

        {/* 10-Second Countdown Dial */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-white/10"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-red-500 transition-all duration-1000"
              strokeDasharray={`${(secondsLeft / 10) * 100}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute text-2xl font-black text-white">
            {secondsLeft}s
          </div>
        </div>

        <p className="text-sm font-bold text-white">
          {escalated ? 'No response received — preparing safety escalation...' : 'Are you okay?'}
        </p>

        {/* THREE ESSENTIAL ACTIONS (Section 23 & 25) */}
        <div className="space-y-2.5">
          {/* 1. I'M OK (Dismiss False Alarm) */}
          <button
            type="button"
            onClick={handleImOk}
            disabled={isDismissing}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 cursor-pointer transition-all"
          >
            <Check size={20} />
            <span>[ I'M OK ] (False Alarm)</span>
          </button>

          {/* 2. SEND SOS */}
          <button
            type="button"
            onClick={handleSendSOS}
            className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-98 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 cursor-pointer transition-all"
          >
            <BellRing size={18} />
            <span>[ SEND SOS NOW ]</span>
          </button>

          {/* 3. CALL 112 */}
          <a
            href="tel:112"
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-98 text-gray-200 font-bold text-xs uppercase flex items-center justify-center gap-2 border border-white/15 transition-all"
          >
            <PhoneCall size={16} className="text-red-400" />
            <span>[ CALL 112 NATIONAL POLICE ]</span>
          </a>
        </div>

        <p className="text-[10px] text-gray-400">
          If you don't respond, MotoAssist will follow your configured emergency escalation policy.
        </p>
      </div>
    </div>
  );
}
