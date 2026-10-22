import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import VehicleQrTag from '../models/VehicleQrTag.js';
import Bike from '../models/Bike.js';
import { mockStore } from '../services/mockStore.js';

export const getQrTagDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = String(req.params.token || '');
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const tag = mockStore.getVehicleQrTagByToken(token);
      if (!tag) {
        res.status(404).json({ success: false, message: 'Invalid or revoked vehicle QR tag.' });
        return;
      }

      // Return public safe details: NEVER expose owner private phone or address
      res.status(200).json({
        success: true,
        data: {
          token: tag.token,
          vehicleNickname: tag.vehicleNickname,
          brand: tag.brand,
          model: tag.model,
          registrationNumber: tag.registrationNumber,
          emergencyInstructions: tag.emergencyInstructions,
          allowPublicContact: tag.allowPublicContact
        }
      });
      return;
    }

    const tag = await VehicleQrTag.findOne({ token, isActive: true });
    if (!tag) {
      res.status(404).json({ success: false, message: 'Invalid or revoked vehicle QR tag.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        token: tag.token,
        vehicleNickname: tag.vehicleNickname,
        brand: tag.brand,
        model: tag.model,
        registrationNumber: tag.registrationNumber,
        emergencyInstructions: tag.emergencyInstructions,
        allowPublicContact: tag.allowPublicContact
      }
    });
  } catch (error) {
    console.error('Error fetching QR tag details:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve vehicle tag.' });
  }
};

export const submitContactRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = String(req.params.token || '');
    const { requestType, senderName, senderPhone, message, locationPin } = req.body;

    if (!requestType || !message) {
      res.status(400).json({ success: false, message: 'requestType and message are required.' });
      return;
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const newReq = mockStore.submitQrContactRequest(token, {
        requestType,
        senderName,
        senderPhone,
        message,
        locationPin
      });

      if (!newReq) {
        res.status(404).json({ success: false, message: 'QR tag not found or inactive.' });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Alert securely sent to the motorcycle owner.',
        data: newReq
      });
      return;
    }

    const tag = await VehicleQrTag.findOne({ token, isActive: true });
    if (!tag) {
      res.status(404).json({ success: false, message: 'QR tag not found or inactive.' });
      return;
    }

    const contactRequest = {
      id: `QR-MSG-${Date.now().toString(36).toUpperCase()}`,
      requestType,
      senderName,
      senderPhone,
      message,
      locationPin,
      createdAt: new Date(),
      read: false
    };

    tag.contactRequests.unshift(contactRequest as any);
    await tag.save();

    res.status(201).json({
      success: true,
      message: 'Alert securely sent to the motorcycle owner.',
      data: contactRequest
    });
  } catch (error) {
    console.error('Error submitting QR contact request:', error);
    res.status(500).json({ success: false, message: 'Failed to submit alert to owner.' });
  }
};

export const generateOrGetBikeQrTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const bikeId = String(req.params.bikeId || '');
    const userId = req.user?.id || req.body.userId || 'user-rider-1';
    const { emergencyInstructions } = req.body;

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const existing = mockStore.getVehicleQrTagByBikeId(bikeId);
      if (existing) {
        res.status(200).json({ success: true, data: existing });
        return;
      }

      const allBikes = mockStore.getBikes(userId);
      const bike = allBikes.find(b => b.id === bikeId);
      const token = `qr_sec_${crypto.randomBytes(8).toString('hex')}`;

      const created = mockStore.createOrUpdateVehicleQrTag({
        token,
        userId,
        bikeId,
        vehicleNickname: bike ? `${bike.brand} ${bike.model}` : 'My Motorcycle',
        brand: bike?.brand || 'Motorcycle',
        model: bike?.model || 'Special',
        registrationNumber: bike?.registrationNumber || 'WB-74-AB-8921',
        emergencyInstructions: emergencyInstructions || 'In case of emergency, dial 112 and use the alert button below.',
        allowPublicContact: true,
        contactRequests: [],
        isActive: true
      });

      res.status(201).json({ success: true, data: created });
      return;
    }

    let tag = await VehicleQrTag.findOne({ bikeId, isActive: true });
    if (tag) {
      res.status(200).json({ success: true, data: tag });
      return;
    }

    const bike = await Bike.findById(bikeId);
    const token = `qr_sec_${crypto.randomBytes(8).toString('hex')}`;

    tag = new VehicleQrTag({
      token,
      userId,
      bikeId,
      vehicleNickname: bike ? `${bike.brand} ${bike.model}` : 'My Motorcycle',
      brand: bike?.brand || 'Motorcycle',
      model: bike?.model || 'Special',
      registrationNumber: bike?.registrationNumber || 'WB-74-AB-8921',
      emergencyInstructions: emergencyInstructions || 'In case of emergency, dial 112 and use the alert button below.',
      allowPublicContact: true,
      contactRequests: [],
      isActive: true
    });

    await tag.save();

    if (bike) {
      bike.qrToken = token;
      await bike.save();
    }

    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    console.error('Error generating bike QR tag:', error);
    res.status(500).json({ success: false, message: 'Failed to generate QR tag.' });
  }
};

export const revokeBikeQrTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const bikeId = String(req.params.bikeId || '');
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const revoked = mockStore.revokeVehicleQrTag(bikeId);
      res.status(200).json({ success: true, revoked });
      return;
    }

    await VehicleQrTag.updateMany({ bikeId }, { $set: { isActive: false } });
    await Bike.findByIdAndUpdate(bikeId, { $unset: { qrToken: 1 } });

    res.status(200).json({ success: true, message: 'Vehicle QR tag revoked successfully.' });
  } catch (error) {
    console.error('Error revoking vehicle QR tag:', error);
    res.status(500).json({ success: false, message: 'Failed to revoke QR tag.' });
  }
};
