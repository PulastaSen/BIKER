import { Router } from 'express';
import { 
  createAssistanceRequest, 
  updateAssistanceStatus, 
  getRequestById, 
  getNearbyProviders,
  rateAssistanceRequest,
  cancelAssistanceRequest,
  getOperationsQueue,
  escalateAssistanceRequest,
  disputeAssistanceRequest
} from '../controllers/assistanceController.js';

const router = Router();

router.get('/providers/nearby', getNearbyProviders);
router.get('/ops/queue', getOperationsQueue);
router.post('/', createAssistanceRequest);
router.get('/:id', getRequestById);
router.put('/:id/status', updateAssistanceStatus);
router.post('/:id/cancel', cancelAssistanceRequest);
router.post('/:id/escalate', escalateAssistanceRequest);
router.post('/:id/dispute', disputeAssistanceRequest);
router.put('/:id/rate', rateAssistanceRequest);

export default router;
