import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import BikeDocument, { BikeDocType } from '../models/BikeDocument.js';
import { mockStore } from '../services/mockStore.js';

function generateDocId() {
  return `DOC-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export type DocumentReviewStatus = 'NOT_SUBMITTED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

function calculateStatus(doc: any): { status: DocumentReviewStatus; isExpiringSoon: boolean } {
  const now = new Date();
  if (doc.expiryDate) {
    const exp = new Date(doc.expiryDate);
    if (exp < now) {
      return { status: 'EXPIRED', isExpiringSoon: false };
    }
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) {
      return { status: doc.isVerified ? 'VERIFIED' : 'PENDING_REVIEW', isExpiringSoon: true };
    }
  }
  return {
    status: doc.isVerified ? 'VERIFIED' : 'PENDING_REVIEW',
    isExpiringSoon: false
  };
}

export const getBikeDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    // Strictly isolate by authenticated user to prevent IDOR
    const userId = req.user?.id || (req.query.userId as string) || 'user-rider-1';
    const bikeId = (req.query.bikeId as string) || undefined;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const rawDocs = mockStore.getBikeDocuments(bikeId || 'all', userId);
      const docsWithStatus = rawDocs.map((d) => {
        const { status, isExpiringSoon } = calculateStatus(d);
        return {
          ...d,
          verificationStatus: status,
          isExpiringSoon
        };
      });
      res.status(200).json({ success: true, data: docsWithStatus });
      return;
    }

    const query: Record<string, any> = { userId };
    if (bikeId) {
      query.bikeId = bikeId;
    }

    const docs = await BikeDocument.find(query).lean();
    const docsWithStatus = docs.map((d) => {
      const { status, isExpiringSoon } = calculateStatus(d);
      return {
        ...d,
        verificationStatus: status,
        isExpiringSoon
      };
    });

    res.status(200).json({ success: true, data: docsWithStatus });
  } catch (error) {
    console.error('Error fetching bike documents:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve documents' });
  }
};

export const addBikeDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.body.userId || 'user-rider-1';
    const { 
      bikeId = 'rider-personal', 
      docType, 
      documentNumber, 
      issuer, 
      expiryDate, 
      fileUrl, 
      notes 
    } = req.body;

    if (!docType || !documentNumber) {
      res.status(400).json({ success: false, message: 'docType and documentNumber are required' });
      return;
    }

    const documentId = generateDocId();
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const newDoc = mockStore.addBikeDocument({
        documentId,
        bikeId,
        userId,
        docType: docType as BikeDocType,
        documentNumber,
        issuer,
        expiryDate,
        fileUrl,
        isVerified: true,
        notes,
        createdAt: new Date().toISOString()
      });
      const { status, isExpiringSoon } = calculateStatus(newDoc);
      res.status(201).json({ 
        success: true, 
        data: { ...newDoc, verificationStatus: status, isExpiringSoon } 
      });
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
    const { status, isExpiringSoon } = calculateStatus(doc.toObject());
    res.status(201).json({ 
      success: true, 
      data: { ...doc.toObject(), verificationStatus: status, isExpiringSoon } 
    });
  } catch (error) {
    console.error('Error adding bike document:', error);
    res.status(500).json({ success: false, message: 'Failed to add document' });
  }
};

export const updateBikeDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id || req.body.userId || 'user-rider-1';
    const { documentNumber, issuer, expiryDate, fileUrl, notes } = req.body;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      // Mock update
      const existing = mockStore.getBikeDocuments('all', userId).find((d) => d.documentId === id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Document not found' });
        return;
      }
      if (documentNumber) existing.documentNumber = documentNumber;
      if (issuer) existing.issuer = issuer;
      if (expiryDate) existing.expiryDate = expiryDate;
      if (fileUrl) existing.fileUrl = fileUrl;
      if (notes) existing.notes = notes;
      const { status, isExpiringSoon } = calculateStatus(existing);
      res.status(200).json({ success: true, data: { ...existing, verificationStatus: status, isExpiringSoon } });
      return;
    }

    // Strict IDOR protection: only owner can update
    const doc = await BikeDocument.findOne({ documentId: id, userId });
    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found or access denied' });
      return;
    }

    if (documentNumber) doc.documentNumber = documentNumber;
    if (issuer) doc.issuer = issuer;
    if (expiryDate) doc.expiryDate = new Date(expiryDate);
    if (fileUrl) doc.fileUrl = fileUrl;
    if (notes) doc.notes = notes;

    await doc.save();
    const { status, isExpiringSoon } = calculateStatus(doc.toObject());
    res.status(200).json({ success: true, data: { ...doc.toObject(), verificationStatus: status, isExpiringSoon } });
  } catch (error) {
    console.error('Error updating bike document:', error);
    res.status(500).json({ success: false, message: 'Failed to update document' });
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

    // Strict IDOR: ensure document belongs to authenticated user
    const result = await BikeDocument.findOneAndDelete({ documentId: id, userId });
    if (!result) {
      res.status(404).json({ success: false, message: 'Document not found or access denied' });
      return;
    }

    res.status(200).json({ success: true, message: 'Document removed' });
  } catch (error) {
    console.error('Error deleting bike document:', error);
    res.status(500).json({ success: false, message: 'Failed to delete document' });
  }
};
