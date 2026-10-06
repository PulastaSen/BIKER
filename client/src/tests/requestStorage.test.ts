import { describe, it, expect, beforeEach } from 'vitest';
import { getRequests, saveRequest, clearRequests } from '../utils/requestStorage';
import type { HelpRequest } from '../types/request';

describe('Public Request Storage Flow', () => {
  beforeEach(() => {
    clearRequests();
  });

  it('starts with an empty array when cleared', () => {
    expect(getRequests()).toEqual([]);
  });

  it('saves and prepends requests in correct chronological order', () => {
    const testBike = {
      id: 'bike-1',
      brand: 'KTM',
      model: '390 Adventure',
      year: 2025,
      registrationNumber: 'WB 74 AB 8921',
    };

    const req1: HelpRequest = {
      id: 'RH-1001',
      bike: testBike,
      issue: 'PUNCTURE',
      description: 'First test request',
      locationShared: false,
      status: 'OPEN',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    const req2: HelpRequest = {
      id: 'RH-1002',
      bike: testBike,
      issue: 'BATTERY_ELECTRICAL',
      description: 'Second test request',
      locationShared: true,
      status: 'OPEN',
      createdAt: '2025-01-02T00:00:00.000Z',
    };

    saveRequest(req1);
    expect(getRequests().length).toBe(1);

    saveRequest(req2);
    const requests = getRequests();
    expect(requests.length).toBe(2);
    // Newly saved request should be first
    expect(requests[0].id).toBe('RH-1002');
    expect(requests[1].id).toBe('RH-1001');
  });
});
