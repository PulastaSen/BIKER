import { API_BASE_URL } from '../config/api';
import type {
  MedicalProfile,
  FamilyMember,
  SafeRideSession,
  RoadHazard,
  AccidentReport,
  BikeDocument,
  SparePart,
  ServiceReceipt,
  HelpRequest
} from '../types/app';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 1. Medical ID
export async function fetchMedicalProfile(): Promise<MedicalProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/medical/profile`, {
      headers: { ...getAuthHeader() }
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.warn('[Ecosystem API] fetchMedicalProfile error:', err);
  }
  return null;
}

export async function saveMedicalProfile(profile: Partial<MedicalProfile>): Promise<MedicalProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/medical/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(profile)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.warn('[Ecosystem API] saveMedicalProfile error:', err);
  }
  return null;
}

// 2. Family Safety Circle
export async function fetchFamilyCircle(): Promise<FamilyMember[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/family`, {
      headers: { ...getAuthHeader() }
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || [];
    }
  } catch (err) {
    console.warn('[Ecosystem API] fetchFamilyCircle error:', err);
  }
  return [];
}

export async function addFamilyMember(member: {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  canViewLiveRide?: boolean;
  notifyOnSOS?: boolean;
}): Promise<FamilyMember | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/family`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(member)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.warn('[Ecosystem API] addFamilyMember error:', err);
  }
  return null;
}

export async function removeFamilyMember(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/family/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return res.ok;
  } catch (err) {
    console.warn('[Ecosystem API] removeFamilyMember error:', err);
  }
  return false;
}

// 3. Safe Rides & Safety Timer
export async function startSafeRide(data: {
  destination: { coordinates: [number, number]; name: string; address?: string };
  startLocation: { coordinates: [number, number]; address?: string };
  estimatedDurationMinutes: number;
  sharedWithFamily?: boolean;
  sharedFamilyIds?: string[];
  safetyTimerEnabled?: boolean;
  safetyTimerTarget?: string;
}): Promise<SafeRideSession | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/rides/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.warn('[Ecosystem API] startSafeRide error:', err);
  }
  return null;
}

export async function fetchActiveRide(): Promise<SafeRideSession | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/rides/active`, {
      headers: { ...getAuthHeader() }
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.warn('[Ecosystem API] fetchActiveRide error:', err);
  }
  return null;
}

export async function updateRideLocation(rideId: string, coordinates: [number, number]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/rides/${rideId}/location`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ coordinates })
    });
    return res.ok;
  } catch (err) {
    console.warn('[Ecosystem API] updateRideLocation error:', err);
  }
  return false;
}

export async function checkInSafetyTimer(rideId: string, status: 'SAFE_CONFIRMED' | 'ESCALATED'): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/rides/${rideId}/check-in`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status })
    });
    return res.ok;
  } catch (err) {
    console.warn('[Ecosystem API] checkInSafetyTimer error:', err);
  }
  return false;
}

export async function endSafeRide(rideId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/rides/${rideId}/end`, {
      method: 'PUT',
      headers: { ...getAuthHeader() }
    });
    return res.ok;
  } catch (err) {
    console.warn('[Ecosystem API] endSafeRide error:', err);
  }
  return false;
}

// 4. Assistance & Stranded Rescue
export async function createAssistanceRequest(data: {
  problemCategory: string;
  helpCategory?: string;
  subcategory?: string;
  urgency?: string;
  description?: string;
  location: { coordinates: [number, number]; address?: string; accuracyMeters?: number };
  providerId?: string;
  towingDetails?: unknown;
  medicalDetails?: unknown;
  estimatedPrice?: unknown;
}): Promise<HelpRequest | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assistance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.warn('[Ecosystem API] createAssistanceRequest error:', err);
  }
  return null;
}

export async function fetchAssistanceRequest(id: string): Promise<HelpRequest | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assistance/${id}`, {
      headers: { ...getAuthHeader() }
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.warn('[Ecosystem API] fetchAssistanceRequest error:', err);
  }
  return null;
}

// 5. Road Hazards
export async function fetchRoadHazards(): Promise<RoadHazard[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hazards`, {
      headers: { ...getAuthHeader() }
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || [];
    }
  } catch (err) {
    console.warn('[Ecosystem API] fetchRoadHazards error:', err);
  }
  return [];
}

export async function reportRoadHazard(hazard: {
  hazardType: string;
  description: string;
  severity: string;
  location: { coordinates: [number, number]; landmark?: string };
}): Promise<RoadHazard | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hazards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(hazard)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.warn('[Ecosystem API] reportRoadHazard error:', err);
  }
  return null;
}

export async function upvoteRoadHazard(id: string): Promise<RoadHazard | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hazards/${id}/upvote`, {
      method: 'PUT',
      headers: { ...getAuthHeader() }
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.warn('[Ecosystem API] upvoteRoadHazard error:', err);
  }
  return null;
}

export async function resolveRoadHazard(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hazards/${id}/resolve`, {
      method: 'PUT',
      headers: { ...getAuthHeader() }
    });
    return res.ok;
  } catch (err) {
    console.warn('[Ecosystem API] resolveRoadHazard error:', err);
  }
  return false;
}

// 6. Accident Reports
export async function submitAccidentReport(report: Partial<AccidentReport>): Promise<AccidentReport | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/accidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(report)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.warn('[Ecosystem API] submitAccidentReport error:', err);
  }
  return null;
}

// 7. Digital Bike Documents
export async function fetchBikeDocuments(bikeId: string): Promise<BikeDocument[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/documents?bikeId=${bikeId}`, {
      headers: { ...getAuthHeader() }
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || [];
    }
  } catch (err) {
    console.warn('[Ecosystem API] fetchBikeDocuments error:', err);
  }
  return [];
}

export async function addBikeDocument(doc: {
  bikeId: string;
  docType: string;
  documentNumber: string;
  issuer?: string;
  expiryDate?: string;
  notes?: string;
}): Promise<BikeDocument | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(doc)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.warn('[Ecosystem API] addBikeDocument error:', err);
  }
  return null;
}

export async function updateBikeDocument(id: string, doc: {
  documentNumber?: string;
  issuer?: string;
  expiryDate?: string;
  notes?: string;
}): Promise<BikeDocument | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(doc)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.warn('[Ecosystem API] updateBikeDocument error:', err);
  }
  return null;
}

export async function deleteBikeDocument(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return res.ok;
  } catch (err) {
    console.warn('[Ecosystem API] deleteBikeDocument error:', err);
  }
  return false;
}

// 8. Spare Parts
export async function searchSpareParts(query?: string, model?: string): Promise<SparePart[]> {
  try {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (model) params.set('model', model);
    const res = await fetch(`${API_BASE_URL}/api/inventory?${params.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || [];
    }
  } catch (err) {
    console.warn('[Ecosystem API] searchSpareParts error:', err);
  }
  return [];
}

// 9. Digital Service Receipts
export async function fetchServiceReceipt(requestId: string): Promise<ServiceReceipt | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/receipts/${requestId}`, {
      headers: { ...getAuthHeader() }
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.warn('[Ecosystem API] fetchServiceReceipt error:', err);
  }
  return null;
}
