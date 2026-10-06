import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRequests } from '../../utils/appStorage';
import type { HelpRequest } from '../../types/app';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { Clock, PlusCircle, ChevronRight, MapPin } from 'lucide-react';

export function MyRequestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

  useEffect(() => {
    if (user) {
      const userReqs = getRequests().filter((r) => r.riderId === user.id);
      setRequests(userReqs);
    }
  }, [user]);

  const filtered = requests.filter((r) => {
    if (filter === 'OPEN') return r.status === 'OPEN' || r.status === 'HELPER_OFFERED' || r.status === 'IN_PROGRESS';
    if (filter === 'RESOLVED') return r.status === 'RESOLVED' || r.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">HELP REQUEST HISTORY</p>
          <h1>My Help Requests</h1>
          <p className="subtitle">View and track all your roadside assistance requests.</p>
        </div>
        <div>
          <Link to="/request-help">
            <Button>
              <PlusCircle size={18} /> New Request
            </Button>
          </Link>
        </div>
      </header>

      <div className="filter-bar">
        <button
          type="button"
          className={`filter-tab ${filter === 'ALL' ? 'is-active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All ({requests.length})
        </button>
        <button
          type="button"
          className={`filter-tab ${filter === 'OPEN' ? 'is-active' : ''}`}
          onClick={() => setFilter('OPEN')}
        >
          Active / Open ({requests.filter((r) => r.status !== 'RESOLVED' && r.status !== 'CANCELLED').length})
        </button>
        <button
          type="button"
          className={`filter-tab ${filter === 'RESOLVED' ? 'is-active' : ''}`}
          onClick={() => setFilter('RESOLVED')}
        >
          Resolved / History ({requests.filter((r) => r.status === 'RESOLVED' || r.status === 'CANCELLED').length})
        </button>
      </div>

      {filtered.length > 0 ? (
        <div className="requests-list">
          {filtered.map((req) => (
            <div key={req.id} className="request-item-card">
              <div className="request-item-card__header">
                <div>
                  <strong className="req-id">{req.id}</strong>
                  <StatusBadge status={req.status} />
                </div>
                <span className="req-date">
                  {new Date(req.createdAt).toLocaleDateString()} at{' '}
                  {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="request-item-card__body">
                <div>
                  <strong>{req.bike.brand} {req.bike.model}</strong>
                  <p>{req.description}</p>
                </div>
                {req.approximateLocation && (
                  <span className="location-tag">
                    <MapPin size={14} /> {req.approximateLocation}
                  </span>
                )}
              </div>

              <div className="request-item-card__footer">
                <Button variant="secondary" onClick={() => navigate(`/requests/${req.id}`)}>
                  View Tracking Details <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Clock}
          title="No Requests Found"
          description="You don't have any help requests matching the selected filter."
          actionLabel="Create Help Request"
          onAction={() => navigate('/request-help')}
        />
      )}
    </div>
  );
}
