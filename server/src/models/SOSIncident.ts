import mongoose, { Schema, Document } from 'mongoose';

export enum SOSStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  RESOLVED = 'RESOLVED'
}

export interface ISOSIncident extends Document {
  incidentId: string;
  userId: mongoose.Types.ObjectId;
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  status: SOSStatus;
  contactsNotified: boolean;
  notificationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const SOSIncidentSchema: Schema = new Schema({
  incidentId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    type: { type: String, enum: ['Point'], required: false },
    coordinates: { type: [Number], required: false }
  },
  status: { type: String, enum: Object.values(SOSStatus), default: SOSStatus.ACTIVE },
  contactsNotified: { type: Boolean, default: false },
  notificationStatus: { type: String, default: 'Pending' }
}, {
  timestamps: true
});

SOSIncidentSchema.index({ location: '2dsphere' });

export default mongoose.model<ISOSIncident>('SOSIncident', SOSIncidentSchema);
