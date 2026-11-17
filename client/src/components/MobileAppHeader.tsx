import { Bell, Menu } from 'lucide-react';
import { MotoAssistLogoMark } from './MotoAssistLogoMark';

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
  return (
    <header
      className={`w-full flex items-center justify-between px-5 py-2.5 z-20 ${className}`}
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
