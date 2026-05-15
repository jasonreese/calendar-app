import { Response, NextFunction } from 'express';
import { EventService } from '../services/eventService';
import { AuthRequest } from '../middleware/auth';
import type { CreateEventDto, UpdateEventDto, EventQueryParams } from '@calendar-app/shared';

const eventService = new EventService();

export class EventController {
  async getEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const params: EventQueryParams = {
        calendarId: req.query.calendarId as string,
        calendarIds: req.query.calendarIds as string,
        start: req.query.start as string,
        end: req.query.end as string,
      };

      const events = await eventService.getEvents(req.user.userId, params);

      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const event = await eventService.getEventById(req.params.id, req.user.userId);

      res.json({
        success: true,
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  async createEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const data: CreateEventDto = req.body;
      const event = await eventService.createEvent(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const data: UpdateEventDto = req.body;
      const event = await eventService.updateEvent(req.params.id, req.user.userId, data);

      res.json({
        success: true,
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      await eventService.deleteEvent(req.params.id, req.user.userId);

      res.json({
        success: true,
        message: 'Event deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
