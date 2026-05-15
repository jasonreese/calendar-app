import { PrismaClient, MemberRole } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import type { CreateCalendarDto, UpdateCalendarDto, AddMemberDto, UpdateMemberRoleDto } from '@calendar-app/shared';

const prisma = new PrismaClient();

export class CalendarService {
  async getUserCalendars(userId: string) {
    const ownedCalendars = await prisma.calendar.findMany({
      where: { ownerId: userId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    const sharedCalendars = await prisma.calendar.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return [...ownedCalendars, ...sharedCalendars];
  }

  async getCalendarById(calendarId: string, userId: string) {
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!calendar) {
      throw new AppError(404, 'Calendar not found', 'CALENDAR_NOT_FOUND');
    }

    const hasAccess = calendar.ownerId === userId ||
      calendar.members.some(m => m.userId === userId);

    if (!hasAccess) {
      throw new AppError(403, 'Access denied', 'ACCESS_DENIED');
    }

    return calendar;
  }

  async createCalendar(userId: string, data: CreateCalendarDto) {
    const calendar = await prisma.calendar.create({
      data: {
        name: data.name,
        description: data.description || null,
        color: data.color || '#3788d8',
        ownerId: userId,
      },
    });

    return calendar;
  }

  async updateCalendar(calendarId: string, userId: string, data: UpdateCalendarDto) {
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
    });

    if (!calendar) {
      throw new AppError(404, 'Calendar not found', 'CALENDAR_NOT_FOUND');
    }

    if (calendar.ownerId !== userId) {
      throw new AppError(403, 'Only owner can update calendar', 'ACCESS_DENIED');
    }

    const updated = await prisma.calendar.update({
      where: { id: calendarId },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
      },
    });

    return updated;
  }

  async deleteCalendar(calendarId: string, userId: string) {
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
    });

    if (!calendar) {
      throw new AppError(404, 'Calendar not found', 'CALENDAR_NOT_FOUND');
    }

    if (calendar.ownerId !== userId) {
      throw new AppError(403, 'Only owner can delete calendar', 'ACCESS_DENIED');
    }

    await prisma.calendar.delete({
      where: { id: calendarId },
    });
  }

  async getMembers(calendarId: string, userId: string) {
    await this.getCalendarById(calendarId, userId);

    const members = await prisma.calendarMember.findMany({
      where: { calendarId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return members;
  }

  async addMember(calendarId: string, ownerId: string, data: AddMemberDto) {
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
    });

    if (!calendar) {
      throw new AppError(404, 'Calendar not found', 'CALENDAR_NOT_FOUND');
    }

    if (calendar.ownerId !== ownerId) {
      throw new AppError(403, 'Only owner can add members', 'ACCESS_DENIED');
    }

    const existingMember = await prisma.calendarMember.findUnique({
      where: {
        calendarId_userId: {
          calendarId,
          userId: data.userId,
        },
      },
    });

    if (existingMember) {
      throw new AppError(400, 'User is already a member', 'ALREADY_MEMBER');
    }

    const member = await prisma.calendarMember.create({
      data: {
        calendarId,
        userId: data.userId,
        role: data.role,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return member;
  }

  async updateMemberRole(
    calendarId: string,
    memberId: string,
    ownerId: string,
    data: UpdateMemberRoleDto
  ) {
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
    });

    if (!calendar) {
      throw new AppError(404, 'Calendar not found', 'CALENDAR_NOT_FOUND');
    }

    if (calendar.ownerId !== ownerId) {
      throw new AppError(403, 'Only owner can update member roles', 'ACCESS_DENIED');
    }

    const member = await prisma.calendarMember.update({
      where: { id: memberId },
      data: { role: data.role },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return member;
  }

  async removeMember(calendarId: string, memberId: string, ownerId: string) {
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
    });

    if (!calendar) {
      throw new AppError(404, 'Calendar not found', 'CALENDAR_NOT_FOUND');
    }

    if (calendar.ownerId !== ownerId) {
      throw new AppError(403, 'Only owner can remove members', 'ACCESS_DENIED');
    }

    await prisma.calendarMember.delete({
      where: { id: memberId },
    });
  }
}
