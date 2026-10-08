import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ProviderInventory from '../models/ProviderInventory.js';
import { mockStore } from '../services/mockStore.js';

export const getInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string | undefined;
    const model = req.query.model as string | undefined;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const parts = mockStore.getInventory(query, model);
      res.status(200).json({ success: true, data: parts });
      return;
    }

    const filter: Record<string, unknown> = { inStock: true };
    if (query) {
      filter.$text = { $search: query };
    }
    if (model) {
      filter.modelCompatibility = { $in: [new RegExp(model, 'i')] };
    }

    const parts = await ProviderInventory.find(filter).populate('providerId', 'name businessName phone');
    res.status(200).json({ success: true, data: parts });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve spare parts inventory' });
  }
};
