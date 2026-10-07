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
    id: 'bike-re-450',
    userId: 'user-rider-1',
    brand: 'Royal Enfield',
    model: 'Himalayan 450',
    registrationNumber: 'WB 74 H 4500',
    year: 2024,
    fuelType: 'PETROL',
    isPrimary: true,
    category: 'Adventure Tourer / Dual-Sport',
    engine: '452cc Liquid-Cooled Single-Cylinder DOHC 4-Valve (Sherpa 450)',
    power: '40.02 PS @ 8,000 RPM',
    torque: '40 Nm @ 5,500 RPM',
    weight: '196 kg Kerb Weight',
    tankCapacity: '17 Litres (420+ km Range)',
    seatHeight: '825 mm - 845 mm (Adjustable)',
    groundClearance: '230 mm (High Clearance)',
    brakes: '320mm Front & 270mm Rear Disc with Switchable Dual-Channel ABS',
    features: [
      'Ride-by-Wire with 4 Ride Modes',
      '4" Round TFT with full Google Maps',
      'Showa 43mm USD Forks (200mm Travel)',
      '21" Front & 17" Rear Spoke Tubeless Rims',
      'Slip & Assist 6-Speed Clutch',
      'Integrated Tail-Lamp Blinkers',
    ],
    notes: 'Sherpa 450 liquid-cooled expedition adventure tourer equipped with cross-spoke tubeless rims.',
  },
  {
    id: 'bike-transalp',
    userId: 'user-rider-1',
    brand: 'Honda',
    model: 'XL750 Transalp',
    registrationNumber: 'WB 74 TR 0750',
    year: 2024,
    fuelType: 'PETROL',
    isPrimary: false,
    category: 'Middleweight Adventure Tourer / All-Rounder',
    engine: '755cc 270° Unicam Parallel-Twin 8-Valve Liquid-Cooled',
    power: '91.8 HP @ 9,500 RPM',
    torque: '75 Nm @ 7,250 RPM',
    weight: '208 kg Kerb Weight',
    tankCapacity: '16.9 Litres (Highway Tourer)',
    seatHeight: '850 mm Seat Height',
    groundClearance: '210 mm Clearance',
    brakes: 'Dual 310mm Wave Front Discs with Axial Calipers, 256mm Rear',
    features: [
      '5 Riding Modes (Sport, Standard, Rain, Gravel, User)',
      'Honda Selectable Torque Control (HSTC) & Wheelie Control',
      '5" Full-Colour TFT Display with HSVC Voice Control',
      'Showa 43mm SFF-CA Cartridge Forks (200mm Travel)',
      'Pro-Link Rear Shock (190mm Travel)',
      'Emergency Stop Signal (ESS) Auto-Hazards',
    ],
    notes: 'High-revving parallel-twin middleweight ADV tuned for trans-Himalayan long-distance tours.',
  },
  {
    id: 'bike-tiger-900',
    userId: 'user-rider-1',
    brand: 'Triumph',
    model: 'Tiger 900 Rally Pro',
    registrationNumber: 'WB 74 TG 0900',
    year: 2024,
    fuelType: 'PETROL',
    isPrimary: false,
    category: 'Flagship Off-Road Adventure Tourer',
    engine: '888cc Liquid-Cooled 12V DOHC In-line 3-Cyl (T-Plane Triple)',
    power: '108 PS (106.5 bhp) @ 9,500 RPM',
    torque: '90 Nm @ 6,850 RPM',
    weight: '228 kg Kerb Weight',
    tankCapacity: '20 Litres Long-Range Tank',
    seatHeight: '860 mm - 880 mm (Adjustable)',
    groundClearance: '240 mm (Rally Spec)',
    brakes: 'Dual 320mm Discs with Brembo Stylema Monobloc Calipers',
    features: [
      '6 Ride Modes including Off-Road Pro',
      'Triumph Shift Assist (Bi-Directional Quickshifter)',
      'Showa 45mm Manual Fully-Adjustable Forks (240mm Travel)',
      'Showa Rear Monoshock with Preload & Rebound (230mm Travel)',
      '7" Full-Colour TFT Display with My Triumph Connectivity',
      'Optimised Cornering ABS & Traction Control with IMU',
      'Heated Rider & Pillion Seats + Heated Grips',
      'TPMS (Tyre Pressure Monitoring System)',
    ],
    notes: 'Flagship triple-cylinder off-road rally tourer with Showa long-travel suspension and Brembo Stylema brakes.',
  },
  {
    id: 'bike-1',
    userId: 'user-rider-1',
    brand: 'KTM',
    model: '390 Adventure',
    registrationNumber: 'WB 74 AB 8921',
    year: 2025,
    fuelType: 'PETROL',
    isPrimary: false,
    category: 'Sub-500cc Compact Dual-Sport ADV',
    engine: '373.2cc Single-Cylinder Liquid-Cooled 4-Valve DOHC',
    power: '43.5 PS @ 9,000 RPM',
    torque: '37 Nm @ 7,000 RPM',
    weight: '177 kg Kerb Weight',
    tankCapacity: '14.5 Litres Tank',
    seatHeight: '855 mm Seat Height',
    groundClearance: '200 mm Clearance',
    brakes: '320mm Front ByBre Caliper with Cornering & Offroad ABS',
    features: [
      'WP APEX 43mm USD Suspension (170mm Travel)',
      'Cornering MTC (Motorcycle Traction Control)',
      'Quickshifter+ (Bi-Directional Clutchless Shifting)',
      '5" Colour TFT Screen with Turn-by-Turn Navigation',
      'Ultra-Lightweight Tubular Steel Trellis Frame',
      'PASC Slipper & Assist Clutch',
    ],
    notes: 'Lightweight high-agility adventure machine configured for rapid mountain twisties.',
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
    category: 'Naked Streetfighter / City Commuter',
    engine: '164.82cc Oil-Cooled Single-Cylinder Twin-Spark DTS-i FI',
    power: '16 PS @ 8,750 RPM',
    torque: '14.65 Nm @ 6,750 RPM',
    weight: '154 kg Kerb Weight',
    tankCapacity: '14 Litres Tank',
    seatHeight: '795 mm Seat Height',
    groundClearance: '165 mm Clearance',
    brakes: '300mm Front Disc & 230mm Rear Disc with Dual-Channel ABS',
    features: [
      'Dual-Channel ABS with 3 Riding ABS Modes (Road, Rain, Off-Road)',
      'Bi-Functional LED Projector Headlamp with LED DRLs',
      'Infinity Digital Display with Gear Position & Clock',
      'USB Mobile Charging Port Near Tank Flap',
      'Underbelly Exhaust with Center of Gravity Balance',
    ],
    notes: 'Agile daily city commuter with oil-cooling and dual-channel ABS safety.',
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
  BIKES: 'motoassist_bikes_v5',
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
    const prevBikes = getItem<Bike[]>('motoassist_bikes_v4', getItem<Bike[]>('motoassist_bikes_v3', []));
    if (prevBikes.length > 0) {
      // Merge: retain all canonical bikes with newest specs and keep user-created custom bikes
      const canonicalIds = new Set(INITIAL_BIKES.map((b) => b.id));
      const customBikes = prevBikes.filter((b) => !canonicalIds.has(b.id));
      setItem(KEYS.BIKES, [...INITIAL_BIKES, ...customBikes]);
    } else {
      setItem(KEYS.BIKES, INITIAL_BIKES);
    }
  } else {
    // Ensure all 5 canonical fleet bikes are present in v5 storage
    const current = getItem<Bike[]>(KEYS.BIKES, []);
    const currentIds = new Set(current.map((b) => b.id));
    const missing = INITIAL_BIKES.filter((b) => !currentIds.has(b.id));
    if (missing.length > 0) {
      setItem(KEYS.BIKES, [...current, ...missing]);
    }
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
  const canonicalMap = new Map(INITIAL_BIKES.map((b) => [b.id, b]));

  const sanitized = all.map((b) => {
    const canonical = canonicalMap.get(b.id);
    return {
      ...canonical,
      ...b,
      brand: b.brand || canonical?.brand || 'Motorcycle',
      model: b.model || canonical?.model || 'Standard',
      category: b.category || canonical?.category || 'Motorcycle',
      engine: b.engine || canonical?.engine,
      power: b.power || canonical?.power,
      torque: b.torque || canonical?.torque,
      weight: b.weight || canonical?.weight,
      tankCapacity: b.tankCapacity || canonical?.tankCapacity,
      seatHeight: b.seatHeight || canonical?.seatHeight,
      groundClearance: b.groundClearance || canonical?.groundClearance,
      brakes: b.brakes || canonical?.brakes,
      features: b.features || canonical?.features,
    };
  });
  return userId ? sanitized.filter((b) => b.userId === userId) : sanitized;
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
