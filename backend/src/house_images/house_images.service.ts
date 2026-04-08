import { eq, and } from 'drizzle-orm';
import { db } from '../db/db.js';
import { houseImages } from '../db/schema.js';
import cloudinary from '../config/cloudinary.js';

export const addImage = async (data: any) => {
  // Check if the same image URL already exists for this house
  const existing = await db.query.houseImages.findFirst({
    where: and(
      eq(houseImages.houseId, data.houseId),
      eq(houseImages.imageUrl, data.imageUrl)
    ),
  });
  if (existing) {
    throw new Error('Image already exists for this house');
  }

  const [newImage] = await db.insert(houseImages).values(data).returning();
  return newImage;
};

export const getImage = async (imageId: number) => {
  return await db.query.houseImages.findFirst({
    where: eq(houseImages.imageId, imageId),
  });
};

export const listImagesByHouse = async (houseId: number) => {
  return await db
    .select()
    .from(houseImages)
    .where(eq(houseImages.houseId, houseId))
    .orderBy(houseImages.sortOrder);
};

export const updateImage = async (imageId: number, updates: any) => {
  const [updated] = await db
    .update(houseImages)
    .set(updates)
    .where(eq(houseImages.imageId, imageId))
    .returning();
  return updated;
};

export const deleteImage = async (imageId: number) => {
  // Get image record to retrieve Cloudinary public_id
  const image = await getImage(imageId);
  if (image && image.imageUrl) {
    // Extract public_id from Cloudinary URL (works for uploaded images)
    const urlParts = image.imageUrl.split('/');
    const publicId = urlParts.slice(urlParts.indexOf('househunt')).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  }

  const [deleted] = await db
    .delete(houseImages)
    .where(eq(houseImages.imageId, imageId))
    .returning();
  return deleted;
};