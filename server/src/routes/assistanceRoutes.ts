import { Router } from 'express';
import { 
  createAssistanceRequest, 
  updateAssistanceStatus, 
  getRequestById, 
  getNearbyProviders,
  rateAssistanceRequest
} from '../controllers/assistanceController.js';

const router = Router();

router.get('/providers/nearby', getNearbyProviders);
router.post('/', createAssistanceRequest);
router.get('/:id', getRequestById);
router.put('/:id/status', updateAssistanceStatus);
router.put('/:id/rate', rateAssistanceRequest);

export default router;
