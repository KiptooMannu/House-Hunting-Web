import { eq, like, or, and } from 'drizzle-orm';
import { db } from '../db/db.js';
import { chatbotSessions, houses } from '../db/schema.js';

export const createSession = async (data: any) => {
  if (!data.sessionToken) data.sessionToken = crypto.randomUUID();
  const [newSession] = await db.insert(chatbotSessions).values(data).returning();
  return newSession;
};

// INTELLIGENT DISCOVERY: New logic to actually answer about houses
export const getChatResponse = async (query: string) => {
  const normalizedQuery = query.toLowerCase();
  
  // Search for houses matching keywords in query
  const matches = await db.query.houses.findMany({
    where: or(
      like(houses.title, `%${normalizedQuery}%`),
      like(houses.description, `%${normalizedQuery}%`),
      like(houses.addressLine, `%${normalizedQuery}%`)
    ),
    limit: 3
  });

  if (matches.length > 0) {
    const list = matches.map(h => `- ${h.title} (KSh ${h.monthlyRent})`).join('\n');
    return `I've found some premium options that match your request:\n\n${list}\n\nWould you like to view the details or initiate a viewing?`;
  }

  return "I couldn't find an exact match for that specific preference, but I have several upcoming listings in Westlands and Karen. What specific features are you looking for?";
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