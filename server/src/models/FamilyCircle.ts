import mongoose, { Schema, Document } from 'mongoose';

export type FamilyRelationship = 'PARENT' | 'PARTNER' | 'SIBLING' | 'FRIEND' | 'CHILD' | 'OTHER';

export interface IFamilyMember extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  relationship: FamilyRelationship;
  phone: string;
  email?: string;
  canViewLiveRide: boolean;
  notifyOnSOS: boolean;
  notifyOnSafetyTimer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FamilyCircleSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  relationship: {
    type: String,
    enum: ['PARENT', 'PARTNER', 'SIBLING', 'FRIEND', 'CHILD', 'OTHER'],
    default: 'PARENT'
  },
  phone: { type: String, required: true },
  email: { type: String },
  canViewLiveRide: { type: Boolean, default: true },
  notifyOnSOS: { type: Boolean, default: true },
  notifyOnSafetyTimer: { type: Boolean, default: true }
}, {
  timestamps: true
});

FamilyCircleSchema.index({ userId: 1, phone: 1 });

export default mongoose.model<IFamilyMember>('FamilyCircle', FamilyCircleSchema);
