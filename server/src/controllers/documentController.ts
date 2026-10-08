import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import BikeDocument from '../models/BikeDocument.js';
import { mockStore } from '../services/mockStore.js';

function generateDocId() {
  return `DOC-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export const getBikeDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || (req.query.userId as string) || 'user-rider-1';
    const bikeId = (req.query.bikeId as string) || 'bike-1';
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const docs = mockStore.getBikeDocuments(bikeId, userId);
      res.status(200).json({ success: true, data: docs });
      return;
    }

    const docs = await BikeDocument.find({ userId, bikeId });
    res.status(200).json({ success: true, data: docs });
  } catch (error) {
    console.error('Error fetching bike documents:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve documents' });
  }
};

export const addBikeDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.body.userId || 'user-rider-1';
    const { bikeId, docType, documentNumber, issuer, expiryDate, fileUrl, notes } = req.body;

    if (!bikeId || !docType || !documentNumber) {
      res.status(400).json({ success: false, message: 'bikeId, docType, and documentNumber are required' });
      return;
    }

    const documentId = generateDocId();
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const newDoc = mockStore.addBikeDocument({
        documentId,
        bikeId,
        userId,
        docType,
        documentNumber,
        issuer,
        expiryDate,
        fileUrl,
        isVerified: true,
        notes,
        createdAt: new Date().toISOString()
      });
      res.status(201).json({ success: true, data: newDoc });
      return;
    }

    const doc = new BikeDocument({
      documentId,
      bikeId,
      userId,
      docType,
      documentNumber,
      issuer,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      fileUrl,
      isVerified: true,
      notes
    });

    await doc.save();
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    console.error('Error adding bike document:', error);
    res.status(500).json({ success: false, message: 'Failed to add document' });
  }
};

export const deleteBikeDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id || 'user-rider-1';
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const removed = mockStore.deleteBikeDocument(id, userId);
      if (!removed) {
        res.status(404).json({ success: false, message: 'Document not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Document removed' });
      return;
    }

    const result = await BikeDocument.findOneAndDelete({ documentId: id, userId });
    if (!result) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Document removed' });
  } catch (error) {
    console.error('Error deleting bike document:', error);
    res.status(500).json({ success: false, message: 'Failed to delete document' });
  }
};
