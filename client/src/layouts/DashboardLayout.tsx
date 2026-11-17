import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
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
import { MotoAssistLogoMark } from '../components/MotoAssistLogoMark';

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
      <div className="min-h-screen bg-[#0A0D12] text-white flex items-center justify-center p-6">
        <div className="bg-[#181D24] p-8 rounded-3xl border border-white/10 text-center max-w-md w-full shadow-2xl">
          <h1 className="text-2xl font-black mb-4 text-[#F5B041]">Access Restricted</h1>
          <p className="text-[#9CA3AF] mb-8">Please log in to access the dashboard portal.</p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-[#F5B041] text-black font-bold rounded-xl hover:bg-[#E5A835] active:scale-95 transition-transform"
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
    <div className="min-h-screen bg-[#0A0D12] text-white flex flex-col md:flex-row selection:bg-[#F5B041] selection:text-black">
      
      {/* Mobile & Tablet Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0A0D12]/95 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 shadow-md">
        <Link to="/" onClick={closeDrawer} className="flex items-center gap-2" aria-label="MotoAssist Home">
          <MotoAssistLogoMark size={28} />
          <div className="flex flex-col leading-none">
            <div className="text-sm font-black tracking-tight uppercase">
              <span className="text-white">MOTO</span>
              <span className="text-[#F5B041]">ASSIST</span>
            </div>
            <span className="text-[8px] font-bold tracking-wider text-[#8A96A3] uppercase mt-0.5">
              {role} PORTAL
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Role badge */}
          <Link
            to={getProfilePath()}
            onClick={closeDrawer}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181D24] border border-white/10 hover:border-[#F5B041]/40 transition-colors"
            title="View Profile"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9CA3AF]">
              {role}
            </span>
          </Link>

          {/* Quick Mobile Logout Action in Header Bar */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-400 border border-red-500/20 transition-all flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer"
            title="Log Out"
            aria-label="Log Out of MotoAssist"
          >
            {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
          </button>

          {/* Mobile Navigation Drawer Toggle */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2.5 rounded-xl bg-[#181D24] border border-white/10 text-white hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
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
          
          <div className="relative w-4/5 max-w-xs bg-[#12161D] border-r border-white/10 h-[100dvh] max-h-[100dvh] flex flex-col z-10 shadow-2xl">
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0A0D12]">
              <div className="flex items-center gap-2">
                <MotoAssistLogoMark size={26} />
                <div className="flex flex-col leading-none">
                  <div className="text-sm font-black tracking-tight uppercase">
                    <span className="text-white">MOTO</span>
                    <span className="text-[#F5B041]">ASSIST</span>
                  </div>
                  <span className="text-[8px] font-bold tracking-wider text-[#8A96A3] uppercase mt-0.5">
                    {role} PORTAL
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-2 text-[#9CA3AF] hover:text-white rounded-xl bg-[#181D24] border border-white/10 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-[#181D24] text-[#F5B041] border border-[#F5B041]/40 font-bold shadow-[0_0_8px_rgba(245,176,65,0.2)]'
                        : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white font-medium'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{link.label}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto text-[#F5B041]" />}
                  </NavLink>
                );
              })}
            </nav>

            {/* Drawer Footer with User identity & prominent Logout */}
            <div className="p-4 border-t border-white/10 shrink-0 bg-[#0A0D12] space-y-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <Link
                to={getProfilePath()}
                onClick={closeDrawer}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#181D24] hover:bg-white/10 transition-colors border border-white/10"
              >
                <div className="w-10 h-10 rounded-full bg-[#F5B041]/15 border border-[#F5B041]/30 text-[#F5B041] flex items-center justify-center shrink-0 font-bold">
                  <UserIcon size={18} />
                </div>
                <div className="overflow-hidden min-w-0">
                  <p className="font-bold text-sm text-white truncate">{user.name}</p>
                  <p className="text-xs text-[#9CA3AF] truncate">{user.email}</p>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 active:scale-98 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer min-h-[44px]"
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
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-[#0A0D12] border-r border-white/5 z-40">
        <div className="p-5 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2.5" aria-label="MotoAssist Home">
            <MotoAssistLogoMark size={32} />
            <div className="flex flex-col leading-none">
              <div className="text-lg font-black tracking-tight uppercase">
                <span className="text-white">MOTO</span>
                <span className="text-[#F5B041]">ASSIST</span>
              </div>
              <span className="text-[9px] font-bold tracking-wider text-[#8A96A3] uppercase mt-0.5">
                {role} PORTAL
              </span>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5" aria-label="Desktop Role Navigation">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#181D24] text-[#F5B041] border border-[#F5B041]/40 font-bold shadow-[0_0_8px_rgba(245,176,65,0.2)]'
                    : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-semibold">{link.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto text-[#F5B041]" />}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-5 border-t border-white/5 bg-[#0A0D12] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F5B041]/15 border border-[#F5B041]/30 text-[#F5B041] flex items-center justify-center shrink-0 font-bold">
              <UserIcon size={18} />
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="font-bold text-sm text-white truncate">{user.name}</p>
              <p className="text-xs text-[#9CA3AF] truncate">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 active:scale-98 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer min-h-[44px]"
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
      <main className="flex-1 flex flex-col min-w-0 dashboard-content pb-28 md:pb-16" key={location.pathname}>
        <Outlet />
      </main>

      {/* Globally accessible Emergency SOS Floating Action */}
      <StickyEmergencySOS />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
