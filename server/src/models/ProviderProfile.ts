import mongoose, { Schema, Document } from 'mongoose';

export type ProviderVerificationState = 'PENDING_VERIFICATION' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';

export interface IProviderProfile extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  ownerName?: string;
  verified: boolean;
  verificationStatus: ProviderVerificationState;
  identityVerified: boolean;
  businessVerified: boolean;
  phoneVerified: boolean;
  adminApproved: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  averageResponseMinutes: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  services: string[];
  startingPrice: number;
  calloutFee: number;
  operatingHours: string;
  phone?: string;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, required: true },
  ownerName: { type: String },
  verified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['PENDING_VERIFICATION', 'VERIFIED', 'SUSPENDED', 'REJECTED'],
    default: 'PENDING_VERIFICATION',
    index: true
  },
  identityVerified: { type: Boolean, default: false },
  businessVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  adminApproved: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  averageResponseMinutes: { type: Number, default: 15 },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: { type: String }
  },
  services: [{ type: String }],
  startingPrice: { type: Number, required: true },
  calloutFee: { type: Number, default: 150 },
  operatingHours: { type: String, default: '24/7 Roadside Assistance' },
  phone: { type: String },
  isOpen: { type: Boolean, default: true }
}, {
  timestamps: true
});

ProviderProfileSchema.index({ location: '2dsphere' });
ProviderProfileSchema.index({ verificationStatus: 1, isOpen: 1 });

export default mongoose.model<IProviderProfile>('ProviderProfile', ProviderProfileSchema);
