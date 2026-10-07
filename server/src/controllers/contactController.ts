import { Request, Response } from 'express';
import mongoose from 'mongoose';
import EmergencyContact from '../models/EmergencyContact.js';
import { mockStore } from '../services/mockStore.js';

export const getContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || (req.query.userId as string) || 'user-rider-1';
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const contacts = mockStore.getContacts(userId);
      res.status(200).json({ success: true, data: contacts });
      return;
    }

    const contacts = await EmergencyContact.find({ userId }).sort({ isPrimary: -1, createdAt: 1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve emergency contacts.' });
  }
};

export const addContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.body.userId || 'user-rider-1';
    const { name, phone, relationship, isPrimary, notifyOnSOS } = req.body;

    if (!name || !phone || !relationship) {
      res.status(400).json({ success: false, message: 'Name, phone, and relationship are required.' });
      return;
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const newContact = mockStore.createContact({
        userId,
        name: name.trim(),
        phone: phone.trim(),
        relationship: relationship.trim(),
        isPrimary: Boolean(isPrimary),
        notifyOnSOS: notifyOnSOS !== false
      });

      res.status(201).json({ success: true, data: newContact });
      return;
    }

    if (isPrimary) {
      await EmergencyContact.updateMany({ userId }, { isPrimary: false });
    }

    const contact = new EmergencyContact({
      userId,
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim(),
      isPrimary: Boolean(isPrimary),
      notifyOnSOS: notifyOnSOS !== false
    });

    await contact.save();
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    res.status(500).json({ success: false, message: 'Failed to add emergency contact.' });
  }
};

export const updateContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user-rider-1';
    const id = req.params.id as string;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const updated = mockStore.updateContact(id, userId, req.body);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Emergency contact not found.' });
        return;
      }
      res.status(200).json({ success: true, data: updated });
      return;
    }

    if (req.body.isPrimary) {
      await EmergencyContact.updateMany({ userId, _id: { $ne: id } }, { isPrimary: false });
    }

    const contact = await EmergencyContact.findOneAndUpdate({ _id: id, userId }, req.body, { new: true });
    if (!contact) {
      res.status(404).json({ success: false, message: 'Emergency contact not found.' });
      return;
    }

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ success: false, message: 'Failed to update contact.' });
  }
};

export const deleteContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user-rider-1';
    const id = req.params.id as string;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const deleted = mockStore.deleteContact(id, userId);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Contact not found.' });
        return;
      }
      res.status(200).json({ success: true, message: 'Contact removed.' });
      return;
    }

    const result = await EmergencyContact.findOneAndDelete({ _id: id, userId });
    if (!result) {
      res.status(404).json({ success: false, message: 'Contact not found.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Contact removed.' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ success: false, message: 'Failed to delete contact.' });
  }
};
