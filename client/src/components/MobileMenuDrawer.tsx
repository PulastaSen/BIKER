import { Link, useNavigate } from 'react-router-dom';
import { 
  X, 
  Home, 
  Wrench, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  Heart, 
  Bike, 
  CreditCard, 
  FileText, 
  LogOut, 
  LogIn,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MotoAssistLogoMark } from './MotoAssistLogoMark';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenuDrawer({ isOpen, onClose }: MobileMenuDrawerProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <aside
        className="relative w-full max-w-xs bg-[#14181E] border-l border-white/10 h-full flex flex-col p-5 text-white z-10 shadow-2xl animate-in slide-in-from-right duration-200"
        aria-label="Navigation Menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <MotoAssistLogoMark size={24} />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black tracking-tight text-white uppercase">
                MOTO<span className="text-[#F5B041]">ASSIST</span>
              </span>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                ROADSIDE RESCUE
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card if logged in */}
        {user ? (
          <div className="my-4 p-3 rounded-2xl bg-[#1A2028] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5B041]/10 border border-[#F5B041]/30 flex items-center justify-center text-[#F5B041] font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <span className="text-xs font-bold text-white block truncate">{user.name}</span>
              <span className="text-[10px] text-gray-400 block truncate">{user.phone}</span>
              <span className="text-[9px] text-[#F5B041] font-mono font-semibold block mt-0.5">
                ROLE: {user.role}
              </span>
            </div>
          </div>
        ) : (
          <div className="my-4 p-3 rounded-2xl bg-[#1A2028] border border-white/5 flex items-center justify-between">
            <span className="text-xs text-gray-400">Account Access</span>
            <Link
              to="/login"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-[#F5B041] text-black text-xs font-bold hover:bg-yellow-400 transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Menu Items List */}
        <nav className="flex-1 overflow-y-auto space-y-1 pr-1" aria-label="Menu links">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <Home size={16} className="text-[#F5B041]" />
            <span>Home</span>
          </Link>

          <Link
            to="/im-stranded"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <Wrench size={16} className="text-[#F5B041]" />
            <span>I'm Stranded (Roadside)</span>
          </Link>

          <Link
            to="/services"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <Truck size={16} className="text-[#C084FC]" />
            <span>Services Catalog</span>
          </Link>

          <Link
            to="/subscriptions"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <CreditCard size={16} className="text-[#10B981]" />
            <span>RSA Shield Plans</span>
          </Link>

          <Link
            to="/nearby-services"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <MapPin size={16} className="text-[#38BDF8]" />
            <span>Nearby Mechanics</span>
          </Link>

          <Link
            to="/safe-ride"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <Radio size={16} className="text-emerald-400" />
            <span>Safe Ride HUD</span>
          </Link>

          <Link
            to="/medical-id"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <Heart size={16} className="text-[#F43F5E]" />
            <span>Medical Emergency ID</span>
          </Link>

          <Link
            to={user?.role === 'RIDER' ? '/rider/bikes' : '/save-my-bike'}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <Bike size={16} className="text-[#F5B041]" />
            <span>Motorcycle Garage</span>
          </Link>

          <Link
            to="/documents"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <FileText size={16} className="text-gray-400" />
            <span>Bike Documents</span>
          </Link>

          <Link
            to="/how-it-works"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <ShieldCheck size={16} className="text-gray-400" />
            <span>How It Works</span>
          </Link>
        </nav>

        {/* Footer Logout / Login */}
        <div className="border-t border-white/10 pt-4 mt-auto">
          {user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
                navigate('/');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-xs font-bold text-gray-300 hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F5B041] hover:bg-yellow-400 text-xs font-black text-black transition-colors"
            >
              <LogIn size={16} />
              <span>Sign In / Register</span>
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}
