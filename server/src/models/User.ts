import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  RIDER = 'RIDER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN'
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  profilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.RIDER },
  profilePhoto: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
