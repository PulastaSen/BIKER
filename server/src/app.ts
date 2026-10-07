import cors from 'cors';
import express from 'express';
import sosRoutes from './routes/sosRoutes.js';
import assistanceRoutes from './routes/assistanceRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bikeRoutes from './routes/bikeRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import helperRoutes from './routes/helperRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json());

// System Health
app.get('/api/health', (_request, response) => response.json({ success: true, message: 'MotoAssist API is healthy' }));

// Feature Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/assistance', assistanceRoutes);
app.use('/api/bikes', bikeRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/helpers', helperRoutes);
app.use('/api/admin', adminRoutes);

export default app;
