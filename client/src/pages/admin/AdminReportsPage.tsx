import { useState, useEffect } from 'react';
import { getSafetyReports } from '../../utils/appStorage';
import type { SafetyReport } from '../../types/app';
import { EmptyState } from '../../components/EmptyState';
import { ShieldCheck } from 'lucide-react';

export function AdminReportsPage() {
  const [reports, setReports] = useState<SafetyReport[]>([]);

  useEffect(() => {
    setReports(getSafetyReports());
  }, []);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>Safety Incident Reports</h1>
          <p className="subtitle">Review reported safety concerns, misrepresentation, or emergency alerts.</p>
        </div>
      </header>

      {reports.length > 0 ? (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Reporter</th>
                <th>Reason</th>
                <th>Details</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((rep) => (
                <tr key={rep.id}>
                  <td><code>{rep.id}</code></td>
                  <td>{rep.reporterName}</td>
                  <td><strong>{rep.reason}</strong></td>
                  <td>{rep.details}</td>
                  <td>{new Date(rep.createdAt).toLocaleDateString()}</td>
                  <td><span className="badge badge--neutral">{rep.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title="No Safety Incidents Reported"
          description="The safety report log is currently clear. Users can file reports regarding roadside safety concerns."
        />
      )}
    </div>
  );
}
