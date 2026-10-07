import mongoose, { Schema, Document } from 'mongoose';

export type MaintenanceServiceType = 
  | 'PERIODIC_SERVICE' 
  | 'OIL_CHANGE' 
  | 'BRAKE_PADS' 
  | 'CHAIN_SPROCKET' 
  | 'TYRE_REPLACEMENT' 
  | 'BATTERY_REPLACEMENT' 
  | 'SUSPENSION_SERVICE' 
  | 'OTHER';

export interface IMaintenanceRecord extends Document {
  bikeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  serviceType: MaintenanceServiceType;
  title: string;
  odometerReadingKm: number;
  serviceDate: Date;
  costInRupees?: number;
  serviceCenterName?: string;
  notes?: string;
  nextServiceDueMileageKm?: number;
  nextServiceDueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceRecordSchema: Schema = new Schema({
  bikeId: { type: Schema.Types.ObjectId, ref: 'Bike', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  serviceType: {
    type: String,
    enum: [
      'PERIODIC_SERVICE',
      'OIL_CHANGE',
      'BRAKE_PADS',
      'CHAIN_SPROCKET',
      'TYRE_REPLACEMENT',
      'BATTERY_REPLACEMENT',
      'SUSPENSION_SERVICE',
      'OTHER'
    ],
    default: 'PERIODIC_SERVICE'
  },
  title: { type: String, required: true },
  odometerReadingKm: { type: Number, required: true, min: 0 },
  serviceDate: { type: Date, required: true, default: Date.now },
  costInRupees: { type: Number, min: 0 },
  serviceCenterName: { type: String },
  notes: { type: String, maxlength: 1000 },
  nextServiceDueMileageKm: { type: Number },
  nextServiceDueDate: { type: Date }
}, {
  timestamps: true
});

MaintenanceRecordSchema.index({ bikeId: 1, serviceDate: -1 });

export default mongoose.model<IMaintenanceRecord>('MaintenanceRecord', MaintenanceRecordSchema);
