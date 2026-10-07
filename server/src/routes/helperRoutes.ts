import { Router } from 'express';
import { 
  getHelperProfile, 
  updateAvailability, 
  getHelperRequestsFeed, 
  acceptAssistanceRequest 
} from '../controllers/helperController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth);

router.get('/profile', getHelperProfile);
router.put('/availability', updateAvailability);
router.get('/requests', getHelperRequestsFeed);
router.put('/requests/:id/accept', acceptAssistanceRequest);

export default router;
