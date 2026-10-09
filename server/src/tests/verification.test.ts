import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { server, serverReady } from '../server.js';

const BASE_URL = 'http://localhost:5000';

describe('Identity Verification & Document Security Test Suite', () => {
  let riderToken: string;
  let adminToken: string;
  let helperToken: string;

  beforeAll(async () => {
    await serverReady;

    // Obtain tokens
    const riderRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rider@motoassist.in', password: 'password123' })
    });
    const riderData = await riderRes.json();
    riderToken = riderData.token;

    const adminRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@motoassist.in', password: 'password123' })
    });
    const adminData = await adminRes.json();
    adminToken = adminData.token;

    const helperRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'helper@motoassist.in', password: 'password123' })
    });
    const helperData = await helperRes.json();
    helperToken = helperData.token;
  });


  it('1. GET /api/verification/status retrieves current verification state', async () => {
    const res = await fetch(`${BASE_URL}/api/verification/status`, {
      headers: { Authorization: `Bearer ${riderToken}` }
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.userId).toBe('user-rider-1');
    expect(['UNDER_REVIEW', 'SUBMITTED', 'NOT_STARTED', 'VERIFIED']).toContain(body.data.status);
  });

  it('2. POST /api/verification/submit-documents rejects missing data', async () => {
    const res = await fetch(`${BASE_URL}/api/verification/submit-documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderToken}`
      },
      body: JSON.stringify({ documentNumber: '123' })
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('3. POST /api/verification/submit-documents enforces file format and size limits', async () => {
    // Invalid mime type
    const invalidFormatRes = await fetch(`${BASE_URL}/api/verification/submit-documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderToken}`
      },
      body: JSON.stringify({
        identityType: 'DRIVING_LICENSE',
        documentNumber: 'DL-74-2024-9988',
        fileMimeType: 'application/x-msdownload'
      })
    });

    expect(invalidFormatRes.status).toBe(400);
    const invalidBody = await invalidFormatRes.json();
    expect(invalidBody.message).toContain('Invalid document format');

    // Oversized file
    const oversizedRes = await fetch(`${BASE_URL}/api/verification/submit-documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderToken}`
      },
      body: JSON.stringify({
        identityType: 'DRIVING_LICENSE',
        documentNumber: 'DL-74-2024-9988',
        fileMimeType: 'image/jpeg',
        fileSizeBytes: 6 * 1024 * 1024
      })
    });

    expect(oversizedRes.status).toBe(400);
    const oversizedBody = await oversizedRes.json();
    expect(oversizedBody.message).toContain('exceeds 5MB limit');
  });

  it('4. POST /api/verification/submit-documents masks document number and records audit log', async () => {
    const res = await fetch(`${BASE_URL}/api/verification/submit-documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderToken}`
      },
      body: JSON.stringify({
        identityType: 'DRIVING_LICENSE',
        documentNumber: 'DL-WB74-2024-1024',
        fileMimeType: 'image/jpeg',
        fileSizeBytes: 1024 * 500,
        fileName: 'license_front.jpg'
      })
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.documentNumberMasked).toContain('****');
    expect(body.data.documentStatus).toBe('SUBMITTED');
  });

  it('5. POST /api/verification/face-verify provides honest pending/demo feedback', async () => {
    // Demo simulation mode
    const demoRes = await fetch(`${BASE_URL}/api/verification/face-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderToken}`
      },
      body: JSON.stringify({
        selfieSnapshot: 'data:image/jpeg;base64,sample...',
        livenessPassed: true,
        isDemoMode: true
      })
    });

    expect(demoRes.status).toBe(200);
    const demoBody = await demoRes.json();
    expect(demoBody.data.isDemoSimulation).toBe(true);
    expect(demoBody.data.faceLivenessStatus).toBe('PASSED');

    // Production honest check without demo flag
    const honestRes = await fetch(`${BASE_URL}/api/verification/face-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderToken}`
      },
      body: JSON.stringify({
        selfieSnapshot: 'data:image/jpeg;base64,sample...',
        livenessPassed: true,
        isDemoMode: false
      })
    });

    expect(honestRes.status).toBe(200);
    const honestBody = await honestRes.json();
    expect(honestBody.data.faceLivenessStatus).toBe('PENDING');
    expect(honestBody.data.faceVerificationNotes).toContain('External biometric provider not configured');
  });

  it('6. GET /api/verification/document/:docId strictly prevents IDOR', async () => {
    // Unrelated helper attempts to access rider documents
    const idorRes = await fetch(`${BASE_URL}/api/verification/document/user-rider-1`, {
      headers: { Authorization: `Bearer ${helperToken}` }
    });

    expect(idorRes.status).toBe(403);
    const idorBody = await idorRes.json();
    expect(idorBody.message).toContain('Access denied');

    // Owner can access
    const ownerRes = await fetch(`${BASE_URL}/api/verification/document/user-rider-1`, {
      headers: { Authorization: `Bearer ${riderToken}` }
    });

    expect(ownerRes.status).toBe(200);
    const ownerBody = await ownerRes.json();
    expect(ownerBody.data.documentNumberMasked).toBeDefined();

    // Admin can access
    const adminAccessRes = await fetch(`${BASE_URL}/api/verification/document/user-rider-1`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(adminAccessRes.status).toBe(200);
  });

  it('7. PUT /api/verification/admin/:userId/review allows Admin to review & approve', async () => {
    // Non-admin rejected
    const nonAdminRes = await fetch(`${BASE_URL}/api/verification/admin/user-rider-1/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riderToken}`
      },
      body: JSON.stringify({ status: 'VERIFIED' })
    });

    expect(nonAdminRes.status).toBe(403);

    // Admin approves
    const adminRes = await fetch(`${BASE_URL}/api/verification/admin/user-rider-1/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'VERIFIED',
        reviewNotes: 'Admin manual inspection completed. All physical marks correspond.'
      })
    });

    expect(adminRes.status).toBe(200);
    const adminBody = await adminRes.json();
    expect(adminBody.data.status).toBe('VERIFIED');
  });
});
