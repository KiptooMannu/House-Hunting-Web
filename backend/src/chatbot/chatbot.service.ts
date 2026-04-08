import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { chatbotSessions } from '../db/schema.js';

export const createSession = async (data: any) => {
  // Generate sessionToken if not provided
  if (!data.sessionToken) data.sessionToken = crypto.randomUUID();
  const [newSession] = await db.insert(chatbotSessions).values(data).returning();
  return newSession;
};

export const getSession = async (sessionId: number) => {
  return await db.query.chatbotSessions.findFirst({ where: eq(chatbotSessions.sessionId, sessionId) });
};

export const listSessions = async () => {
  return await db.select().from(chatbotSessions);
};

export const updateSession = async (sessionId: number, updates: any) => {
  const [updated] = await db.update(chatbotSessions).set(updates).where(eq(chatbotSessions.sessionId, sessionId)).returning();
  return updated;
};

export const deleteSession = async (sessionId: number) => {
  const [deleted] = await db.delete(chatbotSessions).where(eq(chatbotSessions.sessionId, sessionId)).returning();
  return deleted;
};