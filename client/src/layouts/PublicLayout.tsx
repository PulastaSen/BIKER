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
            <NavLink to="/how-it-works" onClick={closeMenu} className={({ isActive }) => (isActive ? 'nav-link--active' : '')}>
              How It Works
            </NavLink>
            <NavLink to="/safety" onClick={closeMenu} className={({ isActive }) => (isActive ? 'nav-link--active' : '')}>
              Safety
            </NavLink>
            <NavLink to="/become-helper" onClick={closeMenu} className={({ isActive }) => (isActive ? 'nav-link--active' : '')}>
              Become a Helper
            </NavLink>
            <NavLink to="/nearby-services" onClick={closeMenu} className={({ isActive }) => (isActive ? 'nav-link--active' : '')}>
              Nearby Repair
            </NavLink>
            <NavLink to="/request-help" onClick={closeMenu} className="nav-help-link">
              Request Help
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
            <h4>Explore</h4>
            <ul>
              <li><Link to="/how-it-works">How it works</Link></li>
              <li><Link to="/nearby-services">Nearby Mechanics & OEM</Link></li>
              <li><Link to="/request-help">Request help</Link></li>
              <li><Link to="/become-helper">Become a helper</Link></li>
              <li><Link to="/safety">Safety guidance</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/rider/dashboard">Rider Portal</Link></li>
              <li><Link to="/helper/dashboard">Helper Portal</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/safety">Terms of Service</Link></li>
              <li><Link to="/safety">Privacy Policy</Link></li>
              <li><Link to="/safety">Contact Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© {new Date().getFullYear()} MotoAssist. Built for safer rides.</span>
        </div>
      </footer>
      <MobileBottomNav />
    </div>
  );
}
