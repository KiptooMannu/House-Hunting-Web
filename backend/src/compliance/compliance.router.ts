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