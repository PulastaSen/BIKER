import { Router } from 'express';
import { 
  getQrTagDetails, 
  submitContactRequest, 
  generateOrGetBikeQrTag, 
  revokeBikeQrTag 
} from '../controllers/qrController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public endpoints (no auth required to scan or submit contact request)
router.get('/tag/:token', getQrTagDetails);
router.post('/tag/:token/contact', submitContactRequest);

// Owner protected endpoints
router.post('/bike/:bikeId/generate', optionalAuth, generateOrGetBikeQrTag);
router.get('/bike/:bikeId', optionalAuth, generateOrGetBikeQrTag);
router.post('/bike/:bikeId/revoke', optionalAuth, revokeBikeQrTag);

export default router;
