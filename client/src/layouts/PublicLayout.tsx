import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navigation, Menu, X, ArrowRight, User, Wrench, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MobileBottomNav } from '../components/MobileBottomNav';

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'HELPER') return '/helper/dashboard';
    return '/rider/dashboard';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="public-layout">
      <header className="site-header">
        <nav className="nav page-container" aria-label="Primary navigation">
          <Link className="brand" to="/" onClick={closeMenu}>
            <span className="brand-mark">
              <Navigation size={19} />
            </span>
            MotoAssist
          </Link>
          <button
            className="menu-button"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
          <div className={`nav__links ${menuOpen ? 'nav__links--open' : ''}`}>
            <NavLink to="/" end onClick={closeMenu} className={({ isActive }) => (isActive ? 'nav-link--active' : '')}>
              Home
            </NavLink>
            <NavLink to="/safety" onClick={closeMenu} className={({ isActive }) => (isActive ? 'nav-link--active' : '')}>
              Safety
            </NavLink>
            <NavLink to="/safe-ride" onClick={closeMenu} className={({ isActive }) => (isActive ? 'nav-link--active' : '')}>
              Safe Ride
            </NavLink>
            <NavLink to="/im-stranded" onClick={closeMenu} className={({ isActive }) => (isActive ? 'nav-link--active' : '')}>
              I'm Stranded
            </NavLink>
            <NavLink to="/nearby-services" onClick={closeMenu} className={({ isActive }) => (isActive ? 'nav-link--active' : '')}>
              Nearby
            </NavLink>
            <NavLink to="/route-coverage" onClick={closeMenu} className={({ isActive }) => (isActive ? 'nav-link--active' : '')}>
              Corridor Hub
            </NavLink>

            {user ? (
              <div className="nav-user-cluster">
                <Link to={getDashboardPath()} className="button button--secondary button--sm" onClick={closeMenu}>
                  {user.role === 'ADMIN' ? <Shield size={16} /> : user.role === 'HELPER' ? <Wrench size={16} /> : <User size={16} />}
                  Dashboard
                </Link>
                <button
                  type="button"
                  className="button button--ghost button--sm"
                  onClick={() => {
                    logout();
                    navigate('/');
                    closeMenu();
                  }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <Link className={`nav-login ${isActive('/login') ? 'nav-link--active' : ''}`} to="/login" onClick={closeMenu}>
                  Login
                </Link>
                <Link className="nav-register" to="/register" onClick={closeMenu}>
                  Register <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </nav>
        {menuOpen && (
          <div className="nav-backdrop" onClick={closeMenu} aria-hidden="true" />
        )}
      </header>

      <main className="public-main" key={location.pathname}>
        <div className="page-transition">
          <Outlet />
        </div>
      </main>

      {location.pathname !== '/' && (
      <section className="final-cta-section shell">
        <div className="final-cta-content">
          <h2>Keep riding. We’ll help you find the next step.</h2>
          <p>
            Whether you are commuting through Siliguri or touring the Himalayan roads, MotoAssist helps you coordinate roadside support when you need it.
          </p>
          <div className="final-cta-actions">
            <Link to="/request-help" className="button button--primary">
              Request Help Now <ArrowRight size={18} />
            </Link>
            <Link to="/become-helper" className="button button--secondary">
              Become a Helper
            </Link>
          </div>
        </div>
      </section>
      )}

      <footer className="site-footer">
        <div className="shell footer-grid">
          <div className="footer-brand">
            <h3>
              <span className="brand-mark">
                <Navigation size={19} />
              </span>
              MotoAssist
            </h3>
            <p>
              Thoughtful roadside-assistance coordination for motorcycle riders on Himalayan routes.
            </p>
          </div>
          <div className="footer-links">
            <h4>Safety & SOS</h4>
            <ul>
              <li><Link to="/sos">🚨 Emergency SOS (Hold 3s)</Link></li>
              <li><Link to="/women-safety">Women Rider Safety</Link></li>
              <li><Link to="/safety-circle">Family Safety Circle</Link></li>
              <li><Link to="/medical-id">Medical Clinical ID</Link></li>
              <li><Link to="/emergency-services">112 / Hospital Directory</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Rescue & Garage</h4>
            <ul>
              <li><Link to="/im-stranded">I'm Stranded (Fast Triage)</Link></li>
              <li><Link to="/save-my-bike">Motorcycle Towing / Recovery</Link></li>
              <li><Link to="/ai-bike-assistant">AI Breakdown Diagnosis</Link></li>
              <li><Link to="/spare-parts">Verified Spare Parts</Link></li>
              <li><Link to="/pre-ride-check">11-Point Pre-Ride Check</Link></li>
              <li><Link to="/documents">Digital Document Wallet</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Road Intelligence</h4>
            <ul>
              <li><Link to="/safe-ride">Start Safe Ride HUD</Link></li>
              <li><Link to="/route-coverage">Himalayan Route Coverage</Link></li>
              <li><Link to="/road-hazards">Community Hazard Feed</Link></li>
              <li><Link to="/accident-assistant">Accident Incident Mode</Link></li>
              <li><Link to="/privacy">Privacy & Safety Center</Link></li>
            </ul>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© {new Date().getFullYear()} MotoAssist. Engineered for Himalayan motorcycle safety & transparent roadside rescue.</span>
        </div>
      </footer>
      <MobileBottomNav />
    </div>
  );
}
