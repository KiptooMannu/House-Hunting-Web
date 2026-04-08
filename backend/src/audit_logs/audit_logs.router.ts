import { Hono } from 'hono';
import * as auditController from './audit_logs.controller';

export const auditLogsRouter = new Hono();

auditLogsRouter.get('/', auditController.listAuditLogs);
auditLogsRouter.get('/:logId', auditController.getAuditLog);
auditLogsRouter.post('/', auditController.createAuditLog);