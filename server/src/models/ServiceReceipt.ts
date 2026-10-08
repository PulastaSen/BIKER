import mongoose, { Schema, Document } from 'mongoose';

export interface IReceiptPart {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IServiceReceipt extends Document {
  receiptId: string;
  requestId: string;
  providerId: mongoose.Types.ObjectId;
  riderId: mongoose.Types.ObjectId;
  calloutFee: number;
  travelFee: number;
  laborFee: number;
  partsFee: number;
  taxes: number;
  total: number;
  parts: IReceiptPart[];
  serviceNotes?: string;
  paymentMethod: 'UPI' | 'CASH' | 'CARD' | 'PENDING';
  isPaid: boolean;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceReceiptSchema: Schema = new Schema({
  receiptId: { type: String, required: true, unique: true, index: true },
  requestId: { type: String, required: true, index: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  riderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  calloutFee: { type: Number, required: true, default: 0 },
  travelFee: { type: Number, required: true, default: 0 },
  laborFee: { type: Number, required: true, default: 0 },
  partsFee: { type: Number, required: true, default: 0 },
  taxes: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true },
  parts: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  }],
  serviceNotes: { type: String },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'CASH', 'CARD', 'PENDING'],
    default: 'UPI'
  },
  isPaid: { type: Boolean, default: false },
  issuedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model<IServiceReceipt>('ServiceReceipt', ServiceReceiptSchema);
