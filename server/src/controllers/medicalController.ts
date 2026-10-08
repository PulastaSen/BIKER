import { Request, Response } from 'express';
import mongoose from 'mongoose';
import MedicalProfile from '../models/MedicalProfile.js';
import { mockStore } from '../services/mockStore.js';

export const getMedicalProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || (req.query.userId as string) || 'user-rider-1';
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const profile = mockStore.getMedicalProfile(userId);
      res.status(200).json({ success: true, data: profile });
      return;
    }

    let profile = await MedicalProfile.findOne({ userId });
    if (!profile && userId) {
      profile = await MedicalProfile.create({
        userId,
        bloodGroup: 'UNKNOWN',
        allergies: [],
        medications: [],
        medicalConditions: [],
        sharingPreference: 'EMERGENCY_ONLY',
        shareWithEmergencyResponders: true
      });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching medical profile:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve medical profile' });
  }
};

export const saveMedicalProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.body.userId || 'user-rider-1';
    const {
      fullName,
      bloodGroup,
      allergies,
      medications,
      medicalConditions,
      emergencyNotes,
      organDonor,
      doctorName,
      doctorContact,
      preferredHospital,
      sharingPreference,
      shareWithEmergencyResponders
    } = req.body;

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const saved = mockStore.saveMedicalProfile({
        userId,
        fullName: fullName || 'Pulasta Sen',
        bloodGroup: bloodGroup || 'UNKNOWN',
        allergies: allergies || [],
        medications: medications || [],
        medicalConditions: medicalConditions || [],
        emergencyNotes,
        organDonor: !!organDonor,
        doctorName,
        doctorContact,
        preferredHospital,
        sharingPreference: sharingPreference || 'EMERGENCY_ONLY',
        shareWithEmergencyResponders: shareWithEmergencyResponders !== false,
        updatedAt: new Date().toISOString()
      });
      res.status(200).json({ success: true, data: saved });
      return;
    }

    const updated = await MedicalProfile.findOneAndUpdate(
      { userId },
      {
        fullName,
        bloodGroup,
        allergies,
        medications,
        medicalConditions,
        emergencyNotes,
        organDonor,
        doctorName,
        doctorContact,
        preferredHospital,
        sharingPreference: sharingPreference || 'EMERGENCY_ONLY',
        shareWithEmergencyResponders: shareWithEmergencyResponders !== false
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error saving medical profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update medical profile' });
  }
};
