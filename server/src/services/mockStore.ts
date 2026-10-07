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
  verified: boolean;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  rating: number;
  distance: string;
  estimatedArrival: string;
  services: string[];
  startingPrice: number;
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
  };
  status: string;
  paymentAmount?: number;
  paymentStatus?: 'PENDING' | 'PAID';
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockSOSIncident {
  incidentId: string;
  userId: string;
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  notificationStatus: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  createdAt: string;
  updatedAt: string;
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
    verified: true,
    verificationStatus: 'VERIFIED',
    rating: 4.8,
    distance: '1.8 km',
    estimatedArrival: '12-18 mins',
    services: ['WP Suspension', 'KTM Diagnostics', 'Adventure 390 Spares', 'Engine Overhaul'],
    startingPrice: 350,
    isOpen: true,
    location: { type: 'Point', coordinates: [88.4285, 26.7412] },
    phone: '+91 98320 11223',
    createdAt: new Date().toISOString()
  },
  {
    id: 'provider-2',
    name: 'Royal Enfield Authorized Service - Sevoke Highway',
    businessName: 'Royal Enfield Authorized Service - Sevoke Highway',
    verified: true,
    verificationStatus: 'VERIFIED',
    rating: 4.7,
    distance: '2.5 km',
    estimatedArrival: '15-20 mins',
    services: ['Himalayan 450 Specialists', 'Genuine Spares', 'Roadside Towing', 'Tubeless Repair'],
    startingPrice: 300,
    isOpen: true,
    location: { type: 'Point', coordinates: [88.4310, 26.7350] },
    phone: '+91 98321 44556',
    createdAt: new Date().toISOString()
  },
  {
    id: 'provider-3',
    name: 'Siliguri 2-Wheeler Rescue & Puncture Hub',
    businessName: 'Siliguri 2-Wheeler Rescue & Puncture Hub',
    verified: true,
    verificationStatus: 'VERIFIED',
    rating: 4.9,
    distance: '0.8 km',
    estimatedArrival: '8-12 mins',
    services: ['Tubeless / Tube Puncture', 'Clutch Cable Replace', 'Chain Link Fix', 'Emergency Fuel'],
    startingPrice: 200,
    isOpen: true,
    location: { type: 'Point', coordinates: [88.3953, 26.7271] },
    phone: '+91 94340 12345',
    createdAt: new Date().toISOString()
  },
  {
    id: 'provider-4',
    name: 'Teesta River Emergency Mountain Moto Repair',
    businessName: 'Teesta River Emergency Mountain Moto Repair',
    verified: true,
    verificationStatus: 'VERIFIED',
    rating: 4.9,
    distance: '14.2 km',
    estimatedArrival: '25-35 mins',
    services: ['Highway Rescue', 'Landslide Recovery', 'Battery Jump-Start', 'Tyre Tube Replace'],
    startingPrice: 400,
    isOpen: true,
    location: { type: 'Point', coordinates: [88.4695, 27.0594] },
    phone: '+91 94342 98765',
    createdAt: new Date().toISOString()
  },
  {
    id: 'provider-5',
    name: 'Darjeeling Ridge Mechanic Workshop',
    businessName: 'Darjeeling Ridge Mechanic Workshop',
    verified: false,
    verificationStatus: 'PENDING',
    rating: 4.6,
    distance: '22.0 km',
    estimatedArrival: '40-50 mins',
    services: ['Mountain Towing', 'Carb Tuning'],
    startingPrice: 300,
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

const assistanceRequests = new Map<string, MockAssistanceRequest>();
const sosIncidents = new Map<string, MockSOSIncident>();

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
  verifyProvider: (id: string, status: 'VERIFIED' | 'REJECTED' | 'PENDING') => {
    const p = providers.find(prov => prov.id === id);
    if (p) {
      p.verificationStatus = status;
      p.verified = status === 'VERIFIED';
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

  // Assistance Requests
  getAllRequests: () => Array.from(assistanceRequests.values()),
  createAssistanceRequest: (req: Omit<MockAssistanceRequest, 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newReq: MockAssistanceRequest = {
      ...req,
      createdAt: now,
      updatedAt: now
    };
    assistanceRequests.set(newReq.requestId, newReq);
    return newReq;
  },
  getRequestById: (id: string) => assistanceRequests.get(id) || null,
  updateRequestStatus: (id: string, status: string, providerId?: string) => {
    const req = assistanceRequests.get(id);
    if (!req) return null;
    req.status = status;
    if (providerId) req.providerId = providerId;
    req.updatedAt = new Date().toISOString();
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
      createdAt: now,
      updatedAt: now
    };
    sosIncidents.set(newIncident.incidentId, newIncident);
    return newIncident;
  },
  getActiveSOS: (userId?: string) => {
    for (const inc of sosIncidents.values()) {
      if (inc.status === 'ACTIVE' && (!userId || inc.userId === userId)) {
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
    return inc;
  },

  // Platform Metrics
  getMetrics: () => {
    const allReqs = Array.from(assistanceRequests.values());
    const openReqs = allReqs.filter(r => ['REQUESTED', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS'].includes(r.status));
    const pendingHelpers = providers.filter(p => p.verificationStatus === 'PENDING');
    return {
      totalUsers: users.length,
      totalBikes: bikes.length,
      totalProviders: providers.length,
      pendingVerifications: pendingHelpers.length,
      activeRequests: openReqs.length,
      totalRequests: allReqs.length
    };
  }
};
