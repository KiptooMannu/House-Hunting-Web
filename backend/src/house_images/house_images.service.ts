import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { houseImages } from '../db/schema.js';

export const addImage = async (data: any) => {
  const [newImage] = await db.insert(houseImages).values(data).returning();
  return newImage;
};

export const getImage = async (imageId: number) => {
  return await db.query.houseImages.findFirst({ where: eq(houseImages.imageId, imageId) });
};

export const listImagesByHouse = async (houseId: number) => {
  return await db.select().from(houseImages).where(eq(houseImages.houseId, houseId)).orderBy(houseImages.sortOrder);
};

export const updateImage = async (imageId: number, updates: any) => {
  const [updated] = await db.update(houseImages).set(updates).where(eq(houseImages.imageId, imageId)).returning();
  return updated;
};

export const deleteImage = async (imageId: number) => {
  const [deleted] = await db.delete(houseImages).where(eq(houseImages.imageId, imageId)).returning();
  return deleted;
};