import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHelperProfileByUserId, toggleHelperAvailability, getRequests, updateRequestStatus } from '../../utils/appStorage';
import type { HelperProfile, HelpRequest } from '../../types/app';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { 
  MapPin, 
  Search, 
  AlertCircle, 
  ChevronRight, 
  PhoneCall, 
  Navigation, 
  Check
} from 'lucide-react';
import { IncidentTimeline } from '../../components/graphics';

export function HelperDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<HelperProfile | undefined>();
  const [availableRequests, setAvailableRequests] = useState<HelpRequest[]>([]);
  const [assignedRequests, setAssignedRequests] = useState<HelpRequest[]>([]);

  const loadHelperData = () => {
    if (user) {
      const p = getHelperProfileByUserId(user.id);
      setProfile(p);

      const all = getRequests();
      setAvailableRequests(all.filter((r) => r.status === 'OPEN' || r.status === 'HELPER_OFFERED'));
      if (p) {
        setAssignedRequests(
          all.filter((r) => r.assignedHelperId === p.id && r.status !== 'RESOLVED' && r.status !== 'CANCELLED')
        );
      }
    }
  };

  useEffect(() => {
    loadHelperData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleToggleAvailable = () => {
    if (profile) {
      const updated = toggleHelperAvailability(profile.id);
      if (updated) setProfile(updated);
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    if (profile) {
      updateRequestStatus(requestId, 'HELPER_OFFERED', { assignedHelperId: profile.id });
      loadHelperData();
      navigate(`/requests/${requestId}`);
    }
  };

  const currentJob = assignedRequests[0];

  const getJobStepIndex = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'HELPER_OFFERED':
        return 0; // Assigned
      case 'IN_PROGRESS':
        return 2; // En Route / Assistance
      case 'RESOLVED':
        return 4; // Complete
      default:
        return 1;
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white p-4 sm:p-6 md:p-8 space-y-6 pb-28 md:pb-12 max-w-5xl mx-auto">
      
      {/* ========================================================
          1. HEADER & AVAILABILITY TOGGLE (Section 21 & 24 Requirement)
          ======================================================== */}
      <header className="rounded-3xl bg-[#121212] border border-white/10 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FFF174] block">
            HELPER COMMAND DESK
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
            Good day, {user?.name || 'Helper'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {profile?.businessName || 'Roadside Assistance Provider'} • {profile?.serviceAreas?.join(', ') || 'Siliguri & Corridors'}
          </p>
        </div>

        {/* Large Online/Offline Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleAvailable}
            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-lg active:scale-95 ${
              profile?.isAvailable
                ? 'bg-emerald-500/15 border-2 border-emerald-500 text-emerald-400'
                : 'bg-white/5 border border-white/10 text-gray-400'
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full ${
                profile?.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
              }`}
            />
            <span>{profile?.isAvailable ? '🟢 ONLINE & ACCEPTING' : '⚫ OFFLINE'}</span>
          </button>
        </div>
      </header>

      {/* Verification Warning if pending */}
      {profile?.verificationStatus === 'PENDING' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0 text-amber-400" />
          <div>
            <strong className="block font-bold">Helper Verification In Review</strong>
            <span className="text-amber-200/80">
              Admin verification in progress. You can inspect nearby requests and test dispatch routing.
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          2. ACTIVE JOB COCKPIT (Section 22 Requirement)
          ======================================================== */}
      {currentJob ? (
        <section className="rounded-3xl bg-gradient-to-br from-[#1C180B] to-[#121212] border-2 border-[#FFF174]/40 p-5 sm:p-7 shadow-[0_10px_40px_rgba(255,241,116,0.15)] space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#FFF174] animate-ping" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FFF174] block">
                  CURRENT ACTIVE JOB
                </span>
                <strong className="text-lg font-black text-white">
                  {currentJob.issue.replaceAll('_', ' ')}
                </strong>
              </div>
            </div>
            <StatusBadge status={currentJob.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-black/40 p-4 rounded-2xl border border-white/10">
            <div>
              <span className="text-[10px] text-gray-400 block font-bold uppercase">Stranded Rider</span>
              <strong className="text-white text-sm block mt-0.5">{currentJob.riderName}</strong>
              <span className="text-gray-400 text-[11px]">{currentJob.bike.brand} {currentJob.bike.model}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-bold uppercase">Location</span>
              <strong className="text-white text-sm block mt-0.5 flex items-center gap-1">
                <MapPin size={14} className="text-[#FFF174]" />
                {currentJob.approximateLocation || 'Himalayan Corridor'}
              </strong>
              <span className="text-emerald-400 text-[11px]">~2.4 km away</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-bold uppercase">Estimated Payout</span>
              <strong className="text-[#FFF174] text-base block mt-0.5">₹350 – ₹600</strong>
              <span className="text-gray-400 text-[11px]">Direct digital or cash receipt</span>
            </div>
          </div>

          {/* Job Timeline Indicator */}
          <div className="pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
              Dispatch Workflow
            </span>
            <IncidentTimeline currentStep={getJobStepIndex(currentJob.status)} />
          </div>

          {/* Next Action Buttons: Navigation, Call, Open */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                currentJob.approximateLocation || 'Siliguri'
              )}`}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 active:scale-95 transition-all text-center"
            >
              <Navigation size={15} />
              <span>Start Navigation</span>
            </a>

            <a
              href={`tel:${currentJob.riderPhone}`}
              className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 font-bold text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 active:scale-95 transition-all text-center"
            >
              <PhoneCall size={15} />
              <span>Call Rider</span>
            </a>

            <button
              type="button"
              onClick={() => navigate(`/requests/${currentJob.id}`)}
              className="py-3 px-4 rounded-xl bg-[#FFF174] hover:bg-[#FCEB50] font-black text-xs uppercase tracking-wider text-black flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>Manage Job</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </section>
      ) : null}

      {/* ========================================================
          3. NEW REQUESTS FEED (Section 12: Prioritize NEW REQUEST)
          ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Search size={16} className="text-[#FFF174]" /> New Requests Feed
            </h2>
            <p className="text-xs text-gray-400">Stranded riders nearby requesting dispatch</p>
          </div>
          <Link
            to="/helper/available-requests"
            className="text-xs font-bold text-[#FFF174] hover:underline flex items-center gap-1"
          >
            <span>All ({availableRequests.length})</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {availableRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableRequests.slice(0, 4).map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-[#121212] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-400">REQ-{req.id.slice(-4)}</span>
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                      Est. ₹350
                    </span>
                  </div>
                  <div>
                    <strong className="text-base font-bold text-white block">
                      {req.bike.brand} {req.bike.model} — {req.issue.replaceAll('_', ' ')}
                    </strong>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{req.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                    <MapPin size={13} className="text-[#FFF174]" />
                    <span className="truncate">{req.approximateLocation || 'Himalayan Corridor'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => handleAcceptRequest(req.id)}
                    className="flex-1 py-2.5 rounded-xl bg-[#FFF174] hover:bg-[#FCEB50] font-black text-xs uppercase tracking-wider text-black flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Check size={15} />
                    <span>Accept Job</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/requests/${req.id}`)}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 font-semibold text-xs text-gray-200 transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No incoming rescue requests"
            description="When riders near your location request roadside help, they will appear here in real time."
            actionLabel="Refresh feed"
            onAction={loadHelperData}
          />
        )}
      </section>

      {/* ========================================================
          4. METRICS / EARNINGS ROW
          ======================================================== */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#121212] border border-white/10 space-y-1">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Nearby Requests</span>
          <strong className="text-2xl font-black text-white">{availableRequests.length}</strong>
          <span className="text-[10px] text-gray-500 block">Waiting in service zone</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121212] border border-white/10 space-y-1">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Completed Assists</span>
          <strong className="text-2xl font-black text-emerald-400">{profile?.completedAssists || 0}</strong>
          <span className="text-[10px] text-gray-500 block">Lifetime rescued</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121212] border border-white/10 space-y-1">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Provider Rating</span>
          <strong className="text-2xl font-black text-[#FFF174]">★ {profile?.rating?.toFixed(1) || '5.0'}</strong>
          <span className="text-[10px] text-gray-500 block">Verified rider reviews</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121212] border border-white/10 space-y-1">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Est. Day Earnings</span>
          <strong className="text-2xl font-black text-white">₹{((profile?.completedAssists || 1) * 350).toLocaleString()}</strong>
          <span className="text-[10px] text-emerald-400 block">Daily settlement active</span>
        </div>
      </section>
    </div>
  );
}
