import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User, { UserRole } from '../models/User.js';
import ProviderProfile from '../models/ProviderProfile.js';
import AssistanceRequest, { RequestStatus } from '../models/AssistanceRequest.js';
import Bike from '../models/Bike.js';
import { mockStore } from '../services/mockStore.js';

export const getMetrics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const metrics = mockStore.getMetrics();
      res.status(200).json({ success: true, data: metrics });
      return;
    }

    const [totalUsers, totalBikes, totalProviders, pendingVerifications, activeRequests, totalRequests] = await Promise.all([
      User.countDocuments(),
      Bike.countDocuments(),
      ProviderProfile.countDocuments(),
      ProviderProfile.countDocuments({ verified: false }),
      AssistanceRequest.countDocuments({
        status: { $in: [RequestStatus.REQUESTED, RequestStatus.ACCEPTED, RequestStatus.EN_ROUTE, RequestStatus.IN_PROGRESS] }
      }),
      AssistanceRequest.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBikes,
        totalProviders,
        pendingVerifications,
        activeRequests,
        totalRequests
      }
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin metrics.' });
  }
};

export const getAdminHelpers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const providers = mockStore.getProviders();
      res.status(200).json({ success: true, data: providers });
      return;
    }

    const helpers = await ProviderProfile.find().populate('userId', 'name email phone').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: helpers });
  } catch (error) {
    console.error('Error fetching admin helpers:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve helpers list.' });
  }
};

export const verifyHelper = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // 'VERIFIED' | 'REJECTED'

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be VERIFIED or REJECTED.' });
      return;
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const updated = mockStore.verifyProvider(id, status);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Helper profile not found.' });
        return;
      }
      res.status(200).json({ success: true, data: updated });
      return;
    }

    const helper = await ProviderProfile.findByIdAndUpdate(
      id,
      { verified: status === 'VERIFIED' },
      { new: true }
    );

    if (!helper) {
      res.status(404).json({ success: false, message: 'Helper profile not found.' });
      return;
    }

    res.status(200).json({ success: true, data: helper });
  } catch (error) {
    console.error('Error updating helper verification:', error);
    res.status(500).json({ success: false, message: 'Failed to update helper verification.' });
  }
};

export const getAdminUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = req.query.role as UserRole | undefined;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      let users = mockStore.getUsers();
      if (role) {
        users = users.filter(u => u.role === role);
      }
      res.status(200).json({ success: true, data: users });
      return;
    }

    const query = role ? { role } : {};
    const users = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};
