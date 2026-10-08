import { Router } from 'express';
import { createAccidentReport, getAccidentReports } from '../controllers/accidentController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
router.use(optionalAuth);

router.post('/', createAccidentReport);
router.get('/', getAccidentReports);

export default router;
