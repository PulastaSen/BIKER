import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHelperProfileByUserId, toggleHelperAvailability, getRequests, updateRequestStatus } from '../../utils/appStorage';
import type { HelperProfile, HelpRequest, RequestStatus } from '../../types/app';
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

  const handleAdvanceJobStatus = (nextStatus: RequestStatus) => {
    if (currentJob) {
      updateRequestStatus(currentJob.id, nextStatus);
      loadHelperData();
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
    <div className="min-h-screen bg-[#090A08] text-[#EFF2F7] p-4 sm:p-6 md:p-8 space-y-6 pb-28 md:pb-12 max-w-5xl mx-auto font-sans">
      
      {/* 1. HEADER & AVAILABILITY TOGGLE */}
      <header className="rounded-2xl bg-[#151613] border border-[#383A32] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FFF174] block">
            HELPER COMMAND DESK
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-[#EFF2F7] tracking-tight mt-0.5">
            Good day, {user?.name || 'Helper'}
          </h1>
          <p className="text-xs text-[#A8A6A3] mt-1 font-medium">
            {profile?.businessName || 'Roadside Assistance Provider'} • {profile?.serviceAreas?.join(', ') || 'Siliguri & Corridors'}
          </p>
        </div>

        {/* Large Online/Offline Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleAvailable}
            className={`px-5 py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-lg active:scale-95 min-h-[44px] cursor-pointer ${
              profile?.isAvailable
                ? 'bg-[#10B981]/15 border-2 border-[#10B981] text-[#10B981]'
                : 'bg-[#20211D] border border-[#383A32] text-[#A8A6A3]'
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full ${
                profile?.isAvailable ? 'bg-[#10B981] animate-pulse' : 'bg-[#545347]'
              }`}
            />
            <span>{profile?.isAvailable ? 'ONLINE & ACCEPTING' : 'OFFLINE'}</span>
          </button>
        </div>
      </header>

      {/* Verification Warning if pending */}
      {profile?.verificationStatus === 'PENDING' && (
        <div className="p-4 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-xs flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0 text-[#F59E0B]" />
          <div>
            <strong className="block font-bold">Helper Verification In Review</strong>
            <span className="text-[#F59E0B]/80">
              Admin verification in progress. You can inspect nearby requests and test dispatch routing.
            </span>
          </div>
        </div>
      )}

      {/* 2. ACTIVE JOB COCKPIT */}
      {currentJob ? (
        <section className="rounded-2xl bg-[#151613] border-2 border-[#DFF127]/50 p-5 sm:p-7 shadow-[0_10px_40px_rgba(223,241,39,0.08)] space-y-5">
          <div className="flex items-center justify-between border-b border-[#383A32] pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DFF127] animate-ping" />
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#DFF127] block">
                  CURRENT ACTIVE DISPATCH
                </span>
                <strong className="text-lg font-display font-black text-[#EFF2F7]">
                  {currentJob.issue.replaceAll('_', ' ')}
                </strong>
              </div>
            </div>
            <StatusBadge status={currentJob.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#20211D] p-4 rounded-xl border border-[#383A32]">
            <div>
              <span className="text-[10px] text-[#A8A6A3] block font-mono font-bold uppercase tracking-wider">Stranded Rider</span>
              <strong className="text-[#EFF2F7] text-sm block mt-0.5">{currentJob.riderName}</strong>
              <span className="text-[#A8A6A3] text-[11px]">{currentJob.bike.brand} {currentJob.bike.model}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#A8A6A3] block font-mono font-bold uppercase tracking-wider">Location</span>
              <strong className="text-[#EFF2F7] text-sm block mt-0.5 flex items-center gap-1">
                <MapPin size={14} className="text-[#FFF174]" />
                {currentJob.approximateLocation || 'Himalayan Corridor'}
              </strong>
              <span className="text-[#10B981] text-[11px] font-mono font-bold">~2.4 km away</span>
            </div>
            <div>
              <span className="text-[10px] text-[#A8A6A3] block font-mono font-bold uppercase tracking-wider">Estimated Tariff</span>
              <strong className="text-[#FFF174] font-mono text-base block mt-0.5 font-bold">₹350 – ₹600</strong>
              <span className="text-[#A8A6A3] text-[11px]">Direct digital or cash receipt</span>
            </div>
          </div>

          {/* Job Timeline Indicator */}
          <div className="pt-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A8A6A3] block mb-2">
              Dispatch Workflow Progression
            </span>
            <IncidentTimeline currentStep={getJobStepIndex(currentJob.status)} />
          </div>

          {/* Status Progression Controls */}
          <div className="p-3.5 rounded-xl bg-[#20211D] border border-[#383A32] space-y-2.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A8A6A3] block">
              STATUS TRANSITION (1-TAP):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold font-display">
              <button
                type="button"
                onClick={() => handleAdvanceJobStatus('EN_ROUTE')}
                className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer min-h-[44px] ${
                  currentJob.status === 'EN_ROUTE'
                    ? 'bg-[#DFF127] text-black border-[#DFF127]'
                    : 'bg-[#151613] border-[#383A32] text-[#EFF2F7] hover:border-[#DFF127]/50'
                }`}
              >
                ● EN ROUTE
              </button>

              <button
                type="button"
                onClick={() => handleAdvanceJobStatus('ARRIVED')}
                className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer min-h-[44px] ${
                  currentJob.status === 'ARRIVED'
                    ? 'bg-[#B1D8E3] text-black border-[#B1D8E3]'
                    : 'bg-[#151613] border-[#383A32] text-[#EFF2F7] hover:border-[#B1D8E3]/50'
                }`}
              >
                ● ARRIVED
              </button>

              <button
                type="button"
                onClick={() => handleAdvanceJobStatus('IN_PROGRESS')}
                className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer min-h-[44px] ${
                  currentJob.status === 'IN_PROGRESS'
                    ? 'bg-[#F59E0B] text-black border-[#F59E0B]'
                    : 'bg-[#151613] border-[#383A32] text-[#EFF2F7] hover:border-[#F59E0B]/50'
                }`}
              >
                ● ASSISTANCE
              </button>

              <button
                type="button"
                onClick={() => handleAdvanceJobStatus('RESOLVED')}
                className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer min-h-[44px] ${
                  currentJob.status === 'RESOLVED' || currentJob.status === 'COMPLETED'
                    ? 'bg-[#10B981] text-black border-[#10B981]'
                    : 'bg-[#151613] border-[#383A32] text-[#EFF2F7] hover:border-[#10B981]/50'
                }`}
              >
                ✓ COMPLETED
              </button>
            </div>
          </div>

          {/* Next Action Buttons: Navigation, Call, Open */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                currentJob.approximateLocation || 'Roadside Location'
              )}`}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-4 rounded-xl bg-[#20211D] hover:bg-[#2A2C26] font-display font-bold text-xs uppercase tracking-wider text-[#EFF2F7] border border-[#383A32] flex items-center justify-center gap-2 active:scale-95 transition-all text-center min-h-[44px]"
            >
              <Navigation size={15} className="text-[#B1D8E3]" />
              <span>Start Navigation</span>
            </a>

            <a
              href={`tel:${currentJob.riderPhone}`}
              className="py-3 px-4 rounded-xl bg-[#20211D] hover:bg-[#2A2C26] font-display font-bold text-xs uppercase tracking-wider text-[#EFF2F7] border border-[#383A32] flex items-center justify-center gap-2 active:scale-95 transition-all text-center min-h-[44px]"
            >
              <PhoneCall size={15} className="text-[#10B981]" />
              <span>Call Rider</span>
            </a>

            <button
              type="button"
              onClick={() => navigate(`/requests/${currentJob.id}`)}
              className="py-3 px-4 rounded-xl bg-[#FFF174] hover:bg-[#ffe83b] font-display font-bold text-xs uppercase tracking-wider text-black flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[44px]"
            >
              <span>Manage Job</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </section>
      ) : null}

      {/* 3. NEW REQUESTS FEED */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-display font-bold uppercase tracking-widest text-[#EFF2F7] flex items-center gap-2">
              <Search size={16} className="text-[#FFF174]" /> New Requests Feed
            </h2>
            <p className="text-xs text-[#A8A6A3]">Stranded riders nearby requesting dispatch</p>
          </div>
          <Link
            to="/helper/available-requests"
            className="text-xs font-mono font-bold text-[#FFF174] hover:underline flex items-center gap-1 min-h-[44px]"
          >
            <span>All ({availableRequests.length})</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {availableRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {availableRequests.slice(0, 4).map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-[#151613] border border-[#383A32] hover:border-[#FFF174]/40 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#A8A6A3]">REQ-{req.id.slice(-4)}</span>
                    <span className="text-xs font-mono text-[#10B981] font-bold bg-[#10B981]/15 border border-[#10B981]/30 px-2 py-0.5 rounded">
                      Est. ₹350
                    </span>
                  </div>
                  <div>
                    <strong className="text-base font-display font-bold text-[#EFF2F7] block">
                      {req.bike.brand} {req.bike.model} — {req.issue.replaceAll('_', ' ')}
                    </strong>
                    <p className="text-xs text-[#A8A6A3] mt-1 line-clamp-2">{req.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#A8A6A3] pt-1">
                    <MapPin size={13} className="text-[#FFF174]" />
                    <span className="truncate">{req.approximateLocation || 'Himalayan Corridor'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#383A32]">
                  <button
                    type="button"
                    onClick={() => handleAcceptRequest(req.id)}
                    className="flex-1 py-2.5 rounded-xl bg-[#FFF174] hover:bg-[#ffe83b] font-display font-bold text-xs uppercase tracking-wider text-black flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer min-h-[44px]"
                  >
                    <Check size={15} />
                    <span>Accept Job</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/requests/${req.id}`)}
                    className="py-2.5 px-4 rounded-xl bg-[#20211D] hover:bg-[#2A2C26] border border-[#383A32] font-display font-bold text-xs uppercase tracking-wider text-[#EFF2F7] transition-colors cursor-pointer min-h-[44px]"
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

      {/* 4. METRICS / EARNINGS ROW */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#151613] border border-[#383A32] space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-[#A8A6A3] block">Nearby Requests</span>
          <strong className="text-2xl font-display font-black text-[#EFF2F7]">{availableRequests.length}</strong>
          <span className="text-[10px] text-[#A8A6A3] block">Waiting in service zone</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151613] border border-[#383A32] space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-[#A8A6A3] block">Completed Assists</span>
          <strong className="text-2xl font-display font-black text-[#10B981]">{profile?.completedAssists || 0}</strong>
          <span className="text-[10px] text-[#A8A6A3] block">Lifetime rescued</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151613] border border-[#383A32] space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-[#A8A6A3] block">Provider Rating</span>
          <strong className="text-2xl font-display font-black text-[#FFF174]">★ {profile?.rating?.toFixed(1) || '5.0'}</strong>
          <span className="text-[10px] text-[#A8A6A3] block">Verified rider reviews</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151613] border border-[#383A32] space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-[#A8A6A3] block">Est. Day Earnings</span>
          <strong className="text-2xl font-display font-black text-[#EFF2F7]">₹{((profile?.completedAssists || 1) * 350).toLocaleString()}</strong>
          <span className="text-[10px] text-[#10B981] block">Daily settlement active</span>
        </div>
      </section>
    </div>
  );
}
