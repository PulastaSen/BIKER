import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import sosRoutes from './routes/sosRoutes.js';
import assistanceRoutes from './routes/assistanceRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bikeRoutes from './routes/bikeRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import helperRoutes from './routes/helperRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import medicalRoutes from './routes/medicalRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import hazardRoutes from './routes/hazardRoutes.js';
import accidentRoutes from './routes/accidentRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';
import crashRoutes from './routes/crashRoutes.js';

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
const allowedOrigin = process.env.CLIENT_URL ?? 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === allowedOrigin || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true
}));

// Payload Limit
app.use(express.json({ limit: '2mb' }));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

// System Health Endpoints
app.get('/health', (_request: Request, response: Response) => {
  response.json({ status: 'ok', service: 'motoassist-api' });
});

app.get('/api/health', (_request: Request, response: Response) => {
  response.json({ success: true, message: 'MotoAssist API is healthy' });
});

// Feature Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/assistance', assistanceRoutes);
app.use('/api/bikes', bikeRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/helpers', helperRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/hazards', hazardRoutes);
app.use('/api/accidents', accidentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/crash', crashRoutes);

// Global Production-Safe Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = err.status || err.statusCode || 500;
  
  if (!isProd) {
    console.error('Unhandled API Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message: isProd && statusCode === 500 ? 'Internal server error' : err.message || 'Unable to process request'
  });
});

export default app;
