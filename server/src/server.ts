import 'dotenv/config';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';

const port = Number(process.env.PORT ?? 5000);
const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/motoassist';

export const server = http.createServer(app);
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

// Disable command buffering so queries don't hang for 10 seconds if Mongo is offline
mongoose.set('bufferCommands', false);

export const serverReady: Promise<http.Server> = new Promise((resolve) => {
  mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 1500 })
    .then(() => {
      console.log('Connected to MongoDB (MotoAssist)');
    })
    .catch((err) => {
      console.warn(`[MotoAssist Notice] MongoDB not connected (${err.message}). Server running in lightning-fast offline/mock mode.`);
    })
    .finally(() => {
      if (server.listening) {
        resolve(server);
        return;
      }
      server.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          resolve(server);
        }
      });
      try {
        server.listen(port, () => {
          console.log(`MotoAssist API listening on port ${port}`);
          resolve(server);
        });
      } catch {
        resolve(server);
      }
    });
});

