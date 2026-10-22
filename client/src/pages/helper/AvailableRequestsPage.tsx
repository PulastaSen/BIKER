import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getRequests,
  getHelperProfileByUserId,
  updateRequestStatus,
  getServiceBookings,
  updateServiceBookingStatus
} from '../../utils/appStorage';
import type { HelpRequest, ServiceBooking } from '../../types/app';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { Search, MapPin, CheckCircle2, ShieldCheck, Wrench, AlertTriangle } from 'lucide-react';

export function AvailableRequestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'EMERGENCY' | 'BOOKINGS'>('EMERGENCY');
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [searchArea, setSearchArea] = useState('');

  const loadData = () => {
    const allReqs = getRequests();
    setRequests(
      allReqs.filter((r) =>
        ['SUBMITTED', 'OPEN', 'SEARCHING', 'HELPER_OFFERED'].includes(r.status)
      )
    );

    const allBookings = getServiceBookings();
    setBookings(
      allBookings.filter((b) =>
        ['PENDING', 'SEARCHING', 'ACCEPTED', 'DISPATCHED'].includes(b.status)
      )
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptAndDispatch = (req: HelpRequest) => {
    if (!user) return;
    const profile = getHelperProfileByUserId(user.id);
    const assignedInfo = {
      name: profile?.name || user.name || 'Certified Responder',
      phone: profile?.phone || user.phone || '+91 94340 12345',
      businessName: profile?.businessName || 'MotoAssist Verified Workshop',
      vehiclePlate: 'WB 74 RSA RESCUE',
      eta: '15-20 mins',
      badge: 'Verified Helper'
    };

    updateRequestStatus(req.id, 'ACCEPTED', {
      assignedHelperId: profile?.id || user.id,
      assignedHelperName: assignedInfo.name,
      assignedHelperPhone: assignedInfo.phone,
      assignedProviderDetails: assignedInfo
    });

    loadData();
    alert(`Request #${req.id} accepted! You are now dispatched.`);
    navigate(`/requests/${req.id}`);
  };

  const handleAcceptBooking = (b: ServiceBooking) => {
    if (!user) return;
    const profile = getHelperProfileByUserId(user.id);
    const providerName = profile?.businessName || profile?.name || user.name || 'Verified MotoAssist Workshop';
    const providerPhone = profile?.phone || user.phone || '+91 94340 12345';

    updateServiceBookingStatus(b.bookingId, 'ACCEPTED', {
      assignedProvider: {
        id: profile?.id || user.id,
        name: providerName,
        phone: providerPhone,
        rating: 4.9,
        assignedAt: new Date().toISOString()
      }
    });
    loadData();
    alert(`Booking ${b.bookingId} (${b.serviceName}) accepted! Proceeding to job.`);
  };

  const handleAdvanceBookingStatus = (b: ServiceBooking, nextStatus: ServiceBooking['status']) => {
    let notes = b.serviceNotes;
    if (nextStatus === 'COMPLETED') {
      notes = notes ? `${notes} • Job completed on-site.` : 'Inspection & service completed on-site. Verified vehicle operation.';
    }
    updateServiceBookingStatus(b.bookingId, nextStatus, { serviceNotes: notes });
    loadData();
  };

  const filteredRequests = requests.filter((r) => {
    if (!searchArea) return true;
    const text = `${r.approximateLocation || ''} ${r.description} ${r.issue}`.toLowerCase();
    return text.includes(searchArea.toLowerCase());
  });

  const filteredBookings = bookings.filter((b) => {
    if (!searchArea) return true;
    const text = `${b.location.address} ${b.location.landmark || ''} ${b.serviceName} ${b.bikeDetails.brand} ${b.bikeDetails.model}`.toLowerCase();
    return text.includes(searchArea.toLowerCase());
  });

  return (
    <div className="dashboard-page p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <header className="dashboard-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-[#FFF174]">FIELD SERVICE & DISPATCH</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Helper & Technician Job Queue</h1>
          <p className="text-sm text-gray-400">Accept roadside breakdowns or scheduled on-demand motorcycle services.</p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#1E1E1E] p-1 rounded-2xl border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setTab('EMERGENCY')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              tab === 'EMERGENCY' ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <AlertTriangle size={14} className={tab === 'EMERGENCY' ? 'text-red-400' : ''} />
            Breakdowns ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('BOOKINGS')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              tab === 'BOOKINGS' ? 'bg-[#FFF174] text-black font-extrabold shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wrench size={14} />
            Service Bookings ({bookings.length})
          </button>
        </div>
      </header>

      <div className="search-filter-box">
        <div className="search-input-wrapper flex items-center gap-3 bg-[#1D1D1D] border border-white/10 px-4 py-3 rounded-2xl">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            className="bg-transparent text-sm text-white placeholder-gray-500 w-full focus:outline-none"
            placeholder={tab === 'EMERGENCY' ? 'Filter breakdowns by location or issue (e.g. Sevoke Road, Puncture)...' : 'Filter bookings by service, bike model, or address...'}
            value={searchArea}
            onChange={(e) => setSearchArea(e.target.value)}
          />
        </div>
      </div>

      {tab === 'EMERGENCY' ? (
        filteredRequests.length > 0 ? (
          <div className="requests-list grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRequests.map((req) => (
              <div key={req.id} className="bg-[#1D1D1D] border border-white/10 rounded-2xl p-5 space-y-4 hover:border-white/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-xs font-mono font-bold text-[#FFF174]">#{req.id}</strong>
                    <StatusBadge status={req.status} />
                  </div>

                  <h3 className="font-bold text-base text-white">
                    {req.riderName} • {(req.bikeDetails?.brand || req.bike?.brand || 'Royal Enfield')} {(req.bikeDetails?.model || req.bike?.model || '')}
                  </h3>

                  {(req.bikeDetails?.registrationNumber || req.bike?.registrationNumber) && (
                    <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded font-bold text-yellow-300 inline-block mt-1">
                      {req.bikeDetails?.registrationNumber || req.bike?.registrationNumber}
                    </span>
                  )}

                  <p className="text-xs font-bold text-red-400 uppercase mt-2">
                    {req.issue?.replaceAll('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-300 line-clamp-2 mt-1">{req.description}</p>

                  {req.approximateLocation && (
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-3 bg-black/30 p-2 rounded-xl">
                      <MapPin size={14} className="text-[#FFF174] shrink-0" /> {req.approximateLocation}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                  <Button variant="secondary" className="flex-1" onClick={() => navigate(`/requests/${req.id}`)}>
                    View Details
                  </Button>
                  <Button className="flex-1" onClick={() => handleAcceptAndDispatch(req)}>
                    <ShieldCheck size={16} /> Accept & Dispatch
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle2}
            title="No Active Breakdown Requests"
            description="All reported stranded riders in this sector are currently attended to."
          />
        )
      ) : (
        /* SERVICE BOOKINGS TAB */
        filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBookings.map((b) => (
              <div key={b.bookingId} className="bg-[#1D1D1D] border border-white/10 rounded-2xl p-5 space-y-4 hover:border-white/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-[#FFF174]">{b.bookingId}</span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      b.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                      b.status === 'ACCEPTED' || b.status === 'DISPATCHED' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white">{b.serviceName}</h3>
                  <p className="text-xs text-gray-300 mt-1">
                    Customer: <span className="text-white font-medium">{b.riderName}</span> • <span className="font-mono text-gray-400">{b.riderPhone}</span>
                  </p>
                  <p className="text-xs text-gray-300">
                    Bike: <span className="text-white font-medium">{b.bikeDetails.brand} {b.bikeDetails.model}</span> ({b.bikeDetails.registrationNumber})
                  </p>

                  <div className="mt-3 bg-black/30 p-2.5 rounded-xl space-y-1.5 text-xs text-gray-300">
                    <p className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#FFF174] shrink-0" />
                      <span>{b.location.address} {b.location.landmark ? `(${b.location.landmark})` : ''}</span>
                    </p>
                    <p className="flex items-center justify-between font-mono font-bold text-white pt-1 border-t border-white/5">
                      <span>Quotation / Labor Rate:</span>
                      <span className="text-[#FFF174]">₹{b.pricing.totalEstimated}</span>
                    </p>
                  </div>

                  {b.pricing.isCoveredBySubscription && (
                    <p className="text-[11px] text-emerald-400 mt-2 font-medium">
                      🛡️ Covered under {b.pricing.coveragePlanName}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  {b.status === 'PENDING' || b.status === 'SEARCHING' ? (
                    <Button className="w-full" onClick={() => handleAcceptBooking(b)}>
                      <ShieldCheck size={16} /> Accept Service Job
                    </Button>
                  ) : b.status === 'ACCEPTED' ? (
                    <div className="flex gap-2">
                      <Button variant="secondary" className="flex-1" onClick={() => handleAdvanceBookingStatus(b, 'DISPATCHED')}>
                        Dispatch / En Route
                      </Button>
                      <Button className="flex-1" onClick={() => handleAdvanceBookingStatus(b, 'COMPLETED')}>
                        Mark Completed
                      </Button>
                    </div>
                  ) : b.status === 'DISPATCHED' ? (
                    <Button className="w-full" onClick={() => handleAdvanceBookingStatus(b, 'COMPLETED')}>
                      <CheckCircle2 size={16} /> Mark Completed
                    </Button>
                  ) : (
                    <div className="text-center py-1 text-xs text-emerald-400 font-bold">
                      ✓ Job Complete
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle2}
            title="No Pending Service Bookings"
            description="All scheduled periodic and doorstep maintenance bookings are currently assigned."
          />
        )
      )}
    </div>
  );
}
