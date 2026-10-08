import mongoose, { Schema, Document } from 'mongoose';

export type CrashConfidence = 'LOW' | 'MEDIUM' | 'HIGH';
export type CrashUserResponse = 'CONFIRMED_SAFE' | 'CONFIRMED_CRASH' | 'TIMEOUT_NO_RESPONSE' | 'DISMISSED';

export interface ICrashDetectionEvent extends Document {
  eventId: string;
  userId: mongoose.Types.ObjectId;
  rideId?: mongoose.Types.ObjectId;
  confidence: CrashConfidence;
  confidenceScore: number; // 0.0 - 1.0
  impactForceG?: number;
  speedDeltaKmph?: number;
  motionStopped: boolean;
  location?: {
    type: string;
    coordinates: number[]; // [lng, lat]
    accuracyMeters?: number;
  };
  sensorEvidence?: {
    maxAcceleration?: number;
    rotationRateDegPerSec?: number;
    preSpeedKmph?: number;
    postSpeedKmph?: number;
  };
  userResponse: CrashUserResponse;
  countdownSeconds: number;
  escalatedToSOS: boolean;
  emergencyContactsAlerted: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CrashDetectionEventSchema: Schema = new Schema({
  eventId: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rideId: { type: Schema.Types.ObjectId, ref: 'RideSession' },
  confidence: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM',
    index: true
  },
  confidenceScore: { type: Number, default: 0.5, min: 0, max: 1 },
  impactForceG: { type: Number },
  speedDeltaKmph: { type: Number },
  motionStopped: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] },
    accuracyMeters: { type: Number }
  },
  sensorEvidence: {
    maxAcceleration: { type: Number },
    rotationRateDegPerSec: { type: Number },
    preSpeedKmph: { type: Number },
    postSpeedKmph: { type: Number }
  },
  userResponse: {
    type: String,
    enum: ['CONFIRMED_SAFE', 'CONFIRMED_CRASH', 'TIMEOUT_NO_RESPONSE', 'DISMISSED'],
    default: 'DISMISSED'
  },
  countdownSeconds: { type: Number, default: 10 },
  escalatedToSOS: { type: Boolean, default: false },
  emergencyContactsAlerted: { type: Boolean, default: false },
  notes: { type: String }
}, {
  timestamps: true
});

CrashDetectionEventSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ICrashDetectionEvent>('CrashDetectionEvent', CrashDetectionEventSchema);
