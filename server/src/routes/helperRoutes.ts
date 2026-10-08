import { Router } from 'express';
import { 
  getHelperProfile, 
  updateAvailability, 
  getHelperRequestsFeed, 
  acceptAssistanceRequest,
  getHelperVerification,
  submitHelperVerification,
  updateHelperLocation
} from '../controllers/helperController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth);

router.get('/profile', getHelperProfile);
router.put('/availability', updateAvailability);
router.get('/requests', getHelperRequestsFeed);
router.put('/requests/:id/accept', acceptAssistanceRequest);
router.get('/verification', getHelperVerification);
router.post('/verification', submitHelperVerification);
router.put('/location', updateHelperLocation);

export default router;
