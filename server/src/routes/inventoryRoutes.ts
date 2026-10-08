import { Router } from 'express';
import { getInventory } from '../controllers/inventoryController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
router.use(optionalAuth);

router.get('/', getInventory);

export default router;
