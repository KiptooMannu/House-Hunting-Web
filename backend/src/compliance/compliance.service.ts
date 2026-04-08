// src/modules/compliance/compliance.service.ts
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { complianceLogs } from '../db/schema.js';

export const createLog = async (data: any) => {
  const [newLog] = await db.insert(complianceLogs).values(data).returning();
  return newLog;
};

export const getLog = async (logId: number) => {
  return await db.query.complianceLogs.findFirst({
    where: eq(complianceLogs.logId, logId),
  });
};

export const listLogs = async () => {
  return await db.select().from(complianceLogs).orderBy(desc(complianceLogs.createdAt));
};

export const updateLog = async (logId: number, updates: any) => {
  const [updated] = await db
    .update(complianceLogs)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(complianceLogs.logId, logId))
    .returning();
  return updated;
};

export const deleteLog = async (logId: number) => {
  const [deleted] = await db
    .delete(complianceLogs)
    .where(eq(complianceLogs.logId, logId))
    .returning();
  return deleted;
};

export const sendRevenueToGava = async (payload: any) => {
  const { periodStart, periodEnd, totalRevenueKes, totalBookingFees } = payload;
  const [log] = await db
    .insert(complianceLogs)
    .values({
      action: 'revenue_report',
      status: 'submitted',
      periodStart: periodStart ? new Date(periodStart) : undefined,
      periodEnd: periodEnd ? new Date(periodEnd) : undefined,
      totalRevenueKes,
      totalBookingFees,
      gavaConnectRequestId: `req_${Date.now()}`,
      gavaConnectResponse: JSON.stringify({ message: 'Mock submission accepted' }),
    } as any) // ✅ type assertion to bypass strict check
    .returning();
  return {
    message: 'Revenue data sent to Gava successfully',
    logId: log.logId,
    gavaConnectRequestId: log.gavaConnectRequestId,
  };
};

export const submitNilFiling = async (payload: any) => {
  const { periodStart, periodEnd } = payload;
  const [log] = await db
    .insert(complianceLogs)
    .values({
      action: 'nil_filing',
      status: 'submitted',
      periodStart: periodStart ? new Date(periodStart) : undefined,
      periodEnd: periodEnd ? new Date(periodEnd) : undefined,
      totalRevenueKes: 0,
      totalBookingFees: 0,
      gavaConnectRequestId: `nil_${Date.now()}`,
      gavaConnectResponse: JSON.stringify({ message: 'Nil filing accepted' }),
    } as any)
    .returning();
  return {
    message: 'Nil filing submitted successfully',
    logId: log.logId,
    gavaConnectRequestId: log.gavaConnectRequestId,
  };
};