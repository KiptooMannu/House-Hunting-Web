const { Op, fn, col, literal } = require('sequelize');
const { Payment, Booking, House, User, sequelize } = require('../models');
const mpesaService = require('./mpesa.service');

// ===================== Simulation Helpers =====================

/**
 * Generate a simulated M-Pesa transaction code (used when Daraja is not configured).
 * Format: SIM + 10 alphanumeric characters.
 */
function generateSimTransactionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'SIM';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ===================== Record Manual Payment =====================

/**
 * POST /api/payments
 * Record a payment for a booking (User role).
 */
const createPayment = async (req, res, next) => {
  try {
    const { booking_id, amount, transaction_code } = req.body;

    // Check booking exists and belongs to user
    const booking = await Booking.findByPk(booking_id, {
      include: [{ model: House, as: 'house' }],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only pay for your own bookings.',
      });
    }

    // Check if payment already exists for this booking
    const existingPayment = await Payment.findOne({
      where: { booking_id, payment_status: 'completed' },
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been completed for this booking.',
      });
    }

    const payment = await Payment.create({
      booking_id,
      amount: amount || booking.house.rent,
      transaction_code,
      payment_status: transaction_code ? 'completed' : 'pending',
      payment_date: transaction_code ? new Date() : null,
    });

    // If payment completed, confirm the booking
    if (payment.payment_status === 'completed') {
      await booking.update({ booking_status: 'confirmed' });
      await House.update({ status: 'booked' }, { where: { id: booking.house_id } });
    }

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

// ===================== List / Get Payments =====================

/**
 * GET /api/payments
 * List all payments (Admin only).
 */
const getAllPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.payment_status = status;

    const { count, rows: payments } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            { model: House, as: 'house', attributes: ['id', 'title', 'rent', 'landlord_id'] },
            { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/:id
 * Get a single payment.
 */
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            { model: House, as: 'house' },
            { model: User, as: 'user', attributes: { exclude: ['password'] } },
          ],
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found.',
      });
    }

    // Users can only see their own payments
    if (req.user.role === 'user' && payment.booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    res.json({ success: true, data: { payment } });
  } catch (error) {
    next(error);
  }
};

// ===================== M-Pesa STK Push (Real API) =====================

/**
 * POST /api/payments/mpesa/stk-push
 * Initiate a real M-Pesa STK Push via Daraja API.
 * Falls back to simulation if Daraja credentials are not configured.
 * Body: { booking_id, phone_number }
 */
const initiateStkPush = async (req, res, next) => {
  try {
    const { booking_id, phone_number } = req.body;

    if (!booking_id) {
      return res.status(400).json({
        success: false,
        message: 'booking_id is required.',
      });
    }

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        message: 'phone_number is required for M-Pesa payment.',
      });
    }

    // Validate Kenyan phone format
    const phoneRegex = /^(\+254|0)\d{9}$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Kenyan phone number (+254... or 0...).',
      });
    }

    // Check booking exists and belongs to user
    const booking = await Booking.findByPk(booking_id, {
      include: [{ model: House, as: 'house' }],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only pay for your own bookings.',
      });
    }

    if (booking.booking_status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been confirmed.',
      });
    }

    // Check for existing completed payment
    const existingPayment = await Payment.findOne({
      where: { booking_id, payment_status: 'completed' },
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been completed for this booking.',
      });
    }

    const amount = parseFloat(booking.house.rent);
    const normalizedPhone = mpesaService.normalizePhone(phone_number);

    // ---- Real Daraja API ----
    if (mpesaService.isConfigured()) {
      console.log('📱 Initiating real M-Pesa STK Push...');

      const stkResponse = await mpesaService.initiateSTKPush({
        phone: phone_number,
        amount,
        accountRef: `BK-${booking_id}`,
        description: `Payment for ${booking.house.title || 'house rental'}`,
      });

      if (!stkResponse.success) {
        return res.status(502).json({
          success: false,
          message: 'M-Pesa STK Push request failed.',
          data: {
            responseCode: stkResponse.responseCode,
            responseDescription: stkResponse.responseDescription,
          },
        });
      }

      // Create pending payment with Daraja references
      const payment = await Payment.create({
        booking_id,
        amount,
        phone_number: normalizedPhone,
        mpesa_checkout_request_id: stkResponse.checkoutRequestId,
        mpesa_merchant_request_id: stkResponse.merchantRequestId,
        payment_status: 'pending',
        payment_date: null,
      });

      return res.status(201).json({
        success: true,
        message: stkResponse.customerMessage || 'STK Push sent. Check your phone to enter M-Pesa PIN.',
        mode: 'live',
        data: {
          payment: {
            id: payment.id,
            booking_id: payment.booking_id,
            amount: payment.amount,
            phone_number: normalizedPhone,
            payment_status: 'pending',
            checkout_request_id: stkResponse.checkoutRequestId,
          },
        },
      });
    }

    // ---- Simulation Fallback ----
    console.log('⚠️  Daraja not configured — using M-Pesa simulation');

    const transactionCode = generateSimTransactionCode();

    const payment = await Payment.create({
      booking_id,
      amount,
      phone_number: normalizedPhone,
      transaction_code: transactionCode,
      payment_status: 'pending',
      payment_date: null,
    });

    // Simulate async callback (2-second delay, 90% success rate)
    setTimeout(async () => {
      try {
        const isSuccess = Math.random() < 0.9;

        if (isSuccess) {
          await payment.update({
            payment_status: 'completed',
            payment_date: new Date(),
          });
          await booking.update({ booking_status: 'confirmed' });
          await House.update({ status: 'booked' }, { where: { id: booking.house_id } });
          console.log(`✅ M-Pesa simulation SUCCESS: ${transactionCode} (KES ${amount})`);
        } else {
          await payment.update({ payment_status: 'failed' });
          console.log(`❌ M-Pesa simulation FAILED: ${transactionCode}`);
        }
      } catch (err) {
        console.error('M-Pesa simulation callback error:', err);
      }
    }, 2000);

    return res.status(201).json({
      success: true,
      message: 'M-Pesa STK Push initiated (simulation mode).',
      mode: 'simulation',
      data: {
        payment: {
          id: payment.id,
          booking_id: payment.booking_id,
          amount: payment.amount,
          transaction_code: transactionCode,
          phone_number: normalizedPhone,
          payment_status: 'pending',
        },
        note: 'Daraja credentials not configured. Payment simulated — result in ~2 seconds.',
      },
    });
  } catch (error) {
    // Handle Daraja-specific axios errors
    if (error.response?.data) {
      console.error('❌ M-Pesa Daraja API error:', error.response.data);
      return res.status(502).json({
        success: false,
        message: 'M-Pesa API returned an error.',
        data: {
          errorCode: error.response.data.errorCode,
          errorMessage: error.response.data.errorMessage || error.response.data.ResponseDescription,
        },
      });
    }
    next(error);
  }
};

// ===================== M-Pesa Callback (Webhook) =====================

/**
 * POST /api/payments/mpesa/callback
 * Handle the real Safaricom M-Pesa STK Push callback.
 * Also supports the legacy simulation format for backward compatibility.
 *
 * Safaricom sends: { Body: { stkCallback: { ... } } }
 * Legacy format:   { transaction_code, result_code, result_desc }
 */
const mpesaCallback = async (req, res, next) => {
  try {
    console.log('📱 M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

    // ---- Real Daraja callback ----
    if (req.body?.Body?.stkCallback) {
      const callbackData = mpesaService.parseCallback(req.body);

      console.log('📱 Parsed callback:', {
        checkoutRequestId: callbackData.checkoutRequestId,
        resultCode: callbackData.resultCode,
        mpesaReceiptNumber: callbackData.mpesaReceiptNumber,
      });

      // Find payment by CheckoutRequestID
      const payment = await Payment.findOne({
        where: { mpesa_checkout_request_id: callbackData.checkoutRequestId },
        include: [{
          model: Booking,
          as: 'booking',
          include: [{ model: House, as: 'house' }],
        }],
      });

      if (!payment) {
        console.error(`❌ No payment found for CheckoutRequestID: ${callbackData.checkoutRequestId}`);
        // Still return 200 — Safaricom requires this
        return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
      }

      if (callbackData.resultCode === 0) {
        // Payment succeeded
        await payment.update({
          payment_status: 'completed',
          payment_date: new Date(),
          mpesa_receipt_number: callbackData.mpesaReceiptNumber,
          phone_number: callbackData.phoneNumber || payment.phone_number,
          // Store receipt also in transaction_code for backward compatibility
          transaction_code: callbackData.mpesaReceiptNumber,
        });

        // Confirm booking and mark house as booked
        if (payment.booking) {
          await payment.booking.update({ booking_status: 'confirmed' });
          if (payment.booking.house) {
            await payment.booking.house.update({ status: 'booked' });
          }
        }

        console.log(`✅ M-Pesa payment completed: ${callbackData.mpesaReceiptNumber} (KES ${callbackData.amount})`);
      } else {
        // Payment failed or cancelled
        await payment.update({ payment_status: 'failed' });
        console.log(`❌ M-Pesa payment failed: ${callbackData.resultDesc}`);
      }

      // Always return 200 to Safaricom
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // ---- Legacy / simulation callback format ----
    const { transaction_code, result_code, result_desc } = req.body;

    if (!transaction_code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid callback: no transaction_code or Body.stkCallback found.',
      });
    }

    const payment = await Payment.findOne({
      where: { transaction_code },
      include: [{
        model: Booking,
        as: 'booking',
        include: [{ model: House, as: 'house' }],
      }],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for the given transaction code.',
      });
    }

    const isSuccess = parseInt(result_code) === 0;

    if (isSuccess) {
      await payment.update({
        payment_status: 'completed',
        payment_date: new Date(),
      });

      if (payment.booking) {
        await payment.booking.update({ booking_status: 'confirmed' });
        if (payment.booking.house) {
          await payment.booking.house.update({ status: 'booked' });
        }
      }

      console.log(`✅ Legacy callback: Payment ${transaction_code} completed`);
    } else {
      await payment.update({ payment_status: 'failed' });
      console.log(`❌ Legacy callback: Payment ${transaction_code} failed — ${result_desc}`);
    }

    res.json({
      success: true,
      message: isSuccess ? 'Payment confirmed' : 'Payment failed',
      data: {
        transaction_code,
        payment_status: payment.payment_status,
      },
    });
  } catch (error) {
    // Always return 200 for Safaricom callbacks even on error
    console.error('❌ M-Pesa callback processing error:', error);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
};

// ===================== Revenue Tracking =====================

/**
 * GET /api/payments/revenue
 * Get revenue tracking statistics (Admin only).
 * Query: ?period=monthly|all&landlord_id=X
 */
const getRevenueStats = async (req, res, next) => {
  try {
    const { landlord_id } = req.query;

    // Base where clause: only completed payments
    const paymentWhere = { payment_status: 'completed' };

    // Include used for landlord-scoped filtering (avoid selecting joined columns in aggregate queries)
    const landlordFilterInclude = landlord_id ? [{
      model: Booking,
      as: 'booking',
      attributes: [],
      required: true,
      include: [{
        model: House,
        as: 'house',
        attributes: [],
        required: true,
        where: { landlord_id: parseInt(landlord_id) },
      }],
    }] : [];

    // 1. Total revenue
    const totalResult = await Payment.findOne({
      where: paymentWhere,
      attributes: [
        [fn('COALESCE', fn('SUM', col('amount')), 0), 'total_revenue'],
        [fn('COUNT', col('Payment.id')), 'total_payments'],
        [fn('COALESCE', fn('AVG', col('amount')), 0), 'average_payment'],
      ],
      include: landlordFilterInclude,
      raw: true,
    });

    // 2. Revenue by month (last 12 months)
    const monthlyRevenue = await Payment.findAll({
      where: {
        ...paymentWhere,
        payment_date: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 12)),
        },
      },
      attributes: [
        [fn('TO_CHAR', col('payment_date'), 'YYYY-MM'), 'month'],
        [fn('SUM', col('amount')), 'revenue'],
        [fn('COUNT', col('Payment.id')), 'payment_count'],
      ],
      include: [{
        model: Booking,
        as: 'booking',
        attributes: [],
        include: [{
          model: House,
          as: 'house',
          attributes: [],
          ...(landlord_id && { where: { landlord_id: parseInt(landlord_id) } }),
        }],
      }],
      group: [literal("TO_CHAR(payment_date, 'YYYY-MM')")],
      order: [[literal("TO_CHAR(payment_date, 'YYYY-MM')"), 'DESC']],
      raw: true,
    });

    // 3. Payment status breakdown
    const statusBreakdown = await Payment.findAll({
      attributes: [
        'payment_status',
        [fn('COUNT', col('Payment.id')), 'count'],
        [fn('COALESCE', fn('SUM', col('amount')), 0), 'total_amount'],
      ],
      include: [{
        model: Booking,
        as: 'booking',
        attributes: [],
        include: [{
          model: House,
          as: 'house',
          attributes: [],
          ...(landlord_id && { where: { landlord_id: parseInt(landlord_id) } }),
        }],
      }],
      group: ['payment_status'],
      raw: true,
    });

    // 4. Revenue by landlord (top 10)
    let revenueByLandlord = [];
    if (!landlord_id) {
      revenueByLandlord = await Payment.findAll({
        where: paymentWhere,
        attributes: [
          [fn('SUM', col('amount')), 'total_revenue'],
          [fn('COUNT', col('Payment.id')), 'payment_count'],
        ],
        include: [{
          model: Booking,
          as: 'booking',
          attributes: [],
          include: [{
            model: House,
            as: 'house',
            attributes: ['landlord_id'],
            include: [{
              model: User,
              as: 'landlord',
              attributes: ['id', 'name', 'email'],
            }],
          }],
        }],
        group: [
          'booking.house.landlord_id',
          'booking.house.landlord.id',
          'booking.house.landlord.name',
          'booking.house.landlord.email',
          'booking.id',
          'booking.house.id',
        ],
        order: [[fn('SUM', col('amount')), 'DESC']],
        limit: 10,
        raw: true,
      });
    }

    res.json({
      success: true,
      data: {
        summary: {
          total_revenue: parseFloat(totalResult?.total_revenue || 0),
          total_payments: parseInt(totalResult?.total_payments || 0),
          average_payment: parseFloat(parseFloat(totalResult?.average_payment || 0).toFixed(2)),
        },
        monthly_revenue: monthlyRevenue,
        status_breakdown: statusBreakdown,
        top_landlords: revenueByLandlord,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  initiateStkPush,
  mpesaCallback,
  getRevenueStats,
};
