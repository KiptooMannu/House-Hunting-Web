import { Context } from 'hono';
import * as auditService from './audit_logs.service.js';
import { createAuditLogSchema, auditIdParam } from '../validators/validators.js';

export const createAuditLog = async (c: Context) => {
  try {
    const data = createAuditLogSchema.parse(await c.req.json());
    // data.performedById = c.get('userId');
    const result = await auditService.createAuditLog(data);
    return c.json(result, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const getAuditLog = async (c: Context) => {
  try {
    const { logId } = auditIdParam.parse(c.req.param());
    const log = await auditService.getAuditLog(logId);
    if (!log) return c.json({ error: 'Audit log not found' }, 404);
    return c.json(log, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const listAuditLogs = async (c: Context) => {
  try {
    const logs = await auditService.listAuditLogs();
    return c.json(logs, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};