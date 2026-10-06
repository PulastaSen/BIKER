import { describe, it, expect, beforeEach } from 'vitest';
import {
  initAppStorage,
  getUsers,
  addUser,
  getCurrentUser,
  setCurrentUser,
  getBikes,
  addBike,
  deleteBike,
  getRequests,
  saveRequest,
  updateRequestStatus,
  getHelperProfiles,
  DEFAULT_USERS,
} from '../utils/appStorage';
import type { Bike, HelpRequest, User } from '../types/app';

describe('App Storage System & Core Data Flows', () => {
  beforeEach(() => {
    localStorage.clear();
    initAppStorage();
  });

  it('initializes default users and persistent storage', () => {
    const users = getUsers();
    expect(users.length).toBeGreaterThanOrEqual(3);
    expect(users[0].email).toBe('rider@motoassist.in');
    expect(users[1].email).toBe('helper@motoassist.in');
    expect(users[2].email).toBe('admin@motoassist.in');
  });

  it('manages current user authentication session state', () => {
    const initialUser = getCurrentUser();
    expect(initialUser).not.toBeNull();
    expect(initialUser?.role).toBe('RIDER');

    const adminUser = DEFAULT_USERS.find((u) => u.role === 'ADMIN');
    setCurrentUser(adminUser || null);
    expect(getCurrentUser()?.role).toBe('ADMIN');

    setCurrentUser(null);
    expect(getCurrentUser()).toBeNull();
  });

  it('allows registering a new user without collisions', () => {
    const newUser: User = {
      id: 'user-test-999',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@gmail.com',
      phone: '+91 99999 88888',
      role: 'RIDER',
      createdAt: new Date().toISOString(),
    };

    addUser(newUser);
    const users = getUsers();
    const found = users.find((u) => u.email === 'rohan.sharma@gmail.com');
    expect(found).toBeDefined();
    expect(found?.name).toBe('Rohan Sharma');
  });

  it('manages garage bikes (add, retrieve, delete)', () => {
    const initialBikes = getBikes();
    const initialCount = initialBikes.length;

    const newBike: Bike = {
      id: 'bike-test-custom',
      userId: 'user-rider-1',
      brand: 'Royal Enfield',
      model: 'Himalayan 450',
      registrationNumber: 'WB 74 Z 9999',
      year: 2025,
      fuelType: 'PETROL',
      isPrimary: false,
    };

    addBike(newBike);
    const updatedBikes = getBikes();
    expect(updatedBikes.length).toBe(initialCount + 1);

    const added = updatedBikes.find((b) => b.id === 'bike-test-custom');
    expect(added?.brand).toBe('Royal Enfield');
    expect(added?.model).toBe('Himalayan 450');

    deleteBike('bike-test-custom');
    const afterDelete = getBikes();
    expect(afterDelete.length).toBe(initialCount);
  });

  it('handles help request creation and multi-step lifecycle transitions', () => {
    const testRequest: HelpRequest = {
      id: 'RH-TEST-9001',
      riderId: 'user-rider-1',
      riderName: 'Pulasta Sen',
      riderPhone: '+91 98765 43210',
      bike: getBikes()[0],
      issue: 'PUNCTURE',
      description: 'Front tyre punctured near Sevoke railway bridge.',
      locationShared: true,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    saveRequest(testRequest);
    let requests = getRequests();
    let found = requests.find((r) => r.id === 'RH-TEST-9001');
    expect(found).toBeDefined();
    expect(found?.status).toBe('OPEN');

    // Helper offers assistance
    updateRequestStatus('RH-TEST-9001', 'HELPER_OFFERED', {
      assignedHelperId: 'helper-prof-1',
      assignedHelperName: 'Siliguri Auto Care (Suman Gurung)',
      assignedHelperPhone: '+91 98320 12345',
    });

    requests = getRequests();
    found = requests.find((r) => r.id === 'RH-TEST-9001');
    expect(found?.status).toBe('HELPER_OFFERED');
    expect(found?.assignedHelperName).toBe('Siliguri Auto Care (Suman Gurung)');

    // Issue resolved
    updateRequestStatus('RH-TEST-9001', 'RESOLVED');
    requests = getRequests();
    found = requests.find((r) => r.id === 'RH-TEST-9001');
    expect(found?.status).toBe('RESOLVED');
  });

  it('retrieves active corridor helper profiles with verification statuses', () => {
    const helpers = getHelperProfiles();
    expect(helpers.length).toBeGreaterThanOrEqual(2);
    const verifiedHelpers = helpers.filter((h) => h.verificationStatus === 'VERIFIED');
    expect(verifiedHelpers.length).toBeGreaterThanOrEqual(1);
    expect(verifiedHelpers[0].businessName).toBeDefined();
  });
});
