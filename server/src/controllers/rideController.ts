import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import RideSession from '../models/RideSession.js';
import { io } from '../server.js';
import { mockStore } from '../services/mockStore.js';

function generateRideId() {
  return `RIDE-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export const startSafeRide = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.body.userId || 'user-rider-1';
    const {
      destination,
      startLocation,
      estimatedDurationMinutes,
      sharedWithFamily,
      sharedFamilyIds,
      safetyTimerEnabled,
      safetyTimerTarget
    } = req.body;

    const rideId = generateRideId();
    const durationMin = Number(estimatedDurationMinutes) || 60;
    const expectedArrival = safetyTimerTarget 
      ? new Date(safetyTimerTarget) 
      : new Date(Date.now() + durationMin * 60 * 1000);

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const mockRide = mockStore.createRideSession({
        rideId,
        userId,
        startLocation: {
          coordinates: startLocation?.coordinates || [88.3953, 26.7271],
          address: startLocation?.address || 'Siliguri'
        },
        destination: {
          coordinates: destination?.coordinates || [88.6138, 27.3389],
          name: destination?.name || 'Gangtok',
          address: destination?.address || 'MG Marg, Gangtok'
        },
        currentLocation: {
          coordinates: startLocation?.coordinates || [88.3953, 26.7271],
          lastUpdated: new Date().toISOString()
        },
        status: 'ACTIVE',
        estimatedDurationMinutes: durationMin,
        expectedArrivalTime: expectedArrival.toISOString(),
        sharedWithFamily: !!sharedWithFamily,
        sharedFamilyIds: sharedFamilyIds || [],
        safetyTimerEnabled: !!safetyTimerEnabled,
        safetyTimerTarget: expectedArrival.toISOString(),
        safetyTimerStatus: 'PENDING',
        startedAt: new Date().toISOString()
      });

      io.emit('ride:started', mockRide);
      res.status(201).json({ success: true, data: mockRide });
      return;
    }

    const ride = new RideSession({
      rideId,
      userId,
      startLocation: {
        type: 'Point',
        coordinates: startLocation?.coordinates || [88.3953, 26.7271],
        address: startLocation?.address || 'Siliguri'
      },
      destination: {
        type: 'Point',
        coordinates: destination?.coordinates || [88.6138, 27.3389],
        name: destination?.name || 'Gangtok',
        address: destination?.address || 'MG Marg, Gangtok'
      },
      currentLocation: {
        type: 'Point',
        coordinates: startLocation?.coordinates || [88.3953, 26.7271],
        lastUpdated: new Date()
      },
      status: 'ACTIVE',
      estimatedDurationMinutes: durationMin,
      expectedArrivalTime: expectedArrival,
      sharedWithFamily: !!sharedWithFamily,
      sharedFamilyIds: sharedFamilyIds || [],
      safetyTimerEnabled: !!safetyTimerEnabled,
      safetyTimerTarget: expectedArrival,
      safetyTimerStatus: 'PENDING',
      startedAt: new Date()
    });

    await ride.save();
    io.emit('ride:started', ride);
    res.status(201).json({ success: true, data: ride });
  } catch (error) {
    console.error('Error starting safe ride:', error);
    res.status(500).json({ success: false, message: 'Failed to start safe ride' });
  }
};

export const getActiveRide = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || (req.query.userId as string) || 'user-rider-1';
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const active = mockStore.getUserActiveRide(userId);
      res.status(200).json({ success: true, data: active });
      return;
    }

    const active = await RideSession.findOne({ userId, status: 'ACTIVE' });
    res.status(200).json({ success: true, data: active });
  } catch (error) {
    console.error('Error fetching active ride:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active ride' });
  }
};

export const updateRideLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { coordinates } = req.body; // [lng, lat]

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      res.status(400).json({ success: false, message: 'Invalid coordinates array [lng, lat]' });
      return;
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const updated = mockStore.updateRideLocation(id, coordinates as [number, number]);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Active ride not found' });
        return;
      }
      io.emit(`ride:location:${id}`, { rideId: id, coordinates });
      io.emit('family:location', { rideId: id, coordinates });
      res.status(200).json({ success: true, data: updated });
      return;
    }

    const ride = await RideSession.findOne({ rideId: id, status: 'ACTIVE' });
    if (!ride) {
      res.status(404).json({ success: false, message: 'Active ride not found' });
      return;
    }

    ride.currentLocation = {
      type: 'Point',
      coordinates: coordinates as [number, number],
      lastUpdated: new Date()
    };
    await ride.save();

    io.emit(`ride:location:${id}`, { rideId: id, coordinates });
    io.emit('family:location', { rideId: id, coordinates });
    res.status(200).json({ success: true, data: ride });
  } catch (error) {
    console.error('Error updating ride location:', error);
    res.status(500).json({ success: false, message: 'Failed to update location' });
  }
};

export const endRide = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const ended = mockStore.endRideSession(id);
      if (!ended) {
        res.status(404).json({ success: false, message: 'Ride not found' });
        return;
      }
      io.emit(`ride:ended:${id}`, { rideId: id, status: 'COMPLETED' });
      res.status(200).json({ success: true, data: ended });
      return;
    }

    const ride = await RideSession.findOne({ rideId: id });
    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found' });
      return;
    }

    ride.status = 'COMPLETED';
    ride.completedAt = new Date();
    await ride.save();

    io.emit(`ride:ended:${id}`, { rideId: id, status: 'COMPLETED' });
    res.status(200).json({ success: true, data: ride });
  } catch (error) {
    console.error('Error ending ride:', error);
    res.status(500).json({ success: false, message: 'Failed to end ride' });
  }
};

export const safetyTimerCheckIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // 'SAFE_CONFIRMED' | 'ESCALATED'

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const ride = mockStore.getRideSession(id);
      if (ride) {
        ride.safetyTimerStatus = status || 'SAFE_CONFIRMED';
      }
      res.status(200).json({ success: true, data: ride });
      return;
    }

    const ride = await RideSession.findOne({ rideId: id });
    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found' });
      return;
    }

    ride.safetyTimerStatus = status || 'SAFE_CONFIRMED';
    await ride.save();

    res.status(200).json({ success: true, data: ride });
  } catch (error) {
    console.error('Error processing safety timer check-in:', error);
    res.status(500).json({ success: false, message: 'Failed to process check-in' });
  }
};
