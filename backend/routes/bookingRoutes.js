const express = require('express');
const router = express.Router();
const {
  createBooking, getBookings, getBookingById, updateBookingStatus,
} = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

// All booking routes require authentication
router.use(auth);

// POST /api/bookings - Create booking (User only)
router.post('/', authorize('user'), createBooking);

// GET /api/bookings - List bookings (role-filtered)
router.get('/', getBookings);

// GET /api/bookings/:id - Get booking details
router.get('/:id', getBookingById);

// PUT /api/bookings/:id/status - Update booking status (Landlord or Admin)
router.put('/:id/status', authorize('landlord', 'admin'), updateBookingStatus);

module.exports = router;
