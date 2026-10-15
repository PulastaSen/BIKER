/**
 * MotoAssist Operational Metrics & Telemetry
 * Instruments core incident response metrics without collecting unnecessary PII.
 */

export interface TelemetryMetricEvent {
  eventType: 
    | 'TIME_TO_FIRST_SAFE_ACTION'
    | 'INCIDENT_SUBMISSION_ATTEMPT'
    | 'SERVER_ACKNOWLEDGEMENT'
    | 'PROVIDER_ACCEPTANCE'
    | 'NO_PROVIDER_FALLBACK'
    | 'LOCATION_PROVENANCE_RECORDED'
    | 'OFFLINE_QUEUED'
    | 'IDEMPOTENT_RETRY_DETECTED';
  timestamp: number;
  durationMs?: number;
  metadata?: Record<string, string | number | boolean>;
}

const TELEMETRY_STORAGE_KEY = 'motoassist_operational_metrics';

export function recordTelemetryMetric(event: Omit<TelemetryMetricEvent, 'timestamp'>): void {
  try {
    const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    const events: TelemetryMetricEvent[] = raw ? JSON.parse(raw) : [];
    events.push({
      ...event,
      timestamp: Date.now()
    });
    // Keep last 100 events to prevent memory bloat
    if (events.length > 100) events.splice(0, events.length - 100);
    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.warn('[Telemetry] Error recording operational metric:', err);
  }
}

export function getTelemetryMetrics(): TelemetryMetricEvent[] {
  try {
    const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function computeOperationalSummary(): {
  averageTimeToFirstActionMs: number;
  totalSubmissions: number;
  totalOfflineQueued: number;
  locationFreshnessRate: number;
} {
  const events = getTelemetryMetrics();
  const actionEvents = events.filter(e => e.eventType === 'TIME_TO_FIRST_SAFE_ACTION' && e.durationMs);
  const avgActionTime = actionEvents.length > 0 
    ? actionEvents.reduce((acc, curr) => acc + (curr.durationMs || 0), 0) / actionEvents.length
    : 0;

  const totalSubmissions = events.filter(e => e.eventType === 'INCIDENT_SUBMISSION_ATTEMPT').length;
  const totalOfflineQueued = events.filter(e => e.eventType === 'OFFLINE_QUEUED').length;

  const locEvents = events.filter(e => e.eventType === 'LOCATION_PROVENANCE_RECORDED');
  const freshLocEvents = locEvents.filter(e => e.metadata?.provenance === 'GPS_FRESH');
  const locationFreshnessRate = locEvents.length > 0 ? (freshLocEvents.length / locEvents.length) * 100 : 100;

  return {
    averageTimeToFirstActionMs: Math.round(avgActionTime),
    totalSubmissions,
    totalOfflineQueued,
    locationFreshnessRate: Math.round(locationFreshnessRate)
  };
}
