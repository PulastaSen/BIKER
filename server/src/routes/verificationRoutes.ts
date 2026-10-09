import { Router } from 'express';
import {
  getVerificationStatus,
  submitIdentityDocuments,
  submitFaceVerification,
  getSecureDocument,
  adminReviewVerification
} from '../controllers/verificationController.js';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Current user verification status
router.get('/status', optionalAuth, getVerificationStatus);

// Submit identity documents (Driving licence, Govt ID, or Business proof)
router.post('/submit-documents', optionalAuth, submitIdentityDocuments);

// Submit face verification / selfie with liveness check
router.post('/face-verify', optionalAuth, submitFaceVerification);

// Secure document inspection (strictly protected against IDOR)
router.get('/document/:docId', authenticateToken, getSecureDocument);

// Admin verification review & decision
router.put('/admin/:userId/review', authenticateToken, requireRole('ADMIN'), adminReviewVerification);

export default router;
