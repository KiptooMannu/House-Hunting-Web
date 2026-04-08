import { Hono } from 'hono';
import {
  createLog,
  listLogs,
  getLog,
  updateLog,
  deleteLog,
  sendRevenueToGava,
  submitNilFiling,
} from './compliance.controller.js';

export const complianceLogsRouter = new Hono();

// Standard CRUD (no middleware)
complianceLogsRouter.post('/', createLog);
complianceLogsRouter.get('/', listLogs);
complianceLogsRouter.get('/:logId', getLog);
complianceLogsRouter.put('/:logId', updateLog);
complianceLogsRouter.delete('/:logId', deleteLog);

// Gava integration endpoints (no middleware)
complianceLogsRouter.post('/gava/send-revenue', sendRevenueToGava);
complianceLogsRouter.post('/gava/nil-filing', submitNilFiling);