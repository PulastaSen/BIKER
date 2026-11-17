import { Link, useLocation } from 'react-router-dom';
import { Home, Wrench, Navigation, Bike, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * MobileBottomNav — Exact reproduction of the 5-item mobile bottom navigation
 * 1. Home (Active yellow)
 * 2. Help (Inactive gray)
 * 3. Rides (Inactive gray)
 * 4. Garage (Inactive gray)
 * 5. Account (Inactive gray)
 *
 * Includes safe area spacing and iPhone home indicator bar.
 */
export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  // If in dedicated emergency mode or full screen entry screen, hide bottom nav
  const isEmergencyMode =
    location.pathname === '/sos' ||
    location.pathname === '/emergency' ||
    location.pathname === '/emergency-assist' ||
    location.pathname === '/entry' ||
    location.pathname === '/accident-assistant';

  if (isEmergencyMode) {
    return null;
  }

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

  const resetScroll = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const isHomeActive = location.pathname === '/';
  const isHelpActive =
    location.pathname.startsWith('/nearby-services') ||
    location.pathname.startsWith('/services') ||
    location.pathname.startsWith('/im-stranded') ||
    location.pathname.startsWith('/request-help') ||
    location.pathname.startsWith('/requests/');
  const isRidesActive =
    location.pathname.startsWith('/safe-ride') ||
    location.pathname.startsWith('/route-coverage') ||
    location.pathname.startsWith('/safety');
  const isGarageActive =
    location.pathname.startsWith('/save-my-bike') ||
    location.pathname.startsWith('/rider/bikes') ||
    location.pathname.startsWith('/ai-bike-assistant');
  const isAccountActive =
    location.pathname.startsWith('/rider/profile') ||
    location.pathname.startsWith('/rider/dashboard') ||
    location.pathname.startsWith('/helper/') ||
    location.pathname.startsWith('/admin/') ||
    location.pathname === '/login' ||
    location.pathname === '/register';

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0E1217]/95 backdrop-blur-lg border-t border-white/[0.08] flex flex-col pt-2 pb-1.5 px-3 select-none transition-all shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
      aria-label="Bottom Navigation"
    >
      <div className="flex items-center justify-around w-full max-w-md mx-auto">
        {/* 1. Home (Active state in screenshot) */}
        <Link
          to="/"
          onClick={resetScroll}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all group ${
            isHomeActive ? 'text-[#F5B041]' : 'text-[#8E98A4] hover:text-white'
          }`}
          aria-label="Home"
        >
          <div
            className={`w-10 h-7 rounded-xl flex items-center justify-center transition-all ${
              isHomeActive
                ? 'bg-[#F5B041]/15 border border-[#F5B041]/40 text-[#F5B041] shadow-[0_0_10px_rgba(245,176,65,0.25)]'
                : 'text-[#8E98A4] group-hover:text-white'
            }`}
          >
            <Home size={20} className={isHomeActive ? 'text-[#F5B041]' : ''} />
          </div>
          <span
            className={`text-[11px] font-sans font-bold leading-none ${
              isHomeActive ? 'text-[#F5B041]' : 'text-[#8E98A4]'
            }`}
          >
            Home
          </span>
        </Link>

        {/* 2. Help */}
        <Link
          to="/services"
          onClick={resetScroll}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all group ${
            isHelpActive ? 'text-[#F5B041]' : 'text-[#8E98A4] hover:text-white'
          }`}
          aria-label="Help"
        >
          <div
            className={`w-10 h-7 rounded-xl flex items-center justify-center transition-all ${
              isHelpActive
                ? 'bg-[#F5B041]/15 border border-[#F5B041]/40 text-[#F5B041]'
                : 'text-[#8E98A4] group-hover:text-white'
            }`}
          >
            <Wrench size={20} />
          </div>
          <span
            className={`text-[11px] font-sans font-bold leading-none ${
              isHelpActive ? 'text-[#F5B041]' : 'text-[#8E98A4]'
            }`}
          >
            Help
          </span>
        </Link>

        {/* 3. Rides */}
        <Link
          to="/safe-ride"
          onClick={resetScroll}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all group ${
            isRidesActive ? 'text-[#F5B041]' : 'text-[#8E98A4] hover:text-white'
          }`}
          aria-label="Rides"
        >
          <div
            className={`w-10 h-7 rounded-xl flex items-center justify-center transition-all ${
              isRidesActive
                ? 'bg-[#F5B041]/15 border border-[#F5B041]/40 text-[#F5B041]'
                : 'text-[#8E98A4] group-hover:text-white'
            }`}
          >
            <Navigation size={20} />
          </div>
          <span
            className={`text-[11px] font-sans font-bold leading-none ${
              isRidesActive ? 'text-[#F5B041]' : 'text-[#8E98A4]'
            }`}
          >
            Rides
          </span>
        </Link>

        {/* 4. Garage */}
        <Link
          to={getGaragePath()}
          onClick={resetScroll}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all group ${
            isGarageActive ? 'text-[#F5B041]' : 'text-[#8E98A4] hover:text-white'
          }`}
          aria-label="Garage"
        >
          <div
            className={`w-10 h-7 rounded-xl flex items-center justify-center transition-all ${
              isGarageActive
                ? 'bg-[#F5B041]/15 border border-[#F5B041]/40 text-[#F5B041]'
                : 'text-[#8E98A4] group-hover:text-white'
            }`}
          >
            <Bike size={20} />
          </div>
          <span
            className={`text-[11px] font-sans font-bold leading-none ${
              isGarageActive ? 'text-[#F5B041]' : 'text-[#8E98A4]'
            }`}
          >
            Garage
          </span>
        </Link>

        {/* 5. Account */}
        <Link
          to={getProfilePath()}
          onClick={resetScroll}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all group ${
            isAccountActive ? 'text-[#F5B041]' : 'text-[#8E98A4] hover:text-white'
          }`}
          aria-label="Account"
        >
          <div
            className={`w-10 h-7 rounded-xl flex items-center justify-center transition-all ${
              isAccountActive
                ? 'bg-[#F5B041]/15 border border-[#F5B041]/40 text-[#F5B041]'
                : 'text-[#8E98A4] group-hover:text-white'
            }`}
          >
            <User size={20} />
          </div>
          <span
            className={`text-[11px] font-sans font-bold leading-none ${
              isAccountActive ? 'text-[#F5B041]' : 'text-[#8E98A4]'
            }`}
          >
            Account
          </span>
        </Link>
      </div>

      {/* iOS Home Indicator Pill Bar */}
      <div className="w-32 h-[4px] bg-white/30 rounded-full mx-auto mt-2 mb-0.5" aria-hidden="true" />
    </nav>
  );
}
