const express = require('express');
const router = express.Router();
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  initiateStkPush,
  mpesaCallback,
  getRevenueStats,
} = require('./payments.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

// POST /api/payments/mpesa/callback - M-Pesa callback (public, no auth — Safaricom calls this)
router.post('/mpesa/callback', mpesaCallback);

// All other payment routes require authentication
router.use(auth);

// POST /api/payments - Record manual payment (User)
router.post('/', authorize('user'), createPayment);

// POST /api/payments/mpesa/stk-push - Initiate real STK Push or simulation fallback (User)
router.post('/mpesa/stk-push', authorize('user'), initiateStkPush);

// GET /api/payments/revenue - Revenue tracking (Admin)
router.get('/revenue', authorize('admin'), getRevenueStats);

// GET /api/payments - List all payments (Admin)
router.get('/', authorize('admin'), getAllPayments);

// GET /api/payments/:id - Get single payment
router.get('/:id', getPaymentById);

module.exports = router;
