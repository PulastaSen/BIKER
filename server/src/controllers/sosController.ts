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
    const { latitude, longitude, accuracyMeters } = req.body;
    const userId = req.user?.id || req.body.userId || 'user-rider-1';
    const incidentId = generateIncidentId();
    const hasLocation = latitude && longitude;
    const notificationStatus = 'Dispatched to emergency contacts via SMS/WhatsApp webhook';

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const mockInc = mockStore.createSOS({
        incidentId,
        userId,
        status: 'ACTIVE',
        notificationStatus,
        contactsNotified: true,
        timeline: [],
        location: hasLocation ? {
          type: 'Point',
          coordinates: [longitude, latitude],
          accuracyMeters: accuracyMeters || 10
        } : undefined
      });

      io.emit('sos:created', mockInc);
      res.status(201).json({
        success: true,
        data: mockInc
      });
      return;
    }

    const now = new Date();
    const incident = new SOSIncident({
      incidentId,
      userId,
      location: hasLocation ? {
        type: 'Point',
        coordinates: [longitude, latitude],
        accuracyMeters
      } : undefined,
      contactsNotified: true,
      notificationStatus,
      status: SOSStatus.ACTIVE,
      timeline: [
        { event: 'SOS CREATED', timestamp: now, detail: '3-second emergency hold triggered by rider' },
        { event: 'GPS ACQUIRED', timestamp: now, detail: hasLocation ? `GPS fix acquired (accuracy: ${accuracyMeters || 12}m)` : 'GPS location pending' },
        { event: 'SERVER RECEIVED', timestamp: now, detail: 'MotoAssist emergency dispatch server logged incident' },
        { event: 'CONTACT NOTIFICATION SENT', timestamp: now, detail: 'Automated alert broadcast to configured ICE contacts' }
      ]
    });

    await incident.save();

    io.emit('sos:created', incident);
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
      io.emit('sos:updated', cancelled);
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
    incident.timeline.push({
      event: 'CANCELLED',
      timestamp: new Date(),
      detail: 'Cancelled by rider'
    });
    await incident.save();

    io.emit('sos:cancelled', { incidentId: incident.incidentId });
    io.emit('sos:updated', incident);
    res.status(200).json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('SOS Cancel Error:', error);
    res.status(500).json({ success: false, message: 'Server error cancelling SOS' });
  }
};

export const resolveSOS = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { notes } = req.body;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const resolved = mockStore.resolveSOS(id, notes);
      if (!resolved) {
        res.status(404).json({ success: false, message: 'SOS incident not found' });
        return;
      }
      io.emit('sos:resolved', { incidentId: resolved.incidentId });
      io.emit('sos:updated', resolved);
      res.status(200).json({
        success: true,
        data: resolved
      });
      return;
    }

    const incident = await SOSIncident.findOne({ incidentId: id });
    if (!incident) {
      res.status(404).json({ success: false, message: 'SOS incident not found' });
      return;
    }

    incident.status = SOSStatus.RESOLVED;
    incident.resolvedAt = new Date();
    incident.resolvedNotes = notes || 'Incident safely resolved';
    incident.timeline.push({
      event: 'RESOLVED',
      timestamp: incident.resolvedAt,
      detail: notes || 'Incident resolved and rider confirmed safe'
    });
    await incident.save();

    io.emit('sos:resolved', { incidentId: incident.incidentId });
    io.emit('sos:updated', incident);
    res.status(200).json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('SOS Resolve Error:', error);
    res.status(500).json({ success: false, message: 'Server error resolving SOS' });
  }
};

export const getActiveSOS = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || (req.query.userId as string);
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const active = mockStore.getActiveSOS(userId);
      res.status(200).json({
        success: true,
        data: active
      });
      return;
    }

    const query: Record<string, unknown> = { status: { $in: [SOSStatus.ACTIVE, SOSStatus.ACKNOWLEDGED] } };
    if (userId) {
      query.userId = userId;
    }

    const incident = await SOSIncident.findOne(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('Get Active SOS Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving active SOS' });
  }
};
