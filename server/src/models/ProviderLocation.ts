import mongoose, { Schema, Document } from 'mongoose';

export interface IProviderLocation extends Document {
  providerId: mongoose.Types.ObjectId;
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  heading?: number;
  speed?: number;
  isOnline: boolean;
  activeRequestId?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const ProviderLocationSchema: Schema = new Schema({
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  heading: { type: Number, min: 0, max: 360 },
  speed: { type: Number, min: 0 },
  isOnline: { type: Boolean, default: true, index: true },
  activeRequestId: { type: Schema.Types.ObjectId, ref: 'AssistanceRequest' }
}, {
  timestamps: true
});

ProviderLocationSchema.index({ location: '2dsphere' });

export default mongoose.model<IProviderLocation>('ProviderLocation', ProviderLocationSchema);
