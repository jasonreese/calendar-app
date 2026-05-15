import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import logger from '../utils/logger';
import { SOCKET_EVENTS } from '@calendar-app/shared';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
}

export const setupSocketHandlers = (io: Server) => {
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const payload = verifyToken(token);
      socket.userId = payload.userId;
      socket.email = payload.email;

      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.userId}`);

    socket.on(SOCKET_EVENTS.JOIN_CALENDAR, (calendarId: string) => {
      socket.join(`calendar:${calendarId}`);
      logger.info(`User ${socket.userId} joined calendar ${calendarId}`);

      socket.to(`calendar:${calendarId}`).emit(SOCKET_EVENTS.MEMBER_JOINED, {
        userId: socket.userId,
        calendarId,
      });
    });

    socket.on(SOCKET_EVENTS.LEAVE_CALENDAR, (calendarId: string) => {
      socket.leave(`calendar:${calendarId}`);
      logger.info(`User ${socket.userId} left calendar ${calendarId}`);

      socket.to(`calendar:${calendarId}`).emit(SOCKET_EVENTS.MEMBER_LEFT, {
        userId: socket.userId,
        calendarId,
      });
    });

    socket.on(SOCKET_EVENTS.EVENT_CREATE, (data: any) => {
      socket.to(`calendar:${data.calendarId}`).emit(SOCKET_EVENTS.EVENT_CREATED, data);
    });

    socket.on(SOCKET_EVENTS.EVENT_UPDATE, (data: any) => {
      socket.to(`calendar:${data.calendarId}`).emit(SOCKET_EVENTS.EVENT_UPDATED, data);
    });

    socket.on(SOCKET_EVENTS.EVENT_DELETE, (data: any) => {
      socket.to(`calendar:${data.calendarId}`).emit(SOCKET_EVENTS.EVENT_DELETED, data);
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
    });

    socket.on('error', (error) => {
      logger.error('Socket error:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'An error occurred' });
    });
  });
};
