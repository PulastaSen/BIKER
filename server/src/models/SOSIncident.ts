import mongoose, { Schema, Document } from 'mongoose';

export enum SOSStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  CANCELLED = 'CANCELLED',
  RESOLVED = 'RESOLVED'
}

export interface ISOSTimelineEvent {
  event: string;
  timestamp: Date;
  detail?: string;
}

export interface ISOSIncident extends Document {
  incidentId: string;
  userId: mongoose.Types.ObjectId;
  location?: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
    accuracyMeters?: number;
  };
  status: SOSStatus;
  contactsNotified: boolean;
  notificationStatus: string;
  timeline: ISOSTimelineEvent[];
  resolvedAt?: Date;
  resolvedNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SOSIncidentSchema: Schema = new Schema({
  incidentId: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  location: {
    type: { type: String, enum: ['Point'], required: false },
    coordinates: { type: [Number], required: false },
    accuracyMeters: { type: Number }
  },
  status: {
    type: String,
    enum: Object.values(SOSStatus),
    default: SOSStatus.ACTIVE,
    index: true
  },
  contactsNotified: { type: Boolean, default: false },
  notificationStatus: { type: String, default: 'Pending' },
  timeline: [{
    event: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    detail: { type: String }
  }],
  resolvedAt: { type: Date },
  resolvedNotes: { type: String }
}, {
  timestamps: true
});

SOSIncidentSchema.index({ location: '2dsphere' });

export default mongoose.model<ISOSIncident>('SOSIncident', SOSIncidentSchema);
