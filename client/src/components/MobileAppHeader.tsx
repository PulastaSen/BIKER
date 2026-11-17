import { Bell, Menu } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { MotoAssistLogoMark } from './MotoAssistLogoMark';
import { useAuth } from '../context/AuthContext';

interface MobileAppHeaderProps {
  onOpenMenu?: () => void;
  onOpenNotifications?: () => void;
  hasUnreadNotifications?: boolean;
  className?: string;
}

export function MobileAppHeader({
  onOpenMenu,
  onOpenNotifications,
  hasUnreadNotifications = true,
  className = '',
}: MobileAppHeaderProps) {
  const { user } = useAuth();

  const getProfilePath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'HELPER') return '/helper/profile';
    return '/rider/profile';
  };

  const getGaragePath = () => {
    if (user?.role === 'RIDER') return '/rider/bikes';
    return '/save-my-bike';
  };

  return (
    <header
      className={`w-full flex items-center justify-between px-1 py-2.5 z-20 ${className}`}
      aria-label="App Header"
    >
      {/* Left: Logo & Branding */}
      <div className="flex items-center gap-2.5">
        <MotoAssistLogoMark size={28} />
        <div className="flex flex-col leading-none">
          <div className="flex items-center text-[16px] sm:text-[18px] font-black tracking-tight uppercase font-sans">
            <span className="text-white">MOTO</span>
            <span className="text-[#F5B041]">ASSIST</span>
          </div>
          <span className="text-[9px] font-bold tracking-wider text-[#8A96A3] uppercase mt-0.5 font-sans">
            ROADSIDE RESCUE
          </span>
        </div>
      </div>

      {/* Center: Desktop Navigation Links (Visible on desktop only) */}
      <nav
        className="hidden md:flex items-center gap-1 lg:gap-2 bg-[#12161D]/90 border border-white/5 rounded-2xl px-3 py-1.5 shadow-sm"
        aria-label="Desktop Primary Navigation"
      >
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-[#181D24] text-[#F5B041] border border-[#F5B041]/40 shadow-[0_0_8px_rgba(245,176,65,0.2)]'
                : 'text-[#8E98A4] hover:text-white hover:bg-white/5'
            }`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/services"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-[#181D24] text-[#F5B041] border border-[#F5B041]/40 shadow-[0_0_8px_rgba(245,176,65,0.2)]'
                : 'text-[#8E98A4] hover:text-white hover:bg-white/5'
            }`
          }
        >
          Help
        </NavLink>
        <NavLink
          to="/safe-ride"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-[#181D24] text-[#F5B041] border border-[#F5B041]/40 shadow-[0_0_8px_rgba(245,176,65,0.2)]'
                : 'text-[#8E98A4] hover:text-white hover:bg-white/5'
            }`
          }
        >
          Rides
        </NavLink>
        <NavLink
          to={getGaragePath()}
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-[#181D24] text-[#F5B041] border border-[#F5B041]/40 shadow-[0_0_8px_rgba(245,176,65,0.2)]'
                : 'text-[#8E98A4] hover:text-white hover:bg-white/5'
            }`
          }
        >
          Garage
        </NavLink>
        <NavLink
          to={getProfilePath()}
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-[#181D24] text-[#F5B041] border border-[#F5B041]/40 shadow-[0_0_8px_rgba(245,176,65,0.2)]'
                : 'text-[#8E98A4] hover:text-white hover:bg-white/5'
            }`
          }
        >
          Account
        </NavLink>
      </nav>

      {/* Right: Notification & Menu Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Notification Icon Button */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative w-10 h-10 rounded-full bg-[#181D24] border border-white/10 hover:border-white/20 active:scale-95 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer shadow-sm"
          aria-label="View notifications"
        >
          <Bell size={18} className="text-gray-300" />
          {hasUnreadNotifications && (
            <span
              className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#EF4444] border border-[#181D24]"
              aria-label="New notifications available"
            />
          )}
        </button>

        {/* Menu Icon Button */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="w-10 h-10 rounded-full bg-[#181D24] border border-white/10 hover:border-white/20 active:scale-95 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer shadow-sm"
          aria-label="Open navigation menu"
        >
          <Menu size={18} className="text-gray-300" />
        </button>
      </div>
    </header>
  );
}
