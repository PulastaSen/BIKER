import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import {
  MotorcycleSilhouette,
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
                Are you in an emergency right now?
              </strong>
              <span className="text-[11px] text-red-200">
                You do not need an account to get roadside or medical emergency assistance.
              </span>
            </div>
          </div>
          <Link
            to="/emergency"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shrink-0"
          >
            <span>Open Emergency Mode</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT LAYOUT */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* COLUMN 1: LOGIN & AUTH CARD (lg:col-span-5) */}
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
            <div className="bg-red-500/15 border border-red-500/40 text-red-300 p-3 rounded-xl mb-5 text-xs font-semibold flex items-center gap-2.5" role="alert">
              <AlertCircle size={18} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick 1-Click Demo Accounts */}
          <div className="mb-5 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block mb-1.5">
              ⚡ Quick 1-Click Demo Credentials
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('rider@motoassist.in')}
                className="px-2.5 py-1 rounded-lg bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30 font-bold transition cursor-pointer"
              >
                Rider
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('helper@motoassist.in')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold transition cursor-pointer"
              >
                Helper
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@motoassist.in')}
                className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 font-bold transition cursor-pointer"
              >
                Admin
              </button>
            </div>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div className="space-y-1">
              <label htmlFor="loginEmail" className="block text-xs font-bold text-gray-200">
                Email Address
              </label>
              <input
                id="loginEmail"
                type="email"
                inputMode="email"
                autoComplete="username"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full bg-[#181818] border border-white/15 rounded-xl p-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#FFF174]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="loginPassword" className="block text-xs font-bold text-gray-200">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[11px] text-[#FFF174] hover:underline font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-[#181818] border border-white/15 rounded-xl p-3 pr-11 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#FFF174]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 bg-[#FFF174] text-black font-black text-sm uppercase tracking-wider rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-[0_0_20px_rgba(255,241,116,0.25)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <span>LOG IN</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* DEDICATED REGISTRATION & ROLES SECTION */}
          <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-center">
              New to MotoAssist?
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/register"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center transition-colors block group"
              >
                <strong className="text-xs font-black text-white group-hover:text-[#FFF174] block">
                  Rider Registration
                </strong>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  Motorcycle owners & travelers
                </span>
              </Link>

              <Link
                to="/become-helper"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center transition-colors block group"
              >
                <strong className="text-xs font-black text-white group-hover:text-emerald-400 block">
                  Helper Registration
                </strong>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  Mechanics & towing partners
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* COLUMN 2: SECTION 14 EXPLAIN MOTOASSIST TO NEW USERS (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="p-6 rounded-3xl bg-[#121212] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FFF174]">
              <MotorcycleSilhouette size={28} />
              <span>Safety Companion On Every Ride</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Get help with motorcycle breakdowns, find nearby assistance, and share rides safely.
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              MotoAssist is engineered for riders navigating highways, mountain corridors, and remote foothill roads. Here is what we do:
            </p>
          </div>

          {/* 5 Distinct Feature Concept Cards */}
          <div className="space-y-2.5">
            
            {/* 1. SOS vs Calling 112 */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30 text-base">
                🚨
              </div>
              <div>
                <strong className="text-xs font-black text-white block">
                  SOS vs. Calling 112 Emergency
                </strong>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  <strong>Call 112</strong> instantly connects to police/ambulance authorities. MotoAssist <strong>SOS</strong> broadcasts live satellite coordinates, medical ID, and alerts local recovery networks simultaneously.
                </p>
              </div>
            </div>

            {/* 2. Motorcycle Roadside Assistance */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-300 flex items-center justify-center shrink-0 border border-yellow-500/30 text-base">
                🔧
              </div>
              <div>
                <strong className="text-xs font-black text-white block">
                  Motorcycle Roadside Assistance
                </strong>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  Puncture repair, battery jump, clutch cables, chain lockouts, and hydraulic flatbed towing with transparent pricing and real-time tracking.
                </p>
              </div>
            </div>

            {/* 3. Safe Ride & Family Location Sharing */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30 text-base">
                📍
              </div>
              <div>
                <strong className="text-xs font-black text-white block">
                  Safe Ride & Family Sharing
                </strong>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  Share live GPS ride tracks directly with your trusted contacts on WhatsApp without forcing family members to install an app.
                </p>
              </div>
            </div>

            {/* 4. Rider Identity Verification */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 border border-blue-500/30 text-base">
                🛡️
              </div>
              <div>
                <strong className="text-xs font-black text-white block">
                  Rider Verification & Vehicle Documents
                </strong>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  Driving licence and selfie verification establish trusted rider identity, while vehicle documents (RC, Insurance, PUC) are stored in an encrypted vault.
                </p>
              </div>
            </div>

            {/* 5. Helper Professional Verification */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30 text-base">
                🏢
              </div>
              <div>
                <strong className="text-xs font-black text-white block">
                  Helper & Provider Verification
                </strong>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  Mechanics, towing operators, and rescue specialists undergo physical workshop validation and credential inspection before receiving dispatch jobs.
                </p>
              </div>
            </div>

          </div>

          <div className="text-center pt-2">
            <Link
              to="/how-it-works"
              className="text-xs text-[#FFF174] font-bold hover:underline underline-offset-4 inline-flex items-center gap-1.5"
            >
              <span>Explore full interactive platform guide</span>
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>

      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-md w-full relative animate-in fade-in duration-150">
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotSent(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#FFF174]/10 text-[#FFF174] flex items-center justify-center mb-4">
              <KeyRound size={24} />
            </div>

            <h3 className="text-xl font-black text-white mb-1">Reset Password</h3>
            <p className="text-xs text-gray-400 mb-5">
              Enter your registered email address and we'll send you recovery instructions.
            </p>

            {forgotSent ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-center space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                <strong className="block text-sm font-bold">Password reset link dispatched!</strong>
                <p className="text-xs text-gray-300">
                  If an account exists for {forgotEmail}, instructions have been sent. Check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="mt-3 px-4 py-2 bg-emerald-500 text-black font-bold text-xs rounded-xl"
                >
                  Back to Log In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgotEmailInput" className="text-xs font-bold text-gray-300 block mb-1">
                    Registered Email
                  </label>
                  <input
                    id="forgotEmailInput"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-[#181818] border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#FFF174] hover:bg-yellow-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
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
