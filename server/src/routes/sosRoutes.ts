import { Router } from 'express';
import { createSOS, cancelSOS, resolveSOS, getActiveSOS } from '../controllers/sosController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
router.use(optionalAuth);

router.post('/', createSOS);
router.put('/:id/cancel', cancelSOS);
router.put('/:id/resolve', resolveSOS);
router.get('/active', getActiveSOS);

export default router;
