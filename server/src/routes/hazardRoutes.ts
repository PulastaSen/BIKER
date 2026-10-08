import { Router } from 'express';
import { getHazards, createHazard, upvoteHazard, resolveHazard } from '../controllers/hazardController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
router.use(optionalAuth);

router.get('/', getHazards);
router.post('/', createHazard);
router.put('/:id/upvote', upvoteHazard);
router.put('/:id/resolve', resolveHazard);

export default router;
