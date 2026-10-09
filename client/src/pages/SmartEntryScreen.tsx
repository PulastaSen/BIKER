import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, PhoneCall, Navigation } from 'lucide-react';
import { MountainContourPattern, AnimatedRoadLines } from '../components/graphics';

export function SmartEntryScreen() {
  const navigate = useNavigate();

  const handleSelectHelp = () => {
    try {
      sessionStorage.setItem('motoassist_entry_intent', 'EMERGENCY_HELP');
    } catch {
      // Ignore storage errors
    }
    navigate('/emergency');
  };

  const handleSelectOk = () => {
    try {
      sessionStorage.setItem('motoassist_entry_intent', 'NORMAL_EXPLORE');
    } catch {
      // Ignore storage errors
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#FFF174] selection:text-black">
      {/* Background Graphic Elements */}
      <AnimatedRoadLines opacity={0.12} />
      <MountainContourPattern height={180} opacity={0.2} />

      {/* Radial ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Minimalist Top Bar */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5 select-none">
          <span className="w-9 h-9 rounded-xl bg-[#FFF174] text-black flex items-center justify-center font-black shadow-[0_0_15px_rgba(255,241,116,0.3)]">
            <Navigation size={18} />
          </span>
          <span className="font-black text-lg tracking-tight text-white uppercase">
            MOTO<span className="text-[#FFF174]">ASSIST</span>
          </span>
        </div>

        {/* Rapid Call 112 Access */}
        <a
          href="tel:112"
          className="px-3.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(239,68,68,0.2)]"
          title="Direct Emergency Dial 112"
        >
          <PhoneCall size={13} className="text-red-400" />
          <span>Call 112</span>
        </a>
      </header>

      {/* Main Full-Screen Decision Interface */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 max-w-2xl mx-auto w-full text-center">
        
        {/* Subtle Category Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#FFF174] animate-pulse" />
          <span>Himalayan Roadside & Emergency Assistance</span>
        </div>

        {/* Primary Question */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
          Are you in trouble right now?
        </h1>

        {/* Supporting Text */}
        <p className="text-sm sm:text-base text-gray-300 max-w-md mx-auto mb-8 sm:mb-10 font-normal leading-relaxed">
          Tell us what you need. We'll help you find the next step.
        </p>

        {/* Two Large Visually Distinct Options */}
        <div className="w-full space-y-4 sm:space-y-5">
          
          {/* OPTION A: YES, I NEED HELP */}
          <button
            type="button"
            onClick={handleSelectHelp}
            className="w-full p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#1C0D0D] via-[#160A0A] to-[#110808] hover:from-[#251010] hover:to-[#180A0A] active:scale-[0.99] border-2 border-red-500/60 shadow-[0_0_35px_rgba(239,68,68,0.3)] transition-all cursor-pointer group text-left relative overflow-hidden min-h-[110px]"
            aria-label="YES, I NEED HELP - Emergency, medical help or motorcycle breakdown"
          >
            {/* Red shimmer corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/15 rounded-full blur-2xl pointer-events-none group-hover:bg-red-600/25 transition-all" />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(220,38,38,0.6)] group-hover:scale-105 transition-transform border border-red-400">
                  <ShieldAlert size={32} className="animate-pulse" />
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-black tracking-wide text-white uppercase group-hover:text-red-200 transition-colors">
                    YES, I NEED HELP
                  </span>
                  <span className="block text-xs sm:text-sm text-red-200/90 font-medium mt-1">
                    Emergency, medical help or motorcycle breakdown.
                  </span>
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
                <ArrowRight size={20} />
              </div>
            </div>
          </button>

          {/* OPTION B: NO, I'M OK */}
          <button
            type="button"
            onClick={handleSelectOk}
            className="w-full p-5 sm:p-6 rounded-3xl bg-[#141414] hover:bg-[#1A1A1A] active:scale-[0.99] border border-white/15 hover:border-[#FFF174]/50 shadow-md transition-all cursor-pointer group text-left relative min-h-[96px]"
            aria-label="NO, I'M OK - Log in, create an account or explore MotoAssist"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 text-[#FFF174] flex items-center justify-center shrink-0 group-hover:bg-[#FFF174]/15 border border-white/10 transition-colors">
                  <Navigation size={24} />
                </div>
                <div>
                  <span className="block text-lg sm:text-xl font-black tracking-wide text-white group-hover:text-[#FFF174] transition-colors">
                    NO, I'M OK
                  </span>
                  <span className="block text-xs sm:text-sm text-gray-300 font-normal mt-0.5">
                    Log in, create an account or explore MotoAssist.
                  </span>
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-gray-400 group-hover:text-white flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
                <ArrowRight size={20} />
              </div>
            </div>
          </button>

        </div>

        {/* Discreet Explore Link */}
        <div className="mt-8 text-xs text-gray-300">
          Want to learn how it works first?{' '}
          <button
            type="button"
            onClick={() => navigate('/how-it-works')}
            className="text-[#FFF174] font-bold hover:underline underline-offset-4 ml-1 cursor-pointer"
          >
            Learn about MotoAssist
          </button>
        </div>
      </main>

      {/* Minimal Non-Intrusive Footer */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto px-4 py-4 text-center text-[11px] text-gray-300 border-t border-white/5">
        <span>No account required for immediate roadside & medical emergency response.</span>
      </footer>
    </div>
  );
}
