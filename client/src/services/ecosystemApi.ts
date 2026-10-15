import { API_BASE_URL, hasBackendApi } from '../config/api';
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

// ----------------------------------------------------
// LOCAL STORAGE KEYS & DEFAULT DATASETS FOR DEMO / STATIC HOSTING
// ----------------------------------------------------
const KEYS = {
  MEDICAL: 'motoassist_medical_profile',
  FAMILY: 'motoassist_family_circle',
  ACTIVE_RIDE: 'motoassist_active_ride',
  DOCUMENTS: 'motoassist_bike_documents',
  HAZARDS: 'motoassist_road_hazards',
  ACCIDENTS: 'motoassist_accident_reports',
};

const DEFAULT_MEDICAL: MedicalProfile = {
  userId: 'user-rider-1',
  fullName: 'Pulasta Sen',
  bloodGroup: 'B+',
  allergies: ['None declared'],
  medications: ['None declared'],
  medicalConditions: ['None declared'],
  emergencyNotes: 'Emergency medical contact: Family Circle & 112 Auto-Dispatch enabled.',
  organDonor: true,
  updatedAt: '2025-01-10T10:00:00.000Z'
};

const DEFAULT_FAMILY: FamilyMember[] = [
  {
    id: 'fam-1',
    userId: 'rider-1',
    name: 'Mom',
    relationship: 'PARENT',
    phone: '+91 98765 11111',
    canViewLiveRide: true,
    notifyOnSOS: true,
    notifyOnSafetyTimer: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'fam-2',
    userId: 'rider-1',
    name: 'Dad',
    relationship: 'PARENT',
    phone: '+91 98765 22222',
    canViewLiveRide: true,
    notifyOnSOS: true,
    notifyOnSafetyTimer: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'fam-3',
    userId: 'rider-1',
    name: 'Partner',
    relationship: 'PARTNER',
    phone: '+91 98765 33333',
    canViewLiveRide: true,
    notifyOnSOS: true,
    notifyOnSafetyTimer: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  }
];

const DEFAULT_DOCUMENTS: BikeDocument[] = [
  {
    id: 'doc-dl-1',
    documentId: 'DOC-DL-001',
    bikeId: 'rider-personal',
    docType: 'DRIVING_LICENSE',
    documentNumber: 'WB-24-2018-009124',
    issuer: 'Siliguri RTO',
    expiryDate: '2038-06-15',
    isVerified: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'doc-rc-2',
    documentId: 'DOC-RC-002',
    bikeId: 'rider-personal',
    docType: 'RC',
    documentNumber: 'WB-74-AX-1024',
    issuer: 'Transport Dept West Bengal',
    expiryDate: '2037-11-20',
    isVerified: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'doc-ins-3',
    documentId: 'DOC-INS-003',
    bikeId: 'rider-personal',
    docType: 'INSURANCE',
    documentNumber: 'BA-2024-MOT-9912',
    issuer: 'Bajaj Allianz General Insurance',
    expiryDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isVerified: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  }
];

const DEFAULT_HAZARDS: RoadHazard[] = [
  {
    id: 'haz-1',
    reportedBy: 'user-helper-1',
    hazardType: 'LANDSLIDE',
    description: 'Active minor rockfall on Coronation Bridge approach. Single lane open with caution.',
    severity: 'HIGH',
    location: {
      type: 'Point',
      coordinates: [88.4521, 26.9023],
      landmark: 'Coronation Bridge, NH-10'
    },
    status: 'ACTIVE',
    upvotes: 14,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'haz-2',
    reportedBy: 'user-rider-1',
    hazardType: 'OIL_SPILL',
    description: 'Heavy diesel slick after sharp curve near Kurseong bypass.',
    severity: 'CRITICAL',
    location: {
      type: 'Point',
      coordinates: [88.2785, 26.8812],
      landmark: 'Rohini Road hairpin 7'
    },
    status: 'ACTIVE',
    upvotes: 8,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// ----------------------------------------------------
// 1. Medical ID
// ----------------------------------------------------
export async function fetchMedicalProfile(): Promise<MedicalProfile | null> {
  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/medical/profile`, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setStored(KEYS.MEDICAL, json.data);
          return json.data;
        }
      }
    } catch {
      // Fall through to local storage
    }
  }
  return getStored<MedicalProfile>(KEYS.MEDICAL, DEFAULT_MEDICAL);
}

export async function saveMedicalProfile(profile: Partial<MedicalProfile>): Promise<MedicalProfile | null> {
  const current = getStored<MedicalProfile>(KEYS.MEDICAL, DEFAULT_MEDICAL);
  const updated: MedicalProfile = {
    ...current,
    ...profile,
    updatedAt: new Date().toISOString()
  };
  setStored(KEYS.MEDICAL, updated);

  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/medical/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || updated;
      }
    } catch {
      // Return local saved version
    }
  }
  return updated;
}

// ----------------------------------------------------
// 2. Family Safety Circle
// ----------------------------------------------------
export async function fetchFamilyCircle(): Promise<FamilyMember[]> {
  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/family`, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setStored(KEYS.FAMILY, json.data);
          return json.data;
        }
      }
    } catch {
      // Fall through to local storage
    }
  }
  return getStored<FamilyMember[]>(KEYS.FAMILY, DEFAULT_FAMILY);
}

export async function addFamilyMember(member: {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  canViewLiveRide?: boolean;
  notifyOnSOS?: boolean;
}): Promise<FamilyMember | null> {
  const newMember: FamilyMember = {
    id: `fam-${Date.now()}`,
    userId: 'rider-1',
    name: member.name,
    relationship: member.relationship,
    phone: member.phone,
    email: member.email,
    canViewLiveRide: member.canViewLiveRide ?? true,
    notifyOnSOS: member.notifyOnSOS ?? true,
    notifyOnSafetyTimer: true,
    createdAt: new Date().toISOString()
  };

  const list = getStored<FamilyMember[]>(KEYS.FAMILY, DEFAULT_FAMILY);
  setStored(KEYS.FAMILY, [...list, newMember]);

  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/family`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(member)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || newMember;
      }
    } catch {
      // Fall through to return local member
    }
  }
  return newMember;
}

export async function removeFamilyMember(id: string): Promise<boolean> {
  const list = getStored<FamilyMember[]>(KEYS.FAMILY, DEFAULT_FAMILY);
  setStored(KEYS.FAMILY, list.filter(m => m.id !== id));

  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/family/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
      return res.ok;
    } catch {
      return true;
    }
  }
  return true;
}

// ----------------------------------------------------
// 3. Safe Rides & Safety Timer
// ----------------------------------------------------
export async function startSafeRide(data: {
  destination: { coordinates: [number, number]; name: string; address?: string };
  startLocation: { coordinates: [number, number]; address?: string };
  estimatedDurationMinutes: number;
  sharedWithFamily?: boolean;
  sharedFamilyIds?: string[];
  safetyTimerEnabled?: boolean;
  safetyTimerTarget?: string;
}): Promise<SafeRideSession | null> {
  const now = new Date().toISOString();
  const newRide: SafeRideSession = {
    rideId: `ride-${Date.now()}`,
    userId: 'user-rider-1',
    status: 'ACTIVE',
    startLocation: data.startLocation,
    destination: data.destination,
    currentLocation: {
      coordinates: data.startLocation.coordinates,
      lastUpdated: now
    },
    startedAt: now,
    createdAt: now,
    estimatedDurationMinutes: data.estimatedDurationMinutes,
    sharedWithFamily: data.sharedWithFamily ?? true,
    sharedFamilyIds: data.sharedFamilyIds ?? [],
    safetyTimerEnabled: data.safetyTimerEnabled ?? true,
    safetyTimerTarget: data.safetyTimerTarget || new Date(Date.now() + (data.estimatedDurationMinutes + 15) * 60000).toISOString(),
    expectedArrivalTime: data.safetyTimerTarget || new Date(Date.now() + data.estimatedDurationMinutes * 60000).toISOString()
  };
  setStored(KEYS.ACTIVE_RIDE, newRide);

  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || newRide;
      }
    } catch {
      // Return local ride
    }
  }
  return newRide;
}

export async function fetchActiveRide(): Promise<SafeRideSession | null> {
  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/active`, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch {
      // Fall through to local storage
    }
  }
  return getStored<SafeRideSession | null>(KEYS.ACTIVE_RIDE, null);
}

export async function updateRideLocation(rideId: string, coordinates: [number, number]): Promise<boolean> {
  const ride = getStored<SafeRideSession | null>(KEYS.ACTIVE_RIDE, null);
  if (ride && ride.rideId === rideId) {
    ride.currentLocation = {
      coordinates,
      lastUpdated: new Date().toISOString()
    };
    setStored(KEYS.ACTIVE_RIDE, ride);
  }

  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/${rideId}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ coordinates })
      });
      return res.ok;
    } catch {
      return true;
    }
  }
  return true;
}

export async function checkInSafetyTimer(rideId: string, status: 'SAFE_CONFIRMED' | 'ESCALATED'): Promise<boolean> {
  const ride = getStored<SafeRideSession | null>(KEYS.ACTIVE_RIDE, null);
  if (ride && ride.rideId === rideId) {
    ride.safetyTimerStatus = status;
    setStored(KEYS.ACTIVE_RIDE, ride);
  }

  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/${rideId}/check-in`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch {
      return true;
    }
  }
  return true;
}

export async function endSafeRide(rideId: string): Promise<boolean> {
  localStorage.removeItem(KEYS.ACTIVE_RIDE);

  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/${rideId}/end`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      return res.ok;
    } catch {
      return true;
    }
  }
  return true;
}

// ----------------------------------------------------
// 4. Assistance Requests
// ----------------------------------------------------
export async function fetchAssistanceRequests(filter?: { status?: string; role?: string }): Promise<HelpRequest[]> {
  if (hasBackendApi()) {
    try {
      const params = new URLSearchParams();
      if (filter?.status) params.set('status', filter.status);
      if (filter?.role) params.set('role', filter.role);

      const res = await fetch(`${API_BASE_URL}/api/assistance?${params.toString()}`, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch {
      // Fall through to local storage
    }
  }

  const raw = localStorage.getItem('motoassist_requests_v3');
  return raw ? JSON.parse(raw) : [];
}

export async function fetchAssistanceRequestById(id: string): Promise<HelpRequest | null> {
  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assistance/${id}`, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch {
      // Fall through to local storage
    }
  }

  const raw = localStorage.getItem('motoassist_requests_v3');
  const all: HelpRequest[] = raw ? JSON.parse(raw) : [];
  return all.find(r => r.requestId === id || r.id === id) || null;
}

export async function createAssistanceRequest(data: any): Promise<any> {
  const requestId = `RH-${Math.floor(1000 + Math.random() * 9000)}`;
  const created = {
    id: requestId,
    requestId,
    ...data,
    status: 'REQUESTED',
    createdAt: new Date().toISOString()
  };

  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assistance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || created;
      }
    } catch {
      // Fall through
    }
  }

  const raw = localStorage.getItem('motoassist_requests_v3');
  const all = raw ? JSON.parse(raw) : [];
  localStorage.setItem('motoassist_requests_v3', JSON.stringify([created, ...all]));

  return created;
}

export const fetchAssistanceRequest = fetchAssistanceRequestById;

// ----------------------------------------------------
// 5. Road Hazards
// ----------------------------------------------------
export async function fetchHazards(bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }): Promise<RoadHazard[]> {
  if (hasBackendApi()) {
    try {
      const params = new URLSearchParams();
      if (bounds) {
        params.set('minLat', String(bounds.minLat));
        params.set('maxLat', String(bounds.maxLat));
        params.set('minLng', String(bounds.minLng));
        params.set('maxLng', String(bounds.maxLng));
      }
      const res = await fetch(`${API_BASE_URL}/api/hazards?${params.toString()}`, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setStored(KEYS.HAZARDS, json.data);
          return json.data;
        }
      }
    } catch {
      // Fall through
    }
  }
  return getStored<RoadHazard[]>(KEYS.HAZARDS, DEFAULT_HAZARDS);
}

export async function reportHazard(hazard: {
  hazardType: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  coordinates?: [number, number];
  landmark?: string;
  location?: { coordinates: [number, number]; landmark?: string };
}): Promise<RoadHazard | null> {
  const coords: [number, number] = hazard.coordinates || hazard.location?.coordinates || [88.4350, 26.8990];
  const landmark = hazard.landmark || hazard.location?.landmark;
  const newHazard: RoadHazard = {
    id: `haz-${Date.now()}`,
    reportedBy: 'user-rider-1',
    hazardType: hazard.hazardType as any,
    description: hazard.description,
    severity: hazard.severity,
    location: {
      type: 'Point',
      coordinates: coords,
      landmark: landmark
    },
    status: 'ACTIVE',
    upvotes: 1,
    createdAt: new Date().toISOString()
  };

  const list = getStored<RoadHazard[]>(KEYS.HAZARDS, DEFAULT_HAZARDS);
  setStored(KEYS.HAZARDS, [newHazard, ...list]);

  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hazards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(hazard)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || newHazard;
      }
    } catch {
      // Return local
    }
  }
  return newHazard;
}

export async function upvoteHazard(id: string): Promise<boolean> {
  const list = getStored<RoadHazard[]>(KEYS.HAZARDS, DEFAULT_HAZARDS);
  const updated = list.map(h => (h.id === id ? { ...h, upvotes: h.upvotes + 1 } : h));
  setStored(KEYS.HAZARDS, updated);

  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hazards/${id}/upvote`, {
        method: 'PUT',
        headers: { ...getAuthHeader() }
      });
      return res.ok;
    } catch {
      return true;
    }
  }
  return true;
}

export async function resolveHazard(id: string): Promise<boolean> {
  const list = getStored<RoadHazard[]>(KEYS.HAZARDS, DEFAULT_HAZARDS);
  const updated = list.map(h => (h.id === id ? { ...h, status: 'RESOLVED' as const } : h));
  setStored(KEYS.HAZARDS, updated);

  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hazards/${id}/resolve`, {
        method: 'PUT',
        headers: { ...getAuthHeader() }
      });
      return res.ok;
    } catch {
      return true;
    }
  }
  return true;
}

export const fetchRoadHazards = fetchHazards;
export const reportRoadHazard = reportHazard;
export const upvoteRoadHazard = upvoteHazard;
export const resolveRoadHazard = resolveHazard;

// ----------------------------------------------------
// 6. Accident Assistant
// ----------------------------------------------------
export async function submitAccidentReport(report: Partial<AccidentReport>): Promise<AccidentReport | null> {
  const created: AccidentReport = {
    id: `acc-${Date.now()}`,
    reportId: `ACC-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'SUBMITTED',
    createdAt: new Date().toISOString(),
    location: report.location || { coordinates: [0, 0] },
    ...report
  };
  const list = getStored<AccidentReport[]>(KEYS.ACCIDENTS, []);
  setStored(KEYS.ACCIDENTS, [created, ...list]);

  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/accidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(report)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || created;
      }
    } catch {
      // Return local
    }
  }
  return created;
}

// ----------------------------------------------------
// 7. Digital Bike Documents
// ----------------------------------------------------
export async function fetchBikeDocuments(bikeId: string): Promise<BikeDocument[]> {
  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents?bikeId=${bikeId}`, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setStored(KEYS.DOCUMENTS, json.data);
          return json.data;
        }
      }
    } catch {
      // Fall through to local storage
    }
  }

  const all = getStored<BikeDocument[]>(KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
  return all.filter(d => !bikeId || d.bikeId === bikeId || bikeId === 'rider-personal');
}

export async function addBikeDocument(doc: {
  bikeId: string;
  docType: string;
  documentNumber: string;
  issuer?: string;
  expiryDate?: string;
  notes?: string;
}): Promise<BikeDocument | null> {
  const newDoc: BikeDocument = {
    id: `doc-${Date.now()}`,
    documentId: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
    bikeId: doc.bikeId,
    docType: doc.docType,
    documentNumber: doc.documentNumber,
    issuer: doc.issuer || 'Regional Transport Office',
    expiryDate: doc.expiryDate,
    notes: doc.notes,
    isVerified: true,
    createdAt: new Date().toISOString()
  };

  const all = getStored<BikeDocument[]>(KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
  setStored(KEYS.DOCUMENTS, [...all, newDoc]);

  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(doc)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || newDoc;
      }
    } catch {
      // Return local
    }
  }
  return newDoc;
}

export async function updateBikeDocument(id: string, doc: {
  documentNumber?: string;
  issuer?: string;
  expiryDate?: string;
  notes?: string;
}): Promise<BikeDocument | null> {
  const all = getStored<BikeDocument[]>(KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
  let updatedDoc: BikeDocument | null = null;
  const updatedList = all.map(d => {
    if (d.id === id || d.documentId === id) {
      updatedDoc = { ...d, ...doc };
      return updatedDoc;
    }
    return d;
  });
  setStored(KEYS.DOCUMENTS, updatedList);

  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(doc)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || updatedDoc;
      }
    } catch {
      // Return local
    }
  }
  return updatedDoc;
}

export async function deleteBikeDocument(id: string): Promise<boolean> {
  const all = getStored<BikeDocument[]>(KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
  setStored(KEYS.DOCUMENTS, all.filter(d => d.id !== id && d.documentId !== id));

  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
      return res.ok;
    } catch {
      return true;
    }
  }
  return true;
}

// ----------------------------------------------------
// 8. Spare Parts & Receipts
// ----------------------------------------------------
export async function searchSpareParts(query?: string, model?: string): Promise<SparePart[]> {
  if (hasBackendApi()) {
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
    } catch {
      // Fall through
    }
  }

  // High-fidelity fallback parts inventory for Himalayan riders
  return [
    {
      id: 'part-1',
      partId: 'SP-RE-450-CLUTCH',
      providerId: 'helper-prof-1',
      providerName: 'Suman Himalayan Spares',
      partName: 'Sherpa 450 OEM Clutch Cable',
      brand: 'Royal Enfield Genuine Spares',
      category: 'CABLES_LEVERS',
      price: 480,
      inStock: true,
      quantityAvailable: 4,
      distanceKm: 4.2,
      locationName: 'Sevoke Road, Siliguri'
    },
    {
      id: 'part-2',
      partId: 'SP-TUBE-21',
      providerId: 'helper-prof-1',
      providerName: 'Suman Himalayan Spares',
      partName: 'Heavy Duty 21" Front Tube (90/90-21)',
      brand: 'CEAT Gripp Pro',
      category: 'TYRES_TUBES',
      price: 650,
      inStock: true,
      quantityAvailable: 6,
      distanceKm: 4.2,
      locationName: 'Sevoke Road, Siliguri'
    },
    {
      id: 'part-3',
      partId: 'SP-BRAKE-PADS',
      providerId: 'helper-prof-2',
      providerName: 'Gurung Mountain Motors',
      partName: 'Sintered Front Brake Pads',
      brand: 'Brembo / ByBre Original',
      category: 'BRAKES',
      price: 1250,
      inStock: true,
      quantityAvailable: 2,
      distanceKm: 12.8,
      locationName: 'Rohini Toll Gate'
    }
  ];
}

export async function fetchServiceReceipt(requestId: string): Promise<ServiceReceipt | null> {
  if (hasBackendApi()) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/receipts/${requestId}`, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch {
      // Fall through
    }
  }
  return null;
}
