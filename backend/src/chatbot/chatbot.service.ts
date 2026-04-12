import { eq, like, or, and } from 'drizzle-orm';
import { db } from '../db/db.js';
import { chatbotSessions, houses } from '../db/schema.js';

export const createSession = async (data: any) => {
  if (!data.sessionToken) data.sessionToken = crypto.randomUUID();
  const [newSession] = await db.insert(chatbotSessions).values(data).returning();
  return newSession;
};

// INTELLIGENT DISCOVERY: Enhanced logic to return curated property cards
export const getChatResponse = async (query: string) => {
  const normalizedQuery = query.toLowerCase();
  
  // Search for houses matching keywords
  const matches = await db.query.houses.findMany({
    where: or(
      like(houses.title, `%${normalizedQuery}%`),
      like(houses.description, `%${normalizedQuery}%`),
      like(houses.addressLine, `%${normalizedQuery}%`)
    ),
    limit: 5,
    with: {
      location: true,
      images: {
        limit: 1
      }
    }
  });

  if (matches.length > 0) {
    const list = matches.map(h => h.title).join(', ');
    return {
      reply: `I have isolated several high-authority nodes that align with your criteria, including ${list}. I have populated your Discovery Canvas with the specifics.`,
      houses: matches.map(h => ({
        id: h.houseId,
        title: h.title,
        rent: h.monthlyRent,
        county: h.location?.town || 'Nairobi',
        images: h.images?.map(img => img.imageUrl) || []
      }))
    };
  }

  return {
    reply: "My intelligence nodes couldn't isolate an exact match for that specific preference, but I have several upcoming institutional listings in Westlands and Karen. What specific ROI or lifestyle features should I prioritize?",
    houses: []
  };
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