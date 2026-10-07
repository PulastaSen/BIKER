import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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

  return (
    <div className="auth-page bg-[#090909] min-h-screen flex items-center justify-center p-4 md:p-8 text-white font-sans pt-24 pb-16">
      <div className="auth-card bg-[#111111] border border-white/15 rounded-3xl p-6 sm:p-10 md:p-12 w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-[#FFF174]/10 blur-[90px] pointer-events-none" />

        <div className="auth-header text-center mb-8 relative z-10">
          <div className="auth-icon w-16 h-16 bg-[#FFF174]/10 border border-[#FFF174]/30 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Lock size={28} className="text-[#FFF174]" />
          </div>
          <h1 className="text-3xl font-black mb-2 text-white tracking-tight">WELCOME BACK</h1>
          <p className="text-gray-300 text-sm font-medium">Log in to manage assistance requests or garage profile.</p>
        </div>

        {error && (
          <div className="bg-red-500/15 border-2 border-red-500/40 text-red-400 p-4 rounded-xl mb-6 text-sm font-semibold flex items-center gap-3" role="alert">
            <AlertCircle size={20} className="flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Credentials */}
        <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-2xl relative z-10">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">⚡ Quick 1-Click Demo Accounts</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('rider@motoassist.in')}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30 font-medium transition cursor-pointer"
            >
              Rider
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('helper@motoassist.in')}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-medium transition cursor-pointer"
            >
              Helper
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@motoassist.in')}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 font-medium transition cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="loginEmail" className="block text-sm font-bold text-gray-200">
              Email Address
            </label>
            <input
              id="loginEmail"
              type="email"
              inputMode="email"
              autoComplete="username"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full bg-[#181818] border-2 border-white/15 rounded-xl p-3.5 text-white placeholder-gray-500 font-medium text-base focus:outline-none focus:border-[#FFF174] focus:ring-2 focus:ring-[#FFF174]/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="loginPassword" className="block text-sm font-bold text-gray-200">
              Password
            </label>
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
                className="w-full bg-[#181818] border-2 border-white/15 rounded-xl p-3.5 pr-12 text-white placeholder-gray-500 font-medium text-base focus:outline-none focus:border-[#FFF174] focus:ring-2 focus:ring-[#FFF174]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex items-center justify-center py-4 mt-6 bg-[#FFF174] text-black font-black text-lg rounded-xl hover:bg-yellow-400 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400/50 shadow-[0_0_24px_rgba(255,241,116,0.3)] disabled:opacity-70 min-h-[52px] cursor-pointer"
          >
            {isLoading ? (
               <><Loader2 className="animate-spin mr-2" size={20} /> AUTHENTICATING...</>
            ) : (
               <span className="flex items-center gap-2">LOG IN <ArrowRight size={20} /></span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8 relative z-10 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#FFF174] hover:underline font-bold transition-all underline-offset-4 ml-1">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

