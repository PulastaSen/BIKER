import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRequests, getHelperProfileByUserId } from '../../utils/appStorage';
import type { HelpRequest } from '../../types/app';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { Clock, ChevronRight, MapPin } from 'lucide-react';

export function HelperAssistsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assists, setAssists] = useState<HelpRequest[]>([]);

  useEffect(() => {
    if (user) {
      const prof = getHelperProfileByUserId(user.id);
      if (prof) {
        const all = getRequests();
        const mine = all.filter((r) => r.assignedHelperId === prof.id || (r.offeredHelperIds && r.offeredHelperIds.includes(prof.id)));
        setAssists(mine);
      }
    }
  }, [user]);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">ASSISTANCE HISTORY</p>
          <h1>My Assistance Log</h1>
          <p className="subtitle">Track roadside help requests you have offered or provided support for.</p>
        </div>
      </header>

      {assists.length > 0 ? (
        <div className="requests-list">
          {assists.map((req) => (
            <div key={req.id} className="request-item-card">
              <div className="request-item-card__header">
                <div>
                  <strong className="req-id">{req.id}</strong>
                  <StatusBadge status={req.status} />
                </div>
                <span className="req-date">{new Date(req.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="request-item-card__body">
                <div>
                  <strong>{req.riderName} ({req.riderPhone})</strong>
                  <p>{req.bike.brand} {req.bike.model} • {req.issue.replaceAll('_', ' ')}</p>
                </div>
                {req.approximateLocation && (
                  <span className="location-tag">
                    <MapPin size={14} /> {req.approximateLocation}
                  </span>
                )}
              </div>

              <div className="request-item-card__footer">
                <Button variant="secondary" onClick={() => navigate(`/requests/${req.id}`)}>
                  View Tracking Page <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Clock}
          title="No Assistance History Yet"
          description="Offer assistance on available requests in your service area to start building your helper log."
          actionLabel="View Available Requests"
          onAction={() => navigate('/helper/available-requests')}
        />
      )}
    </div>
  );
}
