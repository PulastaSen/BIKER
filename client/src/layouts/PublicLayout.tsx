import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navigation, Menu, X, ArrowRight, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { StickyEmergencySOS } from '../components/StickyEmergencySOS';

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  const isEmergencyMode = location.pathname === '/sos';
  const isFullScreenMode = ['/emergency', '/emergency-assist', '/entry'].includes(location.pathname);

  // Informational pages where long scrolling, full footer, and marketing CTA are acceptable
  const isInformationalPage = [
    '/how-it-works',
    '/safety',
    '/privacy',
    '/privacy-center',
    '/become-helper',
  ].includes(location.pathname);

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

  if (isFullScreenMode) {
    return (
      <div className="public-layout min-h-screen flex flex-col bg-[#090909] text-white">
        <main className="public-main flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="public-layout min-h-screen flex flex-col bg-[#090909] text-white">
      {/* If in Dedicated Emergency Mode, render minimal Emergency Header */}
      {isEmergencyMode ? (
        <header className="sticky top-0 z-50 bg-[#160808]/95 border-b border-red-500/40 backdrop-blur-md px-4 py-3">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-black text-xs sm:text-sm text-red-200 tracking-wider uppercase flex items-center gap-1.5">
                <ShieldAlert size={16} className="text-red-400" />
                EMERGENCY RESCUE MODE
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-bold text-gray-200 transition-all border border-white/10 cursor-pointer"
            >
              Exit Emergency
            </button>
          </div>
        </header>
      ) : (
        <header className="site-header sticky top-0 z-40 bg-[#090909]/95 border-b border-white/10 backdrop-blur-md">
          <nav className="nav page-container flex items-center justify-between max-w-7xl mx-auto px-4 py-3" aria-label="Primary navigation">
            <Link className="brand flex items-center gap-2 font-black text-lg text-white" to="/" onClick={closeMenu}>
              <span className="brand-mark w-8 h-8 rounded-xl bg-[#FFF174] text-black flex items-center justify-center">
                <Navigation size={18} />
              </span>
              <span>MotoAssist</span>
            </Link>

            {/* Mobile Hamburger toggle */}
            <button
              className="menu-button md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* CONSOLIDATED PRIMARY RIDER NAVIGATION (Section 1) */}
            <div className={`nav__links ${menuOpen ? 'nav__links--open' : ''} flex items-center gap-1 sm:gap-2`}>
              {/* 1. HOME */}
              <NavLink
                to="/"
                end
                onClick={closeMenu}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                    isActive ? 'bg-[#FFF174]/15 text-[#FFF174]' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                Home
              </NavLink>

              {/* 2. HELP */}
              <NavLink
                to="/nearby-services"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                    isActive ? 'bg-[#FFF174]/15 text-[#FFF174]' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                Help
              </NavLink>

              {/* 3. RIDES */}
              <NavLink
                to="/safe-ride"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                    isActive ? 'bg-[#FFF174]/15 text-[#FFF174]' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                Rides
              </NavLink>

              {/* 4. GARAGE */}
              <NavLink
                to={getGaragePath()}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                    isActive ? 'bg-[#FFF174]/15 text-[#FFF174]' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                Garage
              </NavLink>

              {/* 5. PROFILE / LOGIN */}
              <NavLink
                to={getProfilePath()}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                    isActive ? 'bg-[#FFF174]/15 text-[#FFF174]' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                {user ? 'Profile' : 'Sign In'}
              </NavLink>

              {/* PERSISTENT HEADER SOS ACTION (Section 1) */}
              <Link
                to="/sos"
                onClick={closeMenu}
                className="ml-2 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all"
                aria-label="Direct Emergency SOS"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>SOS</span>
              </Link>

              {user && (
                <button
                  type="button"
                  className="p-1.5 text-gray-400 hover:text-white transition-colors ml-1 cursor-pointer"
                  onClick={() => {
                    logout();
                    navigate('/');
                    closeMenu();
                  }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </nav>
          {menuOpen && (
            <div className="nav-backdrop fixed inset-0 bg-black/60 z-30 md:hidden" onClick={closeMenu} aria-hidden="true" />
          )}
        </header>
      )}

      {/* MAIN VIEW */}
      <main className="public-main flex-1" key={location.pathname}>
        <div className="page-transition">
          <Outlet />
        </div>
      </main>

      {/* MARKETING CTA: Only shown on Informational Pages per Section 2 & 16 */}
      {isInformationalPage && (
        <section className="final-cta-section shell py-12 px-4 max-w-5xl mx-auto text-center space-y-4">
          <div className="final-cta-content bg-[#121212] border border-white/10 rounded-3xl p-8 sm:p-12 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Keep riding. We’ll help you find the next step.
            </h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Whether you are commuting or touring Himalayan roads, MotoAssist coordinates transparent roadside rescue.
            </p>
            <div className="final-cta-actions flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link to="/im-stranded" className="px-5 py-3 rounded-xl bg-[#FFF174] text-black font-black text-xs uppercase tracking-wider hover:bg-yellow-400">
                I'm Stranded <ArrowRight size={14} className="inline ml-1" />
              </Link>
              <Link to="/become-helper" className="px-5 py-3 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20">
                Become a Helper
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FULL FOOTER: Only shown on Informational Pages */}
      {isInformationalPage ? (
        <footer className="site-footer bg-[#0c0c0c] border-t border-white/10 py-12 px-4 text-xs text-gray-400">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-black text-white text-base">
                <Navigation size={18} className="text-[#FFF174]" /> MotoAssist
              </div>
              <p className="text-xs text-gray-500">
                Roadside assistance & emergency network for Himalayan motorcycle riders.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white uppercase text-[11px] mb-3">Rescue</h4>
              <ul className="space-y-2">
                <li><Link to="/sos" className="hover:text-white">Emergency SOS</Link></li>
                <li><Link to="/im-stranded" className="hover:text-white">I'm Stranded</Link></li>
                <li><Link to="/nearby-services" className="hover:text-white">Nearby Mechanics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white uppercase text-[11px] mb-3">Safety</h4>
              <ul className="space-y-2">
                <li><Link to="/safe-ride" className="hover:text-white">Safe Ride HUD</Link></li>
                <li><Link to="/women-safety" className="hover:text-white">Women Rider Safety</Link></li>
                <li><Link to="/medical-id" className="hover:text-white">Medical Emergency ID</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white uppercase text-[11px] mb-3">Legal & Info</h4>
              <ul className="space-y-2">
                <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Center</Link></li>
                <li><Link to="/become-helper" className="hover:text-white">Join as Helper</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-6xl mx-auto border-t border-white/10 mt-8 pt-6 text-center text-gray-500">
            <span>© {new Date().getFullYear()} MotoAssist. Engineered for Himalayan motorcycle safety.</span>
          </div>
        </footer>
      ) : !isEmergencyMode ? (
        /* COMPACT 1-LINE FOOTER on Desktop for Task/Utility Pages; Hidden on Mobile per Section 16 */
        <footer className="hidden md:block py-4 border-t border-white/5 bg-[#090909] text-center text-[11px] text-gray-500">
          <div className="max-w-4xl mx-auto flex items-center justify-between px-4">
            <span>© {new Date().getFullYear()} MotoAssist • 24/7 Roadside Rescue</span>
            <div className="flex items-center gap-4">
              <Link to="/how-it-works" className="hover:text-gray-300">How It Works</Link>
              <Link to="/privacy" className="hover:text-gray-300">Privacy</Link>
              <Link to="/become-helper" className="hover:text-gray-300">Become a Helper</Link>
            </div>
          </div>
        </footer>
      ) : null}

      {/* Globally accessible Emergency SOS Floating Action */}
      <StickyEmergencySOS />

      {/* Native-style Mobile Bottom Navigation (Home, Help, Rides, Garage, Profile) */}
      <MobileBottomNav />
    </div>
  );
}
