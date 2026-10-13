import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  KeyRound,
  X,
  User,
  Wrench,
  HelpCircle
} from 'lucide-react';
import {
  AnimatedRoadLines,
  MountainContourPattern
} from '../components/graphics';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    const loggedInUser = await login(email.trim(), password);

    if (loggedInUser) {
      if (loggedInUser.role === 'RIDER') navigate('/rider/dashboard');
      else if (loggedInUser.role === 'HELPER') navigate('/helper/dashboard');
      else navigate('/admin/dashboard');
    } else {
      setError('Invalid email or password. Please try again.');
    }

    setIsLoading(false);
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotEmail.trim().length > 3) {
      setForgotSent(true);
    }
  };

  return (
    <div className="auth-page bg-[#090909] min-h-screen text-white font-sans pt-12 pb-24 px-4 sm:px-6 relative overflow-hidden selection:bg-[#FFF174] selection:text-black">
      {/* Background graphics */}
      <AnimatedRoadLines opacity={0.1} />
      <MountainContourPattern height={140} opacity={0.18} />

      {/* EMERGENCY PRIORITY BANNER */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-950/60 via-[#180a0a] to-[#120808] border border-red-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="w-8 h-8 rounded-xl bg-red-600/30 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0">
              <ShieldAlert size={18} className="animate-pulse" />
            </span>
            <div>
              <strong className="text-xs sm:text-sm font-black text-white block">
                Are you in trouble right now?
              </strong>
              <span className="text-[11px] text-red-200">
                You do not need an account to get roadside or medical emergency assistance.
              </span>
            </div>
          </div>
          <Link
            to="/emergency"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <span>Open Emergency Mode</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT LAYOUT */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* COLUMN 1: LOGIN & AUTH CARD (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-[#111111] border border-white/15 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative">
          
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-[#FFF174]/10 border border-[#FFF174]/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-[#FFF174]">
              <Lock size={26} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              SIGN IN TO MOTOASSIST
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Access your garage, ride telemetry, emergency ID & safety circle.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-400 p-3.5 rounded-2xl mb-5 text-xs font-semibold flex items-center gap-2.5" role="alert">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Credentials */}
          <div className="mb-5 p-3.5 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-2">
              ⚡ Quick 1-Click Demo Logins
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('rider@motoassist.in')}
                className="text-xs px-3 py-1.5 rounded-xl bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30 font-bold transition cursor-pointer"
              >
                Rider
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('helper@motoassist.in')}
                className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold transition cursor-pointer"
              >
                Helper
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@motoassist.in')}
                className="text-xs px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 font-bold transition cursor-pointer"
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="loginEmail" className="block text-xs font-bold text-gray-200">
                Email Address
              </label>
              <input
                id="loginEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rider@motoassist.in"
                className="w-full bg-[#161616] border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFF174]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="loginPassword" className="block text-xs font-bold text-gray-200">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-[#FFF174] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#161616] border border-white/20 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFF174]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#FFF174] hover:bg-yellow-400 active:scale-98 text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(255,241,116,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to MotoAssist</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

        </div>

        {/* COLUMN 2: REGISTRATION & EXPLORE OPTIONS (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="p-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              NEW TO MOTOASSIST? CHOOSE AN ACCOUNT TYPE
            </h2>
          </div>

          {/* RIDER REGISTRATION CARD */}
          <Link
            to="/register"
            className="p-5 sm:p-6 rounded-3xl bg-[#141414] border border-white/15 hover:border-[#FFF174]/50 flex items-center justify-between gap-4 transition-all group block shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF174]/15 border border-[#FFF174]/30 text-[#FFF174] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <User size={22} />
              </div>
              <div>
                <strong className="text-base sm:text-lg font-black text-white group-hover:text-[#FFF174] transition-colors block">
                  Create Rider Account
                </strong>
                <span className="text-xs text-gray-400 block mt-0.5">
                  Save your motorcycle, medical ID, and emergency contacts once for quick access.
                </span>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                  Pre-Ride Check • Safe Ride • Emergency SOS
                </span>
              </div>
            </div>
            <ArrowRight size={20} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          {/* HELPER / PROVIDER REGISTRATION CARD */}
          <Link
            to="/become-helper"
            className="p-5 sm:p-6 rounded-3xl bg-[#141414] border border-white/15 hover:border-emerald-500/50 flex items-center justify-between gap-4 transition-all group block shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Wrench size={22} />
              </div>
              <div>
                <strong className="text-base sm:text-lg font-black text-white group-hover:text-emerald-300 transition-colors block">
                  Register as Helper / Service Provider
                </strong>
                <span className="text-xs text-gray-400 block mt-0.5">
                  Are you a mechanic, tow truck operator or highway volunteer? Join our verified network.
                </span>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                  Direct Dispatch • Fair Rates • Roadside Network
                </span>
              </div>
            </div>
            <ArrowRight size={20} className="text-gray-400 group-hover:text-emerald-300 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          {/* LEARN ABOUT MOTOASSIST */}
          <Link
            to="/how-it-works"
            className="p-4 rounded-2xl bg-[#161616] border border-white/10 hover:border-white/25 flex items-center justify-between text-xs text-gray-300 transition-colors group block"
          >
            <div className="flex items-center gap-3">
              <HelpCircle size={18} className="text-[#FFF174]" />
              <span>Want to explore features first? Learn how MotoAssist works</span>
            </div>
            <span className="text-[#FFF174] font-bold group-hover:underline">Explore</span>
          </Link>

        </div>

      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/20 rounded-3xl max-w-md w-full p-6 sm:p-8 relative text-white space-y-4">
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotSent(false);
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF174]/10 text-[#FFF174] border border-[#FFF174]/30 flex items-center justify-center mx-auto mb-2">
                <KeyRound size={22} />
              </div>
              <h3 className="text-lg font-black text-white">Reset Account Password</h3>
              <p className="text-xs text-gray-400">
                Enter your registered email address to receive password recovery instructions.
              </p>
            </div>

            {forgotSent ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-center space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                <strong className="block text-sm font-bold">Recovery Link Sent</strong>
                <p className="text-xs text-gray-300">
                  We've dispatched password reset instructions to <strong>{forgotEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotSent(false);
                  }}
                  className="mt-2 px-4 py-2 bg-emerald-500 text-black font-black text-xs uppercase rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 pt-2">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#181818] border border-white/20 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-[#FFF174] text-black font-black text-xs uppercase rounded-xl hover:bg-yellow-400 cursor-pointer"
                >
                  Send Recovery Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
