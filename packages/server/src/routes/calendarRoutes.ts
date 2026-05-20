import { Router } from 'express';
import { CalendarController } from '../controllers/calendarController';
import { InvitationController } from '../controllers/invitationController';
import { authenticate } from '../middleware/auth';

const router = Router();
const calendarController = new CalendarController();
const invitationController = new InvitationController();

router.use(authenticate);

router.get('/', (req, res, next) => calendarController.getCalendars(req, res, next));
router.post('/', (req, res, next) => calendarController.createCalendar(req, res, next));
router.get('/:id', (req, res, next) => calendarController.getCalendar(req, res, next));
router.put('/:id', (req, res, next) => calendarController.updateCalendar(req, res, next));
router.delete('/:id', (req, res, next) => calendarController.deleteCalendar(req, res, next));

router.get('/:id/members', (req, res, next) => calendarController.getMembers(req, res, next));
router.post('/:id/members', (req, res, next) => calendarController.addMember(req, res, next));
router.put('/:id/members/:memberId', (req, res, next) => calendarController.updateMemberRole(req, res, next));
router.delete('/:id/members/:memberId', (req, res, next) => calendarController.removeMember(req, res, next));

router.post('/:id/invitations', (req, res, next) => invitationController.createInvitation(req, res, next));

export default router;
