
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MobileBottomNav } from '../components/MobileBottomNav';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#090909] text-white flex items-center justify-center p-6">
        <div className="bg-[#111111] p-8 rounded-3xl border border-white/10 text-center max-w-md w-full">
          <h1 className="text-2xl font-black mb-4 text-[#FFF174]">Access Restricted</h1>
          <p className="text-gray-400 mb-8">Please log in to access the dashboard portal.</p>
          <Link to="/login" className="inline-block px-8 py-3 bg-[#FFF174] text-black font-bold rounded-xl hover:bg-yellow-400">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const role = user.role;

  const riderLinks = [
    { to: '/rider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/helpers', label: 'Verify Helpers', icon: ShieldCheck },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/requests', label: 'System Requests', icon: Clock },
    { to: '/admin/reports', label: 'Safety Reports', icon: AlertTriangle },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'HELPER' ? helperLinks : riderLinks;

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col md:flex-row">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-[#090909] border-r border-white/5 z-40">
        <div className="p-6">
          <Link className="flex items-center gap-2 font-black text-xl mb-2 text-[#FFF174]" to="/">
            <Navigation size={24} /> MotoAssist
          </Link>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
            {role} PORTAL
          </span>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-[#FFF174]/10 text-[#FFF174] font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <UserIcon size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 text-gray-300 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 dashboard-content" key={location.pathname}>
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation (Visible only on mobile) */}
      <MobileBottomNav />
    </div>
  );
}
