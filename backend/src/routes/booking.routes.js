const router = require('express').Router();
const {
  getAvailability,
  createBooking,
  getBookings,
  getBookingById,
  rescheduleBooking,
  cancelBooking,
  updateBookingStatus,
} = require('../controllers/booking.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/availability', getAvailability); // public
router.post('/', authenticate, createBooking);
router.get('/', authenticate, getBookings);
router.get('/:id', authenticate, getBookingById);
router.put('/:id/reschedule', authenticate, rescheduleBooking);
router.put('/:id/cancel', authenticate, cancelBooking);
router.put('/:id/status', authenticate, authorize('admin', 'staff'), updateBookingStatus);

module.exports = router;
