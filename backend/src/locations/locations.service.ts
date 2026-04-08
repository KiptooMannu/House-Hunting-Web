import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { locations } from '../db/schema.js';

export const createLocation = async (data: any) => {
  const [newLocation] = await db.insert(locations).values(data).returning();
  return newLocation;
};

export const getLocation = async (locationId: number) => {
  return await db.query.locations.findFirst({ where: eq(locations.locationId, locationId) });
};

export const listLocations = async () => {
  return await db.select().from(locations);
};

export const updateLocation = async (locationId: number, updates: any) => {
  const [updated] = await db.update(locations).set(updates).where(eq(locations.locationId, locationId)).returning();
  return updated;
};

export const deleteLocation = async (locationId: number) => {
  const [deleted] = await db.delete(locations).where(eq(locations.locationId, locationId)).returning();
  return deleted;
};