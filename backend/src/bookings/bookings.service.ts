import { eq, and } from 'drizzle-orm';
import { db } from '../db/db.js';
import { bookings, houses, notifications } from '../db/schema.js';
import { calculateBookingFees } from '../utils/pricing.js';
import { generateETIMSReceipt, voidRevenueInGava } from '../compliance/compliance.service.js';

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

  // Notify Landlord about new booking attempt
  await db.insert(notifications).values({
    userId: houseQuery.landlordId,
    title: 'New Booking Reservation 🏠',
    message: `A seeker has initialized a reservation for "${houseQuery.title}". Check your Active Bookings to oversee this transition.`,
    type: 'info',
  });

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
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.bookingId, bookingId),
    with: { house: true }
  });
  if (!booking) throw new Error('Booking not found');

  const [updated] = await db.update(bookings).set({ ...updates, updatedAt: new Date() }).where(eq(bookings.bookingId, bookingId)).returning();
  
  // If status changed to cancelled, void the KRA revenue report and notify both
  if (updates.status === 'cancelled') {
    try {
      await voidRevenueInGava(bookingId);
    } catch (e) {
      console.warn('[BookingService] Failed to void KRA revenue:', e);
    }

    // Notify Seeker
    await db.insert(notifications).values({
      userId: booking.seekerId,
      title: 'Reservation Cancelled',
      message: `Your reservation for "${booking.house.title}" has been cancelled. If you already made a payment, a refund process will be initiated.`,
      type: 'error',
    });

    // Notify Landlord
    await db.insert(notifications).values({
      userId: booking.house.landlordId,
      title: 'Booking Cancelled',
      message: `The reservation for "${booking.house.title}" (Booking ID: ${bookingId}) was cancelled and the slot is now open again.`,
      type: 'warning',
    });
  }
  
  return updated;
};

export const deleteBooking = async (bookingId: number) => {
  const [deleted] = await db.delete(bookings).where(eq(bookings.bookingId, bookingId)).returning();
  return deleted;
};

export const confirmBooking = async (bookingId: number) => {
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.bookingId, bookingId),
    with: { house: true }
  });
  if (!booking) throw new Error('Booking not found');

  const [updated] = await db.update(bookings).set({ status: 'confirmed', confirmedAt: new Date() }).where(eq(bookings.bookingId, bookingId)).returning();
  
  // Notify Seeker of confirmation
  await db.insert(notifications).values({
    userId: booking.seekerId,
    title: 'Reservation Confirmed! ✨',
    message: `Your booking for "${booking.house.title}" has been confirmed. You can now access move-in instructions in your dashboard.`,
    type: 'success',
  });

  // Trigger automated eTIMS sync upon manual confirmation
  try {
    await generateETIMSReceipt(bookingId);
  } catch (e) {
    console.warn('[BookingService] Automated eTIMS generation failed:', e);
  }
  
  return updated;
};