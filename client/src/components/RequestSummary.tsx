import type { Bike, IssueType } from '../types/request';
import { issueTypes } from '../data/issueTypes';
import { Bike as BikeIcon, AlertTriangle, FileText, Image as ImageIcon, MapPin, Shield } from 'lucide-react';

interface RequestSummaryProps {
  bike: Bike;
  issue: IssueType;
  description: string;
  imageName?: string;
  approximateLocation?: string;
  locationShared: boolean;
  latitude?: number;
  longitude?: number;
  requestId?: string;
  createdAt?: string;
  status?: string;
}

export function RequestSummary({
  bike,
  issue,
  description,
  imageName,
  approximateLocation,
  locationShared,
  latitude,
  longitude,
  requestId,
  createdAt,
  status,
}: RequestSummaryProps) {
  const issueDef = issueTypes.find((item) => item.value === issue);

  return (
    <div className="summary-card">
      {requestId && (
        <div className="summary-card__header">
          <div className="summary-card__id-badge">
            <span>Request ID:</span> <strong>{requestId}</strong>
          </div>
          {status && <span className="status-badge status-badge--open">{status}</span>}
        </div>
      )}

      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-item__label">
            <BikeIcon size={16} /> Selected Motorcycle
          </div>
          <div className="summary-item__value">
            <strong>{bike.brand} {bike.model}</strong>
            <span className="summary-item__sub">({bike.year} • {bike.registrationNumber})</span>
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-item__label">
            <AlertTriangle size={16} /> Problem Category
          </div>
          <div className="summary-item__value">
            <strong>{issueDef?.label || issue}</strong>
          </div>
        </div>

        <div className="summary-item summary-item--full">
          <div className="summary-item__label">
            <FileText size={16} /> Description
          </div>
          <div className="summary-item__value description-text">{description}</div>
        </div>

        <div className="summary-item">
          <div className="summary-item__label">
            <ImageIcon size={16} /> Attached Image
          </div>
          <div className="summary-item__value">
            {imageName ? (
              <span className="badge badge--neutral">{imageName}</span>
            ) : (
              <span className="text-muted">No image attached</span>
            )}
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-item__label">
            <MapPin size={16} /> Approximate Location
          </div>
          <div className="summary-item__value">
            {approximateLocation ? approximateLocation : <span className="text-muted">Not specified</span>}
          </div>
        </div>

        <div className="summary-item summary-item--full">
          <div className="summary-item__label">
            <Shield size={16} /> Location Sharing Status
          </div>
          <div className="summary-item__value">
            {locationShared ? (
              <span className="badge badge--success">
                Consent given {latitude && longitude ? `(${latitude.toFixed(5)}, ${longitude.toFixed(5)})` : ''}
              </span>
            ) : (
              <span className="badge badge--muted">Not shared</span>
            )}
          </div>
        </div>

        {createdAt && (
          <div className="summary-item summary-item--full">
            <div className="summary-item__label">Created At</div>
            <div className="summary-item__value">{new Date(createdAt).toLocaleString()}</div>
          </div>
        )}
      </div>
    </div>
  );
}
