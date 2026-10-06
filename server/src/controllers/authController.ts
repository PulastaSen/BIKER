import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User.js';
import ProviderProfile from '../models/ProviderProfile.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key_do_not_use_in_prod';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, role, businessName, startingPrice } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
       res.status(400).json({ success: false, message: 'User with this email or phone already exists' });
       return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      phone,
      passwordHash,
      role: role || 'RIDER'
    });

    await user.save();

    // If provider or helper, create profile
    const isProvider = user.role === UserRole.PROVIDER || (user.role as string) === 'HELPER';
    if (isProvider) {
      const profile = new ProviderProfile({
        userId: user._id,
        businessName: businessName || name,
        startingPrice: startingPrice || 500,
        location: {
          type: 'Point',
          coordinates: [88.4, 27.0] // Default to somewhere in the region
        },
        services: ['General Help']
      });
      await profile.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
       res.status(401).json({ success: false, message: 'No token provided' });
       return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
       res.status(404).json({ success: false, message: 'User not found' });
       return;
    }

    res.status(200).json({ success: true, user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    } });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
