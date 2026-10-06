import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Connected to MotoAssist Socket.IO server');
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from MotoAssist server:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  return socket;
};
