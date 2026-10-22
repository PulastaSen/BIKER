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
    <div className="dashboard-page max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-white">
      
      {/* Header */}
      <header className="dashboard-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <p className="eyebrow text-xs font-black uppercase text-[#FFF174] tracking-widest">OPERATIONS COMMAND CENTRE</p>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">MotoAssist Platform Command</h1>
          <p className="text-xs text-[#C5C5C5] mt-1">Real-time supervision of dispatches, on-demand services, active subscriptions, and emergency vehicle alerts.</p>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              OPS ADMIN ACTIVE
            </span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-3.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer min-h-[38px]"
            >
              {isLoggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
              <span>Log Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[#1D1D1D] border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Clock size={13} className="text-[#FFF174]" /> Active Dispatches
          </span>
          <strong className="text-2xl font-black text-white">{openRequests.length}</strong>
          <span className="text-[10px] text-gray-500 block">Highway & Emergency</span>
        </div>

        <div className="bg-[#1D1D1D] border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Wrench size={13} className="text-[#FFF174]" /> Service Bookings
          </span>
          <strong className="text-2xl font-black text-[#FFF174]">{bookings.length}</strong>
          <span className="text-[10px] text-gray-500 block">On-demand & scheduled</span>
        </div>

        <div className="bg-[#1D1D1D] border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <CreditCard size={13} className="text-emerald-400" /> Active Subscriptions
          </span>
          <strong className="text-2xl font-black text-emerald-400">{activeSubs.length}</strong>
          <span className="text-[10px] text-gray-500 block">Roadside Shield Plans</span>
        </div>

        <div className="bg-[#1D1D1D] border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck size={13} className="text-amber-400" /> Pending Helpers
          </span>
          <strong className="text-2xl font-black text-amber-400">{pendingHelpers.length}</strong>
          <span className="text-[10px] text-gray-500 block">Awaiting verification</span>
        </div>

        <div className="bg-[#1D1D1D] border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <QrCode size={13} className="text-indigo-400" /> Vehicle QR Alerts
          </span>
          <strong className="text-2xl font-black text-indigo-400">{allQrAlerts.length}</strong>
          <span className="text-[10px] text-gray-500 block">Public beacons logged</span>
        </div>

        <div className="bg-[#1D1D1D] border border-white/10 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Users size={13} className="text-gray-400" /> Platform Users
          </span>
          <strong className="text-2xl font-black text-white">{users.length}</strong>
          <span className="text-[10px] text-gray-500 block">Registered Riders & Crew</span>
        </div>
      </div>

      {/* Command Centre Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-3">
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
            className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-[#FFF174] text-black border-[#FFF174] shadow-md shadow-yellow-500/10'
                : 'bg-[#1D1D1D] text-[#C5C5C5] border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === tab.id ? 'bg-black text-[#FFF174]' : 'bg-white/10 text-white'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT: EMERGENCY & DISPATCH QUEUE */}
      {activeTab === 'DISPATCH_QUEUE' && (
        <div className="bg-[#1D1D1D] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Clock size={18} className="text-[#FFF174]" />
              <span>Live Emergency & Roadside Dispatches ({requests.length})</span>
            </h2>
            <Button variant="secondary" onClick={() => navigate('/admin/requests')}>
              Full Requests Table <ChevronRight size={14} />
            </Button>
          </div>

          <div className="overflow-x-auto">
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
        </div>
      )}

      {/* TAB CONTENT: SERVICE BOOKINGS */}
      {activeTab === 'SERVICE_BOOKINGS' && (
        <div className="bg-[#1D1D1D] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Wrench size={18} className="text-[#FFF174]" />
              <span>ReadyAssist-Benchmark Service Catalogue Bookings ({bookings.length})</span>
            </h2>
            <button
              onClick={() => navigate('/services')}
              className="text-xs text-[#FFF174] font-bold hover:underline"
            >
              Open Service Catalogue →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
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
              <tbody className="divide-y divide-white/5">
                {bookings.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#FFF174]">{b.bookingId}</td>
                    <td className="py-3 px-3">
                      <strong className="text-white block">{b.serviceName}</strong>
                      <span className="text-[10px] text-gray-400 uppercase">{b.serviceType}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-gray-200 block font-bold">{b.riderName}</span>
                      <span className="text-gray-400 text-[11px]">{b.riderPhone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-gray-200 block">{b.bikeDetails.brand} {b.bikeDetails.model}</span>
                      <span className="text-[10px] font-mono text-gray-400">{b.bikeDetails.registrationNumber}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-black text-[#FFF174]">₹{b.pricing.totalEstimated}</span>
                      {b.pricing.isCoveredBySubscription && (
                        <span className="block text-[9px] text-emerald-400 font-bold uppercase">Shield Covered</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        b.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                        b.status === 'CANCELLED' ? 'bg-red-500/20 text-red-300' :
                        b.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {b.dispute?.filed ? (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold">
                          Disputed: ₹{b.dispute.amount}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[11px]">No disputes</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {b.status === 'REQUESTED' && (
                        <button
                          onClick={() => handleUpdateBooking(b.bookingId, 'ASSIGNED')}
                          className="px-2.5 py-1 bg-[#FFF174] text-black font-black text-[11px] rounded hover:bg-yellow-400"
                        >
                          Dispatch Provider
                        </button>
                      )}
                      {b.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleUpdateBooking(b.bookingId, 'COMPLETED')}
                          className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] rounded"
                        >
                          Mark Completed
                        </button>
                      )}
                      {b.status === 'COMPLETED' && (
                        <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle2 size={13} /> Closed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SUBSCRIPTIONS */}
      {activeTab === 'SUBSCRIPTIONS' && (
        <div className="bg-[#1D1D1D] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <CreditCard size={18} className="text-[#FFF174]" />
              <span>Active Roadside Assistance Subscriptions ({subscriptions.length})</span>
            </h2>
            <button
              onClick={() => navigate('/subscriptions')}
              className="text-xs text-[#FFF174] font-bold hover:underline"
            >
              View Plan Catalog →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
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
              <tbody className="divide-y divide-white/5">
                {subscriptions.map((s) => (
                  <tr key={s.subscriptionId} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#FFF174]">{s.subscriptionId}</td>
                    <td className="py-3 px-3">
                      <strong className="text-white block">{s.planName}</strong>
                      <span className="text-[10px] text-gray-400 uppercase">{s.planTier}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-gray-200 block">{s.linkedBike.brand} {s.linkedBike.model}</span>
                      <span className="text-[10px] font-mono text-gray-400">{s.linkedBike.registrationNumber}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-emerald-400">
                        {s.features.maxFreeBreakdowns - s.features.usedBreakdowns} / {s.features.maxFreeBreakdowns} Left
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      {s.features.towingDistanceLimitKm} km Free
                    </td>
                    <td className="py-3 px-3 text-gray-300">
                      {new Date(s.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300 text-[10px] font-mono">
                        {s.paymentDetails.paymentMode} (₹{s.priceInr})
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: VEHICLE QR ALERTS LOG */}
      {activeTab === 'QR_ALERTS' && (
        <div className="bg-[#1D1D1D] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <QrCode size={18} className="text-[#FFF174]" />
              <span>Public Vehicle QR Contact Alerts Log ({allQrAlerts.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {allQrAlerts.map(alert => (
              <div key={alert.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#FFF174]">{alert.id}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase">
                      {alert.requestType.replaceAll('_', ' ')}
                    </span>
                    <span className="text-gray-400 text-[11px]">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-white font-medium italic">"{alert.message}"</p>
                  <div className="flex items-center gap-3 text-gray-400 text-[11px] pt-1">
                    <span>Target: <strong className="text-gray-200">{alert.bikeInfo}</strong></span>
                    {alert.senderName && <span>Reporter: <strong>{alert.senderName}</strong> ({alert.senderPhone || 'No phone'})</span>}
                  </div>
                </div>

                {alert.locationPin && (
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-gray-400 uppercase block">Landmark</span>
                    <span className="text-xs font-bold text-gray-200 flex items-center gap-1 justify-end">
                      <MapPin size={12} className="text-[#FFF174]" />
                      {alert.locationPin.address || `${alert.locationPin.lat}, ${alert.locationPin.lng}`}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {allQrAlerts.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No public vehicle QR alerts logged yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: HELPERS */}
      {activeTab === 'HELPERS' && (
        <div className="bg-[#1D1D1D] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#FFF174]" />
              <span>Helper Network & Verification ({helpers.length})</span>
            </h2>
            <Button variant="secondary" onClick={() => navigate('/admin/helpers')}>
              Manage All Helpers <ChevronRight size={14} />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
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
              <tbody className="divide-y divide-white/5">
                {helpers.map((h) => (
                  <tr key={h.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3">
                      <strong className="text-white block">{h.name}</strong>
                      <span className="text-gray-400 text-[11px]">{h.email} • {h.phone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                        {h.serviceType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-300">{h.businessName || 'Independent Mechanic'}</td>
                    <td className="py-3 px-3 text-gray-300">{h.serviceAreas.join(', ')}</td>
                    <td className="py-3 px-3">
                      <strong className="text-[#FFF174]">{h.rating} ★</strong> ({h.completedAssists} assists)
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
