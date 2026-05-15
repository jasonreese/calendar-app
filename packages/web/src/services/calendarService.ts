import api from './api';
import type {
  Calendar,
  CalendarMember,
  CreateCalendarDto,
  UpdateCalendarDto,
  AddMemberDto,
  UpdateMemberRoleDto,
} from '@calendar-app/shared';
import type { ApiResponse } from '@calendar-app/shared';

interface UserBrief {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
}

export const calendarService = {
  async getCalendars(): Promise<Calendar[]> {
    const response = await api.get('/calendars');
    return response.data.data;
  },

  async getCalendar(id: string): Promise<Calendar> {
    const response = await api.get(`/calendars/${id}`);
    return response.data.data;
  },

  async createCalendar(data: CreateCalendarDto): Promise<Calendar> {
    const response = await api.post('/calendars', data);
    return response.data.data;
  },

  async updateCalendar(id: string, data: UpdateCalendarDto): Promise<Calendar> {
    const response = await api.put(`/calendars/${id}`, data);
    return response.data.data;
  },

  async deleteCalendar(id: string): Promise<void> {
    await api.delete(`/calendars/${id}`);
  },

  // ---- 成员管理 ----

  async getMembers(calendarId: string): Promise<CalendarMember[]> {
    const response = await api.get(`/calendars/${calendarId}/members`);
    return response.data.data;
  },

  async addMember(calendarId: string, data: AddMemberDto): Promise<CalendarMember> {
    const response = await api.post(`/calendars/${calendarId}/members`, data);
    return response.data.data;
  },

  async updateMemberRole(calendarId: string, memberId: string, data: UpdateMemberRoleDto): Promise<CalendarMember> {
    const response = await api.put(`/calendars/${calendarId}/members/${memberId}`, data);
    return response.data.data;
  },

  async removeMember(calendarId: string, memberId: string): Promise<void> {
    await api.delete(`/calendars/${calendarId}/members/${memberId}`);
  },

  // ---- 用户搜索 ----

  async searchUsers(q: string): Promise<UserBrief[]> {
    if (!q.trim()) return [];
    const response = await api.get<ApiResponse<UserBrief[]>>('/users/search', { params: { q } });
    return response.data.data;
  },
};
