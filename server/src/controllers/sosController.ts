import { Request, Response } from 'express';
import mongoose from 'mongoose';
import SOSIncident, { SOSStatus } from '../models/SOSIncident.js';
import { io } from '../server.js';
import crypto from 'crypto';
import { mockStore } from '../services/mockStore.js';

function generateIncidentId() {
  return `MA-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export const createSOS = async (req: Request, res: Response): Promise<void> => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.body.userId || 'user-rider-1';
    const incidentId = generateIncidentId();
    const hasLocation = latitude && longitude;
    const notificationStatus = 'Notification service not configured';

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const mockInc = mockStore.createSOS({
        incidentId,
        userId,
        status: 'ACTIVE',
        notificationStatus,
        location: hasLocation ? {
          type: 'Point',
          coordinates: [longitude, latitude]
        } : undefined
      });

      io.emit('sos:created', {
        incidentId: mockInc.incidentId,
        location: mockInc.location,
        status: mockInc.status,
        timestamp: mockInc.createdAt
      });

      res.status(201).json({
        success: true,
        data: mockInc
      });
      return;
    }

    const incident = new SOSIncident({
      incidentId,
      userId,
      location: hasLocation ? {
        type: 'Point',
        coordinates: [longitude, latitude]
      } : undefined,
      contactsNotified: false,
      notificationStatus
    });

    await incident.save();

    io.emit('sos:created', {
      incidentId: incident.incidentId,
      location: incident.location,
      status: incident.status,
      timestamp: incident.createdAt
    });

    res.status(201).json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('SOS Creation Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating SOS' });
  }
};

export const cancelSOS = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const cancelled = mockStore.cancelSOS(id);
      if (!cancelled) {
        res.status(404).json({ success: false, message: 'Active SOS incident not found' });
        return;
      }
      io.emit('sos:cancelled', { incidentId: cancelled.incidentId });
      res.status(200).json({
        success: true,
        data: cancelled
      });
      return;
    }
    
    const incident = await SOSIncident.findOne({ incidentId: id, status: SOSStatus.ACTIVE });
    if (!incident) {
      res.status(404).json({ success: false, message: 'Active SOS incident not found' });
      return;
    }

    incident.status = SOSStatus.CANCELLED;
    await incident.save();

    io.emit('sos:cancelled', { incidentId: incident.incidentId });

    res.status(200).json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('SOS Cancel Error:', error);
    res.status(500).json({ success: false, message: 'Server error cancelling SOS' });
  }
};

export const getActiveSOS = async (req: Request, res: Response): Promise<void> => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const active = mockStore.getActiveSOS();
      if (!active) {
        res.status(404).json({ success: false, message: 'No active SOS' });
        return;
      }
      res.status(200).json({
        success: true,
        data: active
      });
      return;
    }

    const userIdRaw = typeof req.query.userId === 'string' ? req.query.userId : '60d5ecb8b392d7001f3e9a01';
    const userId = mongoose.Types.ObjectId.isValid(userIdRaw) ? new mongoose.Types.ObjectId(userIdRaw) : new mongoose.Types.ObjectId('60d5ecb8b392d7001f3e9a01');
    const incident = await SOSIncident.findOne({ userId, status: SOSStatus.ACTIVE });
    
    if (!incident) {
      res.status(404).json({ success: false, message: 'No active SOS' });
      return;
    }

    res.status(200).json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('SOS Get Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching SOS' });
  }
};

