import mongoose, { Schema, Document } from 'mongoose';

export type MedicalSharingPreference = 'NEVER' | 'EMERGENCY_ONLY' | 'TRUSTED_CONTACTS';

export interface IMedicalProfile extends Document {
  userId: mongoose.Types.ObjectId;
  fullName?: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'UNKNOWN';
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  emergencyNotes?: string;
  organDonor?: boolean;
  doctorName?: string;
  doctorContact?: string;
  preferredHospital?: string;
  sharingPreference: MedicalSharingPreference;
  shareWithEmergencyResponders: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  fullName: { type: String },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'],
    default: 'UNKNOWN'
  },
  allergies: { type: [String], default: [] },
  medications: { type: [String], default: [] },
  medicalConditions: { type: [String], default: [] },
  emergencyNotes: { type: String, maxlength: 500 },
  organDonor: { type: Boolean, default: false },
  doctorName: { type: String },
  doctorContact: { type: String },
  preferredHospital: { type: String },
  sharingPreference: {
    type: String,
    enum: ['NEVER', 'EMERGENCY_ONLY', 'TRUSTED_CONTACTS'],
    default: 'EMERGENCY_ONLY'
  },
  shareWithEmergencyResponders: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<IMedicalProfile>('MedicalProfile', MedicalProfileSchema);
