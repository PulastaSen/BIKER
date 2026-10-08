import { useState, useEffect } from 'react';
import { WifiOff, PhoneCall, RefreshCw, CheckCircle2, Users } from 'lucide-react';
import { fetchFamilyCircle } from '../services/ecosystemApi';

export function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [reconnected, setReconnected] = useState(false);
  const [familyPhone, setFamilyPhone] = useState('+91 98765 43210');

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

    fetchFamilyCircle().then((members) => {
      if (members && members.length > 0 && members[0].phone) {
        setFamilyPhone(members[0].phone);
      }
    });

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
      className="fixed top-0 inset-x-0 z-[100] bg-[#1A0E0E] border-b border-red-500/50 text-white px-4 py-2.5 text-xs font-medium shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in"
    >
      <div className="flex items-center gap-2 text-red-200">
        <WifiOff size={16} className="text-red-400 animate-pulse shrink-0" />
        <span className="font-bold text-white">⚠️ LOW CONNECTIVITY</span>
        <span className="hidden sm:inline text-gray-300">
          • Live updates paused. Emergency phone dialers remain active.
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <a 
          href="tel:112" 
          className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-black rounded-lg transition-colors flex items-center gap-1 shadow-sm"
        >
          <PhoneCall size={12} /> Call 112
        </a>
        <a 
          href={`tel:${familyPhone.replace(/[^0-9+]/g, '')}`} 
          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 border border-white/20"
        >
          <Users size={12} className="text-[#FFF174]" /> Call Family
        </a>
        <button 
          type="button"
          onClick={() => window.location.reload()}
          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          title="Retry network connection"
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    </div>
  );
}
