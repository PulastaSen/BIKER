import mongoose, { Schema, Document } from 'mongoose';

export type HazardType = 
  | 'POTHOLE' 
  | 'ACCIDENT' 
  | 'DEBRIS' 
  | 'OIL_SPILL' 
  | 'FLOODING' 
  | 'ROAD_CLOSURE' 
  | 'LANDSLIDE' 
  | 'DANGEROUS_SECTION';

export type HazardStatus = 'ACTIVE' | 'VERIFIED' | 'RESOLVED' | 'DISMISSED';

export interface IRoadHazard extends Document {
  reportedBy: mongoose.Types.ObjectId;
  hazardType: HazardType;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: {
    type: string;
    coordinates: number[]; // [lng, lat]
    landmark?: string;
  };
  status: HazardStatus;
  upvotes: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RoadHazardSchema: Schema = new Schema({
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  hazardType: {
    type: String,
    enum: ['POTHOLE', 'ACCIDENT', 'DEBRIS', 'OIL_SPILL', 'FLOODING', 'ROAD_CLOSURE', 'LANDSLIDE', 'DANGEROUS_SECTION'],
    required: true
  },
  description: { type: String, required: true, maxlength: 500 },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true },
    landmark: { type: String }
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'VERIFIED', 'RESOLVED', 'DISMISSED'],
    default: 'ACTIVE',
    index: true
  },
  upvotes: { type: Number, default: 0 },
  expiresAt: { type: Date }
}, {
  timestamps: true
});

RoadHazardSchema.index({ location: '2dsphere' });
RoadHazardSchema.index({ createdAt: -1 });

export default mongoose.model<IRoadHazard>('RoadHazard', RoadHazardSchema);
