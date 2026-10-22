import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Navigation,
  LayoutDashboard,
  PlusCircle,
  Clock,
  Bike as BikeIcon,
  PhoneCall,
  User as UserIcon,
  Settings,
  Wrench,
  Search,
  ChevronRight,
  ShieldCheck,
  Users,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { StickyEmergencySOS } from '../components/StickyEmergencySOS';

export function DashboardLayout() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user, logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const closeDrawer = () => setMobileDrawerOpen(false);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileDrawerOpen]);

  // Reset scroll position on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    closeDrawer();
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#151515] text-white flex items-center justify-center p-6">
        <div className="bg-[#1D1D1D] p-8 rounded-3xl border border-white/10 text-center max-w-md w-full shadow-2xl">
          <h1 className="text-2xl font-black mb-4 text-[#FFF174]">Access Restricted</h1>
          <p className="text-[#C5C5C5] mb-8">Please log in to access the dashboard portal.</p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-[#FFF174] text-black font-bold rounded-xl hover:bg-yellow-400 active:scale-95 transition-transform"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const role = user.role;

  const riderLinks = [
    { to: '/rider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/services', label: 'Services Catalogue', icon: Wrench },
    { to: '/subscriptions', label: 'RSA Plans & Shield', icon: ShieldCheck },
    { to: '/request-help', label: 'Request Help', icon: PlusCircle },
    { to: '/rider/requests', label: 'My Help Requests', icon: Clock },
    { to: '/rider/bikes', label: 'My Garage (Bikes)', icon: BikeIcon },
    { to: '/rider/emergency-contacts', label: 'Emergency Contacts', icon: PhoneCall },
    { to: '/rider/profile', label: 'Rider Profile', icon: UserIcon },
    { to: '/rider/settings', label: 'Settings', icon: Settings },
  ];

  const helperLinks = [
    { to: '/helper/dashboard', label: 'Helper Dashboard', icon: LayoutDashboard },
    { to: '/helper/available-requests', label: 'Available Requests Feed', icon: Search },
    { to: '/helper/my-assists', label: 'My Assistance Log', icon: Clock },
    { to: '/helper/profile', label: 'Helper Profile & Skills', icon: Wrench },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Operations Command Centre', icon: LayoutDashboard },
    { to: '/ops', label: 'Live Ops Desk', icon: Clock },
    { to: '/admin/helpers', label: 'Verify Helpers', icon: ShieldCheck },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/requests', label: 'System Requests', icon: AlertTriangle },
    { to: '/admin/reports', label: 'Safety Reports', icon: AlertTriangle },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'HELPER' ? helperLinks : riderLinks;

  const getProfilePath = () => {
    if (role === 'HELPER') return '/helper/profile';
    if (role === 'ADMIN') return '/admin/dashboard';
    return '/rider/profile';
  };

  return (
    <div className="min-h-screen bg-[#151515] text-white flex flex-col md:flex-row">
      
      {/* Mobile & Tablet Top Bar (Sticky with accessible Logout & Menu) */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#1D1D1D]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <Link className="flex items-center gap-2 font-black text-lg text-[#FFF174]" to="/" onClick={closeDrawer}>
          <Navigation size={20} />
          <span>MotoAssist</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Role badge */}
          <Link
            to={getProfilePath()}
            onClick={closeDrawer}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            title="View Profile"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5C5C5]">
              {role}
            </span>
          </Link>

          {/* Quick Mobile Logout Action in Header Bar */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-400 border border-red-500/30 transition-all flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer"
            title="Log Out"
            aria-label="Log Out of MotoAssist"
          >
            {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
          </button>

          {/* Mobile Navigation Drawer Toggle */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Toggle navigation drawer"
            aria-expanded={mobileDrawerOpen}
          >
            {mobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile & Tablet Drawer Modal */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in duration-150">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={closeDrawer} aria-hidden="true" />
          
          <div className="relative w-4/5 max-w-xs bg-[#1D1D1D] border-r border-white/15 h-[100dvh] max-h-[100dvh] flex flex-col z-10 shadow-2xl">
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#252525]">
              <div>
                <div className="flex items-center gap-2 font-black text-lg text-[#FFF174]">
                  <Navigation size={20} /> MotoAssist
                </div>
                <span className="text-[10px] font-bold text-[#C5C5C5] uppercase tracking-widest mt-0.5 block">
                  {role} PORTAL
                </span>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-2.5 text-gray-400 hover:text-white rounded-xl bg-white/5 border border-white/10 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close navigation drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Navigation Items */}
            <nav className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-1.5" aria-label="Mobile Role Navigation">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => {
                      closeDrawer();
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                      isActive ? 'bg-[#FFF174] text-black font-black shadow-md' : 'text-[#C5C5C5] hover:bg-white/5 hover:text-white font-medium'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{link.label}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto" />}
                  </NavLink>
                );
              })}
            </nav>

            {/* Drawer Footer with User identity & prominent Logout */}
            <div className="p-5 border-t border-white/10 shrink-0 bg-[#252525] space-y-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <Link
                to={getProfilePath()}
                onClick={closeDrawer}
                className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#FFF174]/20 border border-[#FFF174]/40 text-[#FFF174] flex items-center justify-center shrink-0 font-bold">
                  <UserIcon size={18} />
                </div>
                <div className="overflow-hidden min-w-0">
                  <p className="font-bold text-sm text-white truncate">{user.name}</p>
                  <p className="text-xs text-[#C5C5C5] truncate">{user.email}</p>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 active:scale-98 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer min-h-[44px]"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Logging out…</span>
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    <span>Log Out from MotoAssist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Visible on md+) */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-[#1D1D1D] border-r border-white/10 z-40">
        <div className="p-6 border-b border-white/10">
          <Link className="flex items-center gap-2 font-black text-xl text-[#FFF174]" to="/">
            <Navigation size={24} /> MotoAssist
          </Link>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md mt-2 inline-block">
            {role} PORTAL
          </span>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-[#FFF174] text-black font-black shadow-md' : 'text-[#C5C5C5] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-semibold">{link.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-5 border-t border-white/10 bg-[#252525] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF174]/20 border border-[#FFF174]/40 text-[#FFF174] flex items-center justify-center shrink-0 font-bold">
              <UserIcon size={18} />
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="font-bold text-sm text-white truncate">{user.name}</p>
              <p className="text-xs text-[#C5C5C5] truncate">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 active:scale-98 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer min-h-[42px]"
          >
            {isLoggingOut ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Logging out…</span>
              </>
            ) : (
              <>
                <LogOut size={15} />
                <span>Log Out</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area - with pb-28 on mobile so bottom bar NEVER covers content or buttons */}
      <main className="flex-1 flex flex-col min-w-0 dashboard-content pb-28 md:pb-8" key={location.pathname}>
        <Outlet />
      </main>

      {/* Globally accessible Emergency SOS Floating Action */}
      <StickyEmergencySOS />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}

