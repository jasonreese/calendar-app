import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@calendar-app/shared';
import { useEventStore } from '../store/eventStore';
import type { Event } from '@calendar-app/shared';

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

  socket = io(baseUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message);
  });

  socket.on(SOCKET_EVENTS.EVENT_CREATED, (event: Event) => {
    useEventStore.getState().addEvent(event);
  });

  socket.on(SOCKET_EVENTS.EVENT_UPDATED, (event: Event) => {
    useEventStore.getState().updateEvent(event.id, event);
  });

  socket.on(SOCKET_EVENTS.EVENT_DELETED, (data: { id: string }) => {
    useEventStore.getState().removeEvent(data.id);
  });

  return socket;
}

export function joinCalendar(calendarId: string) {
  if (socket?.connected) {
    socket.emit(SOCKET_EVENTS.JOIN_CALENDAR, calendarId);
  }
}

export function leaveCalendar(calendarId: string) {
  if (socket?.connected) {
    socket.emit(SOCKET_EVENTS.LEAVE_CALENDAR, calendarId);
  }
}

export function emitEventCreate(event: Event) {
  if (socket?.connected) {
    socket.emit(SOCKET_EVENTS.EVENT_CREATE, event);
  }
}

export function emitEventUpdate(event: Event) {
  if (socket?.connected) {
    socket.emit(SOCKET_EVENTS.EVENT_UPDATE, event);
  }
}

export function emitEventDelete(data: { id: string; calendarId: string }) {
  if (socket?.connected) {
    socket.emit(SOCKET_EVENTS.EVENT_DELETE, data);
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
