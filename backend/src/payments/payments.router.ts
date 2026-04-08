import { Hono } from 'hono';
import * as paymentController from './payments.controller.js';

export const paymentsRouter = new Hono();

paymentsRouter.get('/', paymentController.listPayments);
paymentsRouter.get('/:paymentId', paymentController.getPayment);
paymentsRouter.post('/', paymentController.createPayment);
paymentsRouter.put('/:paymentId', paymentController.updatePayment);
paymentsRouter.delete('/:paymentId', paymentController.deletePayment);