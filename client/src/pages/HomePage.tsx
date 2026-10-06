import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Wrench, Map as MapIcon, ShieldCheck, ChevronRight } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#090909] min-h-screen text-white pb-24 font-sans flex flex-col items-center">
      <main className="w-full max-w-md px-6 pt-6 pb-12 flex-1 flex flex-col gap-6">
        
        {/* Urgent Status Area */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF174]/10 border border-[#FFF174]/20 text-[#FFF174] text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FFF174] animate-pulse"></span> Rapid Response Network
          </div>
          <h2 className="text-[2.5rem] leading-none font-black mb-3">Are you safe?</h2>
          <p className="text-gray-400 text-sm font-medium">Select an option below for immediate assistance.</p>
        </div>

        {/* SOS Action - Sticky Mobile Priority */}
        <button 
          onClick={() => navigate('/sos')}
          className="relative w-full overflow-hidden bg-gradient-to-br from-red-600 to-red-900 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 shadow-[0_15px_50px_-12px_rgba(220,38,38,0.5)] active:scale-[0.97] transition-transform touch-manipulation"
          style={{ minHeight: '180px' }}
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent"></div>
          <ShieldAlert size={56} className="text-white drop-shadow-lg z-10 animate-pulse" />
          <span className="font-black text-4xl tracking-widest text-white drop-shadow-md z-10">SOS</span>
          <span className="text-red-100 text-xs font-bold uppercase tracking-widest z-10 bg-red-950/50 px-4 py-1.5 rounded-full border border-red-500/30">Hold for Emergency</span>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/request-help')}
            className="bg-[#111111] border border-white/10 rounded-[28px] p-6 flex flex-col items-center justify-center gap-4 active:scale-[0.97] transition-transform hover:bg-[#1a1a1a] touch-manipulation shadow-lg"
            style={{ minHeight: '150px' }}
          >
            <div className="w-16 h-16 rounded-full bg-[#FFF174]/10 text-[#FFF174] flex items-center justify-center mb-1">
              <Wrench size={32} />
            </div>
            <span className="font-bold text-base text-center leading-tight">Request<br/>Assistance</span>
          </button>

          <button 
            onClick={() => navigate('/nearby-services')}
            className="bg-[#111111] border border-white/10 rounded-[28px] p-6 flex flex-col items-center justify-center gap-4 active:scale-[0.97] transition-transform hover:bg-[#1a1a1a] touch-manipulation shadow-lg"
            style={{ minHeight: '150px' }}
          >
            <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1">
              <MapIcon size={32} />
            </div>
            <span className="font-bold text-base text-center leading-tight">Nearby<br/>Help</span>
          </button>
        </div>

        <button 
          onClick={() => navigate('/safety')}
          className="w-full bg-[#111111] border border-white/10 rounded-[28px] p-6 flex items-center gap-5 active:scale-[0.97] transition-transform hover:bg-[#1a1a1a] touch-manipulation shadow-lg"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={32} />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-bold text-xl mb-1">Start Safe Ride</h3>
            <p className="text-sm text-gray-400 font-medium">Live route & ETA sharing</p>
          </div>
          <ChevronRight size={28} className="text-gray-500" />
        </button>

      </main>
    </div>
  );
}
