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
    const { problemCategory, location, providerId, description, towingDetails, estimatedPrice } = req.body;
    const riderId = req.user?.id || req.body.riderId || 'user-rider-1';
    const requestId = generateRequestId();

    const isMongoConnected = mongoose.connection.readyState === 1;

    // Price calculation
    const defaultPricing = {
      calloutFee: 150,
      travelFee: 100,
      serviceFee: problemCategory === 'Towing' ? 500 : 100,
      estimatedTotal: problemCategory === 'Towing' ? 750 : 350,
      isAvailable: true,
      disclaimer: 'Final price may change if additional parts or work are required.'
    };

    const finalPricing = estimatedPrice || defaultPricing;

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
          address: location?.address || 'Siliguri Highway Corridor',
          accuracyMeters: location?.accuracyMeters || 10
        },
        status: RequestStatus.REQUESTED,
        estimatedPrice: finalPricing,
        towingDetails: towingDetails || undefined
      });

      io.emit('assistance:new_request', mockReq);
      io.emit('assistance:created', mockReq);
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
        address: location.address,
        accuracyMeters: location.accuracyMeters
      },
      status: RequestStatus.REQUESTED,
      estimatedPrice: finalPricing,
      towingDetails,
      timeline: [
        { status: 'REQUESTED', timestamp: new Date(), notes: 'Assistance request logged' }
      ]
    });

    await incident.save();

    io.emit('assistance:new_request', incident);
    io.emit('assistance:created', incident);
    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    console.error('Error creating assistance request:', error);
    res.status(500).json({ success: false, message: 'Failed to create request' });
  }
};

export const updateAssistanceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, providerId, notes } = req.body;

    const validStatuses = Object.values(RequestStatus);
    if (!validStatuses.includes(status)) {
       res.status(400).json({ success: false, message: `Invalid status: ${status}` });
       return;
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    // Helper for specific socket event emission
    const emitStatusSpecificEvents = (payload: unknown) => {
      io.emit(`assistance:updated:${id}`, payload);
      switch (status) {
        case RequestStatus.ACCEPTED:
          io.emit('assistance:accepted', payload);
          break;
        case RequestStatus.EN_ROUTE:
          io.emit('assistance:en_route', payload);
          break;
        case RequestStatus.ARRIVED:
          io.emit('assistance:arrived', payload);
          break;
        case RequestStatus.IN_PROGRESS:
          io.emit('assistance:started', payload);
          break;
        case RequestStatus.COMPLETED:
          io.emit('assistance:completed', payload);
          break;
      }
    };

    if (!isMongoConnected) {
      const updated = mockStore.updateRequestStatus(id, status, providerId, notes);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }
      emitStatusSpecificEvents(updated);
      res.status(200).json({ success: true, data: updated });
      return;
    }

    const request = await AssistanceRequest.findOne({ requestId: id });
    if (!request) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    request.status = status;
    if (providerId) {
      request.providerId = providerId;
    }
    request.timeline.push({
      status,
      timestamp: new Date(),
      notes: notes || `Status updated to ${status}`
    });
    await request.save();

    emitStatusSpecificEvents(request);
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

    const request = await AssistanceRequest.findOne({ requestId: id })
      .populate('providerId', 'name businessName phone rating verificationStatus')
      .populate('riderId', 'name phone');

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
        businessName: p.businessName,
        verified: p.verified,
        verificationStatus: p.verificationStatus,
        identityVerified: p.identityVerified,
        businessVerified: p.businessVerified,
        phoneVerified: p.phoneVerified,
        adminApproved: p.adminApproved,
        rating: p.rating,
        completedJobs: p.completedJobs,
        averageResponseMinutes: p.averageResponseMinutes,
        distance: '< 5km',
        estimatedArrival: '15-20 mins',
        services: p.services,
        startingPrice: p.startingPrice,
        calloutFee: p.calloutFee,
        operatingHours: p.operatingHours,
        phone: p.phone,
        isOpen: p.isOpen
      };
    });

    res.status(200).json({ success: true, data: formattedProviders });
  } catch (error) {
    console.error('Error fetching nearby providers:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve providers' });
  }
};

export const rateAssistanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
      return;
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const updated = mockStore.rateRequest(id, rating, review);
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
    console.error('Error rating request:', error);
    res.status(500).json({ success: false, message: 'Failed to submit rating' });
  }
};
