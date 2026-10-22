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
  category?: string;
  engine?: string;
  power?: string;
  torque?: string;
  weight?: string;
  tankCapacity?: string;
  tankCapacityLiters?: number;
  mileageKmpl?: number;
  seatHeight?: string;
  groundClearance?: string;
  brakes?: string;
  features?: string[];
  vin?: string;
  odometerKm?: number;
  insuranceExpiry?: string;
  pucExpiry?: string;
  maintenanceReminders?: {
    chainLubeDueKm?: number;
    oilServiceDueKm?: number;
    tyreCheckDate?: string;
  };
  qrToken?: string;
  activeSubscriptionId?: string;
}

export type RequestStatus =
  | 'OPEN'
  | 'SUBMITTED'
  | 'REQUESTED'
  | 'ASSIGNED'
  | 'HELPER_OFFERED'
  | 'SEARCHING'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'UNFULFILLED_NO_PROVIDER';

export interface EstimatedPrice {
  calloutFee: number;
  travelFee: number;
  serviceFee: number;
  estimatedTotal: number;
  isAvailable: boolean;
  disclaimer: string;
}

export interface TowingDetails {
  towingType: 'FLATBED' | 'MOTORCYCLE_CARRIER' | 'PICKUP' | 'OEM_RECOVERY' | 'WORKSHOP_DELIVERY' | 'HOME_DELIVERY';
  pickupAddress?: string;
  destinationAddress?: string;
  pickupPhotos?: string[];
  deliveredPhotos?: string[];
}

export interface RequestTimelineEvent {
  status: string;
  timestamp: string;
  notes?: string;
}

export type HelpCategory = 
  | 'MECHANICAL' 
  | 'MEDICAL' 
  | 'EMERGENCY' 
  | 'RECOVERY' 
  | 'FUEL' 
  | 'BATTERY' 
  | 'TOWING' 
  | 'SAFETY' 
  | 'BOTH' 
  | 'UNKNOWN';

export type RiderDocumentType = 'DRIVING_LICENSE' | 'RC' | 'INSURANCE' | 'PUC' | 'GOVT_ID';
export type DocumentReviewStatus = 'NOT_SUBMITTED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export interface RiderDocument {
  id: string;
  documentId: string;
  docType: RiderDocumentType;
  documentNumber: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  fileUrl?: string;
  isVerified?: boolean;
  verificationStatus: DocumentReviewStatus;
  isExpiringSoon?: boolean;
  notes?: string;
  createdAt?: string;
}

export interface CrashDetectionEvent {
  eventId: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceScore: number;
  impactForceG?: number;
  speedDeltaKmph?: number;
  motionStopped: boolean;
  userResponse: 'CONFIRMED_SAFE' | 'CONFIRMED_CRASH' | 'TIMEOUT_NO_RESPONSE' | 'DISMISSED';
  timestamp: string;
}

export interface LiveHelperTelemetry {
  requestId: string;
  providerId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  etaMinutes?: number;
  distanceKm?: number;
  timestamp: string;
}

export interface HelpRequest {
  id: string;
  requestId?: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  bike: Bike;
  issue: string;
  helpCategory?: HelpCategory;
  subcategory?: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  approximateLocation?: string;
  locationShared: boolean;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  isBikeMovable?: boolean;
  towingRequired?: boolean;
  towingDetails?: TowingDetails;
  riderSafe?: boolean;
  imageName?: string;
  status: RequestStatus;
  estimatedPrice?: EstimatedPrice;
  medicalDetails?: {
    medicalUrgency?: string;
    injuryDescription?: string;
    ambulanceStatus?: string;
    hospitalTarget?: string;
  };
  liveTracking?: {
    isTrackingActive: boolean;
    lastProviderCoordinates?: [number, number];
    heading?: number;
    speed?: number;
    etaMinutes?: number;
    distanceKm?: number;
    updatedAt?: string;
  };
  receiptId?: string;
  timeline?: RequestTimelineEvent[];
  coverageType?: 'COMPLIMENTARY_YEAR_1' | 'EXTENDED_WARRANTY' | 'PAY_PER_INCIDENT' | 'OEM_RSA';
  assignedProviderDetails?: {
    name?: string;
    phone?: string;
    businessName?: string;
    vehiclePlate?: string;
    rating?: number;
    verified?: boolean;
  };
  escalationDetails?: {
    escalatedToHelpline?: boolean;
    helplinePhone?: string;
    escalatedAt?: string;
    notes?: string;
  };
  disputeDetails?: {
    disputed?: boolean;
    reason?: string;
    disputedAmount?: number;
    status?: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'REVIEW_PENDING';
    reportedAt?: string;
  };
  cancellationReason?: string;
  bikeDetails?: {
    brand?: string;
    model?: string;
    registrationNumber?: string;
    vin?: string;
    fuelType?: string;
    year?: number;
  };
  locationProvenance?: 'GPS_FRESH' | 'GPS_STALE' | 'MANUAL_LANDMARK' | 'UNAVAILABLE';
  assignedHelperId?: string;
  assignedHelperName?: string;
  assignedHelperPhone?: string;
  offeredHelperIds?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type VerificationStatus = 'PENDING' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';

export type ServiceType = 'MECHANIC' | 'TOWING' | 'RIDER_VOLUNTEER' | 'WORKSHOP';

export interface HelperProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  serviceType: ServiceType;
  businessName?: string;
  ownerName?: string;
  serviceAreas: string[];
  skills: string[];
  isAvailable: boolean;
  verificationStatus: VerificationStatus;
  identityVerified?: boolean;
  businessVerified?: boolean;
  phoneVerified?: boolean;
  adminApproved?: boolean;
  rating: number;
  completedAssists: number;
  averageResponseMinutes?: number;
  calloutFee?: number;
  startingPrice?: number;
  operatingHours?: string;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary?: boolean;
  notifyOnSOS?: boolean;
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

export type MedicalSharingPreference = 'NEVER' | 'EMERGENCY_ONLY' | 'TRUSTED_CONTACTS';

export interface MedicalProfile {
  userId: string;
  fullName: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'UNKNOWN';
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  emergencyNotes?: string;
  organDonor: boolean;
  doctorName?: string;
  doctorContact?: string;
  preferredHospital?: string;
  sharingPreference?: MedicalSharingPreference;
  sharingPolicy?: 'NEVER' | 'EMERGENCY_ONLY' | 'TRUSTED_CONTACTS';
  shareWithEmergencyResponders?: boolean;
  updatedAt?: string;
}

export interface FamilyMember {
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

export interface SafeRideSession {
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

export type RoadHazardType = 
  | 'POTHOLE' 
  | 'ACCIDENT' 
  | 'DEBRIS' 
  | 'OIL_SPILL' 
  | 'FLOODING' 
  | 'ROAD_CLOSURE' 
  | 'LANDSLIDE' 
  | 'DANGEROUS_SECTION'
  | 'HEAVY_FOG'
  | 'ANIMAL_HAZARD';

export interface RoadHazard {
  id: string;
  reportedBy: string;
  hazardType: RoadHazardType;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: {
    type: string;
    coordinates: [number, number];
    landmark?: string;
  };
  status: 'ACTIVE' | 'VERIFIED' | 'RESOLVED' | 'DISMISSED';
  upvotes: number;
  expiresAt?: string;
  createdAt: string;
}

export interface ServiceReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ServiceReceipt {
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
  parts: ServiceReceiptItem[];
  serviceNotes?: string;
  paymentMethod: string;
  isPaid: boolean;
  issuedAt: string;
}

export interface AccidentReport {
  id?: string;
  reportId?: string;
  userId?: string;
  bikeId?: string;
  dateTime?: string;
  incidentTime?: string;
  location: {
    coordinates: [number, number];
    address?: string;
  };
  riderSafe?: boolean;
  injuriesReported?: boolean;
  injuryReported?: boolean;
  damageDescription?: string;
  bikeDamage?: string;
  otherVehiclesInvolved?: string[];
  otherVehicles?: string;
  witnessContact?: string;
  witnessInfo?: string;
  roadCondition?: string;
  weatherCondition?: string;
  insuranceClaimNumber?: string;
  insurancePolicyNumber?: string;
  insuranceClaimStarted?: boolean;
  towingRequested?: boolean;
  notes?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'RESOLVED' | 'LOGGED';
  createdAt?: string;
}

export type BikeDocType = 'RC' | 'INSURANCE' | 'PUC' | 'DRIVING_LICENSE' | 'WARRANTY' | 'SERVICE_RECORD';

export interface BikeDocument {
  id?: string;
  documentId?: string;
  bikeId: string;
  userId?: string;
  docType: BikeDocType | string;
  documentNumber: string;
  issuer?: string;
  expiryDate?: string;
  fileUrl?: string;
  isVerified?: boolean;
  notes?: string;
  createdAt: string;
}

export interface SparePart {
  id?: string;
  partId?: string;
  providerId: string;
  providerName?: string;
  partName: string;
  brand?: string;
  modelCompatibility?: string[];
  compatibleModels?: string[];
  partNumber?: string;
  category: string;
  partCategory?: string;
  price: number;
  priceInr?: number;
  inStock?: boolean;
  quantity?: number;
  quantityAvailable?: number;
  distanceKm?: number;
  locationName?: string;
  contactPhone?: string;
}

export interface BikeHealthStatus {
  oil: 'GOOD' | 'ATTENTION' | 'CRITICAL';
  chain: 'GOOD' | 'ATTENTION' | 'CRITICAL';
  brake: 'GOOD' | 'ATTENTION' | 'CRITICAL';
  tyres: 'GOOD' | 'ATTENTION' | 'CRITICAL';
  battery: 'GOOD' | 'ATTENTION' | 'CRITICAL';
  upcomingMaintenanceKm: number;
  upcomingMaintenanceTask: string;
}

// ReadyAssist-Benchmark Service Catalogue Types
export type CatalogServiceType =
  | 'PUNCTURE_REPAIR'
  | 'TYRE_REPLACEMENT'
  | 'BATTERY_JUMPSTART'
  | 'MINOR_MECHANICAL'
  | 'CHAIN_DRIVETRAIN'
  | 'EMERGENCY_FUEL'
  | 'FLATBED_TOWING'
  | 'ACCIDENT_RECOVERY'
  | 'KEY_LOCK_ASSIST'
  | 'SCHEDULED_PERIODIC'
  | 'DOORSTEP_FITMENT'
  | 'WORKSHOP_PICKDROP';

export interface ServiceCatalogItem {
  id: CatalogServiceType;
  title: string;
  category: 'ROADSIDE_ASSISTANCE' | 'DOORSTEP_CARE' | 'TOWING_RECOVERY' | 'WORKSHOP_SERVICE';
  shortDesc: string;
  fullDesc: string;
  basePrice: number;
  priceNote: string;
  turnaroundMinutes: number;
  supportedVehicles: string[];
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: string;
  badge?: string;
  iconName: string;
}

export type BookingStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'UNFULFILLED_NO_PROVIDER'
  | 'PENDING'
  | 'ACCEPTED'
  | 'DISPATCHED'
  | 'SEARCHING';

export interface ServiceBooking {
  bookingId: string;
  userId: string;
  riderName: string;
  riderPhone: string;
  serviceType: CatalogServiceType;
  serviceName: string;
  bikeDetails: {
    brand: string;
    model: string;
    registrationNumber: string;
    fuelType?: string;
  };
  location: {
    address: string;
    lat: number;
    lng: number;
    landmark?: string;
  };
  scheduledTime?: string;
  pricing: {
    baseRate: number;
    travelFee: number;
    partsEstimate: number;
    totalEstimated: number;
    isCoveredBySubscription?: boolean;
    coveragePlanName?: string;
    disclaimer: string;
  };
  status: BookingStatus;
  assignedProvider?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    assignedAt: string;
  };
  cancellationReason?: string;
  serviceNotes?: string;
  partsUsed?: string[];
  dispute?: {
    filed: boolean;
    reason?: string;
    amount?: number;
    status?: 'OPEN' | 'RESOLVED' | 'REVIEW_PENDING';
  };
  createdAt: string;
  updatedAt: string;
}

// ReadyAssist-Benchmark Subscription Plans
export type RsaPlanTier = 'FREEDOM' | 'COMMUTER' | 'TOURING_PRO' | 'HILL_EXPLORER';

export interface RsaPlan {
  tier: RsaPlanTier;
  name: string;
  tagline: string;
  priceInr: number;
  durationMonths: number;
  highlight?: boolean;
  badge?: string;
  features: {
    maxFreeBreakdowns: number;
    towingDistanceLimitKm: number;
    includesPunctureRepair: boolean;
    includesBatteryJumpstart: boolean;
    includesMinorMechanicalLabor: boolean;
    includesFuelDeliveryLabor: boolean;
    includesMountainWinchRecovery: boolean;
    highwayPriorityDispatch: boolean;
  };
  includedBulletPoints: string[];
  exclusions: string[];
  waitingPeriodHours: number;
}

export interface UserSubscription {
  subscriptionId: string;
  userId: string;
  planTier: RsaPlanTier;
  planName: string;
  priceInr: number;
  durationMonths: number;
  linkedBike: {
    bikeId: string;
    brand: string;
    model: string;
    registrationNumber: string;
  };
  features: {
    maxFreeBreakdowns: number;
    usedBreakdowns: number;
    towingDistanceLimitKm: number;
    includesPunctureRepair: boolean;
    includesBatteryJumpstart: boolean;
    includesMinorMechanicalLabor: boolean;
    includesFuelDeliveryLabor: boolean;
    includesMountainWinchRecovery: boolean;
    highwayPriorityDispatch: boolean;
  };
  waitingPeriodHours: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  paymentDetails: {
    paymentMode: 'TEST_DEMO' | 'RAZORPAY' | 'STRIPE';
    transactionRef: string;
    paidAmount: number;
    paidAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Vehicle Emergency QR Tag
export interface QrContactRequest {
  id: string;
  requestType: 'PARKED_OBSTRUCTION' | 'LIGHTS_ON' | 'VEHICLE_TIPPED' | 'ACCIDENT_EMERGENCY' | 'GENERAL_MESSAGE';
  senderName?: string;
  senderPhone?: string;
  message: string;
  locationPin?: {
    lat: number;
    lng: number;
    address?: string;
  };
  createdAt: string;
  read: boolean;
}

export interface VehicleQrTag {
  token: string;
  userId: string;
  bikeId: string;
  vehicleNickname: string;
  brand: string;
  model: string;
  registrationNumber: string;
  emergencyInstructions?: string;
  allowPublicContact: boolean;
  contactRequests: QrContactRequest[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
