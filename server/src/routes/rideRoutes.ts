import { Router } from 'express';
import {
  startSafeRide,
  getActiveRide,
  updateRideLocation,
  endRide,
  safetyTimerCheckIn
} from '../controllers/rideController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
router.use(optionalAuth);

router.post('/start', startSafeRide);
router.get('/active', getActiveRide);
router.put('/:id/location', updateRideLocation);
router.put('/:id/end', endRide);
router.put('/:id/check-in', safetyTimerCheckIn);

export default router;
