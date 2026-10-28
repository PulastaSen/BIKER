import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getUsers, 
  getHelperProfiles, 
  getRequests, 
  getServiceBookings, 
  getUserSubscriptions, 
  getVehicleQrTags,
  updateServiceBookingStatus
} from '../../utils/appStorage';
import type { 
  User, 
  HelperProfile, 
  HelpRequest, 
  ServiceBooking, 
  UserSubscription, 
  VehicleQrTag 
} from '../../types/app';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  ChevronRight, 
  LogOut, 
  Loader2, 
  Wrench, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type AdminTab = 'DISPATCH_QUEUE' | 'SERVICE_BOOKINGS' | 'SUBSCRIPTIONS' | 'QR_ALERTS' | 'HELPERS';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, logout, isLoggingOut } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('DISPATCH_QUEUE');
  const [users, setUsers] = useState<User[]>([]);
  const [helpers, setHelpers] = useState<HelperProfile[]>([]);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [qrTags, setQrTags] = useState<VehicleQrTag[]>([]);

  const loadData = () => {
    setUsers(getUsers());
    setHelpers(getHelperProfiles());
    setRequests(getRequests());
    setBookings(getServiceBookings());
    setSubscriptions(getUserSubscriptions());
    setQrTags(getVehicleQrTags());
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingHelpers = helpers.filter((h) => h.verificationStatus === 'PENDING' || h.verificationStatus === 'PENDING_VERIFICATION');
  const openRequests = requests.filter((r) => ['OPEN', 'HELPER_OFFERED', 'IN_PROGRESS', 'SEARCHING', 'SUBMITTED', 'OFFERED', 'ACCEPTED', 'EN_ROUTE'].includes(r.status));
  const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE');

  // Collect all contact alerts from QR tags
  const allQrAlerts = qrTags.flatMap(tag => 
    tag.contactRequests.map(cr => ({
      ...cr,
      bikeInfo: `${tag.brand} ${tag.model} (${tag.registrationNumber})`,
      ownerNickname: tag.vehicleNickname
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleUpdateBooking = (bookingId: string, nextStatus: ServiceBooking['status']) => {
    updateServiceBookingStatus(bookingId, nextStatus);
    loadData();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-page max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-[#EFF2F7] font-sans">
      
      {/* Header */}
      <header className="dashboard-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#383A32] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <p className="eyebrow text-xs font-mono font-bold uppercase text-[#FFF174] tracking-widest">OPERATIONS COMMAND CENTRE</p>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-black text-[#EFF2F7] mt-1 tracking-tight">MotoAssist Platform Command</h1>
          <p className="text-xs text-[#A8A6A3] mt-1">Real-time supervision of dispatches, on-demand services, active subscriptions, and emergency vehicle alerts.</p>
        </div>

        {user && (
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 px-3 py-1.5 rounded-xl">
              OPS ADMIN ACTIVE
            </span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 rounded-xl bg-[#EF4444]/15 hover:bg-[#EF4444]/25 border border-[#EF4444]/30 text-[#EF4444] font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px]"
            >
              {isLoggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
              <span>Log Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-[#151613] border border-[#383A32] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold text-[#A8A6A3] uppercase tracking-wider flex items-center gap-1">
            <Clock size={13} className="text-[#FFF174]" /> Dispatches
          </span>
          <strong className="text-2xl font-display font-black text-[#EFF2F7]">{openRequests.length}</strong>
          <span className="text-[10px] text-[#A8A6A3] block">Highway & Emergency</span>
        </div>

        <div className="bg-[#151613] border border-[#383A32] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold text-[#A8A6A3] uppercase tracking-wider flex items-center gap-1">
            <Wrench size={13} className="text-[#FFF174]" /> Bookings
          </span>
          <strong className="text-2xl font-display font-black text-[#FFF174]">{bookings.length}</strong>
          <span className="text-[10px] text-[#A8A6A3] block">On-demand services</span>
        </div>

        <div className="bg-[#151613] border border-[#383A32] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold text-[#A8A6A3] uppercase tracking-wider flex items-center gap-1">
            <CreditCard size={13} className="text-[#10B981]" /> Subscriptions
          </span>
          <strong className="text-2xl font-display font-black text-[#10B981]">{activeSubs.length}</strong>
          <span className="text-[10px] text-[#A8A6A3] block">Active Shield Plans</span>
        </div>

        <div className="bg-[#151613] border border-[#383A32] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold text-[#A8A6A3] uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck size={13} className="text-[#F59E0B]" /> Pending
          </span>
          <strong className="text-2xl font-display font-black text-[#F59E0B]">{pendingHelpers.length}</strong>
          <span className="text-[10px] text-[#A8A6A3] block">Awaiting verification</span>
        </div>

        <div className="bg-[#151613] border border-[#383A32] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold text-[#A8A6A3] uppercase tracking-wider flex items-center gap-1">
            <QrCode size={13} className="text-[#B1D8E3]" /> QR Beacons
          </span>
          <strong className="text-2xl font-display font-black text-[#B1D8E3]">{allQrAlerts.length}</strong>
          <span className="text-[10px] text-[#A8A6A3] block">Vehicle alerts</span>
        </div>

        <div className="bg-[#151613] border border-[#383A32] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold text-[#A8A6A3] uppercase tracking-wider flex items-center gap-1">
            <Users size={13} className="text-[#A8A6A3]" /> Platform Users
          </span>
          <strong className="text-2xl font-display font-black text-[#EFF2F7]">{users.length}</strong>
          <span className="text-[10px] text-[#A8A6A3] block">Registered accounts</span>
        </div>
      </div>

      {/* Command Centre Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#383A32] overflow-x-auto pb-3">
        {[
          { id: 'DISPATCH_QUEUE', label: 'Emergency & Roadside Queue', count: openRequests.length },
          { id: 'SERVICE_BOOKINGS', label: 'Service Bookings Catalogue', count: bookings.length },
          { id: 'SUBSCRIPTIONS', label: 'RSA Subscriptions', count: activeSubs.length },
          { id: 'QR_ALERTS', label: 'Vehicle QR Contact Log', count: allQrAlerts.length },
          { id: 'HELPERS', label: 'Helper Verification Queue', count: pendingHelpers.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`px-4 py-2.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-2 min-h-[44px] cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#FFF174] text-black border-[#FFF174] shadow-md'
                : 'bg-[#151613] text-[#A8A6A3] border-[#383A32] hover:border-[#FFF174]/40 hover:text-[#EFF2F7]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === tab.id ? 'bg-black text-[#FFF174]' : 'bg-[#20211D] text-[#A8A6A3] border border-[#383A32]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT: EMERGENCY & DISPATCH QUEUE */}
      {activeTab === 'DISPATCH_QUEUE' && (
        <div className="bg-[#151613] border border-[#383A32] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Clock size={18} className="text-[#FFF174]" />
              <span>Live Emergency & Roadside Dispatches ({requests.length})</span>
            </h2>
            <Button variant="secondary" onClick={() => navigate('/admin/requests')}>
              Full Requests Table <ChevronRight size={14} />
            </Button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Ticket ID</th>
                  <th className="py-3 px-3">Rider</th>
                  <th className="py-3 px-3">Motorcycle</th>
                  <th className="py-3 px-3">Issue Category</th>
                  <th className="py-3 px-3">Location / Landmark</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Assigned Helper</th>
                  <th className="py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {requests.slice(0, 10).map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#FFF174]">{r.id}</td>
                    <td className="py-3 px-3">
                      <strong className="text-white block">{r.riderName}</strong>
                      <span className="text-gray-400 text-[11px]">{r.riderPhone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-gray-200 block">{r.bike.brand} {r.bike.model}</span>
                      <span className="text-[10px] font-mono text-gray-400">{r.bike.registrationNumber}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                        {r.issue.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-300 max-w-[180px] truncate">
                      {r.approximateLocation || 'Live GPS Coordinates'}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3 px-3 text-gray-300">
                      {r.assignedHelperName || <span className="text-amber-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => navigate(`/requests/${r.id}`)}
                        className="px-3 py-1 bg-white/10 hover:bg-[#FFF174] hover:text-black rounded-lg text-xs font-bold transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile 2-Column Responsive Cards */}
          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-2.5 md:hidden">
            {requests.slice(0, 10).map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-[#20211D] border border-[#383A32] flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-[#FFF174]">#{r.id.slice(-4)}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <strong className="text-xs text-white block truncate">{r.riderName}</strong>
                  <span className="text-[10px] text-gray-400 block truncate">{r.bike.brand} {r.bike.model}</span>
                  <div className="mt-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold text-[9px] uppercase inline-block">
                      {r.issue.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1.5 truncate">
                    <MapPin size={10} className="text-[#FFF174] shrink-0" />
                    <span className="truncate">{r.approximateLocation || 'Live GPS'}</span>
                  </p>
                </div>
                <div className="pt-2 border-t border-[#383A32] flex items-center justify-between">
                  <span className="text-[9px] text-gray-400 truncate max-w-[80px]">
                    {r.assignedHelperName || 'Unassigned'}
                  </span>
                  <button
                    onClick={() => navigate(`/requests/${r.id}`)}
                    className="px-2.5 py-1 bg-white/10 hover:bg-[#FFF174] hover:text-black rounded-lg text-[10px] font-bold transition-colors min-h-[32px]"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SERVICE BOOKINGS */}
      {activeTab === 'SERVICE_BOOKINGS' && (
        <div className="bg-[#151613] border border-[#383A32] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-bold uppercase tracking-wider text-[#EFF2F7] flex items-center gap-2">
              <Wrench size={18} className="text-[#FFF174]" />
              <span>Service Catalogue Bookings ({bookings.length})</span>
            </h2>
            <button
              onClick={() => navigate('/services')}
              className="text-xs text-[#FFF174] font-mono font-bold hover:underline min-h-[44px] flex items-center"
            >
              Open Service Catalogue →
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#383A32] text-[#A8A6A3] uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-3">Booking ID</th>
                  <th className="py-3 px-3">Service Name</th>
                  <th className="py-3 px-3">Rider & Contact</th>
                  <th className="py-3 px-3">Motorcycle</th>
                  <th className="py-3 px-3">Quoted Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Dispute / Notes</th>
                  <th className="py-3 px-3">Workflow Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#383A32]/50">
                {bookings.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-[#20211D] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#FFF174]">{b.bookingId}</td>
                    <td className="py-3 px-3">
                      <strong className="text-[#EFF2F7] block font-display">{b.serviceName}</strong>
                      <span className="text-[10px] text-[#A8A6A3] uppercase font-mono">{b.serviceType}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[#EFF2F7] block font-bold">{b.riderName}</span>
                      <span className="text-[#A8A6A3] text-[11px] font-mono">{b.riderPhone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#EFF2F7] block">{b.bikeDetails.brand} {b.bikeDetails.model}</span>
                      <span className="text-[10px] font-mono text-[#A8A6A3]">{b.bikeDetails.registrationNumber}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-[#FFF174]">₹{b.pricing.totalEstimated}</span>
                      {b.pricing.isCoveredBySubscription && (
                        <span className="block text-[9px] text-[#10B981] font-mono font-bold uppercase">Shield Covered</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        b.status === 'COMPLETED' ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' :
                        b.status === 'CANCELLED' ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30' :
                        b.status === 'IN_PROGRESS' ? 'bg-[#B1D8E3]/15 text-[#B1D8E3] border border-[#B1D8E3]/30' :
                        'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {b.dispute?.filed ? (
                        <span className="px-2 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 text-[10px] font-bold">
                          Disputed: ₹{b.dispute.amount}
                        </span>
                      ) : (
                        <span className="text-[#A8A6A3] text-[11px]">No disputes</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {b.status === 'REQUESTED' && (
                        <button
                          onClick={() => handleUpdateBooking(b.bookingId, 'ASSIGNED')}
                          className="px-3 py-1.5 bg-[#FFF174] text-black font-display font-bold text-[11px] uppercase tracking-wider rounded-lg hover:bg-[#ffe83b] min-h-[38px]"
                        >
                          Dispatch Provider
                        </button>
                      )}
                      {b.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleUpdateBooking(b.bookingId, 'COMPLETED')}
                          className="px-3 py-1.5 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-display font-bold text-[11px] uppercase tracking-wider rounded-lg min-h-[38px]"
                        >
                          Mark Completed
                        </button>
                      )}
                      {b.status === 'COMPLETED' && (
                        <span className="text-[#10B981] font-mono font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle2 size={13} /> Closed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile 2-Column Responsive Cards */}
          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-2.5 md:hidden">
            {bookings.map((b) => (
              <div key={b.bookingId} className="p-3 rounded-xl bg-[#20211D] border border-[#383A32] flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-[#FFF174]">#{b.bookingId.slice(-4)}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      b.status === 'COMPLETED' ? 'bg-[#10B981]/15 text-[#10B981]' :
                      b.status === 'CANCELLED' ? 'bg-[#EF4444]/15 text-[#EF4444]' :
                      'bg-[#F59E0B]/15 text-[#F59E0B]'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <strong className="text-xs text-white block line-clamp-1">{b.serviceName}</strong>
                  <span className="text-[10px] text-gray-400 block truncate">{b.bikeDetails.brand} {b.bikeDetails.model}</span>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 truncate">{b.riderName}</span>
                    <span className="font-mono font-bold text-[#FFF174]">₹{b.pricing.totalEstimated}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#383A32]">
                  {b.status === 'REQUESTED' && (
                    <button
                      onClick={() => handleUpdateBooking(b.bookingId, 'ASSIGNED')}
                      className="w-full py-1.5 bg-[#FFF174] text-black font-display font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-[#ffe83b] min-h-[34px]"
                    >
                      Dispatch
                    </button>
                  )}
                  {b.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleUpdateBooking(b.bookingId, 'COMPLETED')}
                      className="w-full py-1.5 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-display font-bold text-[10px] uppercase tracking-wider rounded-lg min-h-[34px]"
                    >
                      Complete
                    </button>
                  )}
                  {b.status === 'COMPLETED' && (
                    <span className="text-[#10B981] font-mono font-bold text-[10px] flex items-center justify-center gap-1 py-1">
                      <CheckCircle2 size={12} /> Closed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SUBSCRIPTIONS */}
      {activeTab === 'SUBSCRIPTIONS' && (
        <div className="bg-[#151613] border border-[#383A32] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-bold uppercase tracking-wider text-[#EFF2F7] flex items-center gap-2">
              <CreditCard size={18} className="text-[#FFF174]" />
              <span>Active Roadside Assistance Subscriptions ({subscriptions.length})</span>
            </h2>
            <button
              onClick={() => navigate('/subscriptions')}
              className="text-xs text-[#FFF174] font-mono font-bold hover:underline min-h-[44px] flex items-center"
            >
              View Plan Catalog →
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#383A32] text-[#A8A6A3] uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-3">Subscription ID</th>
                  <th className="py-3 px-3">Plan Tier</th>
                  <th className="py-3 px-3">Covered Motorcycle</th>
                  <th className="py-3 px-3">Callout Balance</th>
                  <th className="py-3 px-3">Free Tow Limit</th>
                  <th className="py-3 px-3">Valid Until</th>
                  <th className="py-3 px-3">Payment Mode</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#383A32]/50">
                {subscriptions.map((s) => (
                  <tr key={s.subscriptionId} className="hover:bg-[#20211D] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#FFF174]">{s.subscriptionId}</td>
                    <td className="py-3 px-3">
                      <strong className="text-[#EFF2F7] block font-display">{s.planName}</strong>
                      <span className="text-[10px] text-[#A8A6A3] uppercase font-mono">{s.planTier}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#EFF2F7] block">{s.linkedBike.brand} {s.linkedBike.model}</span>
                      <span className="text-[10px] font-mono text-[#A8A6A3]">{s.linkedBike.registrationNumber}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-[#10B981]">
                        {s.features.maxFreeBreakdowns - s.features.usedBreakdowns} / {s.features.maxFreeBreakdowns} Left
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#EFF2F7]">
                      {s.features.towingDistanceLimitKm} km Free
                    </td>
                    <td className="py-3 px-3 text-[#A8A6A3] font-mono">
                      {new Date(s.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#20211D] text-[#A8A6A3] border border-[#383A32] text-[10px] font-mono">
                        {s.paymentDetails.paymentMode} (₹{s.priceInr})
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] font-mono font-bold text-[10px] uppercase">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile 2-Column Responsive Cards */}
          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-2.5 md:hidden">
            {subscriptions.map((s) => (
              <div key={s.subscriptionId} className="p-3 rounded-xl bg-[#20211D] border border-[#383A32] flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-[#FFF174]">#{s.subscriptionId.slice(-4)}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] font-mono font-bold text-[9px] uppercase">
                      {s.status}
                    </span>
                  </div>
                  <strong className="text-xs text-white block line-clamp-1">{s.planName}</strong>
                  <span className="text-[10px] text-gray-400 block truncate">{s.linkedBike.brand} {s.linkedBike.model}</span>
                  <div className="mt-1 space-y-0.5 text-[10px]">
                    <div className="flex justify-between text-gray-400">
                      <span>Callouts:</span>
                      <span className="text-[#10B981] font-mono font-bold">{s.features.maxFreeBreakdowns - s.features.usedBreakdowns} Left</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Towing:</span>
                      <span className="text-white font-mono">{s.features.towingDistanceLimitKm}km free</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#383A32] flex items-center justify-between text-[10px] text-gray-400">
                  <span className="truncate">{new Date(s.endDate).toLocaleDateString()}</span>
                  <span className="font-mono font-bold text-[#FFF174]">₹{s.priceInr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: VEHICLE QR ALERTS LOG */}
      {activeTab === 'QR_ALERTS' && (
        <div className="bg-[#151613] border border-[#383A32] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-bold uppercase tracking-wider text-[#EFF2F7] flex items-center gap-2">
              <QrCode size={18} className="text-[#FFF174]" />
              <span>Public Vehicle QR Contact Alerts Log ({allQrAlerts.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {allQrAlerts.map(alert => (
              <div key={alert.id} className="p-4 bg-[#20211D] border border-[#383A32] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#FFF174]">{alert.id}</span>
                    <span className="px-2 py-0.5 rounded bg-[#B1D8E3]/15 text-[#B1D8E3] border border-[#B1D8E3]/30 font-mono font-bold text-[10px] uppercase">
                      {alert.requestType.replaceAll('_', ' ')}
                    </span>
                    <span className="text-[#A8A6A3] font-mono text-[11px]">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[#EFF2F7] font-medium italic">"{alert.message}"</p>
                  <div className="flex items-center gap-3 text-[#A8A6A3] text-[11px] pt-1">
                    <span>Target: <strong className="text-[#EFF2F7]">{alert.bikeInfo}</strong></span>
                    {alert.senderName && <span>Reporter: <strong className="text-[#EFF2F7]">{alert.senderName}</strong> ({alert.senderPhone || 'No phone'})</span>}
                  </div>
                </div>

                {alert.locationPin && (
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-[#A8A6A3] uppercase block font-mono">Landmark</span>
                    <span className="text-xs font-mono font-bold text-[#EFF2F7] flex items-center gap-1 justify-end">
                      <MapPin size={12} className="text-[#FFF174]" />
                      {alert.locationPin.address || `${alert.locationPin.lat}, ${alert.locationPin.lng}`}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {allQrAlerts.length === 0 && (
              <div className="text-center py-8 text-[#A8A6A3]">
                No public vehicle QR alerts logged yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: HELPERS */}
      {activeTab === 'HELPERS' && (
        <div className="bg-[#151613] border border-[#383A32] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-bold uppercase tracking-wider text-[#EFF2F7] flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#FFF174]" />
              <span>Helper Network & Verification ({helpers.length})</span>
            </h2>
            <Button variant="secondary" onClick={() => navigate('/admin/helpers')}>
              Manage All Helpers <ChevronRight size={14} />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#383A32] text-[#A8A6A3] uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-3">Helper Name</th>
                  <th className="py-3 px-3">Service Type</th>
                  <th className="py-3 px-3">Business / Workshop</th>
                  <th className="py-3 px-3">Service Areas</th>
                  <th className="py-3 px-3">Rating & Jobs</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#383A32]/50">
                {helpers.map((h) => (
                  <tr key={h.id} className="hover:bg-[#20211D] transition-colors">
                    <td className="py-3 px-3">
                      <strong className="text-[#EFF2F7] block font-display">{h.name}</strong>
                      <span className="text-[#A8A6A3] text-[11px] font-mono">{h.email} • {h.phone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#20211D] border border-[#383A32] text-[#EFF2F7] font-mono font-bold">
                        {h.serviceType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#A8A6A3]">{h.businessName || 'Independent Mechanic'}</td>
                    <td className="py-3 px-3 text-[#A8A6A3]">{h.serviceAreas.join(', ')}</td>
                    <td className="py-3 px-3">
                      <strong className="text-[#FFF174]">{h.rating} ★</strong> <span className="text-[#A8A6A3]">({h.completedAssists} assists)</span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={h.verificationStatus} />
                    </td>
                    <td className="py-3 px-3">
                      <Button onClick={() => navigate('/admin/helpers')}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
