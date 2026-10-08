import { Router } from 'express';
import { getBikeDocuments, addBikeDocument, deleteBikeDocument } from '../controllers/documentController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
router.use(optionalAuth);

router.get('/', getBikeDocuments);
router.post('/', addBikeDocument);
router.delete('/:id', deleteBikeDocument);

export default router;
