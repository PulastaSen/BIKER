import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  requestId: string;
  riderId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  requestId: { type: String, required: true, unique: true, index: true },
  riderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000 }
}, {
  timestamps: true
});

ReviewSchema.index({ providerId: 1, rating: -1 });

export default mongoose.model<IReview>('Review', ReviewSchema);
