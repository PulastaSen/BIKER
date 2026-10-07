import { useState, useEffect } from 'react';
import { WifiOff, PhoneCall, RefreshCw, CheckCircle2 } from 'lucide-react';

export function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [reconnected, setReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setReconnected(true);
      const timer = setTimeout(() => setReconnected(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (reconnected) {
    return (
      <div 
        role="status" 
        className="fixed top-0 inset-x-0 z-[100] bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all duration-300"
      >
        <CheckCircle2 size={16} />
        <span>Back online. Real-time sync restored.</span>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div 
      role="alert" 
      className="fixed top-0 inset-x-0 z-[100] bg-[#EF4444] text-white px-4 py-2.5 text-xs font-bold shadow-xl flex flex-wrap items-center justify-between gap-3 animate-fade-in"
    >
      <div className="flex items-center gap-2">
        <WifiOff size={16} className="animate-pulse shrink-0" />
        <span>You're offline. Live GPS dispatch is paused. If in immediate danger, call emergency services directly:</span>
      </div>

      <div className="flex items-center gap-2">
        <a 
          href="tel:112" 
          className="px-2.5 py-1 bg-white text-black text-[11px] font-black rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1 shadow-sm"
        >
          <PhoneCall size={12} className="text-[#EF4444]" /> Call 112
        </a>
        <a 
          href="tel:108" 
          className="px-2.5 py-1 bg-black/40 text-white text-[11px] font-bold rounded-lg hover:bg-black/60 transition-colors flex items-center gap-1 border border-white/20"
        >
          <PhoneCall size={12} /> Call 108
        </a>
        <button 
          onClick={() => window.location.reload()}
          className="px-2.5 py-1 bg-black/20 text-white text-[11px] font-bold rounded-lg hover:bg-black/40 transition-colors flex items-center gap-1"
          title="Retry network connection"
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    </div>
  );
}
