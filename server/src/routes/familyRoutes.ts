import { Router } from 'express';
import { getFamilyCircle, addFamilyMember, removeFamilyMember } from '../controllers/familyController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
router.use(optionalAuth);

router.get('/', getFamilyCircle);
router.post('/', addFamilyMember);
router.delete('/:id', removeFamilyMember);

export default router;
