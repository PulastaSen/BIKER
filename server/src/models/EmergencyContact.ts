import mongoose, { Schema } from 'mongoose';

export interface IEmergencyContact {
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  notifyOnSOS: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const EmergencyContactSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relationship: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
  notifyOnSOS: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<IEmergencyContact>('EmergencyContact', EmergencyContactSchema);
