import { Router } from 'express';
import { getBikes, addBike, updateBike, deleteBike } from '../controllers/bikeController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth);

router.get('/', getBikes);
router.post('/', addBike);
router.put('/:id', updateBike);
router.delete('/:id', deleteBike);

export default router;
