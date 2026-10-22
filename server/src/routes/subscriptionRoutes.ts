import { Router } from 'express';
import { 
  createSubscription, 
  getSubscriptions, 
  getSubscriptionById, 
  cancelSubscription 
} from '../controllers/subscriptionController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth);

router.post('/', createSubscription);
router.get('/', getSubscriptions);
router.get('/:id', getSubscriptionById);
router.post('/:id/cancel', cancelSubscription);

export default router;
