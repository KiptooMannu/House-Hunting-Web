import { Context } from 'hono';
import * as bookingService from './bookings.service.js';
import { createBookingSchema, updateBookingSchema, bookingIdParam } from '../validators/validators.js';

export const createBooking = async (c: Context) => {
  try {
    const data = createBookingSchema.parse(await c.req.json());
    // data.seekerId = c.get('userId'); // from auth
    const result = await bookingService.createBooking(data);
    return c.json(result, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const getBooking = async (c: Context) => {
  try {
    const { bookingId } = bookingIdParam.parse(c.req.param());
    const booking = await bookingService.getBooking(bookingId);
    if (!booking) return c.json({ error: 'Booking not found' }, 404);
    return c.json(booking, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const listBookings = async (c: Context) => {
  try {
    const seekerId = c.req.query('seekerId') ? parseInt(c.req.query('seekerId')!) : undefined;
    const houseId = c.req.query('houseId') ? parseInt(c.req.query('houseId')!) : undefined;
    const landlordId = c.req.query('landlordId') ? parseInt(c.req.query('landlordId')!) : undefined;
    const bookings = await bookingService.listBookings({ seekerId, houseId, landlordId });
    return c.json(bookings, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const updateBooking = async (c: Context) => {
  try {
    const { bookingId } = bookingIdParam.parse(c.req.param());
    const updates = updateBookingSchema.parse(await c.req.json());
    const updated = await bookingService.updateBooking(bookingId, updates);
    if (!updated) return c.json({ error: 'Booking not found' }, 404);
    return c.json(updated, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const deleteBooking = async (c: Context) => {
  try {
    const { bookingId } = bookingIdParam.parse(c.req.param());
    const deleted = await bookingService.deleteBooking(bookingId);
    if (!deleted) return c.json({ error: 'Booking not found' }, 404);
    return c.json({ message: 'Booking deleted' }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

// Extra: confirm booking (admin/landlord)
export const confirmBooking = async (c: Context) => {
  try {
    const { bookingId } = bookingIdParam.parse(c.req.param());
    const updated = await bookingService.confirmBooking(bookingId);
    return c.json(updated, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};