import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { server, serverReady } from '../server.js';

const BASE_URL = 'http://localhost:5000';

describe('MotoAssist Backend Full API Test Suite', () => {
  beforeAll(async () => {
    await serverReady;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /api/health returns healthy status', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain('healthy');
  });

  describe('1. Authentication API', () => {
    it('POST /api/auth/login validates credentials and issues JWT', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'rider@motoassist.in', password: 'password123' })
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.token).toBeDefined();
      expect(body.user.email).toBe('rider@motoassist.in');
      expect(body.user.role).toBe('RIDER');
    });

    it('POST /api/auth/login rejects wrong password', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'rider@motoassist.in', password: 'wrongpassword' })
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
    });

    it('POST /api/auth/register creates a new user profile', async () => {
      const uniqueEmail = `rider_${Date.now()}@motoassist.test`;
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Karma Lhamo',
          email: uniqueEmail,
          phone: `+91 92${Date.now().toString().slice(-8)}`,
          password: 'password123',
          role: 'RIDER'
        })
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.user.email).toBe(uniqueEmail);
      expect(body.token).toBeDefined();
    });

    it('POST /api/auth/logout invalidates session token and returns success', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-jwt-token'
        }
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toContain('logged out');
    });
  });

  describe('2. Bike Garage API', () => {
    let bikeId = '';

    it('GET /api/bikes returns list of user bikes', async () => {
      const res = await fetch(`${BASE_URL}/api/bikes?userId=user-rider-1`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('POST /api/bikes adds a new motorcycle to garage', async () => {
      const res = await fetch(`${BASE_URL}/api/bikes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-rider-1',
          brand: 'Royal Enfield',
          model: 'Himalayan 450',
          registrationNumber: 'WB 74 ZZ 9901',
          year: 2025,
          fuelType: 'PETROL',
          isPrimary: true,
          notes: 'Tested on North Sikkim loop.'
        })
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBeDefined();
      expect(body.data.brand).toBe('Royal Enfield');
      bikeId = body.data.id;
    });

    it('PUT /api/bikes/:id updates bike details', async () => {
      const res = await fetch(`${BASE_URL}/api/bikes/${bikeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Upgraded with crash bars and panniers.' })
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.notes).toContain('Upgraded');
    });

    it('DELETE /api/bikes/:id removes motorcycle from garage', async () => {
      const res = await fetch(`${BASE_URL}/api/bikes/${bikeId}`, {
        method: 'DELETE'
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });

  describe('3. Emergency Contacts API', () => {
    let contactId = '';

    it('GET /api/contacts returns emergency contacts', async () => {
      const res = await fetch(`${BASE_URL}/api/contacts?userId=user-rider-1`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('POST /api/contacts creates a new contact', async () => {
      const res = await fetch(`${BASE_URL}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-rider-1',
          name: 'Sunil Chettri',
          phone: '+91 98320 99887',
          relationship: 'Friend / Ride Lead',
          isPrimary: false,
          notifyOnSOS: true
        })
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBeDefined();
      expect(body.data.name).toBe('Sunil Chettri');
      contactId = body.data.id;
    });

    it('PUT /api/contacts/:id updates an existing contact', async () => {
      const res = await fetch(`${BASE_URL}/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relationship: 'Himalayan Tour Marshal' })
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.relationship).toBe('Himalayan Tour Marshal');
    });

    it('DELETE /api/contacts/:id removes contact', async () => {
      const res = await fetch(`${BASE_URL}/api/contacts/${contactId}`, {
        method: 'DELETE'
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });

  describe('4. Roadside Assistance & SOS APIs', () => {
    let requestId = '';
    let incidentId = '';

    it('GET /api/assistance/providers/nearby returns active service hubs', async () => {
      const res = await fetch(`${BASE_URL}/api/assistance/providers/nearby?lat=26.7271&lng=88.3953`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('POST /api/assistance creates roadside request', async () => {
      const res = await fetch(`${BASE_URL}/api/assistance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemCategory: 'Fuel',
          location: { coordinates: [88.3953, 26.7271], address: 'NH-10 Siliguri' },
          providerId: 'provider-1'
        })
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.requestId).toBeDefined();
      requestId = body.data.requestId;
    });

    it('GET /api/assistance/:id retrieves the request', async () => {
      const res = await fetch(`${BASE_URL}/api/assistance/${requestId}`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.requestId).toBe(requestId);
    });

    it('PUT /api/assistance/:id/status advances dispatch state', async () => {
      const res = await fetch(`${BASE_URL}/api/assistance/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED', providerId: 'provider-1' })
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('ACCEPTED');
    });

    it('PUT /api/assistance/:id/status rejects invalid transitions with 409 Conflict', async () => {
      // Attempting invalid backward transition from ACCEPTED to SUBMITTED
      const res = await fetch(`${BASE_URL}/api/assistance/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SUBMITTED' })
      });

      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.allowedTransitions).toContain('EN_ROUTE');
    });

    it('POST /api/assistance honors idempotency-key to prevent duplicate requests', async () => {
      const testKey = `IDEM-TEST-${Date.now()}`;
      const payload = {
        problemCategory: 'Puncture',
        location: { coordinates: [88.3953, 26.7271], address: 'Sevoke Road', accuracyMeters: 8 },
        idempotencyKey: testKey
      };

      const res1 = await fetch(`${BASE_URL}/api/assistance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      expect(res1.status).toBe(201);
      const body1 = await res1.json();
      const firstReqId = body1.data.requestId;

      // Re-send with same idempotency key
      const res2 = await fetch(`${BASE_URL}/api/assistance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      expect(res2.status).toBe(200);
      const body2 = await res2.json();
      expect(body2.idempotentReplay).toBe(true);
      expect(body2.data.requestId).toBe(firstReqId);
    });

    it('GET /api/assistance/ops/queue returns automotive operations dispatch queue', async () => {
      const res = await fetch(`${BASE_URL}/api/assistance/ops/queue`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.unassigned).toBeInstanceOf(Array);
      expect(body.data.active).toBeInstanceOf(Array);
      expect(body.data.total).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/assistance/:id/cancel cancels incident with reason and audit log', async () => {
      const res = await fetch(`${BASE_URL}/api/assistance/${requestId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Self resolved flat tyre with CO2 canister' })
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('CANCELLED');
      expect(body.data.cancellationReason).toBe('Self resolved flat tyre with CO2 canister');
    });

    it('POST /api/assistance creates request with motorcycle identification (VRN, VIN, Brand, Model)', async () => {
      const res = await fetch(`${BASE_URL}/api/assistance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderId: 'rider-re-test',
          riderName: 'Pulasta Sen',
          riderPhone: '+91 98765 43210',
          helpCategory: 'MECHANICAL',
          subcategory: 'TYRE',
          issue: 'PUNCTURE',
          description: 'Rear puncture on Himalayan 450',
          approximateLocation: 'Sevoke Road Crossing',
          latitude: 26.8834,
          longitude: 88.4712,
          locationProvenance: 'GPS_FRESH',
          bikeDetails: {
            brand: 'Royal Enfield',
            model: 'Himalayan 450',
            registrationNumber: 'WB 74 H 4500',
            vin: 'ME3H450XXXX123456',
            fuelType: 'PETROL',
            year: 2024
          },
          coverageType: 'COMPLIMENTARY_YEAR_1'
        })
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.bikeDetails.brand).toBe('Royal Enfield');
      expect(body.data.bikeDetails.registrationNumber).toBe('WB 74 H 4500');
      expect(body.data.coverageType).toBe('COMPLIMENTARY_YEAR_1');
    });

    it('POST /api/assistance/:id/escalate escalates unfulfilled request to 24/7 Helpline', async () => {
      // Create request to escalate
      const createRes = await fetch(`${BASE_URL}/api/assistance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderId: 'rider-re-test-2',
          riderName: 'Pulasta Sen',
          riderPhone: '+91 98765 43210',
          helpCategory: 'MECHANICAL',
          issue: 'BATTERY_DEAD',
          description: 'Dead battery in remote sector',
          latitude: 26.8834,
          longitude: 88.4712,
          bikeDetails: {
            brand: 'Royal Enfield',
            model: 'Continental GT 650',
            registrationNumber: 'WB 74 GT 6500'
          }
        })
      });
      const createData = await createRes.json();
      const escId = createData.data.id || createData.data.requestId;

      const escRes = await fetch(`${BASE_URL}/api/assistance/${escId}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'No local workshop responded in 15 mins' })
      });

      expect(escRes.status).toBe(200);
      const escBody = await escRes.json();
      expect(escBody.success).toBe(true);
      expect(escBody.data.status).toBe('UNFULFILLED_NO_PROVIDER');
      expect(escBody.data.escalationDetails.escalatedToHelpline).toBe(true);
      expect(escBody.data.escalationDetails.helplinePhone).toBe('1800 2100 007');
    });

    it('POST /api/assistance/:id/dispute records customer tariff / billing discrepancy', async () => {
      // Create request to dispute
      const createRes = await fetch(`${BASE_URL}/api/assistance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderId: 'rider-re-test-3',
          riderName: 'Pulasta Sen',
          riderPhone: '+91 98765 43210',
          helpCategory: 'TOWING',
          issue: 'TOWING',
          description: 'Flatbed towing dispute',
          latitude: 26.8834,
          longitude: 88.4712
        })
      });
      const createData = await createRes.json();
      const dispId = createData.data.id || createData.data.requestId;

      const dispRes = await fetch(`${BASE_URL}/api/assistance/${dispId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Excess charges above ₹45/km towing tariff',
          disputedAmount: 450
        })
      });

      expect(dispRes.status).toBe(200);
      const dispBody = await dispRes.json();
      expect(dispBody.success).toBe(true);
      expect(dispBody.data.disputeDetails.disputed).toBe(true);
      expect(dispBody.data.disputeDetails.disputedAmount).toBe(450);
      expect(dispBody.data.disputeDetails.status).toBe('REVIEW_PENDING');
    });

    it('GET /api/assistance/providers/nearby?brand=Royal+Enfield prioritizes OEM authorized workshops', async () => {
      const res = await fetch(`${BASE_URL}/api/assistance/providers/nearby?lat=26.7271&lng=88.3953&brand=Royal+Enfield`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data[0].name).toContain('Royal Enfield');
    });

    it('POST /api/sos triggers emergency incident', async () => {
      const res = await fetch(`${BASE_URL}/api/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: 27.0360, longitude: 88.2627 })
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('ACTIVE');
      incidentId = body.data.incidentId;
    });

    it('GET /api/sos/active retrieves current active incident', async () => {
      const res = await fetch(`${BASE_URL}/api/sos/active`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('ACTIVE');
    });

    it('PUT /api/sos/:id/cancel cancels incident', async () => {
      const res = await fetch(`${BASE_URL}/api/sos/${incidentId}/cancel`, {
        method: 'PUT'
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('CANCELLED');
    });
  });

  describe('5. Helper Portal API', () => {
    it('GET /api/helpers/profile returns helper information', async () => {
      const res = await fetch(`${BASE_URL}/api/helpers/profile`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.businessName).toBeDefined();
    });

    it('PUT /api/helpers/availability toggles active status', async () => {
      const res = await fetch(`${BASE_URL}/api/helpers/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: false, providerId: 'provider-1' })
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.isOpen).toBe(false);
    });

    it('GET /api/helpers/requests retrieves available requests feed', async () => {
      const res = await fetch(`${BASE_URL}/api/helpers/requests`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('6. Admin Operations API', () => {
    it('GET /api/admin/metrics returns platform operations summary', async () => {
      const res = await fetch(`${BASE_URL}/api/admin/metrics`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.totalUsers).toBeGreaterThan(0);
      expect(body.data.totalProviders).toBeGreaterThan(0);
      expect(body.data.totalBikes).toBeGreaterThan(0);
    });

    it('GET /api/admin/helpers retrieves provider management list', async () => {
      const res = await fetch(`${BASE_URL}/api/admin/helpers`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('PUT /api/admin/helpers/:id/verify updates provider approval status', async () => {
      const res = await fetch(`${BASE_URL}/api/admin/helpers/provider-5/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'VERIFIED' })
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.verificationStatus).toBe('VERIFIED');
    });

    it('GET /api/admin/users lists platform users with optional role filtering', async () => {
      const res = await fetch(`${BASE_URL}/api/admin/users?role=RIDER`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.every((u: { role: string }) => u.role === 'RIDER')).toBe(true);
    });
  });

  describe('7. Emergency Medical ID API', () => {
    it('GET /api/medical/profile returns medical profile for rider', async () => {
      const res = await fetch(`${BASE_URL}/api/medical/profile?userId=user-rider-1`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.bloodGroup).toBeDefined();
      expect(Array.isArray(body.data.allergies)).toBe(true);
    });

    it('PUT /api/medical/profile updates emergency medical details', async () => {
      const res = await fetch(`${BASE_URL}/api/medical/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-rider-1',
          fullName: 'Pulasta Sen',
          bloodGroup: 'O+',
          allergies: ['Penicillin'],
          medications: ['None'],
          doctorName: 'Dr. D. Sen',
          doctorContact: '+91 98765 99999',
          preferredHospital: 'Neotia Getwel, Siliguri',
          sharingPreference: 'EMERGENCY_ONLY'
        })
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.bloodGroup).toBe('O+');
      expect(body.data.sharingPreference).toBe('EMERGENCY_ONLY');
    });
  });

  describe('8. Family Safety Circle API', () => {
    it('GET /api/family returns trusted circle members', async () => {
      const res = await fetch(`${BASE_URL}/api/family?userId=user-rider-1`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('POST /api/family adds a new family member', async () => {
      const res = await fetch(`${BASE_URL}/api/family`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-rider-1',
          name: 'Rohan Sen',
          relationship: 'SIBLING',
          phone: '+91 98765 11111',
          canViewLiveRide: true,
          notifyOnSOS: true
        })
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Rohan Sen');
    });
  });

  describe('9. Safe Ride & Safety Timer API', () => {
    let createdRideId = '';

    it('POST /api/rides/start initiates a safe ride session', async () => {
      const res = await fetch(`${BASE_URL}/api/rides/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-rider-1',
          destination: { coordinates: [88.6138, 27.3389], name: 'Gangtok Ridge' },
          startLocation: { coordinates: [88.3953, 26.7271], address: 'Siliguri' },
          estimatedDurationMinutes: 180,
          sharedWithFamily: true,
          safetyTimerEnabled: true
        })
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.rideId).toBeDefined();
      createdRideId = body.data.rideId;
    });

    it('PUT /api/rides/:id/location updates live coordinates', async () => {
      const res = await fetch(`${BASE_URL}/api/rides/${createdRideId}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinates: [88.4200, 26.8500] })
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it('PUT /api/rides/:id/check-in confirms rider safety', async () => {
      const res = await fetch(`${BASE_URL}/api/rides/${createdRideId}/check-in`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SAFE_CONFIRMED' })
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.safetyTimerStatus).toBe('SAFE_CONFIRMED');
    });

    it('PUT /api/rides/:id/end completes the ride', async () => {
      const res = await fetch(`${BASE_URL}/api/rides/${createdRideId}/end`, {
        method: 'PUT'
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('COMPLETED');
    });
  });

  describe('10. Road Hazards & Road Intelligence API', () => {
    let createdHazardId = '';

    it('GET /api/hazards retrieves verified road conditions', async () => {
      const res = await fetch(`${BASE_URL}/api/hazards`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('POST /api/hazards reports a new road hazard', async () => {
      const res = await fetch(`${BASE_URL}/api/hazards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-rider-1',
          hazardType: 'LANDSLIDE',
          description: 'Rubble near Sevoke Railway Crossing',
          severity: 'HIGH',
          location: { coordinates: [88.4350, 26.8990], landmark: 'Sevoke' }
        })
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      createdHazardId = body.data.id;
    });

    it('PUT /api/hazards/:id/upvote increments hazard confirmation votes', async () => {
      const res = await fetch(`${BASE_URL}/api/hazards/${createdHazardId}/upvote`, {
        method: 'PUT'
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.upvotes).toBeGreaterThan(1);
    });
  });

  describe('11. Accident Assistant API', () => {
    it('POST /api/accidents logs a structured accident report', async () => {
      const res = await fetch(`${BASE_URL}/api/accidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-rider-1',
          bikeId: 'bike-1',
          location: { coordinates: [88.3953, 26.7271], address: 'NH-10 Siliguri' },
          riderSafe: true,
          bikeDamage: 'Right side fairing and mirror damage',
          roadCondition: 'Wet mountain road',
          towingRequested: true
        })
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.reportId).toBeDefined();
    });

    it('GET /api/accidents returns user accident incident records', async () => {
      const res = await fetch(`${BASE_URL}/api/accidents?userId=user-rider-1`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('12. Digital Bike Document Wallet API', () => {
    let createdDocId = '';

    it('POST /api/documents adds a vehicle document', async () => {
      const res = await fetch(`${BASE_URL}/api/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-rider-1',
          bikeId: 'bike-1',
          docType: 'RC',
          documentNumber: 'WB-74-AB-8921',
          issuer: 'Siliguri RTO',
          notes: 'Original smart card RC'
        })
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      createdDocId = body.data.documentId;
    });

    it('GET /api/documents retrieves bike documents', async () => {
      const res = await fetch(`${BASE_URL}/api/documents?bikeId=bike-1&userId=user-rider-1`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('DELETE /api/documents/:id deletes document securely', async () => {
      const res = await fetch(`${BASE_URL}/api/documents/${createdDocId}`, {
        method: 'DELETE'
      });
      expect(res.status).toBe(200);
    });
  });

  describe('13. Spare Parts Inventory API', () => {
    it('GET /api/inventory queries genuine spare parts', async () => {
      const res = await fetch(`${BASE_URL}/api/inventory?q=Brake`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0].partName).toContain('Brake');
    });
  });

  describe('14. Digital Service Receipts API', () => {
    it('GET /api/receipts/:requestId retrieves itemized receipt', async () => {
      const res = await fetch(`${BASE_URL}/api/receipts/REQ-TEST-1`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.total).toBeGreaterThan(0);
      expect(Array.isArray(body.data.parts)).toBe(true);
    });
  });
});
