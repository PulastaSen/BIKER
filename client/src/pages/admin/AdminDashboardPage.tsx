import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, getHelperProfiles, getRequests, getSafetyReports } from '../../utils/appStorage';
import type { User, HelperProfile, HelpRequest, SafetyReport } from '../../types/app';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { ShieldCheck, Users, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

export function AdminDashboardPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [helpers, setHelpers] = useState<HelperProfile[]>([]);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [reports, setReports] = useState<SafetyReport[]>([]);

  useEffect(() => {
    setUsers(getUsers());
    setHelpers(getHelperProfiles());
    setRequests(getRequests());
    setReports(getSafetyReports());
  }, []);

  const pendingHelpers = helpers.filter((h) => h.verificationStatus === 'PENDING');
  const openRequests = requests.filter((r) => r.status === 'OPEN' || r.status === 'HELPER_OFFERED' || r.status === 'IN_PROGRESS');

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">ADMINISTRATION PORTAL</p>
          <h1>Platform Operations Dashboard</h1>
          <p className="subtitle">Overview of Riders, Verified Helpers, System Requests, and Safety Reports.</p>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="admin-metrics-grid">
        <div className="dash-card metric-card">
          <span className="metric-card__title">Total Platform Users</span>
          <strong className="metric-card__value">{users.length}</strong>
          <span className="metric-card__sub"><Users size={14} /> Riders & Helpers</span>
        </div>

        <div className="dash-card metric-card">
          <span className="metric-card__title">Pending Helper Verifications</span>
          <strong className="metric-card__value" style={{ color: pendingHelpers.length > 0 ? '#b45309' : '#111827' }}>
            {pendingHelpers.length}
          </strong>
          <span className="metric-card__sub"><ShieldCheck size={14} /> Require Admin Approval</span>
        </div>

        <div className="dash-card metric-card">
          <span className="metric-card__title">Active Help Requests</span>
          <strong className="metric-card__value">{openRequests.length}</strong>
          <span className="metric-card__sub"><Clock size={14} /> Open in system</span>
        </div>

        <div className="dash-card metric-card">
          <span className="metric-card__title">Safety Incident Reports</span>
          <strong className="metric-card__value">{reports.length}</strong>
          <span className="metric-card__sub"><AlertTriangle size={14} /> Reported issues</span>
        </div>
      </div>

      {/* Pending Helper Verification Banner */}
      {pendingHelpers.length > 0 && (
        <section className="dashboard-section" style={{ marginTop: '2rem' }}>
          <div className="section-header-row">
            <h2 className="section-title">
              <ShieldCheck size={20} /> Pending Helper Verification ({pendingHelpers.length})
            </h2>
            <Button variant="secondary" onClick={() => navigate('/admin/helpers')}>
              Manage All Helpers <ChevronRight size={16} />
            </Button>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Helper Name</th>
                  <th>Service Type</th>
                  <th>Business / Workshop</th>
                  <th>Service Areas</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingHelpers.map((h) => (
                  <tr key={h.id}>
                    <td>
                      <strong>{h.name}</strong>
                      <div className="sub-text">{h.email} • {h.phone}</div>
                    </td>
                    <td><span className="badge badge--neutral">{h.serviceType}</span></td>
                    <td>{h.businessName || 'Individual'}</td>
                    <td>{h.serviceAreas.join(', ')}</td>
                    <td><StatusBadge status={h.verificationStatus} /></td>
                    <td>
                      <Button onClick={() => navigate('/admin/helpers')}>
                        Review & Approve
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* System Requests Overview */}
      <section className="dashboard-section" style={{ marginTop: '2rem' }}>
        <div className="section-header-row">
          <h2 className="section-title">
            <Clock size={20} /> System Help Requests
          </h2>
          <Button variant="secondary" onClick={() => navigate('/admin/requests')}>
            View All Requests <ChevronRight size={16} />
          </Button>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Rider</th>
                <th>Bike</th>
                <th>Issue</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.slice(0, 5).map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.id}</strong></td>
                  <td>{r.riderName}</td>
                  <td>{r.bike.brand} {r.bike.model}</td>
                  <td>{r.issue.replaceAll('_', ' ')}</td>
                  <td>{r.approximateLocation || 'N/A'}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => navigate(`/requests/${r.id}`)}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
