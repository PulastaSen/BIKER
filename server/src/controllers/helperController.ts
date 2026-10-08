import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ProviderProfile from '../models/ProviderProfile.js';
import ProviderVerification from '../models/ProviderVerification.js';
import ProviderLocation from '../models/ProviderLocation.js';
import AssistanceRequest, { RequestStatus } from '../models/AssistanceRequest.js';
import { mockStore } from '../services/mockStore.js';
import { io } from '../server.js';

export const getHelperProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user-helper-1';
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      // Find matching provider or return default helper
      const provider = mockStore.getProviders()[0];
      res.status(200).json({ success: true, data: provider });
      return;
    }

    const profile = await ProviderProfile.findOne({ userId });
    if (!profile) {
      res.status(404).json({ success: false, message: 'Helper profile not found.' });
      return;
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching helper profile:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving helper profile.' });
  }
};

export const updateAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isOpen } = req.body;
    const providerId = (req.body.providerId as string) || 'provider-1';
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const updated = mockStore.setProviderAvailability(providerId, Boolean(isOpen));
      res.status(200).json({ success: true, data: updated });
      return;
    }

    const profile = await ProviderProfile.findOneAndUpdate(
      { _id: providerId },
      { isOpen: Boolean(isOpen) },
      { new: true }
    );

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ success: false, message: 'Failed to update helper availability.' });
  }
};

export const getHelperRequestsFeed = async (_req: Request, res: Response): Promise<void> => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const all = mockStore.getAllRequests();
      res.status(200).json({ success: true, data: all });
      return;
    }

    const requests = await AssistanceRequest.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching helper requests feed:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assistance requests.' });
  }
};

export const acceptAssistanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const providerId = req.body.providerId || 'provider-1';
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const updated = mockStore.updateRequestStatus(id, RequestStatus.ACCEPTED, providerId);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Request not found.' });
        return;
      }
      io.emit(`assistance:updated:${updated.requestId}`, updated);
      res.status(200).json({ success: true, data: updated });
      return;
    }

    const request = await AssistanceRequest.findOne({ requestId: id });
    if (!request) {
      res.status(404).json({ success: false, message: 'Request not found.' });
      return;
    }

    request.status = RequestStatus.ACCEPTED;
    request.providerId = providerId;
    if (!request.liveTracking) {
      request.liveTracking = { isTrackingActive: true };
    } else {
      request.liveTracking.isTrackingActive = true;
    }
    await request.save();

    io.emit(`assistance:updated:${request.requestId}`, request);
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ success: false, message: 'Failed to accept assistance request.' });
  }
};

// Section 4 & 5: Helper Verification Profile & Badges
export const getHelperVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || (req.query.userId as string) || 'user-helper-1';
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      // Mock verified helper trust profile
      res.status(200).json({
        success: true,
        data: {
          verificationId: 'VERIF-H-001',
          providerId: userId,
          businessName: 'Raj Motors & Mountain Rescue',
          ownerName: 'Rajesh Sharma',
          phone: '+91 98320 12345',
          phoneVerified: true,
          businessVerified: true,
          identityVerified: true,
          adminApproved: true,
          status: 'VERIFIED',
          services: ['Mechanical', 'Towing', 'Battery', 'Puncture', 'Fuel'],
          rating: 4.9,
          completedJobs: 142,
          responseRate: '98%',
          averageResponseMinutes: 8,
          isAvailable: true
        }
      });
      return;
    }

    const verif = await ProviderVerification.findOne({ providerId: userId });
    res.status(200).json({ success: true, data: verif });
  } catch (error) {
    console.error('Error fetching helper verification:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve helper verification.' });
  }
};

export const submitHelperVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.body.userId || 'user-helper-1';
    const {
      businessName,
      ownerName,
      phone,
      businessRegistrationNumber,
      tradeLicenseNumber,
      gstin
    } = req.body;

    if (!businessName || !ownerName || !phone) {
      res.status(400).json({ success: false, message: 'businessName, ownerName, and phone are required' });
      return;
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      res.status(200).json({
        success: true,
        message: 'Verification submitted for review',
        data: {
          verificationId: 'VERIF-H-NEW',
          providerId: userId,
          businessName,
          ownerName,
          phone,
          phoneVerified: true,
          businessVerified: Boolean(businessRegistrationNumber),
          identityVerified: true,
          adminApproved: false,
          status: 'PENDING_VERIFICATION'
        }
      });
      return;
    }

    const verif = await ProviderVerification.findOneAndUpdate(
      { providerId: userId },
      {
        businessName,
        ownerName,
        phone,
        businessRegistrationNumber,
        tradeLicenseNumber,
        gstin,
        status: 'PENDING_VERIFICATION'
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: 'Verification submitted for review', data: verif });
  } catch (error) {
    console.error('Error submitting helper verification:', error);
    res.status(500).json({ success: false, message: 'Failed to submit helper verification.' });
  }
};

// Section 14 & 15: Helper Live Location Stream
export const updateHelperLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const providerId = req.user?.id || req.body.providerId || 'provider-1';
    const { requestId, latitude, longitude, heading, speed, accuracy } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      res.status(400).json({ success: false, message: 'latitude and longitude must be numbers' });
      return;
    }

    const timestamp = new Date().toISOString();
    const locationPayload = {
      requestId,
      providerId,
      latitude,
      longitude,
      heading,
      speed,
      accuracy,
      timestamp
    };

    // Broadcast via Socket.IO directly to active incident room
    if (io) {
      if (requestId) {
        io.to(`incident:${requestId}`).emit('provider:location:update', locationPayload);
        io.emit(`assistance:location:${requestId}`, locationPayload);
      }
      io.emit(`helper:location:${providerId}`, locationPayload);
    }

    const isMongoConnected = mongoose.connection.readyState === 1;
    if (isMongoConnected) {
      await ProviderLocation.findOneAndUpdate(
        { providerId },
        {
          location: { type: 'Point', coordinates: [longitude, latitude] },
          heading,
          speed,
          isOnline: true,
          activeRequestId: requestId
        },
        { upsert: true }
      );

      if (requestId) {
        await AssistanceRequest.findOneAndUpdate(
          { requestId },
          {
            'liveTracking.lastProviderCoordinates': [longitude, latitude],
            'liveTracking.heading': heading,
            'liveTracking.speed': speed,
            'liveTracking.updatedAt': new Date()
          }
        );
      }
    }

    res.status(200).json({ success: true, data: locationPayload });
  } catch (error) {
    console.error('Error updating helper location:', error);
    res.status(500).json({ success: false, message: 'Failed to update helper location.' });
  }
};
