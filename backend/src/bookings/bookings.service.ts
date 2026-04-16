import { eq, and } from 'drizzle-orm';
import { db } from '../db/db.js';
import { bookings, houses } from '../db/schema.js';
import { calculateBookingFees } from '../utils/pricing.js';

export const createBooking = async (data: any) => {
  const houseQuery = await db.query.houses.findFirst({
    where: eq(houses.houseId, data.houseId),
  });

  if (!houseQuery) throw new Error('House not found');

  const { basePrice, platformFee } = calculateBookingFees(Number(houseQuery.monthlyRent));

  const finalData = {
    ...data,
    totalPrice: basePrice.toString(),
    bookingFee: platformFee.toString(),
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

export const listBookings = async (filters: { seekerId?: number; houseId?: number; landlordId?: number }) => {
  // If landlordId is provided, filter bookings via the houses table
  if (filters.landlordId) {
    return await db.query.bookings.findMany({
      where: (bookings, { exists }) => exists(
        db.select()
          .from(houses)
          .where(
            and(
              eq(houses.houseId, bookings.houseId),
              eq(houses.landlordId, Number(filters.landlordId))
            )
          )
      ),
      with: { 
        house: { with: { location: true, images: true } },
        payments: true 
      },
    });
  }

  // Standard filtering for seekers or specific houses
  const conditions = [];
  if (filters.seekerId) conditions.push(eq(bookings.seekerId, filters.seekerId));
  if (filters.houseId) conditions.push(eq(bookings.houseId, filters.houseId));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  return await db.query.bookings.findMany({
    where: whereClause,
    with: { 
      house: { with: { location: true, images: true } },
      payments: true 
    },
  });
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