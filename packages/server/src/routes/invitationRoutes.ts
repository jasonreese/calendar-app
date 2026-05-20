import { Router } from 'express';
import { InvitationController } from '../controllers/invitationController';
import { authenticate } from '../middleware/auth';

const router = Router();
const invitationController = new InvitationController();

// GET /api/invitations/:token — public, no auth required (to preview invitation)
router.get('/:token', (req, res, next) => invitationController.getInvitation(req, res, next));

// POST /api/invitations/:token/accept — requires auth
router.post('/:token/accept', authenticate, (req, res, next) => invitationController.acceptInvitation(req, res, next));

export default router;
