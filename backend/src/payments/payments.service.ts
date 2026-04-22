import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { bookings, payments, houses, jobs } from '../db/schema.js';
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

import logger from '../utils/logger.js';
import { generateETIMSReceipt } from '../compliance/compliance.service.js';

export async function handleMpesaCallback(rawBody: any) {
  const callbackData = parseCallback(rawBody);
  const { checkoutRequestId, resultCode, resultDesc, amount, mpesaReceiptNumber, transactionDate } = callbackData;

  const [existingBooking] = await db.select()
    .from(bookings)
    .where(eq(bookings.mpesaCheckoutRequestId, checkoutRequestId))
    .limit(1);

  if (!existingBooking) {
    logger.error('M-Pesa callback for unknown booking', { checkoutRequestId });
    return { success: false, message: 'Booking not found' };
  }

  if (resultCode === 0) {
    logger.info('M-Pesa payment success. Processing audit trail.', { bookingId: existingBooking.bookingId, receipt: mpesaReceiptNumber });

    // IDEMPOTENCY CHECK: Ensure we haven't processed this receipt already
    if (mpesaReceiptNumber) {
      const [existingPayment] = await db.select()
        .from(payments)
        .where(eq(payments.mpesaReceiptNumber, mpesaReceiptNumber))
        .limit(1);

      if (existingPayment) {
        logger.info('M-Pesa callback ignored: Receipt already processed (Idempotency confirmed)', { mpesaReceiptNumber });
        return { success: true, message: 'Already processed', bookingId: existingBooking.bookingId };
      }
    }

    await db.transaction(async (trx) => {
      await trx.update(bookings)
        .set({ status: 'confirmed', confirmedAt: new Date() })
        .where(eq(bookings.bookingId, existingBooking.bookingId));

      await trx.insert(payments).values({
        bookingId: existingBooking.bookingId,
        payerId: existingBooking.seekerId,
        amount: existingBooking.bookingFee,
        method: 'mpesa',
        status: 'completed',
        mpesaReceiptNumber,
        mpesaTransactionDate: transactionDate ? new Date(transactionDate.toString().replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3T$4:$5:$6')) : new Date(),
        mpesaCheckoutRequestId: checkoutRequestId,
        paidAt: new Date(),
      });

      // Transactional Outbox: Enqueue compliance job WITHIN the transaction
      // This ensures if the payment is saved, the job MUST eventually run.
      const payload = {
        bookingId: existingBooking.bookingId,
        totalRevenueKes: Number(existingBooking.bookingFee),
        totalBookingFees: 1500, // Matched with pricing engine
        initiatedById: existingBooking.seekerId,
      };

      await trx.insert(jobs).values({
        type: 'kra_etims_sync',
        payload: payload,
        status: 'pending',
      });
    });

    logger.info('M-Pesa payment processed and eTIMS job enqueued', { bookingId: existingBooking.bookingId });

    // DISPATCH OUTBOUND WEBHOOK
    await dispatchWebhook('payment.succeeded', {
      bookingId: existingBooking.bookingId,
      amount: amount || existingBooking.bookingFee,
      receipt: mpesaReceiptNumber,
      gateway: 'mpesa_stk'
    });

    return { success: true, bookingId: existingBooking.bookingId };
  } else {
    return { success: false, message: resultDesc };
  }
}

export async function handleMpesaC2BConfirmation(payload: any) {
  const { TransID, TransAmount, BillRefNumber, MSISDN } = payload;
  logger.info('M-Pesa C2B Confirmation received', { TransID, BillRefNumber });

  // 1. Resolve booking ID from BillRefNumber (e.g., "BOOK-65" or just "65")
  const bookingId = parseInt(BillRefNumber.replace(/\D/g, ''));
  if (!bookingId) {
    logger.warn('M-Pesa C2B Confirmation: Invalid BillRefNumber', { BillRefNumber });
    return;
  }

  const [booking] = await db.select().from(bookings).where(eq(bookings.bookingId, bookingId)).limit(1);
  if (!booking) {
    logger.warn('M-Pesa C2B Confirmation: Booking not found', { bookingId });
    return;
  }

  // IDEMPOTENCY CHECK
  const [existingPayment] = await db.select()
    .from(payments)
    .where(eq(payments.mpesaReceiptNumber, TransID))
    .limit(1);

  if (existingPayment) {
    logger.info('M-Pesa C2B callback ignored: Receipt already processed', { TransID });
    return;
  }

  await db.transaction(async (trx) => {
    await trx.update(bookings)
      .set({ status: 'confirmed', confirmedAt: new Date() })
      .where(eq(bookings.bookingId, bookingId));

    await trx.insert(payments).values({
      bookingId,
      payerId: booking.seekerId,
      amount: TransAmount.toString(),
      method: 'mpesa',
      status: 'completed',
      mpesaReceiptNumber: TransID,
      mpesaPhoneNumber: MSISDN,
      paidAt: new Date(),
    });

    const compliancePayload = {
      bookingId,
      totalRevenueKes: Number(TransAmount),
      totalBookingFees: 1500,
      initiatedById: booking.seekerId,
    };

    await trx.insert(jobs).values({
      type: 'kra_etims_sync',
      payload: compliancePayload,
      status: 'pending',
    });
  });

  logger.info('M-Pesa C2B processed successfully', { bookingId, TransID });
  
  // DISPATCH OUTBOUND WEBHOOK
  await dispatchWebhook('payment.succeeded', {
    bookingId,
    amount: TransAmount,
    receipt: TransID,
    gateway: 'mpesa_c2b'
  });
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

    // Same pattern as M-Pesa flow – guarantees atomicity and resilience
    const payload = {
      bookingId,
      totalRevenueKes: Number(booking.bookingFee),
      totalBookingFees: 1500, // Matched with pricing engine
      initiatedById: booking.seekerId,
    };

    await trx.insert(jobs).values({
      type: 'kra_etims_sync',
      payload: payload,
      status: 'pending',
    });
  });

  // DISPATCH OUTBOUND WEBHOOK
  await dispatchWebhook('payment.succeeded', {
    bookingId,
    amount: paymentIntent.amount / 100,
    receipt: paymentIntent.id,
    gateway: 'stripe_manual'
  });

  return { success: true, bookingId };
}

export async function handleStripeWebhook(payload: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET is not set');
    throw new Error('Webhook secret missing');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    logger.error('Stripe webhook signature verification failed', { error: err.message });
    throw new Error(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const bookingId = parseInt(paymentIntent.metadata.bookingId);

    if (!bookingId) {
      logger.warn('Stripe webhook received for PI without bookingId metadata', { pi: paymentIntent.id });
      return;
    }

    // IDEMPOTENCY CHECK
    const [existingPayment] = await db.select()
      .from(payments)
      .where(eq(payments.transactionReference, paymentIntent.id))
      .limit(1);

    if (existingPayment) {
      logger.info('Stripe webhook ignored: Transaction already processed', { pi: paymentIntent.id });
      return;
    }

    const [booking] = await db.select().from(bookings).where(eq(bookings.bookingId, bookingId)).limit(1);
    if (!booking) {
      logger.error('Stripe webhook: booking not found', { bookingId });
      return;
    }

    await db.transaction(async (trx) => {
      await trx.update(bookings)
        .set({ status: 'confirmed', confirmedAt: new Date() })
        .where(eq(bookings.bookingId, bookingId));

      await trx.insert(payments).values({
        bookingId,
        payerId: booking.seekerId,
        amount: booking.bookingFee,
        method: 'card',
        status: 'completed',
        transactionReference: paymentIntent.id,
        paidAt: new Date(),
      });

      // Transactional Outbox
      const compliancePayload = {
        bookingId,
        totalRevenueKes: Number(booking.bookingFee),
        totalBookingFees: 1500,
        initiatedById: booking.seekerId,
      };

      await trx.insert(jobs).values({
        type: 'kra_etims_sync',
        payload: compliancePayload,
        status: 'pending',
      });
    });

    logger.info('Stripe webhook processed successfully', { bookingId, pi: paymentIntent.id });

    // DISPATCH OUTBOUND WEBHOOK
    await dispatchWebhook('payment.succeeded', {
      bookingId,
      amount: booking.bookingFee,
      receipt: paymentIntent.id,
      gateway: 'stripe'
    });
  }
}

// ========== WEBHOOK DISPATCHER ==========
import { webhooks } from '../db/schema.js';
import { and } from 'drizzle-orm';

export async function dispatchWebhook(eventType: string, payload: any) {
  try {
    const activeHooks = await db.select()
      .from(webhooks)
      .where(and(eq(webhooks.eventType, eventType), eq(webhooks.isActive, true)));
  
    for (const hook of activeHooks) {
      await db.insert(jobs).values({
        type: 'webhook_dispatch',
        payload: {
          url: hook.url,
          secret: hook.secret,
          eventType,
          data: payload,
          timestamp: new Date().toISOString()
        },
        status: 'pending'
      });
    }
  } catch (err) {
    logger.warn('Webhook dispatch skipped: Outbound system partially initialized', { 
      eventType, 
      error: err instanceof Error ? err.message : String(err) 
    });
  }
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