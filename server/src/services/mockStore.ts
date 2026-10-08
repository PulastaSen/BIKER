import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: string;
  profilePhoto?: string;
  createdAt: string;
}

export interface MockProvider {
  id: string;
  name: string;
  businessName: string;
  ownerName?: string;
  verified: boolean;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  identityVerified?: boolean;
  businessVerified?: boolean;
  phoneVerified?: boolean;
  adminApproved?: boolean;
  rating: number;
  reviewCount?: number;
  completedJobs?: number;
  averageResponseMinutes?: number;
  distance: string;
  estimatedArrival: string;
  services: string[];
  startingPrice: number;
  calloutFee?: number;
  operatingHours?: string;
  isOpen: boolean;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  phone?: string;
  createdAt: string;
}

export interface MockBike {
  id: string;
  userId: string;
  brand: string;
  model: string;
  registrationNumber: string;
  year: number;
  fuelType: 'PETROL' | 'ELECTRIC';
  isPrimary: boolean;
  notes?: string;
  tankCapacityLiters?: number;
  mileageKmpl?: number;
  createdAt: string;
}

export interface MockContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  notifyOnSOS: boolean;
  createdAt: string;
}

export interface MockFamilyMember {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  canViewLiveRide: boolean;
  notifyOnSOS: boolean;
  notifyOnSafetyTimer: boolean;
  createdAt: string;
}

export interface MockMedicalProfile {
  userId: string;
  fullName: string;
  bloodGroup: string;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  emergencyNotes?: string;
  organDonor: boolean;
  doctorName?: string;
  doctorContact?: string;
  preferredHospital?: string;
  sharingPreference: 'NEVER' | 'EMERGENCY_ONLY' | 'TRUSTED_CONTACTS';
  shareWithEmergencyResponders: boolean;
  updatedAt: string;
}

export interface MockTimelineItem {
  status: string;
  timestamp: string;
  notes?: string;
}

export interface MockAssistanceRequest {
  requestId: string;
  riderId: string;
  providerId?: string;
  problemCategory: string;
  description?: string;
  location: {
    type: string;
    coordinates: number[];
    address?: string;
    accuracyMeters?: number;
  };
  status: string;
  estimatedPrice?: {
    calloutFee: number;
    travelFee: number;
    serviceFee: number;
    estimatedTotal: number;
    isAvailable: boolean;
    disclaimer: string;
  };
  towingDetails?: {
    towingType: string;
    pickupAddress?: string;
    destinationAddress?: string;
    pickupPhotos?: string[];
    deliveredPhotos?: string[];
  };
  receiptId?: string;
  timeline?: MockTimelineItem[];
  paymentAmount?: number;
  paymentStatus?: 'PENDING' | 'PAID';
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockSOSTimelineEvent {
  event: string;
  timestamp: string;
  detail?: string;
}

export interface MockSOSIncident {
  incidentId: string;
  userId: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CANCELLED';
  notificationStatus: string;
  location?: {
    type: string;
    coordinates: number[];
    accuracyMeters?: number;
  };
  contactsNotified?: boolean;
  timeline: MockSOSTimelineEvent[];
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockRideSession {
  rideId: string;
  userId: string;
  bikeId?: string;
  startLocation: {
    coordinates: [number, number];
    address?: string;
  };
  destination: {
    coordinates: [number, number];
    name: string;
    address?: string;
  };
  currentLocation?: {
    coordinates: [number, number];
    lastUpdated: string;
  };
  status: 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EMERGENCY';
  estimatedDurationMinutes: number;
  expectedArrivalTime?: string;
  sharedWithFamily: boolean;
  sharedFamilyIds: string[];
  safetyTimerEnabled: boolean;
  safetyTimerTarget?: string;
  safetyTimerStatus?: 'PENDING' | 'SAFE_CONFIRMED' | 'ESCALATED' | 'CANCELLED';
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface MockRoadHazard {
  id: string;
  reportedBy: string;
  hazardType: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: {
    type: 'Point';
    coordinates: [number, number];
    landmark?: string;
  };
  status: 'ACTIVE' | 'VERIFIED' | 'RESOLVED' | 'DISMISSED';
  upvotes: number;
  expiresAt: string;
  createdAt: string;
}

export interface MockServiceReceipt {
  receiptId: string;
  requestId: string;
  providerId: string;
  riderId: string;
  calloutFee: number;
  travelFee: number;
  laborFee: number;
  partsFee: number;
  taxes: number;
  total: number;
  parts: Array<{ name: string; quantity: number; unitPrice: number; totalPrice: number }>;
  serviceNotes?: string;
  paymentMethod: string;
  isPaid: boolean;
  issuedAt: string;
}

export interface MockAccidentReport {
  reportId: string;
  userId: string;
  bikeId?: string;
  incidentTime: string;
  location: {
    coordinates: [number, number];
    address?: string;
  };
  riderSafe: boolean;
  injuriesReported: boolean;
  emergencyServicesContacted: boolean;
  photos: string[];
  bikeDamage: string;
  otherVehicles: string;
  witnessInfo: string;
  roadCondition: string;
  insuranceClaimStarted: boolean;
  insurancePolicyNumber?: string;
  towingRequested: boolean;
  notes?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'RESOLVED';
  createdAt: string;
}

export interface MockBikeDocument {
  documentId: string;
  bikeId: string;
  userId: string;
  docType: 'RC' | 'INSURANCE' | 'PUC' | 'DRIVING_LICENSE' | 'WARRANTY' | 'SERVICE_RECORD';
  documentNumber: string;
  issuer?: string;
  expiryDate?: string;
  fileUrl?: string;
  isVerified: boolean;
  notes?: string;
  createdAt: string;
}

export interface MockInventoryPart {
  partId: string;
  providerId: string;
  partName: string;
  brand: string;
  modelCompatibility: string[];
  partNumber?: string;
  category: string;
  price: number;
  inStock: boolean;
  quantity: number;
}

// Pre-seeded users with hashed 'password123'
const defaultPasswordHash = bcrypt.hashSync('password123', 10);

const users: MockUser[] = [
  {
    id: 'user-rider-1',
    name: 'Pulasta Sen',
    email: 'rider@motoassist.in',
    phone: '+91 98765 43210',
    passwordHash: defaultPasswordHash,
    role: 'RIDER',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-helper-1',
    name: 'Suman Gurung',
    email: 'helper@motoassist.in',
    phone: '+91 98320 12345',
    passwordHash: defaultPasswordHash,
    role: 'HELPER',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-admin-1',
    name: 'MotoAssist Ops Admin',
    email: 'admin@motoassist.in',
    phone: '+91 90000 00000',
    passwordHash: defaultPasswordHash,
    role: 'ADMIN',
    createdAt: new Date().toISOString()
  }
];

const providers: MockProvider[] = [
  {
    id: 'provider-1',
    name: 'KTM & Husqvarna Authorized Service Centre',
    businessName: 'KTM & Husqvarna Authorized Service Centre',
    ownerName: 'Tenzing Norbu',
    verified: true,
    verificationStatus: 'VERIFIED',
    identityVerified: true,
    businessVerified: true,
    phoneVerified: true,
    adminApproved: true,
    rating: 4.8,
    reviewCount: 42,
    completedJobs: 138,
    averageResponseMinutes: 14,
    distance: '1.8 km',
    estimatedArrival: '12-18 mins',
    services: ['WP Suspension', 'KTM Diagnostics', 'Adventure 390 Spares', 'Engine Overhaul'],
    startingPrice: 350,
    calloutFee: 150,
    operatingHours: '08:00 AM - 09:00 PM',
    isOpen: true,
    location: { type: 'Point', coordinates: [88.4285, 26.7412] },
    phone: '+91 98320 11223',
    createdAt: new Date().toISOString()
  },
  {
    id: 'provider-2',
    name: 'Royal Enfield Authorized Service - Sevoke Highway',
    businessName: 'Royal Enfield Authorized Service - Sevoke Highway',
    ownerName: 'Sunil Sharma',
    verified: true,
    verificationStatus: 'VERIFIED',
    identityVerified: true,
    businessVerified: true,
    phoneVerified: true,
    adminApproved: true,
    rating: 4.7,
    reviewCount: 56,
    completedJobs: 210,
    averageResponseMinutes: 16,
    distance: '2.5 km',
    estimatedArrival: '15-20 mins',
    services: ['Himalayan 450 Specialists', 'Genuine Spares', 'Roadside Towing', 'Tubeless Repair'],
    startingPrice: 300,
    calloutFee: 150,
    operatingHours: '24/7 Roadside Rescue',
    isOpen: true,
    location: { type: 'Point', coordinates: [88.4310, 26.7350] },
    phone: '+91 98321 44556',
    createdAt: new Date().toISOString()
  },
  {
    id: 'provider-3',
    name: 'Siliguri 2-Wheeler Rescue & Puncture Hub',
    businessName: 'Siliguri 2-Wheeler Rescue & Puncture Hub',
    ownerName: 'Raju Das',
    verified: true,
    verificationStatus: 'VERIFIED',
    identityVerified: true,
    businessVerified: true,
    phoneVerified: true,
    adminApproved: true,
    rating: 4.9,
    reviewCount: 88,
    completedJobs: 340,
    averageResponseMinutes: 10,
    distance: '0.8 km',
    estimatedArrival: '8-12 mins',
    services: ['Tubeless / Tube Puncture', 'Clutch Cable Replace', 'Chain Link Fix', 'Emergency Fuel', 'Flatbed Towing'],
    startingPrice: 200,
    calloutFee: 100,
    operatingHours: '24/7 Highway Support',
    isOpen: true,
    location: { type: 'Point', coordinates: [88.3953, 26.7271] },
    phone: '+91 94340 12345',
    createdAt: new Date().toISOString()
  },
  {
    id: 'provider-4',
    name: 'Teesta River Emergency Mountain Moto Repair',
    businessName: 'Teesta River Emergency Mountain Moto Repair',
    ownerName: 'Karma Lepcha',
    verified: true,
    verificationStatus: 'VERIFIED',
    identityVerified: true,
    businessVerified: true,
    phoneVerified: true,
    adminApproved: true,
    rating: 4.9,
    reviewCount: 31,
    completedJobs: 95,
    averageResponseMinutes: 25,
    distance: '14.2 km',
    estimatedArrival: '25-35 mins',
    services: ['Highway Rescue', 'Landslide Recovery', 'Battery Jump-Start', 'Tyre Tube Replace', 'Mountain Towing'],
    startingPrice: 400,
    calloutFee: 200,
    operatingHours: '24/7 Mountain Emergency',
    isOpen: true,
    location: { type: 'Point', coordinates: [88.4695, 27.0594] },
    phone: '+91 94342 98765',
    createdAt: new Date().toISOString()
  },
  {
    id: 'provider-5',
    name: 'Darjeeling Ridge Mechanic Workshop',
    businessName: 'Darjeeling Ridge Mechanic Workshop',
    ownerName: 'Pemba Sherpa',
    verified: false,
    verificationStatus: 'PENDING',
    identityVerified: true,
    businessVerified: false,
    phoneVerified: true,
    adminApproved: false,
    rating: 4.6,
    reviewCount: 14,
    completedJobs: 42,
    averageResponseMinutes: 35,
    distance: '22.0 km',
    estimatedArrival: '40-50 mins',
    services: ['Mountain Towing', 'Carb Tuning'],
    startingPrice: 300,
    calloutFee: 150,
    operatingHours: '09:00 AM - 07:00 PM',
    isOpen: true,
    location: { type: 'Point', coordinates: [88.2663, 27.0410] },
    phone: '+91 94344 87654',
    createdAt: new Date().toISOString()
  }
];

const bikes: MockBike[] = [
  {
    id: 'bike-1',
    userId: 'user-rider-1',
    brand: 'KTM',
    model: '390 Adventure',
    registrationNumber: 'WB 74 AB 8921',
    year: 2025,
    fuelType: 'PETROL',
    isPrimary: true,
    tankCapacityLiters: 14.5,
    mileageKmpl: 28,
    notes: 'Configured for high-altitude Himalayan rides.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'bike-2',
    userId: 'user-rider-1',
    brand: 'Bajaj',
    model: 'Pulsar N160',
    registrationNumber: 'WB 74 K 1204',
    year: 2024,
    fuelType: 'PETROL',
    isPrimary: false,
    tankCapacityLiters: 14,
    mileageKmpl: 45,
    notes: 'Daily city commuter.',
    createdAt: new Date().toISOString()
  }
];

const contacts: MockContact[] = [
  {
    id: 'contact-1',
    userId: 'user-rider-1',
    name: 'Anjali Sen',
    phone: '+91 98765 00001',
    relationship: 'Spouse',
    isPrimary: true,
    notifyOnSOS: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'contact-2',
    userId: 'user-rider-1',
    name: 'Bikash Sen',
    phone: '+91 98765 00002',
    relationship: 'Brother',
    isPrimary: false,
    notifyOnSOS: true,
    createdAt: new Date().toISOString()
  }
];

const familyCircle: MockFamilyMember[] = [
  {
    id: 'fam-1',
    userId: 'user-rider-1',
    name: 'Anjali Sen',
    relationship: 'PARTNER',
    phone: '+91 98765 00001',
    email: 'anjali@motoassist.test',
    canViewLiveRide: true,
    notifyOnSOS: true,
    notifyOnSafetyTimer: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'fam-2',
    userId: 'user-rider-1',
    name: 'Dr. Debabrata Sen',
    relationship: 'PARENT',
    phone: '+91 98765 99999',
    email: 'dr.sen@health.test',
    canViewLiveRide: true,
    notifyOnSOS: true,
    notifyOnSafetyTimer: true,
    createdAt: new Date().toISOString()
  }
];

const medicalProfiles = new Map<string, MockMedicalProfile>([
  ['user-rider-1', {
    userId: 'user-rider-1',
    fullName: 'Pulasta Sen',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Sulfa drugs'],
    medications: ['None currently'],
    medicalConditions: ['None'],
    emergencyNotes: 'Contact spouse Anjali Sen immediately. Preferred hospital in North Bengal: Neotia Getwel.',
    organDonor: true,
    doctorName: 'Dr. D. Sen',
    doctorContact: '+91 98765 99999',
    preferredHospital: 'Neotia Getwel Healthcare Centre, Siliguri',
    sharingPreference: 'EMERGENCY_ONLY',
    shareWithEmergencyResponders: true,
    updatedAt: new Date().toISOString()
  }]
]);

const assistanceRequests = new Map<string, MockAssistanceRequest>();
const sosIncidents = new Map<string, MockSOSIncident>();
const rideSessions = new Map<string, MockRideSession>();
const serviceReceipts = new Map<string, MockServiceReceipt>();
const accidentReports = new Map<string, MockAccidentReport>();
const bikeDocuments = new Map<string, MockBikeDocument>();

const roadHazards: MockRoadHazard[] = [
  {
    id: 'hz-1',
    reportedBy: 'user-rider-1',
    hazardType: 'LANDSLIDE',
    description: 'Fresh landslide rubble on NH-10 near 29th Mile. Single lane alternating traffic.',
    severity: 'HIGH',
    location: { type: 'Point', coordinates: [88.4720, 27.0620], landmark: '29th Mile Sevoke Corridor' },
    status: 'ACTIVE',
    upvotes: 18,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 'hz-2',
    reportedBy: 'user-helper-1',
    hazardType: 'OIL_SPILL',
    description: 'Diesel spill on hairpin bend after Coronation Bridge. High skid hazard for 2-wheelers.',
    severity: 'CRITICAL',
    location: { type: 'Point', coordinates: [88.4350, 26.8990], landmark: 'Coronation Bridge hairpin bend' },
    status: 'ACTIVE',
    upvotes: 27,
    expiresAt: new Date(Date.now() + 43200000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 'hz-3',
    reportedBy: 'user-rider-1',
    hazardType: 'POTHOLE',
    description: 'Deep unlit pothole trench on Matigara flyover expansion joint.',
    severity: 'MEDIUM',
    location: { type: 'Point', coordinates: [88.3850, 26.7120], landmark: 'Matigara Flyover East' },
    status: 'ACTIVE',
    upvotes: 9,
    expiresAt: new Date(Date.now() + 172800000).toISOString(),
    createdAt: new Date().toISOString()
  }
];

const inventoryParts: MockInventoryPart[] = [
  {
    partId: 'part-1',
    providerId: 'provider-1',
    partName: 'Front Brake Pad Set (Brembo Bybre OEM)',
    brand: 'KTM OEM',
    modelCompatibility: ['KTM 390 Adventure', 'KTM 250 Adventure', 'KTM Duke 390'],
    partNumber: 'JG151021',
    category: 'BRAKES',
    price: 1850,
    inStock: true,
    quantity: 6
  },
  {
    partId: 'part-2',
    providerId: 'provider-1',
    partName: 'DID Sealed O-Ring Drive Chain Link (520)',
    brand: 'DID / KTM',
    modelCompatibility: ['KTM 390 Adventure', 'Bajaj Dominar 400'],
    partNumber: 'KTM-CH-520',
    category: 'CHAIN',
    price: 450,
    inStock: true,
    quantity: 12
  },
  {
    partId: 'part-3',
    providerId: 'provider-2',
    partName: 'Clutch Cable Assembly - Himalayan 450',
    brand: 'Royal Enfield Genuine',
    modelCompatibility: ['Royal Enfield Himalayan 450', 'Guerrilla 450'],
    partNumber: 'KXA00021',
    category: 'BODY',
    price: 680,
    inStock: true,
    quantity: 8
  },
  {
    partId: 'part-4',
    providerId: 'provider-3',
    partName: 'Heavy Duty Tubeless Mushroom Plug Kit + CO2 Cartridge',
    brand: 'GrandPitstop',
    modelCompatibility: ['All Tubeless Motorcycles'],
    category: 'TYRES',
    price: 1200,
    inStock: true,
    quantity: 15
  },
  {
    partId: 'part-5',
    providerId: 'provider-2',
    partName: 'Motul 7100 4T 10W-50 100% Synthetic 1.5L',
    brand: 'Motul',
    modelCompatibility: ['KTM 390', 'RE Himalayan 450', 'BMW G310GS'],
    category: 'FLUIDS',
    price: 1450,
    inStock: true,
    quantity: 20
  }
];

export const mockStore = {
  // Users
  getUsers: () => [...users],
  findUserByEmail: (email: string) => users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()),
  findUserByPhone: (phone: string) => users.find(u => u.phone.trim() === phone.trim()),
  findUserById: (id: string) => users.find(u => u.id === id),
  createUser: (userData: Omit<MockUser, 'id' | 'createdAt'>) => {
    const newUser: MockUser = {
      ...userData,
      id: `user-${crypto.randomBytes(4).toString('hex')}`,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    return newUser;
  },

  // Providers
  getProviders: () => [...providers],
  findProviderById: (id: string) => providers.find(p => p.id === id),
  setProviderAvailability: (id: string, isOpen: boolean) => {
    const p = providers.find(prov => prov.id === id);
    if (p) p.isOpen = isOpen;
    return p || null;
  },
  verifyProvider: (id: string, status: 'VERIFIED' | 'REJECTED' | 'PENDING' | 'SUSPENDED') => {
    const p = providers.find(prov => prov.id === id);
    if (p) {
      p.verificationStatus = status;
      p.verified = status === 'VERIFIED';
      p.adminApproved = status === 'VERIFIED';
    }
    return p || null;
  },

  // Bikes
  getBikes: (userId: string) => bikes.filter(b => b.userId === userId),
  findBikeById: (id: string, userId: string) => bikes.find(b => b.id === id && b.userId === userId),
  createBike: (bikeData: Omit<MockBike, 'id' | 'createdAt'>) => {
    if (bikeData.isPrimary) {
      bikes.filter(b => b.userId === bikeData.userId).forEach(b => { b.isPrimary = false; });
    }
    const newBike: MockBike = {
      ...bikeData,
      id: `bike-${crypto.randomBytes(4).toString('hex')}`,
      createdAt: new Date().toISOString()
    };
    bikes.push(newBike);
    return newBike;
  },
  updateBike: (id: string, userId: string, updateData: Partial<MockBike>) => {
    const bike = bikes.find(b => b.id === id && b.userId === userId);
    if (!bike) return null;
    if (updateData.isPrimary) {
      bikes.filter(b => b.userId === userId).forEach(b => { b.isPrimary = false; });
    }
    Object.assign(bike, updateData);
    return bike;
  },
  deleteBike: (id: string, userId: string) => {
    const idx = bikes.findIndex(b => b.id === id && b.userId === userId);
    if (idx === -1) return false;
    bikes.splice(idx, 1);
    return true;
  },

  // Emergency Contacts
  getContacts: (userId: string) => contacts.filter(c => c.userId === userId),
  findContactById: (id: string, userId: string) => contacts.find(c => c.id === id && c.userId === userId),
  createContact: (contactData: Omit<MockContact, 'id' | 'createdAt'>) => {
    if (contactData.isPrimary) {
      contacts.filter(c => c.userId === contactData.userId).forEach(c => { c.isPrimary = false; });
    }
    const newContact: MockContact = {
      ...contactData,
      id: `contact-${crypto.randomBytes(4).toString('hex')}`,
      createdAt: new Date().toISOString()
    };
    contacts.push(newContact);
    return newContact;
  },
  updateContact: (id: string, userId: string, updateData: Partial<MockContact>) => {
    const contact = contacts.find(c => c.id === id && c.userId === userId);
    if (!contact) return null;
    if (updateData.isPrimary) {
      contacts.filter(c => c.userId === userId).forEach(c => { c.isPrimary = false; });
    }
    Object.assign(contact, updateData);
    return contact;
  },
  deleteContact: (id: string, userId: string) => {
    const idx = contacts.findIndex(c => c.id === id && c.userId === userId);
    if (idx === -1) return false;
    contacts.splice(idx, 1);
    return true;
  },

  // Family Safety Circle
  getFamilyCircle: (userId: string) => familyCircle.filter(f => f.userId === userId),
  addFamilyMember: (memberData: Omit<MockFamilyMember, 'id' | 'createdAt'>) => {
    const newMember: MockFamilyMember = {
      ...memberData,
      id: `fam-${crypto.randomBytes(4).toString('hex')}`,
      createdAt: new Date().toISOString()
    };
    familyCircle.push(newMember);
    return newMember;
  },
  removeFamilyMember: (id: string, userId: string) => {
    const idx = familyCircle.findIndex(f => f.id === id && f.userId === userId);
    if (idx === -1) return false;
    familyCircle.splice(idx, 1);
    return true;
  },

  // Medical ID
  getMedicalProfile: (userId: string) => medicalProfiles.get(userId) || null,
  saveMedicalProfile: (profile: MockMedicalProfile) => {
    profile.updatedAt = new Date().toISOString();
    medicalProfiles.set(profile.userId, profile);
    return profile;
  },

  // Assistance Requests
  getAllRequests: () => Array.from(assistanceRequests.values()),
  createAssistanceRequest: (req: Omit<MockAssistanceRequest, 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newReq: MockAssistanceRequest = {
      ...req,
      timeline: [
        { status: 'REQUESTED', timestamp: now, notes: 'Incident request submitted by rider' }
      ],
      createdAt: now,
      updatedAt: now
    };
    assistanceRequests.set(newReq.requestId, newReq);
    return newReq;
  },
  getRequestById: (id: string) => assistanceRequests.get(id) || null,
  updateRequestStatus: (id: string, status: string, providerId?: string, notes?: string) => {
    const req = assistanceRequests.get(id);
    if (!req) return null;
    req.status = status;
    if (providerId) req.providerId = providerId;
    const now = new Date().toISOString();
    req.updatedAt = now;
    if (!req.timeline) req.timeline = [];
    req.timeline.push({ status, timestamp: now, notes: notes || `Status advanced to ${status}` });
    return req;
  },
  rateRequest: (id: string, rating: number, review?: string) => {
    const req = assistanceRequests.get(id);
    if (!req) return null;
    req.rating = rating;
    req.review = review;
    req.updatedAt = new Date().toISOString();
    return req;
  },

  // SOS Incidents
  createSOS: (incident: Omit<MockSOSIncident, 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newIncident: MockSOSIncident = {
      ...incident,
      timeline: [
        { event: 'SOS CREATED', timestamp: now, detail: '3-second trigger activated by rider' },
        { event: 'GPS ACQUIRED', timestamp: now, detail: incident.location ? `Coordinates logged (accuracy: ${incident.location.accuracyMeters || 12}m)` : 'GPS location pending' },
        { event: 'SERVER RECEIVED', timestamp: now, detail: 'MotoAssist emergency dispatch server logged incident' },
        { event: 'CONTACT NOTIFICATION SENT', timestamp: now, detail: 'Auto-SMS/WhatsApp sent to emergency contacts' }
      ],
      createdAt: now,
      updatedAt: now
    };
    sosIncidents.set(newIncident.incidentId, newIncident);
    return newIncident;
  },
  getActiveSOS: (userId?: string) => {
    for (const inc of sosIncidents.values()) {
      if ((inc.status === 'ACTIVE' || inc.status === 'ACKNOWLEDGED') && (!userId || inc.userId === userId)) {
        return inc;
      }
    }
    return null;
  },
  cancelSOS: (incidentId: string) => {
    const inc = sosIncidents.get(incidentId);
    if (!inc) return null;
    inc.status = 'CANCELLED';
    inc.updatedAt = new Date().toISOString();
    inc.timeline.push({ event: 'CANCELLED', timestamp: inc.updatedAt, detail: 'Cancelled by rider' });
    return inc;
  },
  resolveSOS: (incidentId: string, notes?: string) => {
    const inc = sosIncidents.get(incidentId);
    if (!inc) return null;
    inc.status = 'RESOLVED';
    inc.resolvedAt = new Date().toISOString();
    inc.updatedAt = inc.resolvedAt;
    inc.timeline.push({ event: 'RESOLVED', timestamp: inc.resolvedAt, detail: notes || 'Incident safely resolved' });
    return inc;
  },

  // Safe Rides & Safety Timers
  createRideSession: (ride: Omit<MockRideSession, 'createdAt'>) => {
    const newRide: MockRideSession = {
      ...ride,
      createdAt: new Date().toISOString()
    };
    rideSessions.set(newRide.rideId, newRide);
    return newRide;
  },
  getRideSession: (rideId: string) => rideSessions.get(rideId) || null,
  getUserActiveRide: (userId: string) => {
    for (const r of rideSessions.values()) {
      if (r.userId === userId && r.status === 'ACTIVE') return r;
    }
    return null;
  },
  updateRideLocation: (rideId: string, coordinates: [number, number]) => {
    const r = rideSessions.get(rideId);
    if (!r) return null;
    r.currentLocation = {
      coordinates,
      lastUpdated: new Date().toISOString()
    };
    return r;
  },
  endRideSession: (rideId: string) => {
    const r = rideSessions.get(rideId);
    if (!r) return null;
    r.status = 'COMPLETED';
    r.completedAt = new Date().toISOString();
    return r;
  },

  // Road Hazards
  getHazards: () => [...roadHazards],
  createHazard: (hazardData: Omit<MockRoadHazard, 'id' | 'upvotes' | 'createdAt'>) => {
    const newHz: MockRoadHazard = {
      ...hazardData,
      id: `hz-${crypto.randomBytes(4).toString('hex')}`,
      upvotes: 1,
      createdAt: new Date().toISOString()
    };
    roadHazards.unshift(newHz);
    return newHz;
  },
  upvoteHazard: (id: string) => {
    const hz = roadHazards.find(h => h.id === id);
    if (hz) hz.upvotes += 1;
    return hz || null;
  },
  resolveHazard: (id: string) => {
    const hz = roadHazards.find(h => h.id === id);
    if (hz) hz.status = 'RESOLVED';
    return hz || null;
  },

  // Service Receipts
  createReceipt: (receipt: MockServiceReceipt) => {
    serviceReceipts.set(receipt.receiptId, receipt);
    return receipt;
  },
  getReceiptByRequestId: (requestId: string) => {
    for (const rec of serviceReceipts.values()) {
      if (rec.requestId === requestId) return rec;
    }
    return null;
  },

  // Accident Reports
  createAccidentReport: (report: MockAccidentReport) => {
    accidentReports.set(report.reportId, report);
    return report;
  },
  getAccidentReports: (userId: string) => {
    return Array.from(accidentReports.values()).filter(r => r.userId === userId);
  },

  // Bike Documents Wallet
  getBikeDocuments: (bikeId: string, userId: string) => {
    return Array.from(bikeDocuments.values()).filter(d => d.bikeId === bikeId && d.userId === userId);
  },
  addBikeDocument: (doc: MockBikeDocument) => {
    bikeDocuments.set(doc.documentId, doc);
    return doc;
  },
  deleteBikeDocument: (documentId: string, userId: string) => {
    const doc = bikeDocuments.get(documentId);
    if (doc && doc.userId === userId) {
      bikeDocuments.delete(documentId);
      return true;
    }
    return false;
  },

  // Spare Parts
  getInventory: (query?: string, model?: string) => {
    return inventoryParts.filter(part => {
      if (query && !part.partName.toLowerCase().includes(query.toLowerCase()) && !part.brand.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      if (model && !part.modelCompatibility.some(m => m.toLowerCase().includes(model.toLowerCase()))) {
        return false;
      }
      return true;
    });
  },

  // Platform Metrics
  getMetrics: () => {
    const allReqs = Array.from(assistanceRequests.values());
    const openReqs = allReqs.filter(r => ['REQUESTED', 'ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(r.status));
    const pendingHelpers = providers.filter(p => p.verificationStatus === 'PENDING');
    return {
      totalUsers: users.length,
      totalBikes: bikes.length,
      totalProviders: providers.length,
      pendingVerifications: pendingHelpers.length,
      activeRequests: openReqs.length,
      totalRequests: allReqs.length,
      activeHazards: roadHazards.filter(h => h.status === 'ACTIVE').length
    };
  }
};
