import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { bookings, payments, houses } from '../db/schema.js';
import { initiateSTKPush, parseCallback } from './mpesa.service.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ========== M-PESA FLOW ==========
interface MpesaInitParams {
  houseId: number;
  userId: number;
  moveInDate?: string;
  occupants?: string;
  notes?: string;
  phone: string;
}

export async function createPendingBookingAndInitiateMpesa({
  houseId,
  userId,
  moveInDate,
  notes,
  phone,
}: MpesaInitParams) {
  // Fetch house details (title and booking fee)
  const [house] = await db
    .select({ title: houses.title, bookingFee: houses.bookingFee })
    .from(houses)
    .where(eq(houses.houseId, houseId))
    .limit(1);

  if (!house) throw new Error('House not found');
  const amount = Number(house.bookingFee);
  if (amount <= 0) throw new Error('Invalid booking fee amount');

  // Create pending booking with the dynamic fee
  const [newBooking] = await db.insert(bookings).values({
    seekerId: userId,
    houseId,
    moveInDate: moveInDate || null,
    specialRequests: notes,
    status: 'pending_payment',
    paymentMethod: 'mpesa',
    bookingFee: amount.toString(),
  }).returning();

  try {
    const accountRef = `BOOK-${newBooking.bookingId}`;
    const description = `Booking fee for ${house.title}`;

    const stkResult = await initiateSTKPush({ phone, amount, accountRef, description });

    if (!stkResult.success) {
      await db.delete(bookings).where(eq(bookings.bookingId, newBooking.bookingId));
      throw new Error(`STK push failed: ${stkResult.responseDescription}`);
    }

    await db.update(bookings)
      .set({ mpesaCheckoutRequestId: stkResult.checkoutRequestId })
      .where(eq(bookings.bookingId, newBooking.bookingId));

    return {
      bookingId: newBooking.bookingId,
      checkoutRequestId: stkResult.checkoutRequestId,
      merchantRequestId: stkResult.merchantRequestId,
      customerMessage: stkResult.customerMessage,
    };
  } catch (error) {
    await db.delete(bookings).where(eq(bookings.bookingId, newBooking.bookingId));
    throw error;
  }
}

export async function handleMpesaCallback(rawBody: any) {
  const callbackData = parseCallback(rawBody);
  const { checkoutRequestId, resultCode, resultDesc, amount, mpesaReceiptNumber, transactionDate } = callbackData;

  const [existingBooking] = await db.select()
    .from(bookings)
    .where(eq(bookings.mpesaCheckoutRequestId, checkoutRequestId))
    .limit(1);

  if (!existingBooking) {
    console.error(`No pending booking for checkoutRequestId: ${checkoutRequestId}`);
    return { success: false, message: 'Booking not found' };
  }

  if (resultCode === 0) {
    await db.transaction(async (trx) => {
      await trx.update(bookings)
        .set({ status: 'confirmed', confirmedAt: new Date() })
        .where(eq(bookings.bookingId, existingBooking.bookingId));

      // Use the stored booking fee from the booking (not the callback amount)
      const feeAmount = existingBooking.bookingFee;
      await trx.insert(payments).values({
        bookingId: existingBooking.bookingId,
        payerId: existingBooking.seekerId,
        amount: feeAmount,
        method: 'mpesa',
        status: 'completed',
        mpesaReceiptNumber,
        mpesaTransactionDate: transactionDate ? new Date(transactionDate.toString().replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3T$4:$5:$6')) : new Date(),
        mpesaCheckoutRequestId: checkoutRequestId,
        paidAt: new Date(),
      });
    });

    // Trigger compliance auto-log (eTIMS)
    try {
      const { generateETIMSReceipt } = await import('../compliance/compliance.service.js');
      await generateETIMSReceipt(existingBooking.bookingId);
    } catch (e) {
      console.warn('[Payments] Compliance auto-log failed:', e);
    }

    return { success: true, bookingId: existingBooking.bookingId };
  } else {
    await db.delete(bookings).where(eq(bookings.bookingId, existingBooking.bookingId));
    console.log(`Payment failed for booking ${existingBooking.bookingId}: ${resultDesc}`);
    return { success: false, message: resultDesc };
  }
}

// ========== STRIPE FLOW ==========
interface StripeIntentParams {
  houseId: number;
  userId: number;
  moveInDate?: string;
  occupants?: string;
  notes?: string;
  // No amount parameter – we'll fetch from house
}

export async function createPendingBookingAndStripeIntent({
  houseId,
  userId,
  moveInDate,
  notes,
}: StripeIntentParams) {
  // Fetch booking fee from house
  const [house] = await db
    .select({ bookingFee: houses.bookingFee })
    .from(houses)
    .where(eq(houses.houseId, houseId))
    .limit(1);

  if (!house) throw new Error('House not found');
  const amount = Number(house.bookingFee);
  if (amount <= 0) throw new Error('Invalid booking fee amount');

  const [newBooking] = await db.insert(bookings).values({
    seekerId: userId,
    houseId,
    moveInDate: moveInDate || null,
    specialRequests: notes,
    status: 'pending_payment',
    paymentMethod: 'card',
    bookingFee: amount.toString(),
  }).returning();

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'kes',
      metadata: { bookingId: newBooking.bookingId },
    });

    return {
      bookingId: newBooking.bookingId,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    await db.delete(bookings).where(eq(bookings.bookingId, newBooking.bookingId));
    throw error;
  }
}

export async function confirmStripePayment(paymentIntentId: string, bookingId: number) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    await db.delete(bookings).where(eq(bookings.bookingId, bookingId));
    throw new Error('Payment not successful');
  }

  await db.transaction(async (trx) => {
    await trx.update(bookings)
      .set({ status: 'confirmed', confirmedAt: new Date() })
      .where(eq(bookings.bookingId, bookingId));

    const [booking] = await trx.select({ seekerId: bookings.seekerId, bookingFee: bookings.bookingFee })
      .from(bookings)
      .where(eq(bookings.bookingId, bookingId));
    await trx.insert(payments).values({
      bookingId,
      payerId: booking.seekerId,
      amount: booking.bookingFee, // use stored fee
      method: 'card',
      status: 'completed',
      transactionReference: paymentIntent.id,
      paidAt: new Date(),
    });
  });

  // Trigger compliance auto-log (eTIMS)
  try {
    const { generateETIMSReceipt } = await import('../compliance/compliance.service.js');
    await generateETIMSReceipt(bookingId);
  } catch (e) {
    console.warn('[Payments] Compliance auto-log failed:', e);
  }

  return { success: true, bookingId };
}

// ========== STATUS POLLING (unchanged, but ensure it returns correct amount) ==========
export async function getPaymentStatusByCheckoutId(checkoutRequestId: string) {
  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.mpesaCheckoutRequestId, checkoutRequestId))
    .limit(1);

  if (!booking) return { status: 'failed', message: 'Transaction not found' };

  if (booking.status === 'confirmed') {
    const [payment] = await db.select()
      .from(payments)
      .where(eq(payments.bookingId, booking.bookingId))
      .limit(1);
    return {
      status: 'completed',
      amount: payment?.amount || booking.bookingFee,
      transactionId: payment?.mpesaReceiptNumber || payment?.transactionReference || 'N/A',
    };
  } else if (booking.status === 'pending_payment') {
    return { status: 'pending' };
  } else {
    return { status: 'failed', message: 'Payment was not successful' };
  }
}

export async function getPaymentStatusByBookingId(bookingId: number) {
  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.bookingId, bookingId))
    .limit(1);

  if (!booking) return { status: 'failed', message: 'Booking not found' };

  if (booking.status === 'confirmed') {
    const [payment] = await db.select()
      .from(payments)
      .where(eq(payments.bookingId, bookingId))
      .limit(1);
    return {
      status: 'completed',
      amount: payment?.amount || booking.bookingFee,
      transactionId: payment?.mpesaReceiptNumber || payment?.transactionReference || 'N/A',
    };
  } else if (booking.status === 'pending_payment') {
    return { status: 'pending' };
  } else {
    return { status: 'failed', message: 'Payment was not successful' };
  }
}

// ========== EXISTING CRUD (keep as is) ==========
export const createPayment = async (data: any) => {
  const [newPayment] = await db.insert(payments).values(data).returning();
  return newPayment;
};

export const getPayment = async (paymentId: number) => {
  return await db.query.payments.findFirst({ where: eq(payments.paymentId, paymentId) });
};

export const listPayments = async (bookingId?: number) => {
  if (bookingId) return await db.select().from(payments).where(eq(payments.bookingId, bookingId));
  return await db.select().from(payments);
};

export const updatePayment = async (paymentId: number, updates: any) => {
  const [updated] = await db.update(payments).set(updates).where(eq(payments.paymentId, paymentId)).returning();
  return updated;
};

export const deletePayment = async (paymentId: number) => {
  const [deleted] = await db.delete(payments).where(eq(payments.paymentId, paymentId)).returning();
  return deleted;
};

export const getRevenue = async (landlordId?: number) => {
  if (landlordId) {
    const results = await db.select({
      payment: payments,
      houseTitle: houses.title,
    })
      .from(payments)
      .innerJoin(bookings, eq(payments.bookingId, bookings.bookingId))
      .innerJoin(houses, eq(bookings.houseId, houses.houseId))
      .where(eq(houses.landlordId, landlordId));
    const allPayments = results.map(r => ({ ...r.payment, house: { title: r.houseTitle } }));
    const total_revenue = allPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const total_payments = allPayments.length;
    const average_payment = total_payments > 0 ? total_revenue / total_payments : 0;
    return { summary: { total_revenue, total_payments, average_payment }, items: allPayments };
  }
  const allPayments = await db.select().from(payments);
  const total_revenue = allPayments.reduce((acc, p) => acc + Number(p.amount), 0);
  const total_payments = allPayments.length;
  const average_payment = total_payments > 0 ? total_revenue / total_payments : 0;
  return { summary: { total_revenue, total_payments, average_payment }, items: allPayments };
};