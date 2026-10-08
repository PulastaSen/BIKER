import { Server, Socket } from 'socket.io';

export interface ProviderLocationPayload {
  requestId: string;
  providerId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  etaMinutes?: number;
  distanceKm?: number;
  timestamp: string;
}

export interface RiderLocationPayload {
  requestId?: string;
  rideId?: string;
  riderId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface CrashEventPayload {
  eventId: string;
  userId: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceScore: number;
  location?: { latitude: number; longitude: number; accuracy?: number };
  timestamp: string;
}

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    // Join rooms
    socket.on('join_incident', (incidentId: string) => {
      if (incidentId) {
        socket.join(`incident:${incidentId}`);
      }
    });

    socket.on('leave_incident', (incidentId: string) => {
      if (incidentId) {
        socket.leave(`incident:${incidentId}`);
      }
    });

    socket.on('join_ride', (rideId: string) => {
      if (rideId) {
        socket.join(`ride:${rideId}`);
      }
    });

    socket.on('leave_ride', (rideId: string) => {
      if (rideId) {
        socket.leave(`ride:${rideId}`);
      }
    });

    // Helper Realtime Location Update (Section 14)
    socket.on('provider:location:update', (data: ProviderLocationPayload) => {
      if (!data || typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
        return;
      }

      // Broadcast to riders in incident room
      if (data.requestId) {
        io.to(`incident:${data.requestId}`).emit('provider:location:update', data);
        io.to(`incident:${data.requestId}`).emit(`assistance:location:${data.requestId}`, data);
      }
    });

    // Rider Realtime Location Update (Section 16)
    socket.on('rider:location:update', (data: RiderLocationPayload) => {
      if (!data || typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
        return;
      }

      if (data.requestId) {
        io.to(`incident:${data.requestId}`).emit('rider:location:update', data);
      }
      if (data.rideId) {
        io.to(`ride:${data.rideId}`).emit('rider:location:update', data);
      }
    });

    // Incident Status Progression (Section 21 & 22)
    socket.on('incident:status:update', (data: { requestId: string; status: string; notes?: string }) => {
      if (data?.requestId) {
        io.to(`incident:${data.requestId}`).emit('incident:status:update', data);
        io.to(`incident:${data.requestId}`).emit(`assistance:updated:${data.requestId}`, data);
      }
    });

    // Crash Detection Sensor Events (Section 23, 24, 25)
    socket.on('crash:possible', (data: CrashEventPayload) => {
      if (data?.userId) {
        io.emit(`crash:alert:${data.userId}`, data);
      }
    });

    socket.on('crash:confirmed', (data: { eventId: string; userId: string; location?: any }) => {
      if (data?.userId) {
        io.emit(`crash:escalate:${data.userId}`, data);
      }
    });

    socket.on('crash:cancelled', (data: { eventId: string; userId: string; reason?: string }) => {
      if (data?.userId) {
        io.emit(`crash:dismiss:${data.userId}`, data);
      }
    });

    socket.on('disconnect', () => {
      // client disconnect cleanup
    });
  });
}
