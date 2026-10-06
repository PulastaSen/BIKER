import type {
  User,
  Bike,
  HelpRequest,
  HelperProfile,
  EmergencyContact,
  SafetyReport,
  VerificationStatus,
} from '../types/app';

// Standard System Accounts
export const DEFAULT_USERS: User[] = [
  {
    id: 'user-rider-1',
    name: 'Pulasta Sen',
    email: 'rider@motoassist.in',
    phone: '+91 98765 43210',
    role: 'RIDER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-01-10T10:00:00.000Z',
  },
  {
    id: 'user-helper-1',
    name: 'Suman Gurung',
    email: 'helper@motoassist.in',
    phone: '+91 98320 12345',
    role: 'HELPER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-01-05T09:00:00.000Z',
    helperProfileId: 'helper-prof-1',
  },
  {
    id: 'user-admin-1',
    name: 'MotoAssist Ops Admin',
    email: 'admin@motoassist.in',
    phone: '+91 90000 00000',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-01-01T08:00:00.000Z',
  },
];

// Backwards compatibility alias
export const DEMO_USERS: User[] = DEFAULT_USERS;

// Verified Registered Bikes
export const INITIAL_BIKES: Bike[] = [
  {
    id: 'bike-1',
    userId: 'user-rider-1',
    brand: 'KTM',
    model: '390 Adventure',
    registrationNumber: 'WB 74 AB 8921',
    year: 2025,
    fuelType: 'PETROL',
    isPrimary: true,
    notes: 'Adventure touring motorcycle configured for Himalayan rides.',
  },
  {
    id: 'bike-2',
    userId: 'user-rider-1',
    brand: 'Bajaj',
    model: 'Pulsar N160',
    registrationNumber: 'WB 74 K 4509',
    year: 2024,
    fuelType: 'PETROL',
    isPrimary: false,
    notes: 'City commute bike.',
  },
];

// Verified Corridor Helper Profiles
export const INITIAL_HELPERS: HelperProfile[] = [
  {
    id: 'helper-prof-1',
    userId: 'user-helper-1',
    name: 'Suman Gurung (Siliguri Auto Care)',
    phone: '+91 98320 12345',
    email: 'helper@motoassist.in',
    serviceType: 'WORKSHOP',
    businessName: 'Siliguri Auto Care & Rescue',
    serviceAreas: ['Siliguri', 'Sevoke', 'Kalimpong'],
    skills: ['Puncture repair', 'Battery jump-start', 'Chain repair', 'Towing', 'Basic engine troubleshooting'],
    isAvailable: true,
    verificationStatus: 'VERIFIED',
    rating: 4.9,
    completedAssists: 38,
    createdAt: '2025-01-05T09:00:00.000Z',
  },
  {
    id: 'helper-prof-2',
    userId: 'user-helper-2',
    name: 'Tashi Sherpa (Himalayan Towing)',
    phone: '+91 97330 99887',
    email: 'tashi@himalayantowing.in',
    serviceType: 'TOWING',
    businessName: 'Himalayan Breakdown Towing Services',
    serviceAreas: ['Gangtok', 'Rangpo', 'Teesta Bazaar'],
    skills: ['Towing', 'Accident recovery'],
    isAvailable: true,
    verificationStatus: 'VERIFIED',
    rating: 4.8,
    completedAssists: 24,
    createdAt: '2025-01-15T11:00:00.000Z',
  },
  {
    id: 'helper-prof-3',
    userId: 'user-helper-3',
    name: 'Biren Pradhan',
    phone: '+91 96410 44332',
    email: 'biren.rider@himalayanroutes.in',
    serviceType: 'RIDER_VOLUNTEER',
    businessName: 'Rider Helper Volunteer',
    serviceAreas: ['Darjeeling', 'Ghum'],
    skills: ['Fuel delivery', 'Puncture repair', 'Clutch wire replacement'],
    isAvailable: false,
    verificationStatus: 'VERIFIED',
    rating: 4.5,
    completedAssists: 5,
    createdAt: '2025-02-01T14:00:00.000Z',
  },
];

// Active & Historical Roadside Help Requests
export const INITIAL_REQUESTS: HelpRequest[] = [
  {
    id: 'RH-1092',
    riderId: 'user-rider-1',
    riderName: 'Pulasta Sen',
    riderPhone: '+91 98765 43210',
    bike: INITIAL_BIKES[0],
    issue: 'PUNCTURE',
    description: 'Rear tyre puncture on Sevoke Road near Coronation Bridge. Need puncture patch support.',
    approximateLocation: 'Sevoke Road near Coronation Bridge',
    locationShared: true,
    latitude: 26.8924,
    longitude: 88.4735,
    isBikeMovable: true,
    towingRequired: false,
    riderSafe: true,
    status: 'HELPER_OFFERED',
    offeredHelperIds: ['helper-prof-1'],
    assignedHelperId: 'helper-prof-1',
    assignedHelperName: 'Siliguri Auto Care & Rescue (Suman Gurung)',
    assignedHelperPhone: '+91 98320 12345',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'RH-1088',
    riderId: 'user-rider-1',
    riderName: 'Pulasta Sen',
    riderPhone: '+91 98765 43210',
    bike: INITIAL_BIKES[1],
    issue: 'BATTERY_ELECTRICAL',
    description: 'Battery drained while stopped near Teesta Bazaar. Horn and self-starter unresponsive.',
    approximateLocation: 'Teesta Bazaar Viewpoint',
    locationShared: false,
    status: 'RESOLVED',
    assignedHelperId: 'helper-prof-1',
    assignedHelperName: 'Siliguri Auto Care & Rescue',
    createdAt: '2025-02-20T12:30:00.000Z',
  },
];

// Pre-seeded Emergency Contacts
export const INITIAL_CONTACTS: EmergencyContact[] = [
  {
    id: 'contact-1',
    userId: 'user-rider-1',
    name: 'Anish Sen',
    relationship: 'Brother',
    phone: '+91 98300 11223',
  },
  {
    id: 'contact-2',
    userId: 'user-rider-1',
    name: 'Riddhi Mitra',
    relationship: 'Riding Buddy',
    phone: '+91 98311 44556',
  },
];

// Storage Keys
const KEYS = {
  USERS: 'motoassist_users_v3',
  CURRENT_USER: 'motoassist_current_user_v3',
  BIKES: 'motoassist_bikes_v3',
  HELPERS: 'motoassist_helpers_v3',
  REQUESTS: 'motoassist_requests_v3',
  CONTACTS: 'motoassist_contacts_v3',
  REPORTS: 'motoassist_reports_v3',
};

// Helper functions
function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

// Initializer
export function initAppStorage(): void {
  if (!localStorage.getItem(KEYS.USERS)) {
    setItem(KEYS.USERS, DEMO_USERS);
  }
  if (!localStorage.getItem(KEYS.BIKES)) {
    setItem(KEYS.BIKES, INITIAL_BIKES);
  }
  if (!localStorage.getItem(KEYS.HELPERS)) {
    setItem(KEYS.HELPERS, INITIAL_HELPERS);
  }
  if (!localStorage.getItem(KEYS.REQUESTS)) {
    setItem(KEYS.REQUESTS, INITIAL_REQUESTS);
  }
  if (!localStorage.getItem(KEYS.CONTACTS)) {
    setItem(KEYS.CONTACTS, INITIAL_CONTACTS);
  }
  if (!localStorage.getItem(KEYS.CURRENT_USER)) {
    setItem(KEYS.CURRENT_USER, DEMO_USERS[0]); // Default to Rider
  }
}

// Auth Storage
export function getUsers(): User[] {
  initAppStorage();
  return getItem<User[]>(KEYS.USERS, DEMO_USERS);
}

export function getCurrentUser(): User | null {
  initAppStorage();
  return getItem<User | null>(KEYS.CURRENT_USER, DEMO_USERS[0]);
}

export function setCurrentUser(user: User | null): void {
  setItem(KEYS.CURRENT_USER, user);
}

export function addUser(user: User): void {
  const users = getUsers();
  const updated = [user, ...users.filter((u) => u.id !== user.id)];
  setItem(KEYS.USERS, updated);
}

// Bike Storage
export function getBikes(userId?: string): Bike[] {
  initAppStorage();
  const all = getItem<Bike[]>(KEYS.BIKES, INITIAL_BIKES);
  return userId ? all.filter((b) => b.userId === userId) : all;
}

export function saveBike(bike: Bike): void {
  const bikes = getBikes();
  const existsIndex = bikes.findIndex((b) => b.id === bike.id);
  let updated: Bike[];
  if (existsIndex >= 0) {
    updated = [...bikes];
    updated[existsIndex] = bike;
  } else {
    updated = [bike, ...bikes];
  }
  if (bike.isPrimary) {
    updated = updated.map((b) => (b.userId === bike.userId && b.id !== bike.id ? { ...b, isPrimary: false } : b));
  }
  setItem(KEYS.BIKES, updated);
}

export function deleteBike(bikeId: string): void {
  const bikes = getBikes();
  setItem(
    KEYS.BIKES,
    bikes.filter((b) => b.id !== bikeId)
  );
}

// Request Storage
export function getRequests(): HelpRequest[] {
  initAppStorage();
  return getItem<HelpRequest[]>(KEYS.REQUESTS, INITIAL_REQUESTS);
}

export function getRequestById(id: string): HelpRequest | undefined {
  return getRequests().find((r) => r.id === id);
}

export function saveRequest(request: HelpRequest): void {
  const requests = getRequests();
  const idx = requests.findIndex((r) => r.id === request.id);
  let updated: HelpRequest[];
  if (idx >= 0) {
    updated = [...requests];
    updated[idx] = { ...request, updatedAt: new Date().toISOString() };
  } else {
    updated = [request, ...requests];
  }
  setItem(KEYS.REQUESTS, updated);
}

export function offerAssistance(requestId: string, helper: HelperProfile): HelpRequest | undefined {
  const request = getRequestById(requestId);
  if (!request) return undefined;
  const offeredIds = request.offeredHelperIds || [];
  if (!offeredIds.includes(helper.id)) {
    offeredIds.push(helper.id);
  }
  const updated: HelpRequest = {
    ...request,
    status: request.status === 'OPEN' ? 'HELPER_OFFERED' : request.status,
    offeredHelperIds: offeredIds,
    assignedHelperId: helper.id,
    assignedHelperName: `${helper.businessName || helper.name}`,
    assignedHelperPhone: helper.phone,
    updatedAt: new Date().toISOString(),
  };
  saveRequest(updated);
  return updated;
}

export const addBike = saveBike;

export function updateRequestStatus(
  requestId: string,
  status: HelpRequest['status'],
  details?: Partial<HelpRequest>
): HelpRequest | undefined {
  const request = getRequestById(requestId);
  if (!request) return undefined;
  const updated: HelpRequest = {
    ...request,
    ...details,
    status,
    updatedAt: new Date().toISOString(),
  };
  saveRequest(updated);
  return updated;
}

// Helper Profile Storage
export function getHelperProfiles(): HelperProfile[] {
  initAppStorage();
  return getItem<HelperProfile[]>(KEYS.HELPERS, INITIAL_HELPERS);
}

export function getHelperProfileByUserId(userId: string): HelperProfile | undefined {
  return getHelperProfiles().find((h) => h.userId === userId);
}

export function getHelperProfileById(id: string): HelperProfile | undefined {
  return getHelperProfiles().find((h) => h.id === id);
}

export function saveHelperProfile(profile: HelperProfile): void {
  const helpers = getHelperProfiles();
  const idx = helpers.findIndex((h) => h.id === profile.id);
  let updated: HelperProfile[];
  if (idx >= 0) {
    updated = [...helpers];
    updated[idx] = profile;
  } else {
    updated = [profile, ...helpers];
  }
  setItem(KEYS.HELPERS, updated);
}

export function setHelperVerification(helperId: string, status: VerificationStatus): void {
  const helpers = getHelperProfiles();
  const updated = helpers.map((h) => (h.id === helperId ? { ...h, verificationStatus: status } : h));
  setItem(KEYS.HELPERS, updated);
}

export function toggleHelperAvailability(helperId: string): HelperProfile | undefined {
  const helpers = getHelperProfiles();
  const helper = helpers.find((h) => h.id === helperId);
  if (!helper) return undefined;
  const updated: HelperProfile = { ...helper, isAvailable: !helper.isAvailable };
  saveHelperProfile(updated);
  return updated;
}

// Emergency Contacts
export function getEmergencyContacts(userId: string): EmergencyContact[] {
  initAppStorage();
  const all = getItem<EmergencyContact[]>(KEYS.CONTACTS, INITIAL_CONTACTS);
  return all.filter((c) => c.userId === userId);
}

export function saveEmergencyContact(contact: EmergencyContact): void {
  const all = getItem<EmergencyContact[]>(KEYS.CONTACTS, INITIAL_CONTACTS);
  const idx = all.findIndex((c) => c.id === contact.id);
  let updated: EmergencyContact[];
  if (idx >= 0) {
    updated = [...all];
    updated[idx] = contact;
  } else {
    updated = [contact, ...all];
  }
  setItem(KEYS.CONTACTS, updated);
}

export function deleteEmergencyContact(id: string): void {
  const all = getItem<EmergencyContact[]>(KEYS.CONTACTS, INITIAL_CONTACTS);
  setItem(
    KEYS.CONTACTS,
    all.filter((c) => c.id !== id)
  );
}

// Safety Reports
export function getSafetyReports(): SafetyReport[] {
  initAppStorage();
  return getItem<SafetyReport[]>(KEYS.REPORTS, []);
}

export function saveSafetyReport(report: SafetyReport): void {
  const reports = getSafetyReports();
  setItem(KEYS.REPORTS, [report, ...reports]);
}
