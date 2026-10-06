import mongoose, { Schema, Document } from 'mongoose';

export interface IProviderProfile extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  services: string[];
  startingPrice: number;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, required: true },
  verified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: { type: String }
  },
  services: [{ type: String }],
  startingPrice: { type: Number, required: true },
  isOpen: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Create a 2dsphere index for geospatial queries
ProviderProfileSchema.index({ location: '2dsphere' });

export default mongoose.model<IProviderProfile>('ProviderProfile', ProviderProfileSchema);
