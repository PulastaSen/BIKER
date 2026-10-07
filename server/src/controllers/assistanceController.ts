import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import AssistanceRequest, { RequestStatus } from '../models/AssistanceRequest.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { io } from '../server.js';
import { mockStore } from '../services/mockStore.js';

function generateRequestId() {
  return `REQ-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export const createAssistanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemCategory, location, providerId, description } = req.body;
    const riderId = req.body.riderId || 'user-rider-1';
    const requestId = generateRequestId();

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const mockReq = mockStore.createAssistanceRequest({
        requestId,
        riderId,
        providerId: providerId || undefined,
        problemCategory: problemCategory || 'Breakdown',
        description,
        location: {
          type: 'Point',
          coordinates: location?.coordinates || [88.3953, 26.7271],
          address: location?.address || 'Siliguri Highway Corridor'
        },
        status: RequestStatus.REQUESTED
      });

      io.emit('assistance:new_request', mockReq);
      res.status(201).json({ success: true, data: mockReq });
      return;
    }

    const incident = new AssistanceRequest({
      requestId,
      riderId,
      providerId: providerId || undefined,
      problemCategory,
      description,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address
      }
    });

    await incident.save();

    io.emit('assistance:new_request', incident);
    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    console.error('Error creating assistance request:', error);
    res.status(500).json({ success: false, message: 'Failed to create request' });
  }
};

export const updateAssistanceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const validStatuses = Object.values(RequestStatus);
    if (!validStatuses.includes(status)) {
       res.status(400).json({ success: false, message: 'Invalid status' });
       return;
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const updated = mockStore.updateRequestStatus(id, status);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }
      io.emit(`assistance:updated:${updated.requestId}`, updated);
      res.status(200).json({ success: true, data: updated });
      return;
    }

    const request = await AssistanceRequest.findOne({ requestId: id });
    if (!request) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    request.status = status;
    await request.save();

    io.emit(`assistance:updated:${request.requestId}`, request);
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

export const getRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const reqData = mockStore.getRequestById(id);
      if (!reqData) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }
      res.status(200).json({ success: true, data: reqData });
      return;
    }

    const request = await AssistanceRequest.findOne({ requestId: id });
    if (!request) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch request' });
  }
};

export const getNearbyProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
       res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
       return;
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const mockProviders = mockStore.getProviders();
      res.status(200).json({ success: true, data: mockProviders });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusInMeters = 50 * 1000;

    const providers = await ProviderProfile.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusInMeters
        }
      },
      isOpen: true
    }).limit(20);

    const formattedProviders = providers.map(p => {
      return {
        id: p._id.toString(),
        name: p.businessName,
        verified: p.verified,
        rating: p.rating,
        distance: '< 5km',
        estimatedArrival: '15-20 mins',
        services: p.services,
        startingPrice: p.startingPrice,
        isOpen: p.isOpen
      };
    });

    res.status(200).json({ success: true, data: formattedProviders });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const rateAssistanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { rating, review } = req.body;

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const updated = mockStore.rateRequest(id, Number(rating), review);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }
      res.status(200).json({ success: true, data: updated });
      return;
    }
    
    const request = await AssistanceRequest.findOne({ requestId: id });

    if (!request) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    request.rating = rating;
    request.review = review;
    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

