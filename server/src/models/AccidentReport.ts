import mongoose, { Schema, Document } from 'mongoose';

export interface IAccidentReport extends Document {
  reportId: string;
  userId: mongoose.Types.ObjectId;
  bikeId?: mongoose.Types.ObjectId;
  incidentTime: Date;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    address?: string;
  };
  riderSafe: boolean;
  injuriesReported: boolean;
  emergencyServicesContacted: boolean;
  photos: string[];
  bikeDamage: string;
  otherVehicles: string;
  witnessInfo: string;
  roadCondition: string;
  insuranceClaimStarted: boolean;
  insurancePolicyNumber?: string;
  towingRequested: boolean;
  notes?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'RESOLVED';
  createdAt: Date;
  updatedAt: Date;
}

const AccidentReportSchema: Schema = new Schema({
  reportId: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bikeId: { type: Schema.Types.ObjectId, ref: 'Bike' },
  incidentTime: { type: Date, required: true, default: Date.now },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String }
  },
  riderSafe: { type: Boolean, default: true },
  injuriesReported: { type: Boolean, default: false },
  emergencyServicesContacted: { type: Boolean, default: false },
  photos: [{ type: String }],
  bikeDamage: { type: String, required: true },
  otherVehicles: { type: String, default: 'None' },
  witnessInfo: { type: String, default: 'None' },
  roadCondition: { type: String, default: 'Dry Asphalt' },
  insuranceClaimStarted: { type: Boolean, default: false },
  insurancePolicyNumber: { type: String },
  towingRequested: { type: Boolean, default: false },
  notes: { type: String },
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'RESOLVED'],
    default: 'SUBMITTED'
  }
}, {
  timestamps: true
});

AccidentReportSchema.index({ 'location': '2dsphere' });

export default mongoose.model<IAccidentReport>('AccidentReport', AccidentReportSchema);
