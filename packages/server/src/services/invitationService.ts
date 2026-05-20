import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class InvitationService {
  async createInvitation(calendarId: string, inviterId: string) {
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
      include: { owner: { select: { id: true, username: true, displayName: true } } },
    });

    if (!calendar) {
      throw new AppError(404, 'Calendar not found', 'CALENDAR_NOT_FOUND');
    }

    if (calendar.ownerId !== inviterId) {
      throw new AppError(403, 'Only the calendar owner can create invitations', 'FORBIDDEN');
    }

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.calendarInvitation.create({
      data: {
        calendarId,
        inviterId,
        token,
        expiresAt,
      },
    });

    return {
      token,
      calendarName: calendar.name,
      inviterName: calendar.owner.displayName || calendar.owner.username,
      expiresAt,
    };
  }

  async getInvitation(token: string) {
    const invitation = await prisma.calendarInvitation.findUnique({
      where: { token },
      include: {
        calendar: {
          select: { name: true },
        },
        inviter: {
          select: { username: true, displayName: true },
        },
      },
    });

    if (!invitation) {
      throw new AppError(404, 'Invitation not found', 'INVITATION_NOT_FOUND');
    }

    if (invitation.expiresAt < new Date()) {
      throw new AppError(400, 'Invitation has expired', 'INVITATION_EXPIRED');
    }

    return {
      token: invitation.token,
      calendarName: invitation.calendar.name,
      inviterName: invitation.inviter.displayName || invitation.inviter.username,
      calendarId: invitation.calendarId,
      expiresAt: invitation.expiresAt,
    };
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await prisma.calendarInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new AppError(404, 'Invitation not found', 'INVITATION_NOT_FOUND');
    }

    if (invitation.expiresAt < new Date()) {
      throw new AppError(400, 'Invitation has expired', 'INVITATION_EXPIRED');
    }

    // Check if already a member
    const existingMember = await prisma.calendarMember.findUnique({
      where: {
        calendarId_userId: {
          calendarId: invitation.calendarId,
          userId,
        },
      },
    });

    if (!existingMember) {
      await prisma.calendarMember.create({
        data: {
          calendarId: invitation.calendarId,
          userId,
          role: 'VIEWER',
        },
      });
    }

    return { calendarId: invitation.calendarId };
  }
}
