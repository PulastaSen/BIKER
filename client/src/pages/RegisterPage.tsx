import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowRight, Loader2, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import type { UserRole } from '../types/app';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('RIDER');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter your full name.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters.';
    }

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Please enter your phone number.';
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number.';
    }

    if (!password) {
      newErrors.password = 'Please enter a password.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    
    if (!validate()) {
      return;
    }
    
    setIsLoading(true);
    
    const user = await register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password, role });
    
    if (user) {
      if (role === 'RIDER') navigate('/rider/dashboard');
      else if (role === 'HELPER') navigate('/helper/dashboard');
      else navigate('/admin/dashboard');
    } else {
      setGlobalError('Registration failed. The email or phone might already be registered.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="auth-page bg-[#090909] min-h-screen flex items-center justify-center p-4 md:p-8 text-white font-sans pt-24 pb-16">
      <div className="auth-card bg-[#111111] border border-white/15 rounded-3xl p-6 sm:p-10 md:p-12 w-full max-w-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-[#FFF174]/10 blur-[90px] pointer-events-none" />

        <div className="auth-header text-center mb-8 relative z-10">
          <div className="auth-icon w-16 h-16 bg-[#FFF174]/10 border border-[#FFF174]/30 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <UserPlus size={28} className="text-[#FFF174]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 text-white tracking-tight">CREATE ACCOUNT</h1>
          <p className="text-gray-300 text-sm md:text-base font-medium">Join MotoAssist and stay safer on the road.</p>
        </div>

        {globalError && (
          <div className="bg-red-500/15 border-2 border-red-500/40 text-red-400 p-4 rounded-xl mb-6 text-sm font-semibold flex items-center gap-3" role="alert">
            <AlertCircle size={20} className="flex-shrink-0 text-red-400" />
            <span>{globalError}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5 relative z-10" noValidate>
          {/* Account Type Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-300">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
              <button
                type="button"
                onClick={() => setRole('RIDER')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer text-center min-h-[72px] justify-center ${
                  role === 'RIDER' 
                    ? 'border-[#FFF174] text-[#FFF174] bg-[#FFF174]/15 shadow-[0_0_15px_rgba(255,241,116,0.2)]' 
                    : 'border-white/10 text-gray-400 bg-white/5 hover:border-white/25 hover:text-white'
                }`}
                aria-pressed={role === 'RIDER'}
              >
                <div className="flex items-center gap-2">
                  <Shield size={20} className={role === 'RIDER' ? 'text-[#FFF174]' : 'text-gray-400'} />
                  <span className="font-extrabold text-base tracking-wide">RIDER</span>
                </div>
                <span className="text-xs text-gray-400">Request roadside help</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('HELPER')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer text-center min-h-[72px] justify-center ${
                  role === 'HELPER' 
                    ? 'border-[#FFF174] text-[#FFF174] bg-[#FFF174]/15 shadow-[0_0_15px_rgba(255,241,116,0.2)]' 
                    : 'border-white/10 text-gray-400 bg-white/5 hover:border-white/25 hover:text-white'
                }`}
                aria-pressed={role === 'HELPER'}
              >
                <div className="flex items-center gap-2">
                  <Shield size={20} className={role === 'HELPER' ? 'text-[#FFF174]' : 'text-gray-400'} />
                  <span className="font-extrabold text-base tracking-wide">PROVIDER</span>
                </div>
                <span className="text-xs text-gray-400">Assist stranded riders</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="regName" className="block text-sm font-bold text-gray-200">
              Full Name {role === 'HELPER' && <span className="text-gray-400 font-normal">(or Business Name)</span>}
            </label>
            <input
              id="regName"
              type="text"
              autoComplete="name"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'regName-error' : undefined}
              className={`w-full bg-[#181818] border-2 rounded-xl p-3.5 text-white placeholder-gray-500 font-medium text-base focus:outline-none transition-all ${
                errors.name 
                  ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20' 
                  : 'border-white/15 focus:border-[#FFF174] focus:ring-2 focus:ring-[#FFF174]/20'
              }`}
            />
            {errors.name && (
              <p id="regName-error" className="text-red-400 text-xs font-semibold flex items-center gap-1.5 mt-1">
                <AlertCircle size={14} /> {errors.name}
              </p>
            )}
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="regEmail" className="block text-sm font-bold text-gray-200">
                Email Address
              </label>
              <input
                id="regEmail"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'regEmail-error' : undefined}
                className={`w-full bg-[#181818] border-2 rounded-xl p-3.5 text-white placeholder-gray-500 font-medium text-base focus:outline-none transition-all ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20' 
                    : 'border-white/15 focus:border-[#FFF174] focus:ring-2 focus:ring-[#FFF174]/20'
                }`}
              />
              {errors.email && (
                <p id="regEmail-error" className="text-red-400 text-xs font-semibold flex items-center gap-1.5 mt-1">
                  <AlertCircle size={14} /> {errors.email}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="regPhone" className="block text-sm font-bold text-gray-200">
                Phone Number
              </label>
              <input
                id="regPhone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91 98320 00000"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                }}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'regPhone-error' : undefined}
                className={`w-full bg-[#181818] border-2 rounded-xl p-3.5 text-white placeholder-gray-500 font-medium text-base focus:outline-none transition-all ${
                  errors.phone 
                    ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20' 
                    : 'border-white/15 focus:border-[#FFF174] focus:ring-2 focus:ring-[#FFF174]/20'
                }`}
              />
              {errors.phone && (
                <p id="regPhone-error" className="text-red-400 text-xs font-semibold flex items-center gap-1.5 mt-1">
                  <AlertCircle size={14} /> {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="regPassword" className="block text-sm font-bold text-gray-200">
              Password
            </label>
            <div className="relative">
              <input
                id="regPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                }}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'regPassword-error' : undefined}
                className={`w-full bg-[#181818] border-2 rounded-xl p-3.5 pr-12 text-white placeholder-gray-500 font-medium text-base focus:outline-none transition-all ${
                  errors.password 
                    ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20' 
                    : 'border-white/15 focus:border-[#FFF174] focus:ring-2 focus:ring-[#FFF174]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p id="regPassword-error" className="text-red-400 text-xs font-semibold flex items-center gap-1.5 mt-1">
                <AlertCircle size={14} /> {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="regConfirmPassword" className="block text-sm font-bold text-gray-200">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="regConfirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                }}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? 'regConfirmPassword-error' : undefined}
                className={`w-full bg-[#181818] border-2 rounded-xl p-3.5 pr-12 text-white placeholder-gray-500 font-medium text-base focus:outline-none transition-all ${
                  errors.confirmPassword 
                    ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20' 
                    : 'border-white/15 focus:border-[#FFF174] focus:ring-2 focus:ring-[#FFF174]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="regConfirmPassword-error" className="text-red-400 text-xs font-semibold flex items-center gap-1.5 mt-1">
                <AlertCircle size={14} /> {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex items-center justify-center py-4 mt-6 bg-[#FFF174] text-black font-black text-lg rounded-xl hover:bg-yellow-400 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400/50 shadow-[0_0_24px_rgba(255,241,116,0.3)] disabled:opacity-70 min-h-[52px] active:scale-[0.99] cursor-pointer"
          >
            {isLoading ? (
               <><Loader2 className="animate-spin mr-2" size={20} /> CREATING ACCOUNT...</>
            ) : (
               <span className="flex items-center gap-2">CREATE ACCOUNT <ArrowRight size={20} /></span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8 relative z-10 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-[#FFF174] hover:underline font-bold transition-all underline-offset-4 ml-1">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

