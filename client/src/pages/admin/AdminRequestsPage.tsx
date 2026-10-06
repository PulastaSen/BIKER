import { useState, useEffect } from 'react';
import { getRequests, updateRequestStatus } from '../../utils/appStorage';
import type { HelpRequest, RequestStatus } from '../../types/app';
import { StatusBadge } from '../../components/StatusBadge';

export function AdminRequestsPage() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);

  const loadRequests = () => {
    setRequests(getRequests());
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusChange = (id: string, status: RequestStatus) => {
    updateRequestStatus(id, status);
    loadRequests();
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>System Help Requests</h1>
          <p className="subtitle">Monitor and manage all roadside help requests across the platform.</p>
        </div>
      </header>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Rider Name</th>
              <th>Motorcycle</th>
              <th>Issue</th>
              <th>Location</th>
              <th>Status</th>
              <th>Action Override</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.id}</strong></td>
                <td>{r.riderName} ({r.riderPhone})</td>
                <td>{r.bike.brand} {r.bike.model}</td>
                <td>{r.issue.replaceAll('_', ' ')}</td>
                <td>{r.approximateLocation || 'N/A'}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>
                  <select
                    value={r.status}
                    onChange={(e) => handleStatusChange(r.id, e.target.value as RequestStatus)}
                    className="select-input select-input--sm"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="HELPER_OFFERED">HELPER OFFERED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
