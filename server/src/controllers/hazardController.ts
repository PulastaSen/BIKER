import { Request, Response } from 'express';
import mongoose from 'mongoose';
import RoadHazard from '../models/RoadHazard.js';
import { io } from '../server.js';
import { mockStore } from '../services/mockStore.js';

export const getHazards = async (_req: Request, res: Response): Promise<void> => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const hazards = mockStore.getHazards();
      res.status(200).json({ success: true, data: hazards });
      return;
    }

    const hazards = await RoadHazard.find({ status: { $ne: 'DISMISSED' } })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, data: hazards });
  } catch (error) {
    console.error('Error fetching road hazards:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve hazards' });
  }
};

export const createHazard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.body.userId || 'user-rider-1';
    const { hazardType, description, severity, location } = req.body;

    if (!hazardType || !description || !location?.coordinates) {
      res.status(400).json({ success: false, message: 'hazardType, description, and location coordinates are required' });
      return;
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const newHz = mockStore.createHazard({
        reportedBy: userId,
        hazardType,
        description,
        severity: severity || 'MEDIUM',
        location: {
          type: 'Point',
          coordinates: location.coordinates,
          landmark: location.landmark || 'Highway Section'
        },
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 86400000).toISOString()
      });

      io.emit('hazard:created', newHz);
      res.status(201).json({ success: true, data: newHz });
      return;
    }

    const hazard = new RoadHazard({
      reportedBy: userId,
      hazardType,
      description,
      severity: severity || 'MEDIUM',
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        landmark: location.landmark
      },
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 86400000)
    });

    await hazard.save();
    io.emit('hazard:created', hazard);
    res.status(201).json({ success: true, data: hazard });
  } catch (error) {
    console.error('Error reporting road hazard:', error);
    res.status(500).json({ success: false, message: 'Failed to report hazard' });
  }
};

export const upvoteHazard = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const hz = mockStore.upvoteHazard(id);
      if (!hz) {
        res.status(404).json({ success: false, message: 'Hazard not found' });
        return;
      }
      res.status(200).json({ success: true, data: hz });
      return;
    }

    const hz = await RoadHazard.findByIdAndUpdate(
      id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );
    if (!hz) {
      res.status(404).json({ success: false, message: 'Hazard not found' });
      return;
    }

    res.status(200).json({ success: true, data: hz });
  } catch (error) {
    console.error('Error upvoting hazard:', error);
    res.status(500).json({ success: false, message: 'Failed to upvote hazard' });
  }
};

export const resolveHazard = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const hz = mockStore.resolveHazard(id);
      if (!hz) {
        res.status(404).json({ success: false, message: 'Hazard not found' });
        return;
      }
      res.status(200).json({ success: true, data: hz });
      return;
    }

    const hz = await RoadHazard.findByIdAndUpdate(
      id,
      { status: 'RESOLVED' },
      { new: true }
    );
    if (!hz) {
      res.status(404).json({ success: false, message: 'Hazard not found' });
      return;
    }

    res.status(200).json({ success: true, data: hz });
  } catch (error) {
    console.error('Error resolving hazard:', error);
    res.status(500).json({ success: false, message: 'Failed to resolve hazard' });
  }
};
