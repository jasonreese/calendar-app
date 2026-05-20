import { Response, NextFunction } from 'express';
import { InvitationService } from '../services/invitationService';
import { AuthRequest } from '../middleware/auth';

const invitationService = new InvitationService();

export class InvitationController {
  async createInvitation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await invitationService.createInvitation(
        req.params.id,
        req.user.userId,
      );

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getInvitation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await invitationService.getInvitation(req.params.token);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async acceptInvitation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await invitationService.acceptInvitation(
        req.params.token,
        req.user.userId,
      );

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
