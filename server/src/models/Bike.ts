import mongoose, { Schema } from 'mongoose';

export interface IBike {
  userId: mongoose.Types.ObjectId;
  brand: string;
  model: string;
  registrationNumber: string;
  year: number;
  fuelType: 'PETROL' | 'ELECTRIC';
  vin?: string;
  engineCc?: number;
  odometerKm?: number;
  insuranceExpiry?: Date;
  pucExpiry?: Date;
  maintenanceReminders?: {
    chainLubeDueKm?: number;
    oilServiceDueKm?: number;
    tyreCheckDate?: Date;
  };
  qrToken?: string;
  activeSubscriptionId?: string;
  isPrimary: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const BikeSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  year: { type: Number, required: true },
  fuelType: { type: String, enum: ['PETROL', 'ELECTRIC'], default: 'PETROL' },
  vin: { type: String },
  engineCc: { type: Number },
  odometerKm: { type: Number, default: 0 },
  insuranceExpiry: { type: Date },
  pucExpiry: { type: Date },
  maintenanceReminders: {
    chainLubeDueKm: { type: Number },
    oilServiceDueKm: { type: Number },
    tyreCheckDate: { type: Date }
  },
  qrToken: { type: String },
  activeSubscriptionId: { type: String },
  isPrimary: { type: Boolean, default: false },
  notes: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IBike>('Bike', BikeSchema);
