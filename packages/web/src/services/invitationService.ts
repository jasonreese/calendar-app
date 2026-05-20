import api from './api';

interface InvitationInfo {
  token: string;
  calendarName: string;
  inviterName: string;
  calendarId: string;
  expiresAt: string;
}

interface CreateInvitationResult {
  token: string;
  calendarName: string;
  inviterName: string;
  expiresAt: string;
}

export const invitationService = {
  async createInvitation(calendarId: string): Promise<CreateInvitationResult> {
    const response = await api.post(`/calendars/${calendarId}/invitations`);
    return response.data.data;
  },

  async getInvitation(token: string): Promise<InvitationInfo> {
    const response = await api.get(`/invitations/${token}`);
    return response.data.data;
  },

  async acceptInvitation(token: string): Promise<{ calendarId: string }> {
    const response = await api.post(`/invitations/${token}/accept`);
    return response.data.data;
  },
};
