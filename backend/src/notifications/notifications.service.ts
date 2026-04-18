import { eq, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { notifications } from '../db/schema.js';

export const listNotifications = async (userId: number) => {
  return await db.select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
};

export const markAsRead = async (notificationId: number) => {
  const [updated] = await db.update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.notificationId, notificationId))
    .returning();
  return updated;
};

export const markAllAsRead = async (userId: number) => {
  await db.update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
};
