import api from './api';
import type { Event, CreateEventDto, UpdateEventDto, EventQueryParams } from '@calendar-app/shared';

export const eventService = {
  async getEvents(params?: EventQueryParams): Promise<Event[]> {
    const response = await api.get('/events', { params });
    return response.data.data;
  },

  async getEvent(id: string): Promise<Event> {
    const response = await api.get(`/events/${id}`);
    return response.data.data;
  },

  async createEvent(data: CreateEventDto): Promise<Event> {
    const response = await api.post('/events', data);
    return response.data.data;
  },

  async updateEvent(id: string, data: UpdateEventDto): Promise<Event> {
    const response = await api.put(`/events/${id}`, data);
    return response.data.data;
  },

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  },
};
