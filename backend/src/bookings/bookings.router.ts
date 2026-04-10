import { Hono } from 'hono';
import * as bookingController from './bookings.controller.js';
import { authMiddleware, adminOrLandlordMiddleware } from '../middleware/authMiddleware.js';

export const bookingsRouter = new Hono();

// All booking routes require authentication
bookingsRouter.use('*', authMiddleware);

// Listing bookings: Seekers might be filtered in controller, 
// but Admins/Landlords can definitely see all.
bookingsRouter.get('/', bookingController.listBookings);
bookingsRouter.get('/:bookingId', bookingController.getBooking);

// Creation
bookingsRouter.post('/', bookingController.createBooking);

// Sensitive operations - restricted to Admin or Landlord
bookingsRouter.put('/:bookingId', adminOrLandlordMiddleware, bookingController.updateBooking);
bookingsRouter.delete('/:bookingId', adminOrLandlordMiddleware, bookingController.deleteBooking);
bookingsRouter.post('/:bookingId/confirm', adminOrLandlordMiddleware, bookingController.confirmBooking);