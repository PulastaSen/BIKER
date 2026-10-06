import { Router } from 'express';
import { createSOS, cancelSOS, getActiveSOS } from '../controllers/sosController.js';

const router = Router();

router.post('/', createSOS);
router.put('/:id/cancel', cancelSOS);
router.get('/active', getActiveSOS);

export default router;
