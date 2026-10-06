import { CheckCircle2, ArrowLeft, PlusCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { RequestSummary } from '../components/RequestSummary';
import { getRequests } from '../utils/requestStorage';
import type { HelpRequest } from '../types/request';

export function RequestSuccessPage() {
  const location = useLocation();
  const stateRequest = location.state?.request as HelpRequest | undefined;
  const latestRequest = getRequests()[0];
  const request = stateRequest || latestRequest;

  if (!request) {
    return (
      <main className="placeholder-page">
        <section className="placeholder-card">
          <h1>No recent request found</h1>
          <p>Create a new roadside assistance help request to get started.</p>
          <Link to="/request-help">
            <Button>Create a help request</Button>
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="request-page">
      <div className="request-shell">
        <Link className="back-link" to="/">
          <ArrowLeft size={18} /> Back to home
        </Link>

        <section className="success-card">
          <div className="success-badge-wrapper">
            <div className="success-icon">
              <CheckCircle2 size={42} />
            </div>
            <p className="eyebrow eyebrow--success">REQUEST SUBMITTED & DISPATCHED</p>
            <h1>Assistance Ticket Active</h1>
            <p className="success-lead">
              Your help request has been generated and dispatched to nearby verified responders in the corridor.
            </p>
            <div className="dispatch-confirmation-banner" role="status" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '1rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0', color: '#065F46', textAlign: 'left' }}>
              <CheckCircle2 size={22} style={{ color: '#059669', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Active Roadside Queue</strong>
                <span style={{ fontSize: '0.85rem', color: '#047857' }}>Nearby verified helpers have been alerted to your coordinates and problem details.</span>
              </div>
            </div>
          </div>

          <RequestSummary
            bike={request.bike}
            issue={request.issue}
            description={request.description}
            imageName={request.imageName}
            approximateLocation={request.approximateLocation}
            locationShared={request.locationShared}
            latitude={request.latitude}
            longitude={request.longitude}
            requestId={request.id}
            createdAt={request.createdAt}
            status={request.status}
          />

          <div className="form-actions success-actions">
            <Link to={`/requests/${request.id}`}>
              <Button variant="secondary">View request timeline</Button>
            </Link>
            <Link to="/">
              <Button variant="secondary">Back to home</Button>
            </Link>
            <Link to="/request-help">
              <Button>
                <PlusCircle size={18} /> Create another request
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
