import mongoose, { Schema, Document } from 'mongoose';

export type BikeDocType = 'RC' | 'INSURANCE' | 'PUC' | 'DRIVING_LICENSE' | 'WARRANTY' | 'SERVICE_RECORD';

export interface IBikeDocument extends Document {
  documentId: string;
  bikeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  docType: BikeDocType;
  documentNumber: string;
  issuer?: string;
  issueDate?: Date;
  expiryDate?: Date;
  fileUrl?: string;
  isVerified?: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BikeDocumentSchema: Schema = new Schema({
  documentId: { type: String, required: true, unique: true, index: true },
  bikeId: { type: Schema.Types.ObjectId, ref: 'Bike', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  docType: {
    type: String,
    enum: ['RC', 'INSURANCE', 'PUC', 'DRIVING_LICENSE', 'WARRANTY', 'SERVICE_RECORD'],
    required: true
  },
  documentNumber: { type: String, required: true },
  issuer: { type: String },
  issueDate: { type: Date },
  expiryDate: { type: Date },
  fileUrl: { type: String },
  isVerified: { type: Boolean, default: false },
  notes: { type: String }
}, {
  timestamps: true
});

BikeDocumentSchema.index({ bikeId: 1, docType: 1 });

export default mongoose.model<IBikeDocument>('BikeDocument', BikeDocumentSchema);
