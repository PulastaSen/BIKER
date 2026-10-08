import { Router } from 'express';
import { getMedicalProfile, saveMedicalProfile } from '../controllers/medicalController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
router.use(optionalAuth);

router.get('/profile', getMedicalProfile);
router.put('/profile', saveMedicalProfile);

export default router;
