import { Router } from 'express';
import { getMetrics, getAdminHelpers, verifyHelper, getAdminUsers } from '../controllers/adminController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth);

router.get('/metrics', getMetrics);
router.get('/helpers', getAdminHelpers);
router.put('/helpers/:id/verify', verifyHelper);
router.get('/users', getAdminUsers);

export default router;
