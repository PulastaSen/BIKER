import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRequests, getHelperProfileByUserId, updateRequestStatus } from '../../utils/appStorage';
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

  const loadRequests = () => {
    const all = getRequests();
    setRequests(
      all.filter((r) =>
        ['SUBMITTED', 'OPEN', 'SEARCHING', 'HELPER_OFFERED'].includes(r.status)
      )
    );
  };

  useEffect(() => {
    loadRequests();
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

    loadRequests();
    alert(`Request #${req.id} accepted! You are now dispatched.`);
    navigate(`/requests/${req.id}`);
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
                  <strong>
                    {req.riderName} • {(req.bikeDetails?.brand || req.bike?.brand || 'Royal Enfield')} {(req.bikeDetails?.model || req.bike?.model || '')}
                  </strong>
                  {(req.bikeDetails?.registrationNumber || req.bike?.registrationNumber) && (
                    <span className="font-mono text-[11px] bg-white/10 px-2 py-0.5 rounded ml-2 font-bold text-yellow-300">
                      {req.bikeDetails?.registrationNumber || req.bike?.registrationNumber}
                    </span>
                  )}
                  <p className="issue-title-badge">{req.issue?.replaceAll('_', ' ')}</p>
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
                  View Details
                </Button>
                <Button onClick={() => handleAcceptAndDispatch(req)}>
                  <ShieldCheck size={18} /> Accept & Dispatch
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
