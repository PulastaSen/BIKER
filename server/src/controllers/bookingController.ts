import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ServiceBooking, { ServiceType, BookingStatus } from '../models/ServiceBooking.js';
import { mockStore } from '../services/mockStore.js';

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      serviceType,
      serviceName,
      bikeDetails,
      location,
      scheduledTime,
      pricing
    } = req.body;

    const userId = req.user?.id || req.body.userId || 'user-rider-1';
    const riderName = req.body.riderName || 'MotoAssist Rider';
    const riderPhone = req.body.riderPhone || '+91 98765 43210';

    if (!serviceType || !serviceName || !bikeDetails || !location) {
      res.status(400).json({ success: false, message: 'Missing required booking attributes.' });
      return;
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const newBooking = mockStore.createServiceBooking({
        userId,
        riderName,
        riderPhone,
        serviceType: serviceType as ServiceType,
        serviceName,
        bikeDetails,
        location,
        scheduledTime,
        pricing: pricing || {
          baseRate: 350,
          travelFee: 100,
          partsEstimate: 0,
          totalEstimated: 450,
          disclaimer: 'Transparent standard rate. Consumables billed at actuals.'
        },
        status: 'REQUESTED'
      });

      res.status(201).json({ success: true, data: newBooking });
      return;
    }

    const bookingId = `BK-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const booking = new ServiceBooking({
      bookingId,
      userId,
      riderName,
      riderPhone,
      serviceType,
      serviceName,
      bikeDetails,
      location,
      scheduledTime,
      pricing: pricing || {
        baseRate: 350,
        travelFee: 100,
        partsEstimate: 0,
        totalEstimated: 450,
        disclaimer: 'Transparent standard rate. Consumables billed at actuals.'
      },
      status: 'REQUESTED'
    });

    await booking.save();
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error('Error creating service booking:', error);
    res.status(500).json({ success: false, message: 'Failed to create service booking.' });
  }
};

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.query.userId as string) || (req.user?.role === 'RIDER' ? req.user.id : undefined);
    const status = req.query.status as string;

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const list = mockStore.getServiceBookings(userId, status);
      res.status(200).json({ success: true, data: list });
      return;
    }

    const filter: Record<string, any> = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;

    const bookings = await ServiceBooking.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching service bookings:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve bookings.' });
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const booking = mockStore.getServiceBookingById(id);
      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking not found.' });
        return;
      }
      res.status(200).json({ success: true, data: booking });
      return;
    }

    const booking = await ServiceBooking.findOne({ bookingId: id });
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Error fetching booking by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve booking.' });
  }
};

export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const { status, assignedProvider, cancellationReason, serviceNotes, partsUsed } = req.body;

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const updated = mockStore.updateServiceBookingStatus(
        id, 
        status as BookingStatus, 
        assignedProvider, 
        cancellationReason, 
        serviceNotes, 
        partsUsed
      );
      if (!updated) {
        res.status(404).json({ success: false, message: 'Booking not found.' });
        return;
      }

      res.status(200).json({ success: true, data: updated });
      return;
    }

    const booking = await ServiceBooking.findOne({ bookingId: id });
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    booking.status = status;
    if (assignedProvider) booking.assignedProvider = assignedProvider;
    if (cancellationReason) booking.cancellationReason = cancellationReason;
    if (serviceNotes) booking.serviceNotes = serviceNotes;
    if (partsUsed) booking.partsUsed = partsUsed;

    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
};

export const disputeBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const { reason, amount = 0 } = req.body;

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const updated = mockStore.disputeServiceBooking(id, reason, amount);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Booking not found.' });
        return;
      }
      res.status(200).json({ success: true, data: updated });
      return;
    }

    const booking = await ServiceBooking.findOne({ bookingId: id });
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    booking.dispute = {
      filed: true,
      reason,
      amount,
      status: 'REVIEW_PENDING'
    };

    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Error filing dispute on booking:', error);
    res.status(500).json({ success: false, message: 'Failed to file booking dispute.' });
  }
};
