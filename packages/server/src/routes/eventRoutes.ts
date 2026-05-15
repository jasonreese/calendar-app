import { Router } from 'express';
import { EventController } from '../controllers/eventController';
import { authenticate } from '../middleware/auth';

const router = Router();
const eventController = new EventController();

router.use(authenticate);

router.get('/', (req, res, next) => eventController.getEvents(req, res, next));
router.post('/', (req, res, next) => eventController.createEvent(req, res, next));
router.get('/:id', (req, res, next) => eventController.getEvent(req, res, next));
router.put('/:id', (req, res, next) => eventController.updateEvent(req, res, next));
router.delete('/:id', (req, res, next) => eventController.deleteEvent(req, res, next));

export default router;
