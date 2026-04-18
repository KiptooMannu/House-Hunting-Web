import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { auditLogs } from '../db/schema.js';

export const createAuditLog = async (data: any) => {
  const [newLog] = await db.insert(auditLogs).values(data).returning();
  return newLog;
};

export const getAuditLog = async (logId: number) => {
  return await db.query.auditLogs.findFirst({ where: eq(auditLogs.logId, logId) });
};

export const listAuditLogs = async () => {
  return await db.query.auditLogs.findMany({
    with: {
      performedBy: true,
    },
    orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],
  });
};