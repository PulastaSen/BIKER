import cors from 'cors';
import express from 'express';
import sosRoutes from './routes/sosRoutes.js';
import assistanceRoutes from './routes/assistanceRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json());
app.get('/api/health', (_request, response) => response.json({ success: true, message: 'MotoAssist API is healthy' }));
app.use('/api/sos', sosRoutes);
app.use('/api/assistance', assistanceRoutes);
app.use('/api/auth', authRoutes);

export default app;
