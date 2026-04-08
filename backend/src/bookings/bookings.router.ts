import { Hono } from 'hono';
import * as bookingController from './bookings.controller.js';

export const bookingsRouter = new Hono();

bookingsRouter.get('/', bookingController.listBookings);
bookingsRouter.get('/:bookingId', bookingController.getBooking);
bookingsRouter.post('/', bookingController.createBooking);
bookingsRouter.put('/:bookingId', bookingController.updateBooking);
bookingsRouter.delete('/:bookingId', bookingController.deleteBooking);
bookingsRouter.post('/:bookingId/confirm', bookingController.confirmBooking);