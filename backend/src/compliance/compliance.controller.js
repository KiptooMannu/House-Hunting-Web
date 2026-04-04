const { Op, fn, col } = require('sequelize');
const { ComplianceLog, Payment, Booking, House, User, sequelize } = require('../models');
const gavaService = require('./gava.service');

// ===================== Simulation Helper =====================

/**
 * Generate a simulated GavaConnect response (used when API credentials are not configured).
 */
function simulateGavaResponse(data) {
  const referenceNumber = `GAVA-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  return {
    success: true,
    referenceNumber,
    status: 'filed',
    message: `Revenue report for period ${data.period} has been filed successfully.`,
    filedAt: new Date().toISOString(),
    rawResponse: {
      simulated: true,
      referenceNumber,
      taxpayerPin: data.landlordPin || 'N/A',
      period: data.period,
      grossRevenue: data.total_revenue,
      taxComputed: data.tax_amount,
      filingType: data.compliance_action === 'nil_filing' ? 'NIL_FILING' : 'REVENUE_REPORT',
    },
  };
}

// ===================== Revenue Calculation =====================

/**
 * Calculate total platform revenue in a given period.
 * Platform revenue = sum of completed payments in that month.
 * Period format: "YYYY-MM" (e.g., "2026-03")
 */
async function calculatePlatformRevenue(period) {
  const [year, month] = period.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month

  const result = await Payment.findOne({
    where: {
      payment_status: 'completed',
      payment_date: {
        [Op.between]: [startDate, endDate],
      },
    },
    attributes: [
      [fn('COALESCE', fn('SUM', col('amount')), 0), 'total_revenue'],
      [fn('COUNT', col('Payment.id')), 'payment_count'],
    ],
    raw: true,
  });

  return {
    total_revenue: parseFloat(result?.total_revenue || 0),
    payment_count: parseInt(result?.payment_count || 0),
  };
}

// ===================== CRUD Operations =====================

/**
 * POST /api/compliance
 * Create a compliance record (Admin; platform-level).
 */
const createComplianceLog = async (req, res, next) => {
  try {
    const { period, compliance_action, total_revenue, tax_amount } = req.body;

    // Check for duplicate filing in the same period
    const existing = await ComplianceLog.findOne({
      where: {
        // "landlord_id" is used as the actor user id for platform compliance
        landlord_id: req.user.id,
        period,
        compliance_action,
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A ${compliance_action} record already exists for period ${period}.`,
      });
    }

    const log = await ComplianceLog.create({
      landlord_id: req.user.id,
      period,
      compliance_action,
      total_revenue: total_revenue || 0,
      tax_amount: tax_amount || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Compliance record created successfully',
      data: { compliance: log },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/compliance
 * List platform compliance records (Admin-only route).
 */
const getComplianceLogs = async (req, res, next) => {
  try {
    const { period, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (period) where.period = period;
    if (status) where.response_status = status;

    const { count, rows: logs } = await ComplianceLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'landlord',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['log_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        compliance: logs,
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
 * GET /api/compliance/:id
 * Get a single compliance record.
 */
const getComplianceLogById = async (req, res, next) => {
  try {
    const log = await ComplianceLog.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'landlord',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Compliance record not found.',
      });
    }

    res.json({ success: true, data: { compliance: log } });
  } catch (error) {
    next(error);
  }
};

// ===================== GavaConnect: Send Revenue =====================

/**
 * POST /api/compliance/gava/send-revenue
 * Send platform revenue data to GavaConnect API (Admin only).
 * Falls back to simulation if GavaConnect credentials are not configured.
 * Body: { period }
 */
const sendRevenueToGava = async (req, res, next) => {
  try {
    const { period } = req.body;

    if (!period) {
      return res.status(400).json({
        success: false,
        message: 'period is required (format: YYYY-MM, e.g., "2026-03").',
      });
    }

    // Validate period format
    const periodRegex = /^\d{4}-\d{2}$/;
    if (!periodRegex.test(period)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid period format. Use YYYY-MM (e.g., "2026-03").',
      });
    }

    // Check for duplicate filing
    const existingLog = await ComplianceLog.findOne({
      where: {
        landlord_id: req.user.id,
        period,
        compliance_action: 'revenue_report',
        response_status: 'filed',
      },
    });

    if (existingLog) {
      return res.status(400).json({
        success: false,
        message: `Revenue report for period ${period} has already been filed.`,
        data: { existing_log: existingLog },
      });
    }

    // Calculate revenue for the whole platform in this period
    const revenueData = await calculatePlatformRevenue(period);

    // Calculate tax (10% of revenue — simplified Kenyan rental income tax bracket)
    const taxRate = 0.10;
    const taxAmount = parseFloat((revenueData.total_revenue * taxRate).toFixed(2));

    let gavaResponse;
    let mode;

    // ---- Real GavaConnect API ----
    if (gavaService.isConfigured()) {
      console.log('📊 Sending revenue report to GavaConnect API...');
      mode = 'live';

      try {
        gavaResponse = await gavaService.submitRevenueReport({
          landlordPin: process.env.PLATFORM_KRA_PIN || 'N/A',
          landlordName: process.env.PLATFORM_NAME || 'HouseHunt KE',
          landlordEmail: process.env.PLATFORM_EMAIL || 'admin@househunting.co.ke',
          period,
          totalRevenue: revenueData.total_revenue,
          taxAmount,
        });
      } catch (apiError) {
        console.error('❌ GavaConnect API error:', apiError.response?.data || apiError.message);

        // Log the failed attempt
        const failedLog = await ComplianceLog.create({
          landlord_id: req.user.id,
          period,
          compliance_action: 'revenue_report',
          total_revenue: revenueData.total_revenue,
          tax_amount: taxAmount,
          response_status: 'failed',
          gava_raw_response: apiError.response?.data || { error: apiError.message },
          log_date: new Date(),
        });

        return res.status(502).json({
          success: false,
          message: 'GavaConnect API returned an error.',
          data: {
            compliance: failedLog,
            error: apiError.response?.data?.message || apiError.message,
          },
        });
      }
    } else {
      // ---- Simulation Fallback ----
      console.log('⚠️  GavaConnect not configured — using simulation');
      mode = 'simulation';

      gavaResponse = simulateGavaResponse({
        landlordPin: process.env.PLATFORM_KRA_PIN || 'N/A',
        period,
        total_revenue: revenueData.total_revenue,
        tax_amount: taxAmount,
        compliance_action: 'revenue_report',
      });
    }

    // Log the compliance record
    const complianceLog = await ComplianceLog.create({
      landlord_id: req.user.id,
      period,
      compliance_action: 'revenue_report',
      total_revenue: revenueData.total_revenue,
      tax_amount: taxAmount,
      response_status: 'filed',
      gava_reference_number: gavaResponse.referenceNumber,
      gava_raw_response: gavaResponse.rawResponse || gavaResponse,
      log_date: new Date(),
    });

    res.status(201).json({
      success: true,
      message: mode === 'live'
        ? 'Revenue data sent to GavaConnect successfully'
        : 'Revenue data sent to GavaConnect successfully (simulation)',
      mode,
      data: {
        compliance: complianceLog,
        gava_response: {
          reference_number: gavaResponse.referenceNumber,
          status: gavaResponse.status,
          message: gavaResponse.message,
          filed_at: gavaResponse.filedAt,
        },
        revenue_summary: {
          period,
          platform: {
            name: process.env.PLATFORM_NAME || 'HouseHunt KE',
            email: process.env.PLATFORM_EMAIL || 'admin@househunting.co.ke',
          },
          total_revenue: revenueData.total_revenue,
          payment_count: revenueData.payment_count,
          tax_rate: `${taxRate * 100}%`,
          tax_amount: taxAmount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ===================== GavaConnect: Nil Filing =====================

/**
 * POST /api/compliance/gava/nil-filing
 * Submit a platform nil filing to GavaConnect API (Admin only).
 * Falls back to simulation if credentials are not configured.
 * Body: { period }
 */
const submitNilFiling = async (req, res, next) => {
  try {
    const { period } = req.body;

    if (!period) {
      return res.status(400).json({
        success: false,
        message: 'period is required (format: YYYY-MM, e.g., "2026-03").',
      });
    }

    // Validate period format
    const periodRegex = /^\d{4}-\d{2}$/;
    if (!periodRegex.test(period)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid period format. Use YYYY-MM (e.g., "2026-03").',
      });
    }

    // Check for duplicate filing
    const existingLog = await ComplianceLog.findOne({
      where: {
        landlord_id: req.user.id,
        period,
        compliance_action: 'nil_filing',
      },
    });

    if (existingLog) {
      return res.status(400).json({
        success: false,
        message: `Nil filing for period ${period} has already been submitted.`,
        data: { existing_log: existingLog },
      });
    }

    // Verify there's actually no platform revenue
    const revenueData = await calculatePlatformRevenue(period);
    let warning = null;

    if (revenueData.total_revenue > 0) {
      warning = `Warning: You have KES ${revenueData.total_revenue.toLocaleString()} in revenue for this period. Consider filing a revenue report instead.`;
    }

    let gavaResponse;
    let mode;

    // ---- Real GavaConnect API ----
    if (gavaService.isConfigured()) {
      console.log('📊 Submitting nil filing to GavaConnect API...');
      mode = 'live';

      try {
        gavaResponse = await gavaService.submitNilFiling({
          landlordPin: process.env.PLATFORM_KRA_PIN || 'N/A',
          landlordName: process.env.PLATFORM_NAME || 'HouseHunt KE',
          landlordEmail: process.env.PLATFORM_EMAIL || 'admin@househunting.co.ke',
          period,
        });
      } catch (apiError) {
        console.error('❌ GavaConnect API error:', apiError.response?.data || apiError.message);

        const failedLog = await ComplianceLog.create({
          landlord_id: req.user.id,
          period,
          compliance_action: 'nil_filing',
          total_revenue: 0,
          tax_amount: 0,
          response_status: 'failed',
          gava_raw_response: apiError.response?.data || { error: apiError.message },
          log_date: new Date(),
        });

        return res.status(502).json({
          success: false,
          message: 'GavaConnect API returned an error.',
          data: {
            compliance: failedLog,
            error: apiError.response?.data?.message || apiError.message,
          },
        });
      }
    } else {
      // ---- Simulation Fallback ----
      console.log('⚠️  GavaConnect not configured — using simulation');
      mode = 'simulation';

      gavaResponse = simulateGavaResponse({
        landlordPin: process.env.PLATFORM_KRA_PIN || 'N/A',
        period,
        total_revenue: 0,
        tax_amount: 0,
        compliance_action: 'nil_filing',
      });
    }

    // Create compliance log
    const complianceLog = await ComplianceLog.create({
      landlord_id: req.user.id,
      period,
      compliance_action: 'nil_filing',
      total_revenue: 0,
      tax_amount: 0,
      response_status: 'filed',
      gava_reference_number: gavaResponse.referenceNumber,
      gava_raw_response: gavaResponse.rawResponse || gavaResponse,
      log_date: new Date(),
    });

    const responseData = {
      compliance: complianceLog,
      gava_response: {
        reference_number: gavaResponse.referenceNumber,
        status: gavaResponse.status,
        message: gavaResponse.message,
        filed_at: gavaResponse.filedAt,
      },
    };

    if (warning) {
      responseData.warning = warning;
    }

    res.status(201).json({
      success: true,
      message: mode === 'live'
        ? 'Nil filing submitted to GavaConnect successfully'
        : 'Nil filing submitted to GavaConnect successfully (simulation)',
      mode,
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplianceLog,
  getComplianceLogs,
  getComplianceLogById,
  sendRevenueToGava,
  submitNilFiling,
};
