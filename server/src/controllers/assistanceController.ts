import { Request, Response } from 'express';
import crypto from 'crypto';
import AssistanceRequest, { RequestStatus } from '../models/AssistanceRequest.js';
import { io } from '../server.js';

function generateRequestId() {
  return `REQ-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export const createAssistanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemCategory, location, providerId, description } = req.body;
    // Mock user if auth not ready
    const riderId = req.body.riderId || '60d5ecb8b392d7001f3e9a01'; 

    const incident = new AssistanceRequest({
      requestId: generateRequestId(),
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

    // Broadcast to the specific provider, or all providers if none selected
    io.emit('assistance:new_request', incident);

    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    console.error('Error creating assistance request:', error);
    res.status(500).json({ success: false, message: 'Failed to create request' });
  }
};

export const updateAssistanceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = Object.values(RequestStatus);
    if (!validStatuses.includes(status)) {
       res.status(400).json({ success: false, message: 'Invalid status' });
       return;
    }

    const request = await AssistanceRequest.findOne({ requestId: id });
    if (!request) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    request.status = status;
    await request.save();

    // Broadcast status change
    io.emit(`assistance:updated:${request.requestId}`, request);

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

export const getRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
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

import ProviderProfile from '../models/ProviderProfile.js';

export const getNearbyProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius = 50 } = req.query; // radius in km

    if (!lat || !lng) {
       res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
       return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusInMeters = parseFloat(radius as string) * 1000;

    const providers = await ProviderProfile.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude] // GeoJSON expects [lng, lat]
          },
          $maxDistance: radiusInMeters
        }
      },
      isOpen: true
    }).limit(20);

    // Format for the frontend
    const formattedProviders = providers.map(p => {
      // Very rough distance estimation since we are not using aggregation for exact distance
      // If we need exact distance, we could use aggregate pipeline with $geoNear
      return {
        id: p._id.toString(),
        name: p.businessName,
        verified: p.verified,
        rating: p.rating,
        distance: '< 5km', // We'll refine this later with true aggregate calculation if needed
        estimatedArrival: 'TBD',
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
    const { id } = req.params;
    const { rating, review } = req.body;
    
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
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
