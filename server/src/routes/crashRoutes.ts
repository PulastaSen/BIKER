import { Router } from 'express';
import { recordCrashEvent, respondToCrashEvent, getCrashEvents } from '../controllers/crashController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
router.use(optionalAuth);

router.post('/detect', recordCrashEvent);
router.post('/:eventId/respond', respondToCrashEvent);
router.get('/user', getCrashEvents);

export default router;
