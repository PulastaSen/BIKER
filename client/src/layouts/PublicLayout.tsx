import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { StickyEmergencySOS } from '../components/StickyEmergencySOS';
import { MobileAppHeader } from '../components/MobileAppHeader';
import { MobileMenuDrawer } from '../components/MobileMenuDrawer';
import { NotificationsModal } from '../components/NotificationsModal';
import { MotoAssistLogoMark } from '../components/MotoAssistLogoMark';

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-close menu and modal on route change
  useEffect(() => {
    setMenuOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  const isEmergencyMode = location.pathname === '/sos';
  const isFullScreenMode = ['/entry'].includes(location.pathname);
  const isHomePage = location.pathname === '/';

  // Informational pages where long scrolling and marketing CTA are acceptable
  const isInformationalPage = [
    '/how-it-works',
    '/safety',
    '/privacy',
    '/privacy-center',
    '/become-helper',
  ].includes(location.pathname);

  if (isFullScreenMode) {
    return (
      <div className="public-layout min-h-screen flex flex-col bg-[#0A0D12] text-white font-sans">
        <main className="public-main flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="public-layout min-h-screen flex flex-col bg-[#0A0D12] text-white font-sans selection:bg-[#F5B041] selection:text-black">
      {/* If in Dedicated Emergency Mode, render minimal Emergency Header (Red & White) */}
      {isEmergencyMode ? (
        <header className="sticky top-0 z-50 bg-[#E53935] border-b border-red-700 shadow-md backdrop-blur-md px-4 py-3">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span className="font-black text-xs sm:text-sm text-white tracking-wider uppercase flex items-center gap-1.5 font-display">
                <ShieldAlert size={16} className="text-white" />
                EMERGENCY RESCUE MODE
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 text-xs font-bold text-white transition-all border border-white/30 cursor-pointer min-h-[44px]"
            >
              Exit Emergency
            </button>
          </div>
        </header>
      ) : !isHomePage ? (
        /* Unified Minimalist Header for all non-home pages: Matches Exact Mobile and Desktop UI */
        <div className="sticky top-0 z-40 bg-[#0A0D12]/95 backdrop-blur-md border-b border-white/5">
          <div className="w-full max-w-md md:max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6">
            <MobileAppHeader
              onOpenMenu={() => setMenuOpen(true)}
              onOpenNotifications={() => setNotificationsOpen(true)}
              hasUnreadNotifications={true}
            />
          </div>
        </div>
      ) : null}

      {/* Shared Navigation Drawer & Notifications Modal for Public Pages */}
      {!isHomePage && (
        <>
          <MobileMenuDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
          <NotificationsModal
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />
        </>
      )}

      {/* MAIN VIEW */}
      <main className="public-main flex-1 pb-28 md:pb-16" key={location.pathname}>
        <div className="page-transition">
          <Outlet />
        </div>
      </main>

      {/* MARKETING CTA: Only shown on Informational Pages */}
      {isInformationalPage && (
        <section className="final-cta-section py-12 px-4 max-w-5xl mx-auto text-center space-y-4">
          <div className="bg-[#181D24] border border-white/10 rounded-3xl p-8 sm:p-12 space-y-4 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Ride Safe. Get Help Anytime.
            </h2>
            <p className="text-[#9CA3AF] text-sm max-w-xl mx-auto">
              Whether you are commuting or touring Himalayan corridors, MotoAssist coordinates rapid, transparent roadside rescue.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/im-stranded"
                className="px-5 py-3 rounded-xl bg-[#F5B041] text-black font-black text-xs uppercase tracking-wider hover:bg-[#E5A835] transition-all"
              >
                I'm Stranded <ArrowRight size={14} className="inline ml-1" />
              </Link>
              <Link
                to="/become-helper"
                className="px-5 py-3 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/15 border border-white/10 transition-all"
              >
                Become a Helper
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FULL FOOTER: Only shown on Informational Pages */}
      {isInformationalPage ? (
        <footer className="site-footer bg-[#0A0D12] border-t border-white/5 py-12 px-4 text-xs text-[#9CA3AF]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MotoAssistLogoMark size={24} />
                <span className="text-white font-black text-base tracking-tight">
                  MOTO<span className="text-[#F5B041]">ASSIST</span>
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Roadside assistance & emergency rescue network for motorcycle riders across India.
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
          <div className="max-w-6xl mx-auto border-t border-white/5 mt-8 pt-6 text-center text-[#6B7280]">
            <span>© {new Date().getFullYear()} MotoAssist • Engineered for Motorcycle Safety & Rescue.</span>
          </div>
        </footer>
      ) : !isEmergencyMode && !isHomePage ? (
        /* COMPACT 1-LINE FOOTER on Desktop for Utility Pages; Hidden on Mobile */
        <footer className="hidden md:block py-4 border-t border-white/5 bg-[#0A0D12] text-center text-[11px] text-[#6B7280]">
          <div className="max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6">
            <span>© {new Date().getFullYear()} MotoAssist • 24/7 Roadside Rescue</span>
            <div className="flex items-center gap-4">
              <Link to="/how-it-works" className="hover:text-gray-300">How It Works</Link>
              <Link to="/privacy" className="hover:text-gray-300">Privacy</Link>
              <Link to="/become-helper" className="hover:text-gray-300">Become a Helper</Link>
            </div>
          </div>
        </footer>
      ) : null}

      {/* Globally accessible Emergency SOS Floating Action (Suppressed on HomePage) */}
      <StickyEmergencySOS />

      {/* Native-style Mobile Bottom Navigation (Home, Help, Rides, Garage, Account) */}
      <MobileBottomNav />
    </div>
  );
}
