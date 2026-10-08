import { Router } from 'express';
import { getReceipt, createReceipt } from '../controllers/receiptController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
router.use(optionalAuth);

router.get('/:requestId', getReceipt);
router.post('/', createReceipt);

export default router;
