import { Link, useLocation } from 'react-router-dom';
import { Home, Map as MapIcon, User, AlertTriangle, List } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'HELPER') return '/helper/dashboard';
    return '/rider/profile'; // Or profile page depending on the user's need.
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isMapActive = location.pathname.startsWith('/nearby-services');
  const isRequestsActive = location.pathname.startsWith('/rider/requests') || location.pathname.startsWith('/helper/available-requests');
  const isProfileActive = location.pathname.startsWith('/rider/profile') || 
                            location.pathname.startsWith('/helper/profile') || 
                            location.pathname === '/login' || 
                            location.pathname === '/register';

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile WebApp Navigation">
      <Link 
        to="/" 
        className={`mobile-nav-item ${isActive('/') ? 'is-active' : ''}`}
        aria-label="Home"
      >
        <div className="mobile-nav-icon-wrap">
          <Home size={24} />
        </div>
        <span className="mobile-nav-label">Home</span>
      </Link>

      <Link 
        to="/nearby-services" 
        className={`mobile-nav-item ${isMapActive ? 'is-active' : ''}`}
        aria-label="Nearby Help"
      >
        <div className="mobile-nav-icon-wrap">
          <MapIcon size={24} />
        </div>
        <span className="mobile-nav-label">Map</span>
      </Link>

      {/* Prominent Center Emergency / SOS Trigger */}
      <Link 
        to="/sos" 
        className="mobile-nav-item mobile-nav-item--sos"
        aria-label="Emergency SOS"
      >
        <div className="mobile-sos-circle" style={{ width: '64px', height: '64px', top: '-24px', backgroundColor: '#DC2626' }}>
          <AlertTriangle size={28} className="text-white" />
          <span className="mobile-sos-pulse" aria-hidden="true" style={{ borderColor: '#DC2626' }} />
        </div>
        <span className="mobile-nav-label mobile-sos-label" style={{ marginTop: '20px' }}>SOS</span>
      </Link>

      <Link 
        to={user ? (user.role === 'HELPER' ? '/helper/available-requests' : '/rider/requests') : '/login'} 
        className={`mobile-nav-item ${isRequestsActive ? 'is-active' : ''}`}
        aria-label="Requests"
      >
        <div className="mobile-nav-icon-wrap">
          <List size={24} />
        </div>
        <span className="mobile-nav-label">Activity</span>
      </Link>

      <Link 
        to={getDashboardPath()} 
        className={`mobile-nav-item ${isProfileActive ? 'is-active' : ''}`}
        aria-label={user ? 'My Profile' : 'Login'}
      >
        <div className="mobile-nav-icon-wrap">
          <User size={24} />
        </div>
        <span className="mobile-nav-label">{user ? 'Profile' : 'Login'}</span>
      </Link>
    </nav>
  );
}
