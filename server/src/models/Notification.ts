import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'SYSTEM' | 'ASSISTANCE' | 'SOS' | 'HAZARD' | 'VERIFICATION';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['SYSTEM', 'ASSISTANCE', 'SOS', 'HAZARD', 'VERIFICATION'],
    default: 'SYSTEM'
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false, index: true },
  relatedEntityId: { type: String }
}, {
  timestamps: true
});

NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
