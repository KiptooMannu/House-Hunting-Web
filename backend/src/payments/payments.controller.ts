import { Context } from 'hono';
import * as paymentService from './payments.service.js';
import { createPaymentSchema, updatePaymentSchema, paymentIdParam } from '../validators/validators.js';

export const createPayment = async (c: Context) => {
  try {
    const data = createPaymentSchema.parse(await c.req.json());
    // data.payerId = c.get('userId');
    const result = await paymentService.createPayment(data);
    return c.json(result, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const getPayment = async (c: Context) => {
  try {
    const { paymentId } = paymentIdParam.parse(c.req.param());
    const payment = await paymentService.getPayment(paymentId);
    if (!payment) return c.json({ error: 'Payment not found' }, 404);
    return c.json(payment, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const listPayments = async (c: Context) => {
  try {
    const bookingId = c.req.query('bookingId') ? parseInt(c.req.query('bookingId')!) : undefined;
    const payments = await paymentService.listPayments(bookingId);
    return c.json(payments, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const updatePayment = async (c: Context) => {
  try {
    const { paymentId } = paymentIdParam.parse(c.req.param());
    const updates = updatePaymentSchema.parse(await c.req.json());
    const updated = await paymentService.updatePayment(paymentId, updates);
    if (!updated) return c.json({ error: 'Payment not found' }, 404);
    return c.json(updated, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const deletePayment = async (c: Context) => {
  try {
    const { paymentId } = paymentIdParam.parse(c.req.param());
    const deleted = await paymentService.deletePayment(paymentId);
    if (!deleted) return c.json({ error: 'Payment not found' }, 404);
    return c.json({ message: 'Payment deleted' }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const getRevenue = async (c: Context) => {
  try {
    const result = await paymentService.getRevenue();
    return c.json({ data: result }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};