import mongoose, { Schema, Document } from 'mongoose';

export enum RequestStatus {
  REQUESTED = 'REQUESTED',
  ACCEPTED = 'ACCEPTED',
  EN_ROUTE = 'EN_ROUTE',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
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
  };
  status: RequestStatus;
  paymentAmount?: number;
  paymentStatus?: 'PENDING' | 'PAID';
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssistanceRequestSchema: Schema = new Schema({
  requestId: { type: String, required: true, unique: true },
  riderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User' },
  problemCategory: { type: String, required: true },
  description: { type: String },
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String }
  },
  status: { type: String, enum: Object.values(RequestStatus), default: RequestStatus.REQUESTED },
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
