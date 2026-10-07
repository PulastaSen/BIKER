import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Bike from '../models/Bike.js';
import { mockStore } from '../services/mockStore.js';

export const getBikes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || (req.query.userId as string) || 'user-rider-1';
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const userBikes = mockStore.getBikes(userId);
      res.status(200).json({ success: true, data: userBikes });
      return;
    }

    const bikes = await Bike.find({ userId }).sort({ isPrimary: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: bikes });
  } catch (error) {
    console.error('Error fetching bikes:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve garage bikes.' });
  }
};

export const addBike = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.body.userId || 'user-rider-1';
    const { brand, model, registrationNumber, year, fuelType, isPrimary, notes } = req.body;

    if (!brand || !model || !registrationNumber || !year) {
      res.status(400).json({ success: false, message: 'Brand, model, registrationNumber, and year are required.' });
      return;
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const newBike = mockStore.createBike({
        userId,
        brand,
        model,
        registrationNumber: registrationNumber.toUpperCase().trim(),
        year: Number(year),
        fuelType: fuelType || 'PETROL',
        isPrimary: Boolean(isPrimary),
        notes
      });

      res.status(201).json({ success: true, data: newBike });
      return;
    }

    if (isPrimary) {
      await Bike.updateMany({ userId }, { isPrimary: false });
    }

    const bike = new Bike({
      userId,
      brand,
      model,
      registrationNumber: registrationNumber.toUpperCase().trim(),
      year: Number(year),
      fuelType: fuelType || 'PETROL',
      isPrimary: Boolean(isPrimary),
      notes
    });

    await bike.save();
    res.status(201).json({ success: true, data: bike });
  } catch (error) {
    console.error('Error adding bike:', error);
    res.status(500).json({ success: false, message: 'Failed to add bike to garage.' });
  }
};

export const updateBike = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user-rider-1';
    const id = req.params.id as string;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const updated = mockStore.updateBike(id, userId, req.body);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Bike not found in garage.' });
        return;
      }
      res.status(200).json({ success: true, data: updated });
      return;
    }

    if (req.body.isPrimary) {
      await Bike.updateMany({ userId, _id: { $ne: id } }, { isPrimary: false });
    }

    const bike = await Bike.findOneAndUpdate({ _id: id, userId }, req.body, { new: true });
    if (!bike) {
      res.status(404).json({ success: false, message: 'Bike not found.' });
      return;
    }

    res.status(200).json({ success: true, data: bike });
  } catch (error) {
    console.error('Error updating bike:', error);
    res.status(500).json({ success: false, message: 'Failed to update bike.' });
  }
};

export const deleteBike = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user-rider-1';
    const id = req.params.id as string;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const deleted = mockStore.deleteBike(id, userId);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Bike not found in garage.' });
        return;
      }
      res.status(200).json({ success: true, message: 'Bike removed from garage.' });
      return;
    }

    const result = await Bike.findOneAndDelete({ _id: id, userId });
    if (!result) {
      res.status(404).json({ success: false, message: 'Bike not found.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Bike removed from garage.' });
  } catch (error) {
    console.error('Error deleting bike:', error);
    res.status(500).json({ success: false, message: 'Failed to delete bike.' });
  }
};
