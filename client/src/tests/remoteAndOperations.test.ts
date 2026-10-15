import { describe, it, expect, beforeEach } from 'vitest';
import { 
  queueOfflineIncident, 
  getOfflineQueue, 
  removeOfflineIncident, 
  clearOfflineQueue 
} from '../utils/offlineQueue';
import { computeOperationalSummary, recordTelemetryMetric } from '../utils/telemetry';

describe('Remote Area Resilience & Offline Incident Queue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('correctly queues an offline emergency request with DRAFT_LOCAL status', () => {
    const queued = queueOfflineIncident({
      problemCategory: 'Towing',
      subcategory: 'Flatbed',
      urgency: 'HIGH',
      description: 'Mountain road breakdown near Coronation Bridge',
      location: {
        coordinates: [88.4722, 26.8833],
        address: 'Coronation Bridge, NH-10',
        accuracyMeters: 14
      },
      locationProvenance: 'GPS_FRESH'
    });

    expect(queued.queueId).toBeDefined();
    expect(queued.queueId).toMatch(/^LOCAL-/);
    expect(queued.status).toBe('DRAFT_LOCAL');
    expect(queued.syncAttempts).toBe(0);
    expect(queued.locationProvenance).toBe('GPS_FRESH');

    const all = getOfflineQueue();
    expect(all.length).toBe(1);
    expect(all[0].queueId).toBe(queued.queueId);
  });

  it('truthfully tags manual landmark location when GPS is unavailable', () => {
    const queued = queueOfflineIncident({
      problemCategory: 'Puncture',
      urgency: 'MEDIUM',
      location: {
        coordinates: [0, 0],
        address: 'Sevoke Military Picket'
      },
      locationProvenance: 'MANUAL_LANDMARK'
    });

    expect(queued.locationProvenance).toBe('MANUAL_LANDMARK');
    expect(queued.location.coordinates).toEqual([0, 0]);
  });

  it('removes item from offline queue once synced or dismissed', () => {
    const item1 = queueOfflineIncident({
      problemCategory: 'Fuel',
      urgency: 'LOW',
      location: { coordinates: [88.39, 26.72] },
      locationProvenance: 'GPS_FRESH'
    });

    const item2 = queueOfflineIncident({
      problemCategory: 'Battery',
      urgency: 'MEDIUM',
      location: { coordinates: [88.40, 26.73] },
      locationProvenance: 'GPS_FRESH'
    });

    expect(getOfflineQueue().length).toBe(2);

    removeOfflineIncident(item1.queueId);

    const remaining = getOfflineQueue();
    expect(remaining.length).toBe(1);
    expect(remaining[0].queueId).toBe(item2.queueId);

    clearOfflineQueue();
    expect(getOfflineQueue().length).toBe(0);
  });

  it('instruments operational metrics without collecting unnecessary PII', () => {
    recordTelemetryMetric({
      eventType: 'TIME_TO_FIRST_SAFE_ACTION',
      durationMs: 1200,
      metadata: { category: 'MEDICAL' }
    });

    recordTelemetryMetric({
      eventType: 'LOCATION_PROVENANCE_RECORDED',
      metadata: { provenance: 'GPS_FRESH' }
    });

    recordTelemetryMetric({
      eventType: 'INCIDENT_SUBMISSION_ATTEMPT'
    });

    const summary = computeOperationalSummary();
    expect(summary.totalSubmissions).toBe(1);
    expect(summary.averageTimeToFirstActionMs).toBe(1200);
    expect(summary.locationFreshnessRate).toBe(100);
  });
});
