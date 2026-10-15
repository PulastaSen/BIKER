import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Settings, RefreshCw, ShieldCheck, LogOut, Loader2, User } from 'lucide-react';
import { initAppStorage } from '../../utils/appStorage';
import { useAuth } from '../../context/AuthContext';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, isLoggingOut } = useAuth();
  const [locationPref, setLocationPref] = useState(true);
  const [resetDone, setResetDone] = useState(false);

  const handleResetData = () => {
    if (window.confirm('Reset all requests, garage bikes, and helper profiles back to default system state?')) {
      localStorage.clear();
      initAppStorage();
      setResetDone(true);
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-page max-w-4xl mx-auto px-4 py-8 space-y-6">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow text-xs font-black uppercase text-[#FFF174] tracking-wider">PREFERENCES & SYSTEM</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white">App Settings</h1>
          <p className="text-xs text-[#C5C5C5] mt-1">Configure location sharing privacy, local storage, and account session.</p>
        </div>
      </header>

      <div className="settings-stack space-y-4">
        {/* Account & Session Management Card */}
        {user && (
          <div className="dash-card p-6 rounded-3xl bg-[#1D1D1D] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF174]/20 border border-[#FFF174]/40 text-[#FFF174] flex items-center justify-center font-bold">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{user.name}</h3>
                  <p className="text-xs text-[#C5C5C5]">{user.email} • Role: {user.role}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LOGGED IN
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full py-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 min-h-[44px]"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Logging out…</span>
                </>
              ) : (
                <>
                  <LogOut size={16} />
                  <span>Log Out of MotoAssist</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="dash-card p-6 rounded-3xl bg-[#1D1D1D] border border-white/10 space-y-3 shadow-xl">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Settings size={18} className="text-[#FFF174]" /> Location & Privacy Settings
          </h3>
          <div className="form-group pt-2">
            <label className="check-label flex items-center gap-2 cursor-pointer text-sm text-gray-200">
              <input
                type="checkbox"
                checked={locationPref}
                onChange={(e) => setLocationPref(e.target.checked)}
                className="w-4 h-4 accent-[#FFF174]"
              />
              <span>Require explicit consent before retrieving browser Geolocation API</span>
            </label>
            <p className="text-xs text-[#C5C5C5] mt-1">
              MotoAssist will never access GPS coordinates automatically without your confirmation.
            </p>
          </div>
        </div>

        <div className="dash-card p-6 rounded-3xl bg-[#1D1D1D] border border-white/10 space-y-3 shadow-xl">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <RefreshCw size={18} className="text-[#FFF174]" /> Clear Cache & Reset State
          </h3>
          <p className="text-xs text-[#C5C5C5]">
            Restores local requests, garage bikes, and helper network profiles back to the default verified state.
          </p>

          {resetDone && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold">
              <ShieldCheck size={18} /> System cache reset! Reloading application...
            </div>
          )}

          <Button variant="secondary" onClick={handleResetData}>
            <RefreshCw size={16} /> Reset System Cache
          </Button>
        </div>
      </div>
    </div>
  );
}
