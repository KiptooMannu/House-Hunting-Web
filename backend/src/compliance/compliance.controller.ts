import { Context } from 'hono';
import * as complianceService from './compliance.service.js';
import {
  createComplianceLogSchema,
  updateComplianceLogSchema,
  complianceIdParam,
} from '../validators/validators.js';

export const createLog = async (c: Context) => {
  try {
    const data = createComplianceLogSchema.parse(await c.req.json());
    const result = await complianceService.createLog(data);
    return c.json(result, 201);
  } catch (error: any) {
    if (error.name === 'ZodError')
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const getLog = async (c: Context) => {
  try {
    const { logId } = complianceIdParam.parse(c.req.param());
    const log = await complianceService.getLog(logId);
    if (!log) return c.json({ error: 'Log not found' }, 404);
    return c.json(log, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const listLogs = async (c: Context) => {
  try {
    const role = c.get('role'); // userRole is stored as 'role' in authMiddleware
    const userId = c.get('userId');
    const landlordId = role === 'landlord' ? userId : undefined;
    const logs = await complianceService.listLogs(landlordId);
    return c.json(logs, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const updateLog = async (c: Context) => {
  try {
    const { logId } = complianceIdParam.parse(c.req.param());
    const updates = updateComplianceLogSchema.parse(await c.req.json());
    const updated = await complianceService.updateLog(logId, updates);
    if (!updated) return c.json({ error: 'Log not found' }, 404);
    return c.json(updated, 200);
  } catch (error: any) {
    if (error.name === 'ZodError')
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const deleteLog = async (c: Context) => {
  try {
    const { logId } = complianceIdParam.parse(c.req.param());
    const result = await complianceService.deleteLog(logId);
    if (!result) return c.json({ error: 'Log not found' }, 404);
    return c.json({ message: 'Log deleted' }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const sendRevenueToGava = async (c: Context) => {
  try {
    const body = await c.req.json();
    const result = await complianceService.sendRevenueToGava(body);
    return c.json(result, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const submitNilFiling = async (c: Context) => {
  try {
    const body = await c.req.json();
    const userId = c.get('userId');
    const result = await complianceService.submitNilFiling({ ...body, initiatedById: userId });
    return c.json(result, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const validateTCC = async (c: Context) => {
  try {
    const body = await c.req.json();
    if (!body.kraPIN || !body.tccNumber) {
        return c.json({ error: 'kraPIN and tccNumber are required.' }, 400);
    }
    const result = await complianceService.validateLandlordTCC(body.kraPIN, body.tccNumber);
    return c.json(result, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const verifyCompliance = async (c: Context) => {
  try {
    const body = await c.req.json();
    const adminId = c.get('userId');
    const result = await complianceService.verifyCompliance({ ...body, adminId });
    return c.json(result, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const verifyNationalId = async (c: Context) => {
  try {
    const body = await c.req.json();
    const adminId = c.get('userId');
    const result = await complianceService.verifyNationalId({ ...body, adminId });
    return c.json(result, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};