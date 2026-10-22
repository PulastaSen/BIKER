import mongoose, { Schema, Document } from 'mongoose';

export type ServiceType = 
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

export type BookingStatus = 
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'UNFULFILLED_NO_PROVIDER';

export interface IServiceBooking extends Document {
  bookingId: string;
  userId: mongoose.Types.ObjectId;
  riderName: string;
  riderPhone: string;
  serviceType: ServiceType;
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
  scheduledTime?: Date;
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
    assignedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

const ServiceBookingSchema: Schema = new Schema({
  bookingId: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  riderName: { type: String, required: true },
  riderPhone: { type: String, required: true },
  serviceType: { 
    type: String, 
    required: true,
    enum: [
      'PUNCTURE_REPAIR',
      'TYRE_REPLACEMENT',
      'BATTERY_JUMPSTART',
      'MINOR_MECHANICAL',
      'CHAIN_DRIVETRAIN',
      'EMERGENCY_FUEL',
      'FLATBED_TOWING',
      'ACCIDENT_RECOVERY',
      'KEY_LOCK_ASSIST',
      'SCHEDULED_PERIODIC',
      'DOORSTEP_FITMENT',
      'WORKSHOP_PICKDROP'
    ]
  },
  serviceName: { type: String, required: true },
  bikeDetails: {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    registrationNumber: { type: String, required: true },
    fuelType: { type: String, default: 'PETROL' }
  },
  location: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    landmark: { type: String }
  },
  scheduledTime: { type: Date },
  pricing: {
    baseRate: { type: Number, required: true },
    travelFee: { type: Number, default: 0 },
    partsEstimate: { type: Number, default: 0 },
    totalEstimated: { type: Number, required: true },
    isCoveredBySubscription: { type: Boolean, default: false },
    coveragePlanName: { type: String },
    disclaimer: { type: String, default: 'Standard pricing. Final invoice subject to on-site consumables and parts used.' }
  },
  status: {
    type: String,
    enum: [
      'REQUESTED',
      'CONFIRMED',
      'ASSIGNED',
      'EN_ROUTE',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'UNFULFILLED_NO_PROVIDER'
    ],
    default: 'REQUESTED',
    index: true
  },
  assignedProvider: {
    id: { type: String },
    name: { type: String },
    phone: { type: String },
    rating: { type: Number },
    assignedAt: { type: Date }
  },
  cancellationReason: { type: String },
  serviceNotes: { type: String },
  partsUsed: [{ type: String }],
  dispute: {
    filed: { type: Boolean, default: false },
    reason: { type: String },
    amount: { type: Number },
    status: { type: String, enum: ['OPEN', 'RESOLVED', 'REVIEW_PENDING'], default: 'OPEN' }
  }
}, {
  timestamps: true
});

export default mongoose.model<IServiceBooking>('ServiceBooking', ServiceBookingSchema);
