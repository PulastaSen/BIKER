import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ProviderProfile from '../models/ProviderProfile.js';
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
    await request.save();

    io.emit(`assistance:updated:${request.requestId}`, request);
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ success: false, message: 'Failed to accept assistance request.' });
  }
};
