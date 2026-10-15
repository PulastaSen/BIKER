/**
 * MotoAssist Offline Incident Queue
 * Handles client-side queuing when network connectivity is lost.
 * 
 * Truthful State Guarantee:
 * All offline requests are explicitly tagged 'DRAFT_LOCAL' and NEVER reported 
 * as sent, acknowledged, or dispatched until the server confirms receipt.
 * 
 * Privacy Protection:
 * Never stores identity documents, raw passwords, or sensitive medical history.
 */

export interface OfflineQueuedIncident {
  queueId: string;
  problemCategory: string;
  subcategory?: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description?: string;
  location: {
    coordinates: [number, number];
    address?: string;
    accuracyMeters?: number;
  };
  locationProvenance: 'GPS_FRESH' | 'GPS_STALE' | 'MANUAL_LANDMARK' | 'UNAVAILABLE';
  createdAt: string;
  status: 'DRAFT_LOCAL';
  syncAttempts: number;
  lastAttemptAt?: string;
  lastError?: string;
}

const STORAGE_KEY = 'motoassist_offline_incident_queue';

export function getOfflineQueue(): OfflineQueuedIncident[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[OfflineQueue] Failed to parse local queue:', err);
    return [];
  }
}

export function queueOfflineIncident(incident: Omit<OfflineQueuedIncident, 'queueId' | 'status' | 'syncAttempts' | 'createdAt'>): OfflineQueuedIncident {
  const queue = getOfflineQueue();
  const queueId = `LOCAL-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  
  const queuedItem: OfflineQueuedIncident = {
    ...incident,
    queueId,
    status: 'DRAFT_LOCAL',
    createdAt: new Date().toISOString(),
    syncAttempts: 0
  };

  queue.push(queuedItem);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('[OfflineQueue] Failed to persist offline queue:', err);
  }

  return queuedItem;
}

export function removeOfflineIncident(queueId: string): void {
  const queue = getOfflineQueue();
  const filtered = queue.filter(q => q.queueId !== queueId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('[OfflineQueue] Failed to remove item from queue:', err);
  }
}

export function clearOfflineQueue(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('[OfflineQueue] Failed to clear offline queue:', err);
  }
}

export async function flushOfflineQueue(apiBaseUrl: string): Promise<{ synced: number; failed: number }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining: OfflineQueuedIncident[] = [];

  for (const item of queue) {
    try {
      const res = await fetch(`${apiBaseUrl}/api/assistance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': item.queueId
        },
        body: JSON.stringify({
          problemCategory: item.problemCategory,
          subcategory: item.subcategory,
          urgency: item.urgency,
          description: item.description,
          location: item.location,
          locationProvenance: item.locationProvenance,
          idempotencyKey: item.queueId
        })
      });

      if (res.ok) {
        synced++;
      } else {
        failed++;
        remaining.push({
          ...item,
          syncAttempts: item.syncAttempts + 1,
          lastAttemptAt: new Date().toISOString(),
          lastError: `HTTP ${res.status}`
        });
      }
    } catch (err) {
      failed++;
      remaining.push({
        ...item,
        syncAttempts: item.syncAttempts + 1,
        lastAttemptAt: new Date().toISOString(),
        lastError: err instanceof Error ? err.message : 'Network error'
      });
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  } catch (err) {
    console.error('[OfflineQueue] Failed to update offline queue after flush:', err);
  }

  return { synced, failed };
}
