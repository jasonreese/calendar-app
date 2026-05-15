import { Response, NextFunction } from 'express';
import { CalendarService } from '../services/calendarService';
import { AuthRequest } from '../middleware/auth';
import type { CreateCalendarDto, UpdateCalendarDto, AddMemberDto, UpdateMemberRoleDto } from '@calendar-app/shared';

const calendarService = new CalendarService();

export class CalendarController {
  async getCalendars(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const calendars = await calendarService.getUserCalendars(req.user.userId);

      res.json({
        success: true,
        data: calendars,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCalendar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const calendar = await calendarService.getCalendarById(
        req.params.id,
        req.user.userId
      );

      res.json({
        success: true,
        data: calendar,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCalendar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const data: CreateCalendarDto = req.body;
      const calendar = await calendarService.createCalendar(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: calendar,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCalendar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const data: UpdateCalendarDto = req.body;
      const calendar = await calendarService.updateCalendar(
        req.params.id,
        req.user.userId,
        data
      );

      res.json({
        success: true,
        data: calendar,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCalendar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      await calendarService.deleteCalendar(req.params.id, req.user.userId);

      res.json({
        success: true,
        message: 'Calendar deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const members = await calendarService.getMembers(
        req.params.id,
        req.user.userId
      );

      res.json({
        success: true,
        data: members,
      });
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const data: AddMemberDto = req.body;
      const member = await calendarService.addMember(
        req.params.id,
        req.user.userId,
        data
      );

      res.status(201).json({
        success: true,
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const data: UpdateMemberRoleDto = req.body;
      const member = await calendarService.updateMemberRole(
        req.params.id,
        req.params.memberId,
        req.user.userId,
        data
      );

      res.json({
        success: true,
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      await calendarService.removeMember(
        req.params.id,
        req.params.memberId,
        req.user.userId
      );

      res.json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
