import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { webhooks } from '../db/schema.js';
import logger from '../utils/logger.js';

export const listWebhooks = async () => {
  return await db.select().from(webhooks);
};

export const createWebhook = async (data: any) => {
  const [newHook] = await db.insert(webhooks).values(data).returning();
  logger.info('Created new outbound webhook subscription', { webhookId: newHook.webhookId, url: newHook.url });
  return newHook;
};

export const updateWebhook = async (webhookId: number, updates: any) => {
  const [updated] = await db
    .update(webhooks)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(webhooks.webhookId, webhookId))
    .returning();
  return updated;
};

export const deleteWebhook = async (webhookId: number) => {
  const [deleted] = await db
    .delete(webhooks)
    .where(eq(webhooks.webhookId, webhookId))
    .returning();
  return deleted;
};
