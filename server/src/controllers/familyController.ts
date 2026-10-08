import { Request, Response } from 'express';
import mongoose from 'mongoose';
import FamilyCircle from '../models/FamilyCircle.js';
import { mockStore } from '../services/mockStore.js';

export const getFamilyCircle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || (req.query.userId as string) || 'user-rider-1';
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const members = mockStore.getFamilyCircle(userId);
      res.status(200).json({ success: true, data: members });
      return;
    }

    const members = await FamilyCircle.find({ userId });
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    console.error('Error fetching family circle:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve family circle' });
  }
};

export const addFamilyMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.body.userId || 'user-rider-1';
    const { name, relationship, phone, email, canViewLiveRide, notifyOnSOS, notifyOnSafetyTimer } = req.body;

    if (!name || !phone) {
      res.status(400).json({ success: false, message: 'Name and phone are required' });
      return;
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const newMember = mockStore.addFamilyMember({
        userId,
        name,
        relationship: relationship || 'PARTNER',
        phone,
        email,
        canViewLiveRide: canViewLiveRide !== false,
        notifyOnSOS: notifyOnSOS !== false,
        notifyOnSafetyTimer: notifyOnSafetyTimer !== false
      });
      res.status(201).json({ success: true, data: newMember });
      return;
    }

    const member = new FamilyCircle({
      userId,
      name,
      relationship: relationship || 'PARTNER',
      phone,
      email,
      canViewLiveRide: canViewLiveRide !== false,
      notifyOnSOS: notifyOnSOS !== false,
      notifyOnSafetyTimer: notifyOnSafetyTimer !== false
    });

    await member.save();
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    console.error('Error adding family member:', error);
    res.status(500).json({ success: false, message: 'Failed to add family member' });
  }
};

export const removeFamilyMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id || 'user-rider-1';
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const removed = mockStore.removeFamilyMember(id, userId);
      if (!removed) {
        res.status(404).json({ success: false, message: 'Member not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Member removed from safety circle' });
      return;
    }

    const result = await FamilyCircle.findOneAndDelete({ _id: id, userId });
    if (!result) {
      res.status(404).json({ success: false, message: 'Member not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Member removed from safety circle' });
  } catch (error) {
    console.error('Error removing family member:', error);
    res.status(500).json({ success: false, message: 'Failed to remove member' });
  }
};
