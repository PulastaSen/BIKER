import mongoose, { Schema, Document } from 'mongoose';

export type VerificationRole = 'RIDER' | 'HELPER';

export type VerificationOverallStatus =
  | 'NOT_STARTED'
  | 'DOCUMENTS_REQUIRED'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'ACTION_REQUIRED';

export type IdentityDocType =
  | 'DRIVING_LICENSE'
  | 'PASSPORT'
  | 'AADHAAR'
  | 'VOTER_ID'
  | 'TRADE_LICENSE'
  | 'BUSINESS_PROOF'
  | 'CERTIFICATE';

export type FaceLivenessStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'PASSED'
  | 'FAILED'
  | 'MANUAL_REVIEW';

export interface IVerificationAuditLog {
  action: string;
  timestamp: Date;
  actorId: string;
  actorRole: string;
  details?: string;
}

export interface IIdentityVerification extends Document {
  verificationId: string;
  userId: string;
  role: VerificationRole;
  status: VerificationOverallStatus;
  
  // Identity Proof
  identityType?: IdentityDocType;
  documentNumberMasked?: string;
  documentFrontKey?: string;
  documentBackKey?: string;
  documentExpiryDate?: Date;
  documentStatus: 'NOT_SUBMITTED' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

  // Face Verification
  selfieKey?: string;
  faceLivenessStatus: FaceLivenessStatus;
  faceMatchScore?: number;
  faceVerificationNotes?: string;
  isBiometricProviderConfigured: boolean;
  isDemoSimulation: boolean;

  // Helper / Provider specific credentials
  helperCategory?: 'MECHANIC' | 'TOWING' | 'FUEL' | 'PUNCTURE' | 'PARAMEDIC';
  businessName?: string;
  serviceAddress?: string;
  businessProofKey?: string;
  commercialLicenseKey?: string;
  yearsOfExperience?: number;

  // Review & Audit
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  auditLogs: IVerificationAuditLog[];

  createdAt: Date;
  updatedAt: Date;
}

const VerificationAuditLogSchema = new Schema({
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  actorId: { type: String, required: true },
  actorRole: { type: String, required: true },
  details: { type: String }
}, { _id: false });

const IdentityVerificationSchema: Schema = new Schema({
  verificationId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['RIDER', 'HELPER'], required: true, index: true },
  status: {
    type: String,
    enum: [
      'NOT_STARTED',
      'DOCUMENTS_REQUIRED',
      'SUBMITTED',
      'UNDER_REVIEW',
      'VERIFIED',
      'REJECTED',
      'EXPIRED',
      'ACTION_REQUIRED'
    ],
    default: 'NOT_STARTED',
    index: true
  },
  identityType: {
    type: String,
    enum: ['DRIVING_LICENSE', 'PASSPORT', 'AADHAAR', 'VOTER_ID', 'TRADE_LICENSE', 'BUSINESS_PROOF', 'CERTIFICATE']
  },
  documentNumberMasked: { type: String },
  documentFrontKey: { type: String },
  documentBackKey: { type: String },
  documentExpiryDate: { type: Date },
  documentStatus: {
    type: String,
    enum: ['NOT_SUBMITTED', 'SUBMITTED', 'VERIFIED', 'REJECTED'],
    default: 'NOT_SUBMITTED'
  },
  selfieKey: { type: String },
  faceLivenessStatus: {
    type: String,
    enum: ['NOT_STARTED', 'PENDING', 'PASSED', 'FAILED', 'MANUAL_REVIEW'],
    default: 'NOT_STARTED'
  },
  faceMatchScore: { type: Number },
  faceVerificationNotes: { type: String },
  isBiometricProviderConfigured: { type: Boolean, default: false },
  isDemoSimulation: { type: Boolean, default: false },
  helperCategory: {
    type: String,
    enum: ['MECHANIC', 'TOWING', 'FUEL', 'PUNCTURE', 'PARAMEDIC']
  },
  businessName: { type: String },
  serviceAddress: { type: String },
  businessProofKey: { type: String },
  commercialLicenseKey: { type: String },
  yearsOfExperience: { type: Number },
  reviewNotes: { type: String },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  auditLogs: [VerificationAuditLogSchema]
}, {
  timestamps: true
});

export default mongoose.model<IIdentityVerification>('IdentityVerification', IdentityVerificationSchema);
