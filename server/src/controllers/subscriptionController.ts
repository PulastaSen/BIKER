import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Subscription, { PlanTier } from '../models/Subscription.js';
import { mockStore } from '../services/mockStore.js';

export const createSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      planTier,
      planName,
      priceInr,
      durationMonths = 12,
      linkedBike,
      features,
      paymentMode = 'TEST_DEMO'
    } = req.body;

    const userId = req.user?.id || req.body.userId || 'user-rider-1';

    if (!planTier || !planName || !linkedBike) {
      res.status(400).json({ success: false, message: 'Missing required planTier, planName, or linkedBike.' });
      return;
    }

    const startDate = new Date();
    const endDate = new Date(Date.now() + durationMonths * 30 * 86400000);

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const newSub = mockStore.createSubscription({
        userId,
        planTier: planTier as PlanTier,
        planName,
        priceInr: priceInr || 1999,
        durationMonths,
        linkedBike,
        features: features || {
          maxFreeBreakdowns: planTier === 'COMMUTER' ? 2 : planTier === 'TOURING_PRO' ? 4 : 6,
          usedBreakdowns: 0,
          towingDistanceLimitKm: planTier === 'COMMUTER' ? 25 : planTier === 'TOURING_PRO' ? 50 : 100,
          includesPunctureRepair: true,
          includesBatteryJumpstart: true,
          includesMinorMechanicalLabor: true,
          includesFuelDeliveryLabor: planTier !== 'COMMUTER',
          includesMountainWinchRecovery: planTier === 'HILL_EXPLORER',
          highwayPriorityDispatch: planTier !== 'COMMUTER'
        },
        waitingPeriodHours: 48,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'ACTIVE',
        paymentDetails: {
          paymentMode,
          transactionRef: `TXN-${Date.now().toString(36).toUpperCase()}`,
          paidAmount: priceInr || 1999,
          paidAt: new Date().toISOString()
        }
      });

      res.status(201).json({ success: true, data: newSub });
      return;
    }

    const subscriptionId = `SUB-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const subscription = new Subscription({
      subscriptionId,
      userId,
      planTier,
      planName,
      priceInr: priceInr || 1999,
      durationMonths,
      linkedBike,
      features: features || {
        maxFreeBreakdowns: planTier === 'COMMUTER' ? 2 : planTier === 'TOURING_PRO' ? 4 : 6,
        usedBreakdowns: 0,
        towingDistanceLimitKm: planTier === 'COMMUTER' ? 25 : planTier === 'TOURING_PRO' ? 50 : 100,
        includesPunctureRepair: true,
        includesBatteryJumpstart: true,
        includesMinorMechanicalLabor: true,
        includesFuelDeliveryLabor: planTier !== 'COMMUTER',
        includesMountainWinchRecovery: planTier === 'HILL_EXPLORER',
        highwayPriorityDispatch: planTier !== 'COMMUTER'
      },
      waitingPeriodHours: 48,
      startDate,
      endDate,
      status: 'ACTIVE',
      paymentDetails: {
        paymentMode,
        transactionRef: `TXN-${Date.now().toString(36).toUpperCase()}`,
        paidAmount: priceInr || 1999,
        paidAt: new Date()
      }
    });

    await subscription.save();
    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to create subscription.' });
  }
};

export const getSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.query.userId as string) || (req.user?.role === 'RIDER' ? req.user.id : undefined);
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const list = userId ? mockStore.getUserSubscriptions(userId) : mockStore.getAllSubscriptions();
      res.status(200).json({ success: true, data: list });
      return;
    }

    const filter: Record<string, any> = {};
    if (userId) filter.userId = userId;

    const subscriptions = await Subscription.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve subscriptions.' });
  }
};

export const getSubscriptionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const sub = mockStore.getSubscriptionById(id);
      if (!sub) {
        res.status(404).json({ success: false, message: 'Subscription not found.' });
        return;
      }
      res.status(200).json({ success: true, data: sub });
      return;
    }

    const sub = await Subscription.findOne({ subscriptionId: id });
    if (!sub) {
      res.status(404).json({ success: false, message: 'Subscription not found.' });
      return;
    }

    res.status(200).json({ success: true, data: sub });
  } catch (error) {
    console.error('Error fetching subscription by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve subscription.' });
  }
};

export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const sub = mockStore.cancelSubscription(id);
      if (!sub) {
        res.status(404).json({ success: false, message: 'Subscription not found.' });
        return;
      }
      res.status(200).json({ success: true, data: sub });
      return;
    }

    const sub = await Subscription.findOne({ subscriptionId: id });
    if (!sub) {
      res.status(404).json({ success: false, message: 'Subscription not found.' });
      return;
    }

    sub.status = 'CANCELLED';
    await sub.save();

    res.status(200).json({ success: true, data: sub });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel subscription.' });
  }
};
