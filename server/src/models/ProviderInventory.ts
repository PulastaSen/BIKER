import mongoose, { Schema, Document } from 'mongoose';

export interface IProviderInventory extends Document {
  partId: string;
  providerId: mongoose.Types.ObjectId;
  partName: string;
  brand: string;
  modelCompatibility: string[];
  partNumber?: string;
  category: 'BRAKES' | 'CHAIN' | 'ELECTRICAL' | 'TYRES' | 'FILTERS' | 'FLUIDS' | 'BODY' | 'ENGINE' | 'OTHER';
  price: number;
  inStock: boolean;
  quantity: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderInventorySchema: Schema = new Schema({
  partId: { type: String, required: true, unique: true, index: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  partName: { type: String, required: true },
  brand: { type: String, required: true },
  modelCompatibility: [{ type: String, required: true }],
  partNumber: { type: String },
  category: {
    type: String,
    enum: ['BRAKES', 'CHAIN', 'ELECTRICAL', 'TYRES', 'FILTERS', 'FLUIDS', 'BODY', 'ENGINE', 'OTHER'],
    default: 'OTHER'
  },
  price: { type: Number, required: true },
  inStock: { type: Boolean, default: true },
  quantity: { type: Number, default: 1 },
  notes: { type: String }
}, {
  timestamps: true
});

ProviderInventorySchema.index({ partName: 'text', brand: 'text', modelCompatibility: 'text' });
ProviderInventorySchema.index({ providerId: 1, inStock: 1 });

export default mongoose.model<IProviderInventory>('ProviderInventory', ProviderInventorySchema);
