import 'dotenv/config';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';

const port = Number(process.env.PORT ?? 5000);
const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/motoassist';

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173'
  }
});

io.on('connection', (socket) => {
  console.log('User connected to MotoAssist socket:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    console.log('Connected to MongoDB (MotoAssist)');
  })
  .catch((err) => {
    console.warn(`[MotoAssist Notice] MongoDB not connected (${err.message}). Server running in offline/mock mode.`);
  })
  .finally(() => {
    server.listen(port, () => console.log(`MotoAssist API listening on port ${port}`));
  });
