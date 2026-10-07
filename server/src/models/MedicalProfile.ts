import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalProfile extends Document {
  userId: mongoose.Types.ObjectId;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'UNKNOWN';
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  emergencyNotes?: string;
  organDonor?: boolean;
  shareWithEmergencyResponders: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
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
  shareWithEmergencyResponders: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<IMedicalProfile>('MedicalProfile', MedicalProfileSchema);
