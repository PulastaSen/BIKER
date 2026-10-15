import mongoose, { Schema, Document } from 'mongoose';

export enum RequestStatus {
  DRAFT_LOCAL = 'DRAFT_LOCAL',
  SUBMITTED = 'SUBMITTED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  SEARCHING = 'SEARCHING',
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  EN_ROUTE = 'EN_ROUTE',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED',
  UNFULFILLED_NO_PROVIDER = 'UNFULFILLED_NO_PROVIDER',
  // Backwards compatibility aliases
  REQUESTED = 'REQUESTED',
  ASSIGNED = 'ASSIGNED',
  COMPLETED = 'COMPLETED'
}

export type LocationProvenance = 'GPS_FRESH' | 'GPS_STALE' | 'MANUAL_LANDMARK' | 'UNAVAILABLE';

export interface IAuditEvent {
  actor: 'RIDER' | 'PROVIDER' | 'OPERATOR' | 'SYSTEM';
  action: string;
  previousStatus?: string;
  newStatus?: string;
  timestamp: Date;
  notes?: string;
}

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  DRAFT_LOCAL: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['ACKNOWLEDGED', 'SEARCHING', 'OFFERED', 'ACCEPTED', 'CANCELLED', 'UNFULFILLED_NO_PROVIDER'],
  REQUESTED: ['ACKNOWLEDGED', 'SEARCHING', 'OFFERED', 'ACCEPTED', 'CANCELLED', 'UNFULFILLED_NO_PROVIDER'],
  ACKNOWLEDGED: ['SEARCHING', 'OFFERED', 'ACCEPTED', 'CANCELLED', 'UNFULFILLED_NO_PROVIDER'],
  SEARCHING: ['OFFERED', 'ACCEPTED', 'CANCELLED', 'UNFULFILLED_NO_PROVIDER'],
  OFFERED: ['ACCEPTED', 'SEARCHING', 'CANCELLED', 'UNFULFILLED_NO_PROVIDER'],
  ASSIGNED: ['ACCEPTED', 'SEARCHING', 'CANCELLED', 'UNFULFILLED_NO_PROVIDER'],
  ACCEPTED: ['EN_ROUTE', 'CANCELLED'],
  EN_ROUTE: ['ARRIVED', 'CANCELLED'],
  ARRIVED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['RESOLVED', 'COMPLETED', 'CANCELLED'],
  RESOLVED: [],
  COMPLETED: [],
  CANCELLED: [],
  UNFULFILLED_NO_PROVIDER: ['SEARCHING', 'SUBMITTED', 'CANCELLED']
};

export function normalizeStatus(status: string): string {
  if (status === 'REQUESTED') return 'SUBMITTED';
  if (status === 'ASSIGNED') return 'OFFERED';
  if (status === 'COMPLETED') return 'RESOLVED';
  return status;
}

export function canTransition(currentStatus: string, nextStatus: string): boolean {
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || ALLOWED_TRANSITIONS[normalizeStatus(currentStatus)];
  if (!allowed) return false;
  return allowed.includes(nextStatus) || allowed.includes(normalizeStatus(nextStatus));
}

export interface IEstimatedPrice {
  calloutFee: number;
  travelFee: number;
  serviceFee: number;
  estimatedTotal: number;
  isAvailable: boolean;
  disclaimer: string;
}

export interface ITowingDetails {
  towingType: 'FLATBED' | 'MOTORCYCLE_CARRIER' | 'PICKUP' | 'OEM_RECOVERY' | 'WORKSHOP_DELIVERY' | 'HOME_DELIVERY';
  pickupAddress?: string;
  destinationAddress?: string;
  pickupPhotos?: string[];
  deliveredPhotos?: string[];
}

export interface IRequestTimelineEvent {
  status: string;
  timestamp: Date;
  notes?: string;
}

export type HelpCategoryType = 
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

export interface IMedicalEmergencyDetails {
  medicalUrgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  injuryDescription?: string;
  medicalIdRef?: string;
  emergencyContactStatus?: 'NOT_NOTIFIED' | 'PENDING' | 'ALERTED';
  ambulanceStatus?: 'NONE' | 'REQUESTED' | 'DISPATCHED' | 'ARRIVED';
  hospitalTarget?: string;
}

export interface IAssistanceRequest extends Document {
  requestId: string;
  idempotencyKey?: string;
  riderId: mongoose.Types.ObjectId;
  bikeId?: mongoose.Types.ObjectId;
  providerId?: mongoose.Types.ObjectId;
  problemCategory: string;
  helpCategory?: HelpCategoryType;
  subcategory?: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description?: string;
  location: {
    type: string;
    coordinates: number[]; // [lng, lat]
    address?: string;
    accuracyMeters?: number;
  };
  status: RequestStatus;
  estimatedPrice?: IEstimatedPrice;
  towingDetails?: ITowingDetails;
  medicalDetails?: IMedicalEmergencyDetails;
  liveTracking?: {
    isTrackingActive: boolean;
    lastProviderCoordinates?: number[];
    heading?: number;
    speed?: number;
    etaMinutes?: number;
    distanceKm?: number;
    updatedAt?: Date;
  };
  receiptId?: string;
  timeline: IRequestTimelineEvent[];
  auditEvents: IAuditEvent[];
  cancellationReason?: string;
  locationProvenance?: LocationProvenance;
  paymentAmount?: number;
  paymentStatus?: 'PENDING' | 'PAID';
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssistanceRequestSchema: Schema = new Schema({
  requestId: { type: String, required: true, unique: true, index: true },
  idempotencyKey: { type: String, sparse: true, index: true },
  riderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bikeId: { type: Schema.Types.ObjectId, ref: 'Bike', index: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  problemCategory: { type: String, required: true },
  helpCategory: { 
    type: String, 
    enum: ['MECHANICAL', 'MEDICAL', 'EMERGENCY', 'RECOVERY', 'FUEL', 'BATTERY', 'TOWING', 'SAFETY', 'BOTH', 'UNKNOWN'],
    default: 'MECHANICAL',
    index: true 
  },
  subcategory: { type: String },
  urgency: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  description: { type: String },
  medicalDetails: {
    medicalUrgency: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    injuryDescription: { type: String },
    medicalIdRef: { type: String },
    emergencyContactStatus: { type: String, default: 'NOT_NOTIFIED' },
    ambulanceStatus: { type: String, default: 'NONE' },
    hospitalTarget: { type: String }
  },
  liveTracking: {
    isTrackingActive: { type: Boolean, default: false },
    lastProviderCoordinates: { type: [Number] },
    heading: { type: Number },
    speed: { type: Number },
    etaMinutes: { type: Number },
    distanceKm: { type: Number },
    updatedAt: { type: Date }
  },
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String },
    accuracyMeters: { type: Number }
  },
  locationProvenance: {
    type: String,
    enum: ['GPS_FRESH', 'GPS_STALE', 'MANUAL_LANDMARK', 'UNAVAILABLE'],
    default: 'GPS_FRESH'
  },
  status: {
    type: String,
    enum: Object.values(RequestStatus),
    default: RequestStatus.REQUESTED,
    index: true
  },
  cancellationReason: { type: String },
  estimatedPrice: {
    calloutFee: { type: Number, default: 150 },
    travelFee: { type: Number, default: 100 },
    serviceFee: { type: Number, default: 100 },
    estimatedTotal: { type: Number, default: 350 },
    isAvailable: { type: Boolean, default: true },
    disclaimer: { type: String, default: 'Final price may change if additional parts or work are required.' }
  },
  towingDetails: {
    towingType: {
      type: String,
      enum: ['FLATBED', 'MOTORCYCLE_CARRIER', 'PICKUP', 'OEM_RECOVERY', 'WORKSHOP_DELIVERY', 'HOME_DELIVERY']
    },
    pickupAddress: { type: String },
    destinationAddress: { type: String },
    pickupPhotos: [{ type: String }],
    deliveredPhotos: [{ type: String }]
  },
  receiptId: { type: String },
  timeline: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String }
  }],
  auditEvents: [{
    actor: { type: String, required: true },
    action: { type: String, required: true },
    previousStatus: { type: String },
    newStatus: { type: String },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String }
  }],
  paymentAmount: { type: Number },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID'] },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String }
}, {
  timestamps: true
});

AssistanceRequestSchema.index({ location: '2dsphere' });
AssistanceRequestSchema.index({ status: 1 });
AssistanceRequestSchema.index({ idempotencyKey: 1 });

export default mongoose.model<IAssistanceRequest>('AssistanceRequest', AssistanceRequestSchema);
