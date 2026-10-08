import mongoose, { Schema, Document } from 'mongoose';

export type RideStatus = 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EMERGENCY';

export interface IRideSession extends Document {
  rideId: string;
  userId: mongoose.Types.ObjectId;
  bikeId?: mongoose.Types.ObjectId;
  startLocation: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    address?: string;
  };
  destination: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    name: string;
    address?: string;
  };
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    lastUpdated: Date;
    heading?: number;
    speed?: number;
  };
  status: RideStatus;
  estimatedDurationMinutes: number;
  expectedArrivalTime?: Date;
  sharedWithFamily: boolean;
  sharedFamilyIds: string[];
  safetyTimerEnabled: boolean;
  safetyTimerTarget?: Date;
  safetyTimerStatus?: 'PENDING' | 'SAFE_CONFIRMED' | 'ESCALATED' | 'CANCELLED';
  emergencyEscalationPolicy: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RideSessionSchema: Schema = new Schema({
  rideId: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bikeId: { type: Schema.Types.ObjectId, ref: 'Bike' },
  startLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String }
  },
  destination: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    name: { type: String, required: true },
    address: { type: String }
  },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] },
    lastUpdated: { type: Date, default: Date.now },
    heading: { type: Number },
    speed: { type: Number }
  },
  status: {
    type: String,
    enum: ['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'EMERGENCY'],
    default: 'PLANNING',
    index: true
  },
  estimatedDurationMinutes: { type: Number, required: true },
  expectedArrivalTime: { type: Date },
  sharedWithFamily: { type: Boolean, default: false },
  sharedFamilyIds: [{ type: String }],
  safetyTimerEnabled: { type: Boolean, default: false },
  safetyTimerTarget: { type: Date },
  safetyTimerStatus: {
    type: String,
    enum: ['PENDING', 'SAFE_CONFIRMED', 'ESCALATED', 'CANCELLED'],
    default: 'PENDING'
  },
  emergencyEscalationPolicy: { type: String, default: 'NOTIFY_FAMILY_CIRCLE' },
  startedAt: { type: Date },
  completedAt: { type: Date }
}, {
  timestamps: true
});

RideSessionSchema.index({ startLocation: '2dsphere' });

export default mongoose.model<IRideSession>('RideSession', RideSessionSchema);
