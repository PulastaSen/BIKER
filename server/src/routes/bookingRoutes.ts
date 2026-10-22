import { Router } from 'express';
import { 
  createBooking, 
  getBookings, 
  getBookingById, 
  updateBookingStatus, 
  disputeBooking 
} from '../controllers/bookingController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth);

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);
router.put('/:id/status', updateBookingStatus);
router.post('/:id/dispute', disputeBooking);

export default router;
