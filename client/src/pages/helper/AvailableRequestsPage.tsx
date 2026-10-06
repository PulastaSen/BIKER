import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRequests, getHelperProfileByUserId, offerAssistance } from '../../utils/appStorage';
import type { HelpRequest } from '../../types/app';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { Search, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';

export function AvailableRequestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [searchArea, setSearchArea] = useState('');
  const [offeredIds, setOfferedIds] = useState<string[]>([]);

  const loadRequests = () => {
    const all = getRequests();
    setRequests(all.filter((r) => r.status === 'OPEN' || r.status === 'HELPER_OFFERED'));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleOfferAssistance = (req: HelpRequest) => {
    if (!user) return;
    const profile = getHelperProfileByUserId(user.id);
    if (profile) {
      offerAssistance(req.id, profile);
      setOfferedIds([...offeredIds, req.id]);
      loadRequests();
      alert(`Assistance offer submitted for Request #${req.id}!`);
    }
  };

  const filtered = requests.filter((r) => {
    if (!searchArea) return true;
    const text = `${r.approximateLocation || ''} ${r.description} ${r.issue}`.toLowerCase();
    return text.includes(searchArea.toLowerCase());
  });

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">HELPER REQUEST FEED</p>
          <h1>Available Help Requests</h1>
          <p className="subtitle">Discover stranded riders around Siliguri and Himalayan corridors needing support.</p>
        </div>
      </header>

      <div className="search-filter-box">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Filter by location or problem (e.g., Sevoke Road, Puncture, Teesta)"
            value={searchArea}
            onChange={(e) => setSearchArea(e.target.value)}
          />
        </div>
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
                  {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="request-item-card__body">
                <div>
                  <strong>{req.riderName} • {req.bike.brand} {req.bike.model}</strong>
                  <p className="issue-title-badge">{req.issue.replaceAll('_', ' ')}</p>
                  <p className="description-preview">{req.description}</p>
                </div>
                {req.approximateLocation && (
                  <span className="location-tag">
                    <MapPin size={14} /> {req.approximateLocation}
                  </span>
                )}
              </div>

              <div className="request-item-card__footer">
                <Button variant="secondary" onClick={() => navigate(`/requests/${req.id}`)}>
                  View Full Details
                </Button>
                <Button onClick={() => handleOfferAssistance(req)}>
                  <ShieldCheck size={18} /> Offer Assistance
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="No Requests Match Filter"
          description="Try clearing your search query to see all open help requests."
        />
      )}
    </div>
  );
}
