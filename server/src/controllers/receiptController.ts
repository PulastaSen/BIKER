import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import ServiceReceipt from '../models/ServiceReceipt.js';
import { mockStore } from '../services/mockStore.js';

function generateReceiptId() {
  return `RCP-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export const getReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = req.params.requestId as string;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      let receipt = mockStore.getReceiptByRequestId(requestId);
      if (!receipt) {
        // Generate on-the-fly realistic receipt if request is completed
        receipt = mockStore.createReceipt({
          receiptId: generateReceiptId(),
          requestId,
          providerId: 'user-helper-1',
          riderId: 'user-rider-1',
          calloutFee: 150,
          travelFee: 100,
          laborFee: 200,
          partsFee: 350,
          taxes: 50,
          total: 850,
          parts: [
            { name: 'Heavy Duty Tube Patch & Valve', quantity: 1, unitPrice: 150, totalPrice: 150 },
            { name: 'DID Master Chain Link Replacement', quantity: 1, unitPrice: 200, totalPrice: 200 }
          ],
          serviceNotes: 'Roadside puncture sealed and chain tension readjusted to 25mm slack.',
          paymentMethod: 'UPI',
          isPaid: true,
          issuedAt: new Date().toISOString()
        });
      }
      res.status(200).json({ success: true, data: receipt });
      return;
    }

    const receipt = await ServiceReceipt.findOne({ requestId })
      .populate('providerId', 'name businessName phone')
      .populate('riderId', 'name phone');

    if (!receipt) {
      res.status(404).json({ success: false, message: 'Receipt not yet generated for this request' });
      return;
    }

    res.status(200).json({ success: true, data: receipt });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve receipt' });
  }
};

export const createReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      requestId,
      providerId,
      riderId,
      calloutFee,
      travelFee,
      laborFee,
      partsFee,
      taxes,
      total,
      parts,
      serviceNotes,
      paymentMethod,
      isPaid
    } = req.body;

    const receiptId = generateReceiptId();
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const newRec = mockStore.createReceipt({
        receiptId,
        requestId,
        providerId: providerId || 'user-helper-1',
        riderId: riderId || 'user-rider-1',
        calloutFee: Number(calloutFee) || 0,
        travelFee: Number(travelFee) || 0,
        laborFee: Number(laborFee) || 0,
        partsFee: Number(partsFee) || 0,
        taxes: Number(taxes) || 0,
        total: Number(total) || 350,
        parts: parts || [],
        serviceNotes,
        paymentMethod: paymentMethod || 'UPI',
        isPaid: !!isPaid,
        issuedAt: new Date().toISOString()
      });
      res.status(201).json({ success: true, data: newRec });
      return;
    }

    const receipt = new ServiceReceipt({
      receiptId,
      requestId,
      providerId,
      riderId,
      calloutFee,
      travelFee,
      laborFee,
      partsFee,
      taxes,
      total,
      parts,
      serviceNotes,
      paymentMethod,
      isPaid: !!isPaid
    });

    await receipt.save();
    res.status(201).json({ success: true, data: receipt });
  } catch (error) {
    console.error('Error creating receipt:', error);
    res.status(500).json({ success: false, message: 'Failed to create receipt' });
  }
};
