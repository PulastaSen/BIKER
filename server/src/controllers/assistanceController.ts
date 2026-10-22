import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import AssistanceRequest, { 
  RequestStatus, 
  canTransition, 
  ALLOWED_TRANSITIONS, 
  normalizeStatus,
  LocationProvenance
} from '../models/AssistanceRequest.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { io } from '../server.js';
import { mockStore } from '../services/mockStore.js';

function generateRequestId() {
  return `REQ-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export const createAssistanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      problemCategory, 
      helpCategory = 'MECHANICAL', 
      subcategory, 
      urgency = 'MEDIUM', 
      location, 
      providerId, 
      description, 
      towingDetails, 
      estimatedPrice,
      medicalDetails,
      bikeId,
      bikeDetails,
      coverageType = 'COMPLIMENTARY_YEAR_1',
      assignedProviderDetails,
      locationProvenance: provInput
    } = req.body;

    const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;
    const isMongoConnected = mongoose.connection.readyState === 1;

    // Automotive Idempotency Check: prevent duplicate dispatch on network retries
    if (idempotencyKey) {
      if (!isMongoConnected) {
        const existing = mockStore.findRequestByIdempotencyKey(idempotencyKey);
        if (existing) {
          res.status(200).json({ success: true, data: existing, idempotentReplay: true });
          return;
        }
      } else {
        const existing = await AssistanceRequest.findOne({ idempotencyKey });
        if (existing) {
          res.status(200).json({ success: true, data: existing, idempotentReplay: true });
          return;
        }
      }
    }

    const riderId = req.user?.id || req.body.riderId || 'user-rider-1';
    const requestId = generateRequestId();

    // Truthful Location Provenance: never invent coordinates
    const coordinates = location?.coordinates && location.coordinates.length === 2 && (location.coordinates[0] !== 0 || location.coordinates[1] !== 0)
      ? location.coordinates
      : [0, 0];
    
    const locationProvenance: LocationProvenance = provInput || (
      coordinates[0] !== 0 ? (location?.accuracyMeters ? 'GPS_FRESH' : 'GPS_STALE') :
      (location?.address ? 'MANUAL_LANDMARK' : 'UNAVAILABLE')
    );

    // Price calculation matching manufacturer transparency
    const defaultPricing = {
      calloutFee: 150,
      travelFee: 100,
      serviceFee: problemCategory === 'Towing' ? 500 : 100,
      estimatedTotal: problemCategory === 'Towing' ? 750 : 350,
      isAvailable: true,
      disclaimer: 'Labor & towing up to 50km covered under RSA scope. Consumables, fuel, and spare parts payable at actuals.'
    };

    const finalPricing = estimatedPrice || defaultPricing;

    if (!isMongoConnected) {
      const mockReq = mockStore.createAssistanceRequest({
        requestId,
        idempotencyKey,
        riderId,
        providerId: providerId || undefined,
        assignedProviderDetails,
        problemCategory: problemCategory || 'Breakdown',
        description,
        location: {
          type: 'Point',
          coordinates,
          address: location?.address || (coordinates[0] === 0 ? 'Location pending' : 'Rider Location'),
          accuracyMeters: location?.accuracyMeters
        },
        locationProvenance,
        status: RequestStatus.SUBMITTED,
        estimatedPrice: finalPricing,
        towingDetails: towingDetails || undefined,
        helpCategory,
        subcategory,
        urgency,
        medicalDetails,
        bikeId,
        bikeDetails,
        coverageType
      });

      io.emit('assistance:new_request', mockReq);
      io.emit('assistance:created', mockReq);
      res.status(201).json({ success: true, data: mockReq });
      return;
    }

    const incident = new AssistanceRequest({
      requestId,
      idempotencyKey,
      riderId,
      bikeId,
      bikeDetails,
      coverageType,
      providerId: providerId || undefined,
      assignedProviderDetails,
      problemCategory: problemCategory || helpCategory,
      helpCategory,
      subcategory,
      urgency,
      description,
      location: {
        type: 'Point',
        coordinates,
        address: location?.address,
        accuracyMeters: location?.accuracyMeters
      },
      locationProvenance,
      medicalDetails,
      status: RequestStatus.SUBMITTED,
      estimatedPrice: finalPricing,
      towingDetails,
      timeline: [
        { status: 'SUBMITTED', timestamp: new Date(), notes: 'Incident request submitted by rider' }
      ],
      auditEvents: [
        {
          actor: 'RIDER',
          action: 'INCIDENT_SUBMITTED',
          newStatus: 'SUBMITTED',
          timestamp: new Date(),
          notes: 'Incident created via mobile client'
        }
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
    const { status, providerId, providerDetails, notes, actor = 'SYSTEM' } = req.body;

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
        case RequestStatus.RESOLVED:
        case RequestStatus.COMPLETED:
          io.emit('assistance:completed', payload);
          break;
        case RequestStatus.CANCELLED:
          io.emit('assistance:cancelled', payload);
          break;
        case RequestStatus.UNFULFILLED_NO_PROVIDER:
          io.emit('assistance:unfulfilled', payload);
          break;
      }
    };

    if (!isMongoConnected) {
      const current = mockStore.getRequestById(id);
      if (!current) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }

      // Automotive State Machine Enforcement: verify transition
      if (!canTransition(current.status, status)) {
        const allowed = ALLOWED_TRANSITIONS[current.status] || ALLOWED_TRANSITIONS[normalizeStatus(current.status)] || [];
        res.status(409).json({ 
          success: false, 
          message: `Invalid state transition from ${current.status} to ${status}. Allowed: ${allowed.join(', ') || 'None (terminal)'}`,
          currentStatus: current.status,
          attemptedStatus: status,
          allowedTransitions: allowed
        });
        return;
      }

      const updated = mockStore.updateRequestStatus(id, status, providerId, notes, actor, providerDetails);
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

    // Automotive State Machine Enforcement
    if (!canTransition(request.status, status)) {
      const allowed = ALLOWED_TRANSITIONS[request.status] || ALLOWED_TRANSITIONS[normalizeStatus(request.status)] || [];
      res.status(409).json({ 
        success: false, 
        message: `Invalid state transition from ${request.status} to ${status}. Allowed: ${allowed.join(', ') || 'None (terminal)'}`,
        currentStatus: request.status,
        attemptedStatus: status,
        allowedTransitions: allowed
      });
      return;
    }

    const previousStatus = request.status;
    request.status = status;
    if (providerId) {
      request.providerId = providerId;
    }
    if (providerDetails) {
      request.assignedProviderDetails = providerDetails;
    }
    request.timeline.push({
      status,
      timestamp: new Date(),
      notes: notes || `Status updated to ${status}`
    });
    if (!request.auditEvents) request.auditEvents = [];
    request.auditEvents.push({
      actor: actor as any,
      action: 'STATUS_TRANSITION',
      previousStatus,
      newStatus: status,
      timestamp: new Date(),
      notes: notes || `Status changed from ${previousStatus} to ${status}`
    });
    await request.save();

    emitStatusSpecificEvents(request);
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

export const escalateAssistanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { reason = 'No provider responded within timeout window. Escalated to 24/7 Helpline Desk.', actor = 'SYSTEM' } = req.body;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const escalated = mockStore.escalateAssistanceRequest(id, reason, actor as any);
      if (!escalated) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }
      io.emit(`assistance:updated:${id}`, escalated);
      io.emit('assistance:escalated', escalated);
      res.status(200).json({ success: true, data: escalated });
      return;
    }

    const request = await AssistanceRequest.findOne({ requestId: id });
    if (!request) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    const prevStatus = request.status;
    request.status = RequestStatus.UNFULFILLED_NO_PROVIDER;
    request.escalationDetails = {
      escalatedToHelpline: true,
      helplinePhone: '1800 2100 007',
      escalatedAt: new Date(),
      notes: reason
    };
    request.timeline.push({ status: 'UNFULFILLED_NO_PROVIDER', timestamp: new Date(), notes: `Escalated: ${reason}` });
    if (!request.auditEvents) request.auditEvents = [];
    request.auditEvents.push({
      actor: actor as any,
      action: 'ESCALATION_TO_HELPLINE',
      previousStatus: prevStatus,
      newStatus: 'UNFULFILLED_NO_PROVIDER',
      timestamp: new Date(),
      notes: reason
    });
    await request.save();

    io.emit(`assistance:updated:${id}`, request);
    io.emit('assistance:escalated', request);
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Error escalating request:', error);
    res.status(500).json({ success: false, message: 'Failed to escalate request' });
  }
};

export const disputeAssistanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { reason, disputedAmount = 0 } = req.body;
    if (!reason) {
      res.status(400).json({ success: false, message: 'Dispute reason is required' });
      return;
    }
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const disputed = mockStore.disputeAssistanceRequest(id, reason, disputedAmount);
      if (!disputed) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }
      io.emit(`assistance:updated:${id}`, disputed);
      res.status(200).json({ success: true, data: disputed });
      return;
    }

    const request = await AssistanceRequest.findOne({ requestId: id });
    if (!request) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    request.disputeDetails = {
      disputed: true,
      reason,
      disputedAmount,
      status: 'REVIEW_PENDING',
      reportedAt: new Date()
    };
    if (!request.auditEvents) request.auditEvents = [];
    request.auditEvents.push({
      actor: 'RIDER',
      action: 'DISPUTE_FILED',
      timestamp: new Date(),
      notes: `Dispute filed: ${reason} (Amount: ₹${disputedAmount})`
    });
    await request.save();

    io.emit(`assistance:updated:${id}`, request);
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Error filing dispute:', error);
    res.status(500).json({ success: false, message: 'Failed to file dispute' });
  }
};

export const cancelAssistanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { reason = 'Cancelled by user', actor = 'RIDER' } = req.body;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const cancelled = mockStore.cancelAssistanceRequest(id, reason, actor as any);
      if (!cancelled) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }
      io.emit(`assistance:updated:${id}`, cancelled);
      io.emit('assistance:cancelled', cancelled);
      res.status(200).json({ success: true, data: cancelled });
      return;
    }

    const request = await AssistanceRequest.findOne({ requestId: id });
    if (!request) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    const prevStatus = request.status;
    request.status = RequestStatus.CANCELLED;
    request.cancellationReason = reason;
    request.timeline.push({ status: 'CANCELLED', timestamp: new Date(), notes: `Cancelled: ${reason}` });
    if (!request.auditEvents) request.auditEvents = [];
    request.auditEvents.push({
      actor: actor as any,
      action: 'INCIDENT_CANCELLED',
      previousStatus: prevStatus,
      newStatus: 'CANCELLED',
      timestamp: new Date(),
      notes: reason
    });
    await request.save();

    io.emit(`assistance:updated:${id}`, request);
    io.emit('assistance:cancelled', request);
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel request' });
  }
};

export const getOperationsQueue = async (_req: Request, res: Response): Promise<void> => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const queue = mockStore.getOperationsQueue();
      res.status(200).json({ success: true, data: queue });
      return;
    }

    const all = await AssistanceRequest.find().sort({ createdAt: -1 }).limit(100);
    const now = Date.now();
    const queue = {
      unassigned: all.filter(r => ['SUBMITTED', 'REQUESTED', 'ACKNOWLEDGED', 'SEARCHING', 'OFFERED', 'ASSIGNED'].includes(r.status)),
      active: all.filter(r => ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(r.status)),
      delayed: all.filter(r => {
        if (!['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(r.status)) return false;
        const updatedTime = new Date(r.updatedAt).getTime();
        return (now - updatedTime) > 15 * 60 * 1000;
      }),
      unfulfilled: all.filter(r => r.status === 'UNFULFILLED_NO_PROVIDER'),
      cancelled: all.filter(r => r.status === 'CANCELLED'),
      resolved: all.filter(r => ['RESOLVED', 'COMPLETED'].includes(r.status)),
      total: all.length
    };

    res.status(200).json({ success: true, data: queue });
  } catch (error) {
    console.error('Error fetching operations queue:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch operations queue' });
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
    const categoryFilter = (req.query.category as string) || (req.query.helpCategory as string) || 'ALL';
    const brandFilter = (req.query.brand as string) || '';

    if (!isMongoConnected) {
      let mockProviders = mockStore.getProviders();
      if (categoryFilter && categoryFilter !== 'ALL' && categoryFilter !== 'BOTH') {
        const lower = categoryFilter.toLowerCase();
        mockProviders = mockProviders.filter((p) => {
          if (lower === 'mechanical') return p.services.some(s => s.toLowerCase().includes('puncture') || s.toLowerCase().includes('engine') || s.toLowerCase().includes('chain') || s.toLowerCase().includes('mechanic'));
          if (lower === 'towing' || lower === 'recovery') return p.services.some(s => s.toLowerCase().includes('tow'));
          if (lower === 'battery') return p.services.some(s => s.toLowerCase().includes('battery'));
          if (lower === 'fuel') return p.services.some(s => s.toLowerCase().includes('fuel'));
          return true;
        });
      }

      if (brandFilter) {
        const bLower = brandFilter.toLowerCase();
        mockProviders.sort((a, b) => {
          const aMatches = a.name.toLowerCase().includes(bLower) || a.businessName.toLowerCase().includes(bLower);
          const bMatches = b.name.toLowerCase().includes(bLower) || b.businessName.toLowerCase().includes(bLower);
          if (aMatches && !bMatches) return -1;
          if (!aMatches && bMatches) return 1;
          return 0;
        });
      }

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
