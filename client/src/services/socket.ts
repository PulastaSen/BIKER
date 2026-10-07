import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    const shouldConnect = Boolean(import.meta.env.VITE_SOCKET_URL || !import.meta.env.PROD);
    socket = io(SOCKET_URL, {
      autoConnect: shouldConnect,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 3,
      timeout: 5000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to MotoAssist Socket.IO server');
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from MotoAssist server:', reason);
    });

    socket.on('connect_error', () => {
      // Graceful fallback for static serverless environments
    });
  }
  return socket;
};
