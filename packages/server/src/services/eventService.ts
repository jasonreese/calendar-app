import { PrismaClient, MemberRole } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import type { CreateEventDto, UpdateEventDto, EventQueryParams } from '@calendar-app/shared';

const prisma = new PrismaClient();

export class EventService {
  private async checkCalendarAccess(calendarId: string, userId: string, requiredRole?: MemberRole) {
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!calendar) {
      throw new AppError(404, 'Calendar not found', 'CALENDAR_NOT_FOUND');
    }

    const isOwner = calendar.ownerId === userId;
    const member = calendar.members[0];

    if (!isOwner && !member) {
      throw new AppError(403, 'Access denied', 'ACCESS_DENIED');
    }

    if (requiredRole) {
      if (!isOwner && member.role === MemberRole.VIEWER) {
        throw new AppError(403, 'Insufficient permissions', 'INSUFFICIENT_PERMISSIONS');
      }
    }

    return { calendar, isOwner, memberRole: member?.role };
  }

  async getEvents(userId: string, params: EventQueryParams) {
    const where: any = {};

    if (params.calendarIds) {
      const ids = params.calendarIds.split(',').filter(Boolean);
      where.calendarId = { in: ids };
    } else if (params.calendarId) {
      await this.checkCalendarAccess(params.calendarId, userId);
      where.calendarId = params.calendarId;
    } else {
      const userCalendars = await prisma.calendar.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } },
          ],
        },
        select: { id: true },
      });

      where.calendarId = {
        in: userCalendars.map(c => c.id),
      };
    }

    if (params.start && params.end) {
      where.startTime = {
        gte: new Date(params.start),
        lte: new Date(params.end),
      };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return events;
  }

  async getEventById(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    if (!event) {
      throw new AppError(404, 'Event not found', 'EVENT_NOT_FOUND');
    }

    await this.checkCalendarAccess(event.calendarId, userId);

    return event;
  }

  async createEvent(userId: string, data: CreateEventDto) {
    await this.checkCalendarAccess(data.calendarId, userId, MemberRole.EDITOR);

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description || null,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        isAllDay: data.isAllDay || false,
        location: data.location || null,
        color: data.color || null,
        calendarId: data.calendarId,
        creatorId: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return event;
  }

  async updateEvent(eventId: string, userId: string, data: UpdateEventDto) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new AppError(404, 'Event not found', 'EVENT_NOT_FOUND');
    }

    await this.checkCalendarAccess(event.calendarId, userId, MemberRole.EDITOR);

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        isAllDay: data.isAllDay,
        location: data.location,
        color: data.color,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteEvent(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new AppError(404, 'Event not found', 'EVENT_NOT_FOUND');
    }

    await this.checkCalendarAccess(event.calendarId, userId, MemberRole.EDITOR);

    await prisma.event.delete({
      where: { id: eventId },
    });
  }
}
