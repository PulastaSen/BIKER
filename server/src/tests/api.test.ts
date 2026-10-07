import { describe, it, expect } from 'vitest';

const BASE_URL = 'http://localhost:5000';

describe('MotoAssist Backend API Tests', () => {
  it('GET /api/health returns healthy status', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain('healthy');
  });

  describe('Auth Endpoints', () => {
    it('POST /api/auth/login validates credentials with pre-seeded demo user', async () => {
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

    it('POST /api/auth/login rejects invalid password', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'rider@motoassist.in', password: 'wrongpassword' })
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
    });

    it('POST /api/auth/register creates a new rider user', async () => {
      const uniqueEmail = `test_${Date.now()}@motoassist.test`;
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Tenzing Norgay',
          email: uniqueEmail,
          phone: `+91 91${Date.now().toString().slice(-8)}`,
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
  });

  describe('SOS Endpoints', () => {
    let incidentId = '';

    it('POST /api/sos triggers an emergency incident', async () => {
      const res = await fetch(`${BASE_URL}/api/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: 27.0360, longitude: 88.2627 })
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.incidentId).toBeDefined();
      expect(body.data.status).toBe('ACTIVE');
      incidentId = body.data.incidentId;
    });

    it('GET /api/sos/active retrieves the current active SOS', async () => {
      const res = await fetch(`${BASE_URL}/api/sos/active`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('ACTIVE');
    });

    it('PUT /api/sos/:id/cancel cancels the emergency incident', async () => {
      const res = await fetch(`${BASE_URL}/api/sos/${incidentId}/cancel`, {
        method: 'PUT'
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('CANCELLED');
    });
  });

  describe('Assistance Request Endpoints', () => {
    let requestId = '';

    it('GET /api/assistance/providers/nearby returns available workshops', async () => {
      const res = await fetch(`${BASE_URL}/api/assistance/providers/nearby?lat=26.7271&lng=88.3953`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('POST /api/assistance creates a new roadside request', async () => {
      const res = await fetch(`${BASE_URL}/api/assistance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemCategory: 'Breakdown',
          location: { coordinates: [88.3953, 26.7271], address: 'Sevoke Road' },
          providerId: 'provider-1',
          description: 'Engine stalled near Sevoke bridge'
        })
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.requestId).toBeDefined();
      expect(body.data.status).toBe('REQUESTED');
      requestId = body.data.requestId;
    });

    it('GET /api/assistance/:id fetches the created request', async () => {
      const res = await fetch(`${BASE_URL}/api/assistance/${requestId}`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.requestId).toBe(requestId);
    });

    it('PUT /api/assistance/:id/status updates the dispatch status', async () => {
      const res = await fetch(`${BASE_URL}/api/assistance/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'EN_ROUTE' })
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('EN_ROUTE');
    });
  });
});
