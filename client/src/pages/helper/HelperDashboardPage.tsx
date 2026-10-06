import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHelperProfileByUserId, toggleHelperAvailability, getRequests } from '../../utils/appStorage';
import type { HelperProfile, HelpRequest } from '../../types/app';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { Wrench, MapPin, Search, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

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
        setAssignedRequests(all.filter((r) => r.assignedHelperId === p.id && r.status !== 'RESOLVED' && r.status !== 'CANCELLED'));
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

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">HELPER PORTAL</p>
          <h1>Welcome, {user?.name}</h1>
          <p className="subtitle">
            {profile?.businessName || 'Roadside Assistance Provider'} • {profile?.serviceAreas.join(', ')}
          </p>
        </div>

        {profile && (
          <div className="availability-toggle-box">
            <span className="toggle-label">Live Status:</span>
            <button
              type="button"
              className={`availability-pill ${profile.isAvailable ? 'is-available' : 'is-unavailable'}`}
              onClick={handleToggleAvailable}
            >
              <span className="status-dot" />
              {profile.isAvailable ? 'AVAILABLE FOR ASSISTS' : 'UNAVAILABLE'}
            </button>
          </div>
        )}
      </header>

      {/* Verification Warning if pending */}
      {profile?.verificationStatus === 'PENDING' && (
        <div className="location-status location-status--warning" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={20} />
          <div>
            <strong>Helper Verification Pending</strong>
            <span>
              Your profile is being reviewed by MotoAssist Admins. You can view open requests and submit offers across the platform.
            </span>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="helper-metrics-grid">
        <div className="dash-card metric-card">
          <span className="metric-card__title">Open Requests Nearby</span>
          <strong className="metric-card__value">{availableRequests.length}</strong>
          <span className="metric-card__sub">In Siliguri & Himalayan routes</span>
        </div>

        <div className="dash-card metric-card">
          <span className="metric-card__title">Active Assignments</span>
          <strong className="metric-card__value">{assignedRequests.length}</strong>
          <span className="metric-card__sub">Requests assigned to you</span>
        </div>

        <div className="dash-card metric-card">
          <span className="metric-card__title">Completed Assists</span>
          <strong className="metric-card__value">{profile?.completedAssists || 0}</strong>
          <span className="metric-card__sub">Rating: ⭐ {profile?.rating.toFixed(1) || '5.0'}</span>
        </div>
      </div>

      {/* Assigned Requests Section */}
      {assignedRequests.length > 0 && (
        <section className="dashboard-section" style={{ marginTop: '2rem' }}>
          <h2 className="section-title">
            <Wrench size={20} /> Your Active Assignment
          </h2>
          {assignedRequests.map((req) => (
            <div key={req.id} className="active-request-card">
              <div className="active-request-card__header">
                <div>
                  <span className="request-id">{req.id}</span>
                  <StatusBadge status={req.status} />
                </div>
                <span className="req-date">{new Date(req.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="active-request-card__body">
                <div className="info-group">
                  <label>Stranded Rider</label>
                  <strong>{req.riderName} ({req.riderPhone})</strong>
                </div>
                <div className="info-group">
                  <label>Motorcycle</label>
                  <strong>{req.bike.brand} {req.bike.model} ({req.bike.registrationNumber})</strong>
                </div>
                <div className="info-group">
                  <label>Location</label>
                  <strong>{req.approximateLocation || 'Landmark not specified'}</strong>
                </div>
              </div>
              <div className="active-request-card__footer">
                <Button onClick={() => navigate(`/requests/${req.id}`)}>
                  Open Request Details <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Available Requests Feed Preview */}
      <section className="dashboard-section" style={{ marginTop: '2rem' }}>
        <div className="section-header-row">
          <h2 className="section-title">
            <Search size={20} /> Available Requests Feed
          </h2>
          <Link to="/helper/available-requests" className="text-link">
            View All ({availableRequests.length}) <ChevronRight size={16} />
          </Link>
        </div>

        {availableRequests.length > 0 ? (
          <div className="requests-list">
            {availableRequests.slice(0, 3).map((req) => (
              <div key={req.id} className="request-item-card">
                <div className="request-item-card__header">
                  <div>
                    <strong className="req-id">{req.id}</strong>
                    <StatusBadge status={req.status} />
                  </div>
                  <span className="req-date">{new Date(req.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="request-item-card__body">
                  <strong>{req.bike.brand} {req.bike.model} — {req.issue.replaceAll('_', ' ')}</strong>
                  <p>{req.description}</p>
                  {req.approximateLocation && (
                    <span className="location-tag">
                      <MapPin size={14} /> {req.approximateLocation}
                    </span>
                  )}
                </div>
                <div className="request-item-card__footer">
                  <Button onClick={() => navigate(`/requests/${req.id}`)}>
                    Review & Offer Support <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle2}
            title="No Open Requests Right Now"
            description="There are currently no active stranded rider requests waiting in your service area."
          />
        )}
      </section>
    </div>
  );
}
