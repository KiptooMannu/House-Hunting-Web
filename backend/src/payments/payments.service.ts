import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { payments } from '../db/schema.js';

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
  let query = db.select().from(payments);
  
  if (landlordId) {
    // We need to join with bookings and houses to filter by landlordId
    const allPayments = await db.select({
      paymentId: payments.paymentId,
      amount: payments.amount,
      createdAt: payments.createdAt,
      status: payments.status
    })
    .from(payments)
    .innerJoin(bookings, eq(payments.bookingId, bookings.bookingId))
    .innerJoin(houses, eq(bookings.houseId, houses.houseId))
    .where(eq(houses.landlordId, landlordId));

    const total_revenue = allPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const total_payments = allPayments.length;
    const average_payment = total_payments > 0 ? total_revenue / total_payments : 0;

    return {
      summary: { total_revenue, total_payments, average_payment },
      items: allPayments,
    };
  }

  const allPayments = await db.select().from(payments);
  const total_revenue = allPayments.reduce((acc, p) => acc + Number(p.amount), 0);
  const total_payments = allPayments.length;
  const average_payment = total_payments > 0 ? total_revenue / total_payments : 0;

  return {
    summary: {
      total_revenue,
      total_payments,
      average_payment,
    },
    items: allPayments,
  };
};