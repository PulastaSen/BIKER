import mongoose, { Schema, Document } from 'mongoose';

export enum RequestStatus {
  REQUESTED = 'REQUESTED',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  EN_ROUTE = 'EN_ROUTE',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
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

export interface IAssistanceRequest extends Document {
  requestId: string;
  riderId: mongoose.Types.ObjectId;
  providerId?: mongoose.Types.ObjectId;
  problemCategory: string;
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
  receiptId?: string;
  timeline: IRequestTimelineEvent[];
  paymentAmount?: number;
  paymentStatus?: 'PENDING' | 'PAID';
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssistanceRequestSchema: Schema = new Schema({
  requestId: { type: String, required: true, unique: true, index: true },
  riderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  problemCategory: { type: String, required: true },
  description: { type: String },
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String },
    accuracyMeters: { type: Number }
  },
  status: {
    type: String,
    enum: Object.values(RequestStatus),
    default: RequestStatus.REQUESTED,
    index: true
  },
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
  paymentAmount: { type: Number },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID'] },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String }
}, {
  timestamps: true
});

AssistanceRequestSchema.index({ location: '2dsphere' });
AssistanceRequestSchema.index({ status: 1 });

export default mongoose.model<IAssistanceRequest>('AssistanceRequest', AssistanceRequestSchema);
