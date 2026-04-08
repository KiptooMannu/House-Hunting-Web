import { eq, and } from 'drizzle-orm';
import { db } from '../db/db.js';
import { bookings } from '../db/schema.js';

export const createBooking = async (data: any) => {
  const [newBooking] = await db.insert(bookings).values(data).returning();
  return newBooking;
};

export const getBooking = async (bookingId: number) => {
  return await db.query.bookings.findFirst({
    where: eq(bookings.bookingId, bookingId),
    with: { house: true, seeker: true, payments: true },
  });
};

export const listBookings = async (filters: { seekerId?: number; houseId?: number }) => {
  const conditions = [];
  if (filters.seekerId) conditions.push(eq(bookings.seekerId, filters.seekerId));
  if (filters.houseId) conditions.push(eq(bookings.houseId, filters.houseId));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  return await db.select().from(bookings).where(whereClause);
};

export const updateBooking = async (bookingId: number, updates: any) => {
  const [updated] = await db.update(bookings).set({ ...updates, updatedAt: new Date() }).where(eq(bookings.bookingId, bookingId)).returning();
  return updated;
};

export const deleteBooking = async (bookingId: number) => {
  const [deleted] = await db.delete(bookings).where(eq(bookings.bookingId, bookingId)).returning();
  return deleted;
};

export const confirmBooking = async (bookingId: number) => {
  const [updated] = await db.update(bookings).set({ status: 'confirmed', confirmedAt: new Date() }).where(eq(bookings.bookingId, bookingId)).returning();
  return updated;
};