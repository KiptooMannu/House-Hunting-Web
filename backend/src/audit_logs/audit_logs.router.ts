import { Hono } from 'hono';
import * as auditController from './audit_logs.controller.js';
import { authMiddleware, adminOrLandlordMiddleware } from '../middleware/authMiddleware.js';

export const auditLogsRouter = new Hono();

// Audit logs are strictly for elevated roles
auditLogsRouter.use('*', authMiddleware);
auditLogsRouter.use('*', adminOrLandlordMiddleware);

auditLogsRouter.get('/', auditController.listAuditLogs);
auditLogsRouter.get('/:logId', auditController.getAuditLog);
auditLogsRouter.post('/', auditController.createAuditLog);