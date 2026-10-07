import { Request, Response, NextFunction } from 'express';

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, phone, password } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    res.status(400).json({ success: false, message: 'Full name is required (minimum 2 characters).' });
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ success: false, message: 'Valid email address is required.' });
    return;
  }
  if (!phone || phone.trim().length < 8) {
    res.status(400).json({ success: false, message: 'Valid phone number is required.' });
    return;
  }
  if (!password || password.length < 6) {
    res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    return;
  }
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Both email and password are required.' });
    return;
  }
  next();
};

export const validateAssistanceRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { problemCategory, location } = req.body;
  if (!problemCategory || typeof problemCategory !== 'string') {
    res.status(400).json({ success: false, message: 'Valid problemCategory is required.' });
    return;
  }
  if (!location || !Array.isArray(location.coordinates) || location.coordinates.length < 2) {
    res.status(400).json({ success: false, message: 'Location coordinates [lng, lat] are required.' });
    return;
  }
  next();
};

export const validateBikePayload = (req: Request, res: Response, next: NextFunction): void => {
  const { brand, model, registrationNumber, year } = req.body;
  if (!brand || !model || !registrationNumber || !year) {
    res.status(400).json({ success: false, message: 'brand, model, registrationNumber, and year are required.' });
    return;
  }
  next();
};

export const validateContactPayload = (req: Request, res: Response, next: NextFunction): void => {
  const { name, phone, relationship } = req.body;
  if (!name || !phone || !relationship) {
    res.status(400).json({ success: false, message: 'name, phone, and relationship are required.' });
    return;
  }
  next();
};
