import mongoose, { Schema, Document } from 'mongoose';

export type PlanTier = 'FREEDOM' | 'COMMUTER' | 'TOURING_PRO' | 'HILL_EXPLORER';

export interface ISubscription extends Document {
  subscriptionId: string;
  userId: mongoose.Types.ObjectId;
  planTier: PlanTier;
  planName: string;
  priceInr: number;
  durationMonths: number;
  linkedBike: {
    bikeId: string;
    brand: string;
    model: string;
    registrationNumber: string;
  };
  features: {
    maxFreeBreakdowns: number;
    usedBreakdowns: number;
    towingDistanceLimitKm: number;
    includesPunctureRepair: boolean;
    includesBatteryJumpstart: boolean;
    includesMinorMechanicalLabor: boolean;
    includesFuelDeliveryLabor: boolean;
    includesMountainWinchRecovery: boolean;
    highwayPriorityDispatch: boolean;
  };
  waitingPeriodHours: number;
  startDate: Date;
  endDate: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  paymentDetails: {
    paymentMode: 'TEST_DEMO' | 'RAZORPAY' | 'STRIPE';
    transactionRef: string;
    paidAmount: number;
    paidAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema({
  subscriptionId: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  planTier: { 
    type: String, 
    required: true, 
    enum: ['FREEDOM', 'COMMUTER', 'TOURING_PRO', 'HILL_EXPLORER'] 
  },
  planName: { type: String, required: true },
  priceInr: { type: Number, required: true },
  durationMonths: { type: Number, required: true, default: 12 },
  linkedBike: {
    bikeId: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    registrationNumber: { type: String, required: true }
  },
  features: {
    maxFreeBreakdowns: { type: Number, default: 2 },
    usedBreakdowns: { type: Number, default: 0 },
    towingDistanceLimitKm: { type: Number, default: 25 },
    includesPunctureRepair: { type: Boolean, default: true },
    includesBatteryJumpstart: { type: Boolean, default: true },
    includesMinorMechanicalLabor: { type: Boolean, default: true },
    includesFuelDeliveryLabor: { type: Boolean, default: false },
    includesMountainWinchRecovery: { type: Boolean, default: false },
    highwayPriorityDispatch: { type: Boolean, default: false }
  },
  waitingPeriodHours: { type: Number, default: 48 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'], 
    default: 'ACTIVE',
    index: true 
  },
  paymentDetails: {
    paymentMode: { type: String, default: 'TEST_DEMO' },
    transactionRef: { type: String, required: true },
    paidAmount: { type: Number, required: true },
    paidAt: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
