import { Link, useLocation } from 'react-router-dom';
import { Home, Wrench, Navigation, Bike, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  // If in dedicated emergency mode, do not display standard navigation
  const isEmergencyMode =
    location.pathname === '/sos' || location.pathname === '/accident-assistant';

  if (isEmergencyMode) {
    return null;
  }

  const getProfilePath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'HELPER') return '/helper/dashboard';
    return '/rider/profile';
  };

  const getGaragePath = () => {
    if (user?.role === 'RIDER') return '/rider/bikes';
    return '/save-my-bike';
  };

  const isHomeActive = location.pathname === '/';
  const isHelpActive =
    location.pathname.startsWith('/nearby-services') ||
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
  const isProfileActive =
    location.pathname.startsWith('/rider/profile') ||
    location.pathname.startsWith('/rider/dashboard') ||
    location.pathname.startsWith('/helper/') ||
    location.pathname.startsWith('/admin/') ||
    location.pathname === '/login' ||
    location.pathname === '/register';

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom App Navigation">
      {/* 1. Home */}
      <Link
        to="/"
        className={`mobile-nav-item ${isHomeActive ? 'is-active' : ''}`}
        aria-label="Home"
      >
        <div className="mobile-nav-icon-wrap">
          <Home size={22} />
        </div>
        <span className="mobile-nav-label">Home</span>
      </Link>

      {/* 2. Help / Assistance */}
      <Link
        to="/nearby-services"
        className={`mobile-nav-item ${isHelpActive ? 'is-active' : ''}`}
        aria-label="Help and Assistance"
      >
        <div className="mobile-nav-icon-wrap">
          <Wrench size={22} />
        </div>
        <span className="mobile-nav-label">Help</span>
      </Link>

      {/* 3. Rides */}
      <Link
        to="/safe-ride"
        className={`mobile-nav-item ${isRidesActive ? 'is-active' : ''}`}
        aria-label="Safe Rides and Navigation"
      >
        <div className="mobile-nav-icon-wrap">
          <Navigation size={22} />
        </div>
        <span className="mobile-nav-label">Rides</span>
      </Link>

      {/* 4. Garage */}
      <Link
        to={getGaragePath()}
        className={`mobile-nav-item ${isGarageActive ? 'is-active' : ''}`}
        aria-label="Motorcycle Garage"
      >
        <div className="mobile-nav-icon-wrap">
          <Bike size={22} />
        </div>
        <span className="mobile-nav-label">Garage</span>
      </Link>

      {/* 5. Profile */}
      <Link
        to={getProfilePath()}
        className={`mobile-nav-item ${isProfileActive ? 'is-active' : ''}`}
        aria-label={user ? 'Profile' : 'Login'}
      >
        <div className="mobile-nav-icon-wrap">
          <User size={22} />
        </div>
        <span className="mobile-nav-label">{user ? 'Profile' : 'Account'}</span>
      </Link>
    </nav>
  );
}
