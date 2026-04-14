import { Hono } from 'hono';
import * as paymentController from '../payments/payments.controller.js'; // or .ts if needed
import { authMiddleware, adminOrLandlordMiddleware } from '../middleware/authMiddleware.js';

export const paymentsRouter = new Hono();

// Public callback (no auth)
paymentsRouter.post('/mpesa/callback', paymentController.mpesaCallback);

// All other routes require authentication
paymentsRouter.use('*', authMiddleware);

// M-Pesa initiation
paymentsRouter.post('/mpesa/stkpush', paymentController.initiateMpesaPayment);

// Card payment
paymentsRouter.post('/card/create-intent', paymentController.createStripeIntent);
paymentsRouter.post('/card/confirm', paymentController.confirmStripePayment);

// Payment status polling
paymentsRouter.get('/status/:checkoutRequestId', paymentController.getPaymentStatus);
paymentsRouter.get('/status', paymentController.getPaymentStatus);

// Revenue & listing (admin/landlord only)
paymentsRouter.get('/revenue', adminOrLandlordMiddleware, paymentController.getRevenue);
paymentsRouter.get('/', adminOrLandlordMiddleware, paymentController.listPayments);

// Individual payment (authenticated user)
paymentsRouter.get('/:paymentId', paymentController.getPayment);

// CRUD
paymentsRouter.post('/', paymentController.createPayment);
paymentsRouter.put('/:paymentId', adminOrLandlordMiddleware, paymentController.updatePayment);
paymentsRouter.delete('/:paymentId', adminOrLandlordMiddleware, paymentController.deletePayment);