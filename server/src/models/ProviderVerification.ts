import mongoose, { Schema, Document } from 'mongoose';

export type VerificationState = 'PENDING_VERIFICATION' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';

export interface IProviderVerification extends Document {
  verificationId: string;
  providerId: mongoose.Types.ObjectId;
  businessName: string;
  ownerName: string;
  phone: string;
  phoneVerified: boolean;
  businessVerified: boolean;
  identityVerified: boolean;
  adminApproved: boolean;
  status: VerificationState;
  businessRegistrationNumber?: string;
  tradeLicenseNumber?: string;
  gstin?: string;
  reviewNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderVerificationSchema: Schema = new Schema({
  verificationId: { type: String, required: true, unique: true, index: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  businessName: { type: String, required: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true },
  phoneVerified: { type: Boolean, default: false },
  businessVerified: { type: Boolean, default: false },
  identityVerified: { type: Boolean, default: false },
  adminApproved: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['PENDING_VERIFICATION', 'VERIFIED', 'SUSPENDED', 'REJECTED'],
    default: 'PENDING_VERIFICATION',
    index: true
  },
  businessRegistrationNumber: { type: String },
  tradeLicenseNumber: { type: String },
  gstin: { type: String },
  reviewNotes: { type: String },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model<IProviderVerification>('ProviderVerification', ProviderVerificationSchema);
