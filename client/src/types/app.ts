export type UserRole = 'RIDER' | 'HELPER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  helperProfileId?: string;
}

export type FuelType = 'PETROL' | 'ELECTRIC' | 'HYBRID';

export interface Bike {
  id: string;
  userId: string;
  brand: string;
  model: string;
  registrationNumber: string;
  year: number;
  fuelType: FuelType;
  isPrimary?: boolean;
  notes?: string;
}

export type RequestStatus =
  | 'OPEN'
  | 'HELPER_OFFERED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CANCELLED';

export interface HelpRequest {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  bike: Bike;
  issue: string;
  description: string;
  approximateLocation?: string;
  locationShared: boolean;
  latitude?: number;
  longitude?: number;
  isBikeMovable?: boolean;
  towingRequired?: boolean;
  riderSafe?: boolean;
  imageName?: string;
  status: RequestStatus;
  assignedHelperId?: string;
  assignedHelperName?: string;
  assignedHelperPhone?: string;
  offeredHelperIds?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type ServiceType = 'MECHANIC' | 'TOWING' | 'RIDER_VOLUNTEER' | 'WORKSHOP';

export interface HelperProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  serviceType: ServiceType;
  businessName?: string;
  serviceAreas: string[];
  skills: string[];
  isAvailable: boolean;
  verificationStatus: VerificationStatus;
  rating: number;
  completedAssists: number;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId?: string;
  reason: string;
  details: string;
  createdAt: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
}
