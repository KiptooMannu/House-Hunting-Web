import { Hono } from 'hono';
import { authMiddleware, adminOrLandlordMiddleware } from '../middleware/authMiddleware.js';
import {
  createLog,
  listLogs,
  getLog,
  updateLog,
  deleteLog,
  sendRevenueToGava,
  submitNilFiling,
  validateTCC,
  verifyCompliance,
  verifyNationalId,
} from './compliance.controller.js';
import { calculateRentalTax, getTaxRatesSummary } from './tax.engine.js';

export const complianceLogsRouter = new Hono();

// Secure all routes
complianceLogsRouter.use('*', authMiddleware);

// Standard CRUD
complianceLogsRouter.post('/', adminOrLandlordMiddleware, createLog);
complianceLogsRouter.get('/', adminOrLandlordMiddleware, listLogs);
complianceLogsRouter.get('/:logId', adminOrLandlordMiddleware, getLog);
complianceLogsRouter.put('/:logId', adminOrLandlordMiddleware, updateLog);
complianceLogsRouter.delete('/:logId', adminOrLandlordMiddleware, deleteLog);

// Gava integration endpoints
complianceLogsRouter.post('/gava/send-revenue', adminOrLandlordMiddleware, sendRevenueToGava);
complianceLogsRouter.post('/gava/nil-filing', adminOrLandlordMiddleware, submitNilFiling);
complianceLogsRouter.post('/gava/validate-tcc', adminOrLandlordMiddleware, validateTCC);
complianceLogsRouter.post('/gava/verify', adminOrLandlordMiddleware, verifyCompliance);
complianceLogsRouter.post('/gava/verify-id', adminOrLandlordMiddleware, verifyNationalId);

// ── Tax Rules Engine ─────────────────────────────────────────────────────────
// POST /api/compliance/tax/calculate  { monthlyRent, bookingFee?, isShortTermLodging? }
complianceLogsRouter.post('/tax/calculate', async (c) => {
  try {
    const body = await c.req.json();
    const monthlyRent = Number(body.monthlyRent);
    if (!monthlyRent || monthlyRent <= 0) {
      return c.json({ error: 'monthlyRent must be a positive number' }, 400);
    }
    const result = calculateRentalTax({
      monthlyRent,
      bookingFee:        body.bookingFee        ? Number(body.bookingFee)  : 0,
      isShortTermLodging: body.isShortTermLodging ?? false,
    });
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/compliance/tax/rates  — returns all current KRA tax rates
complianceLogsRouter.get('/tax/rates', (c) => c.json(getTaxRatesSummary()));