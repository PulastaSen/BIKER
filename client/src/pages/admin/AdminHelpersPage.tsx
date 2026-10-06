import { useState, useEffect } from 'react';
import { getHelperProfiles, setHelperVerification } from '../../utils/appStorage';
import type { HelperProfile, VerificationStatus } from '../../types/app';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { Check, X } from 'lucide-react';

export function AdminHelpersPage() {
  const [helpers, setHelpers] = useState<HelperProfile[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');

  const loadHelpers = () => {
    setHelpers(getHelperProfiles());
  };

  useEffect(() => {
    loadHelpers();
  }, []);

  const handleUpdateStatus = (id: string, status: VerificationStatus) => {
    setHelperVerification(id, status);
    loadHelpers();
  };

  const filtered = helpers.filter((h) => {
    if (filter === 'PENDING') return h.verificationStatus === 'PENDING';
    if (filter === 'VERIFIED') return h.verificationStatus === 'VERIFIED';
    if (filter === 'REJECTED') return h.verificationStatus === 'REJECTED';
    return true;
  });

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>Helper Verification Portal</h1>
          <p className="subtitle">Review and verify mechanics, towing providers, and rider helpers.</p>
        </div>
      </header>

      <div className="filter-bar">
        <button
          type="button"
          className={`filter-tab ${filter === 'ALL' ? 'is-active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All Helpers ({helpers.length})
        </button>
        <button
          type="button"
          className={`filter-tab ${filter === 'PENDING' ? 'is-active' : ''}`}
          onClick={() => setFilter('PENDING')}
        >
          Pending Review ({helpers.filter((h) => h.verificationStatus === 'PENDING').length})
        </button>
        <button
          type="button"
          className={`filter-tab ${filter === 'VERIFIED' ? 'is-active' : ''}`}
          onClick={() => setFilter('VERIFIED')}
        >
          Verified ({helpers.filter((h) => h.verificationStatus === 'VERIFIED').length})
        </button>
      </div>

      <div className="table-responsive" style={{ marginTop: '1.5rem' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Helper / Business Name</th>
              <th>Contact Phone</th>
              <th>Service Type</th>
              <th>Service Areas</th>
              <th>Skills</th>
              <th>Status</th>
              <th>Verification Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h) => (
              <tr key={h.id}>
                <td>
                  <strong>{h.businessName || h.name}</strong>
                  <div className="sub-text">{h.name} • {h.email}</div>
                </td>
                <td>{h.phone}</td>
                <td><span className="badge badge--neutral">{h.serviceType}</span></td>
                <td>{h.serviceAreas.join(', ')}</td>
                <td>
                  <small>{h.skills.join(', ')}</small>
                </td>
                <td><StatusBadge status={h.verificationStatus} /></td>
                <td>
                  <div className="table-actions">
                    {h.verificationStatus !== 'VERIFIED' && (
                      <Button
                        type="button"
                        onClick={() => handleUpdateStatus(h.id, 'VERIFIED')}
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
                      >
                        <Check size={14} /> Approve
                      </Button>
                    )}
                    {h.verificationStatus !== 'REJECTED' && (
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => handleUpdateStatus(h.id, 'REJECTED')}
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
                      >
                        <X size={14} /> Reject
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
