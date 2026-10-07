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
    rating: 4.8,
    distance: '1.8 km',
    estimatedArrival: '12-18 mins',
    services: ['WP Suspension', 'KTM Diagnostics', 'Adventure 390 Spares', 'Engine Overhaul'],
    startingPrice: 350,
    isOpen: true,
    location: { type: 'Point', coordinates: [88.4285, 26.7412] }
  },
  {
    id: 'provider-2',
    name: 'Royal Enfield Authorized Service - Sevoke Highway',
    businessName: 'Royal Enfield Authorized Service - Sevoke Highway',
    verified: true,
    rating: 4.7,
    distance: '2.5 km',
    estimatedArrival: '15-20 mins',
    services: ['Himalayan 450 Specialists', 'Genuine Spares', 'Roadside Towing', 'Tubeless Repair'],
    startingPrice: 300,
    isOpen: true,
    location: { type: 'Point', coordinates: [88.4310, 26.7350] }
  },
  {
    id: 'provider-3',
    name: 'Siliguri 2-Wheeler Rescue & Puncture Hub',
    businessName: 'Siliguri 2-Wheeler Rescue & Puncture Hub',
    verified: true,
    rating: 4.9,
    distance: '0.8 km',
    estimatedArrival: '8-12 mins',
    services: ['Tubeless / Tube Puncture', 'Clutch Cable Replace', 'Chain Link Fix', 'Emergency Fuel'],
    startingPrice: 200,
    isOpen: true,
    location: { type: 'Point', coordinates: [88.3953, 26.7271] }
  },
  {
    id: 'provider-4',
    name: 'Teesta River Emergency Mountain Moto Repair',
    businessName: 'Teesta River Emergency Mountain Moto Repair',
    verified: true,
    rating: 4.9,
    distance: '14.2 km',
    estimatedArrival: '25-35 mins',
    services: ['Highway Rescue', 'Landslide Recovery', 'Battery Jump-Start', 'Tyre Tube Replace'],
    startingPrice: 400,
    isOpen: true,
    location: { type: 'Point', coordinates: [88.4695, 27.0594] }
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

  // Assistance Requests
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
  updateRequestStatus: (id: string, status: string) => {
    const req = assistanceRequests.get(id);
    if (!req) return null;
    req.status = status;
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
  }
};
