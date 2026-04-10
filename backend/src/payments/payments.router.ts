import { Hono } from 'hono';
import * as paymentController from './payments.controller.js';
import { authMiddleware, adminOrLandlordMiddleware } from '../middleware/authMiddleware.js';

export const paymentsRouter = new Hono();

// All payment routes require authentication
paymentsRouter.use('*', authMiddleware);

// Revenue and listing - only Admin or Landlord
paymentsRouter.get('/revenue', adminOrLandlordMiddleware, paymentController.getRevenue);
paymentsRouter.get('/', adminOrLandlordMiddleware, paymentController.listPayments);

// Individual payment tracking
paymentsRouter.get('/:paymentId', paymentController.getPayment);

// Payment creation (can be triggered by system/mpesa callback)
paymentsRouter.post('/', paymentController.createPayment);

// Restricted management
paymentsRouter.put('/:paymentId', adminOrLandlordMiddleware, paymentController.updatePayment);
paymentsRouter.delete('/:paymentId', adminOrLandlordMiddleware, paymentController.deletePayment);