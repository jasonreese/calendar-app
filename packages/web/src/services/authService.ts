import api from './api';
import type { CreateUserDto, LoginDto, AuthResponse, UserProfile } from '@calendar-app/shared';

export const authService = {
  async register(data: CreateUserDto & { invitationToken?: string }): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    const authData = response.data.data;

    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);

    return authData;
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    const authData = response.data.data;

    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);

    return authData;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async getCurrentUser(): Promise<UserProfile> {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
};
