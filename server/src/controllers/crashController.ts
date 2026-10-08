import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import CrashDetectionEvent, { CrashConfidence, CrashUserResponse } from '../models/CrashDetectionEvent.js';
import SOSIncident, { SOSStatus } from '../models/SOSIncident.js';
import { io } from '../server.js';

function generateEventId() {
  return `CRASH-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

// In-memory mock store fallback if MongoDB is offline
interface MockCrashEvent {
  eventId: string;
  userId: string;
  confidence: CrashConfidence;
  confidenceScore: number;
  impactForceG?: number;
  motionStopped: boolean;
  location?: { coordinates: number[]; accuracyMeters?: number };
  userResponse: CrashUserResponse;
  countdownSeconds: number;
  escalatedToSOS: boolean;
  createdAt: string;
}

const mockCrashEvents: MockCrashEvent[] = [];

export const recordCrashEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.body.userId || 'user-rider-1';
    const {
      confidence = 'MEDIUM',
      confidenceScore = 0.65,
      impactForceG,
      speedDeltaKmph,
      motionStopped = false,
      location,
      sensorEvidence
    } = req.body;

    const eventId = generateEventId();
    const isMongoConnected = mongoose.connection.readyState === 1;

    // Realtime notification via Socket.IO
    if (io) {
      io.emit(`crash:alert:${userId}`, {
        eventId,
        userId,
        confidence,
        confidenceScore,
        location,
        timestamp: new Date().toISOString()
      });
    }

    if (!isMongoConnected) {
      const mockEvent: MockCrashEvent = {
        eventId,
        userId,
        confidence,
        confidenceScore,
        impactForceG,
        motionStopped,
        location,
        userResponse: 'DISMISSED',
        countdownSeconds: 10,
        escalatedToSOS: false,
        createdAt: new Date().toISOString()
      };
      mockCrashEvents.unshift(mockEvent);
      res.status(201).json({ success: true, data: mockEvent });
      return;
    }

    const event = new CrashDetectionEvent({
      eventId,
      userId,
      confidence,
      confidenceScore,
      impactForceG,
      speedDeltaKmph,
      motionStopped,
      location: location?.coordinates ? {
        type: 'Point',
        coordinates: location.coordinates,
        accuracyMeters: location.accuracyMeters
      } : undefined,
      sensorEvidence,
      countdownSeconds: 10
    });

    await event.save();
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error('Error recording crash event:', error);
    res.status(500).json({ success: false, message: 'Failed to record crash event' });
  }
};

export const respondToCrashEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.id || req.body.userId || 'user-rider-1';
    const { userResponse, notes } = req.body; // 'CONFIRMED_SAFE' | 'CONFIRMED_CRASH' | 'TIMEOUT_NO_RESPONSE'

    if (!userResponse) {
      res.status(400).json({ success: false, message: 'userResponse is required' });
      return;
    }

    let escalatedToSOS = false;
    let incidentId: string | undefined;

    // Escalate to SOS if user confirmed crash or timed out with high confidence
    if (userResponse === 'CONFIRMED_CRASH' || userResponse === 'TIMEOUT_NO_RESPONSE') {
      escalatedToSOS = true;
      incidentId = `SOS-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      // Notify family and sockets
      if (io) {
        io.emit(`crash:escalate:${userId}`, {
          eventId,
          userId,
          incidentId,
          escalatedToSOS: true,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      // User safe false-alarm dismissal
      if (io) {
        io.emit(`crash:dismiss:${userId}`, {
          eventId,
          userId,
          userResponse: 'CONFIRMED_SAFE',
          timestamp: new Date().toISOString()
        });
      }
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const target = mockCrashEvents.find((e) => e.eventId === eventId);
      if (target) {
        target.userResponse = userResponse;
        target.escalatedToSOS = escalatedToSOS;
      }
      res.status(200).json({
        success: true,
        message: userResponse === 'CONFIRMED_SAFE' ? 'Rider confirmed safe' : 'Crash escalated to emergency response',
        data: { eventId, userResponse, escalatedToSOS, incidentId }
      });
      return;
    }

    const event = await CrashDetectionEvent.findOne({ eventId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    event.userResponse = userResponse;
    event.escalatedToSOS = escalatedToSOS;
    if (notes) event.notes = notes;
    await event.save();

    res.status(200).json({
      success: true,
      message: userResponse === 'CONFIRMED_SAFE' ? 'Rider confirmed safe' : 'Crash escalated to emergency response',
      data: { eventId, userResponse, escalatedToSOS, incidentId }
    });
  } catch (error) {
    console.error('Error responding to crash event:', error);
    res.status(500).json({ success: false, message: 'Failed to update crash event response' });
  }
};

export const getCrashEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || (req.query.userId as string) || 'user-rider-1';
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const userEvents = mockCrashEvents.filter((e) => e.userId === userId);
      res.status(200).json({ success: true, data: userEvents });
      return;
    }

    const events = await CrashDetectionEvent.find({ userId }).sort({ createdAt: -1 }).limit(20);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching crash events:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve crash events' });
  }
};
