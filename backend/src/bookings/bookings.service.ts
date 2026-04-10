import { eq, and } from 'drizzle-orm';
import { db } from '../db/db.js';
import { bookings, houses } from '../db/schema.js';

export const createBooking = async (data: any) => {
  // Extract houseId to fetch dynamic pricing
  const houseQuery = await db.query.houses.findFirst({
    where: eq(houses.houseId, data.houseId),
  });

  if (!houseQuery) throw new Error('House not found');

  // Hardcode the Platform Fee calculation (e.g. 5% of monthly rent, minimum 1500 KSh)
  // This fee is subject to 16% VAT later.
  const calculatedFee = Math.max(Number(houseQuery.monthlyRent) * 0.05, 1500);

  // The base price (is the rental amount) which is MRI eligible
  const isFurnished = houseQuery.furnishing === 'furnished';
  const basePrice = houseQuery.monthlyRent;

  const finalData = {
    ...data,
    totalPrice: basePrice, // MRI eligible rent
    bookingFee: calculatedFee, // VAT/Commercial eligible fee
    // Note: We can also add an internal tag that it's Tourism Levy applicable if furnished/short-term
  };

  const [newBooking] = await db.insert(bookings).values(finalData).returning();
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