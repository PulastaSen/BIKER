import { API_BASE_URL } from '../config/api';

export type VerificationOverallStatus =
  | 'NOT_STARTED'
  | 'DOCUMENTS_REQUIRED'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'ACTION_REQUIRED';

export type FaceLivenessStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'PASSED'
  | 'FAILED'
  | 'MANUAL_REVIEW';

export interface IdentityVerificationData {
  verificationId: string;
  userId: string;
  role: 'RIDER' | 'HELPER';
  status: VerificationOverallStatus;
  identityType?: string;
  documentNumberMasked?: string;
  documentFrontKey?: string;
  documentExpiryDate?: string;
  documentStatus: 'NOT_SUBMITTED' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  selfieKey?: string;
  faceLivenessStatus: FaceLivenessStatus;
  faceMatchScore?: number | null;
  faceVerificationNotes?: string;
  isBiometricProviderConfigured: boolean;
  isDemoSimulation: boolean;
  helperCategory?: 'MECHANIC' | 'TOWING' | 'FUEL' | 'PUNCTURE' | 'PARAMEDIC';
  businessName?: string;
  serviceAddress?: string;
  yearsOfExperience?: number;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  auditLogs?: Array<{
    action: string;
    timestamp: string;
    actorId: string;
    actorRole: string;
    details?: string;
  }>;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchVerificationStatus(): Promise<IdentityVerificationData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/verification/status`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.error('Failed to fetch verification status:', err);
    return null;
  }
}

export async function submitIdentityDocuments(payload: {
  identityType: string;
  documentNumber: string;
  documentExpiryDate?: string;
  fileName?: string;
  fileSizeBytes?: number;
  fileMimeType?: string;
  helperCategory?: string;
  businessName?: string;
  serviceAddress?: string;
  yearsOfExperience?: number;
}): Promise<{ success: boolean; message?: string; data?: IdentityVerificationData }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/verification/submit-documents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.error('Failed to submit identity documents:', err);
    return { success: false, message: 'Network error submitting identity documents' };
  }
}

export async function submitFaceVerification(payload: {
  selfieSnapshot?: string;
  livenessPassed?: boolean;
  antiSpoofCheck?: boolean;
  isDemoMode?: boolean;
  accessibleManualReviewRequested?: boolean;
}): Promise<{ success: boolean; message?: string; data?: IdentityVerificationData }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/verification/face-verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.error('Failed to submit face verification:', err);
    return { success: false, message: 'Network error submitting face verification' };
  }
}

export async function fetchSecureDocument(docId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/verification/document/${docId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Access denied');
    }
    const json = await res.json();
    return json.data;
  } catch (err) {
    throw err;
  }
}

export async function adminReviewVerification(
  userId: string,
  status: 'VERIFIED' | 'REJECTED' | 'ACTION_REQUIRED',
  reviewNotes: string
): Promise<{ success: boolean; message?: string; data?: IdentityVerificationData }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/verification/admin/${userId}/review`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, reviewNotes }),
    });
    const json = await res.json();
    return json;
  } catch (err) {
    return { success: false, message: 'Failed to submit admin review' };
  }
}

export const getVerificationStatus = fetchVerificationStatus;
export const uploadIdentityDocument = submitIdentityDocuments;
export type VerificationRecord = IdentityVerificationData;
