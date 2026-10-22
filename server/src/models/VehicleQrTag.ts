import mongoose, { Schema } from 'mongoose';

export interface IVehicleQrTag {
  token: string;
  userId: mongoose.Types.ObjectId;
  bikeId: string;
  vehicleNickname: string;
  brand: string;
  model: string;
  registrationNumber: string;
  emergencyInstructions?: string;
  allowPublicContact: boolean;
  contactRequests: Array<{
    id: string;
    requestType: 'PARKED_OBSTRUCTION' | 'LIGHTS_ON' | 'VEHICLE_TIPPED' | 'ACCIDENT_EMERGENCY' | 'GENERAL_MESSAGE';
    senderName?: string;
    senderPhone?: string;
    message: string;
    locationPin?: {
      lat: number;
      lng: number;
      address?: string;
    };
    createdAt: Date;
    read: boolean;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleQrTagSchema: Schema = new Schema({
  token: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bikeId: { type: String, required: true, index: true },
  vehicleNickname: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  emergencyInstructions: { type: String, default: 'In case of emergency or accident, please contact national emergency services at 112 immediately.' },
  allowPublicContact: { type: Boolean, default: true },
  contactRequests: [{
    id: { type: String, required: true },
    requestType: { 
      type: String, 
      enum: ['PARKED_OBSTRUCTION', 'LIGHTS_ON', 'VEHICLE_TIPPED', 'ACCIDENT_EMERGENCY', 'GENERAL_MESSAGE'],
      required: true 
    },
    senderName: { type: String },
    senderPhone: { type: String },
    message: { type: String, required: true },
    locationPin: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String }
    },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<IVehicleQrTag>('VehicleQrTag', VehicleQrTagSchema);
