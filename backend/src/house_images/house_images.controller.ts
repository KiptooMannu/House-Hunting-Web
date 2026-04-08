import { Context } from 'hono';
import * as imageService from './house_images.service.js';
import {
  createHouseImageSchema,
  updateHouseImageSchema,
  imageIdParam,
  houseIdParam,
} from '../validators/validators.js';
import cloudinary from '../config/cloudinary.js';

// Existing CRUD functions
export const addImage = async (c: Context) => {
  try {
    const data = createHouseImageSchema.parse(await c.req.json());
    const result = await imageService.addImage(data);
    return c.json(result, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    // Handle duplicate error
    if (error.message === 'Image already exists for this house') {
      return c.json({ error: error.message }, 409);
    }
    return c.json({ error: error.message }, 400);
  }
};

export const getImage = async (c: Context) => {
  try {
    const { imageId } = imageIdParam.parse(c.req.param());
    const image = await imageService.getImage(imageId);
    if (!image) return c.json({ error: 'Image not found' }, 404);
    return c.json(image, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const listImagesByHouse = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const images = await imageService.listImagesByHouse(houseId);
    return c.json(images, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ error: 'Invalid house ID' }, 400);
    }
    return c.json({ error: error.message }, 500);
  }
};

export const updateImage = async (c: Context) => {
  try {
    const { imageId } = imageIdParam.parse(c.req.param());
    const updates = updateHouseImageSchema.parse(await c.req.json());
    const updated = await imageService.updateImage(imageId, updates);
    if (!updated) return c.json({ error: 'Image not found' }, 404);
    return c.json(updated, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 400);
  }
};

export const deleteImage = async (c: Context) => {
  try {
    const { imageId } = imageIdParam.parse(c.req.param());
    const deleted = await imageService.deleteImage(imageId);
    if (!deleted) return c.json({ error: 'Image not found' }, 404);
    return c.json({ message: 'Image deleted' }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

// Upload image to Cloudinary (multipart/form-data)
export const uploadHouseImage = async (c: Context) => {
  try {
    const body = await c.req.parseBody();
    const file = body['image'] as File;
    const houseId = parseInt(body['houseId'] as string);
    const caption = (body['caption'] as string) || '';
    const isPrimary = body['isPrimary'] === 'true';
    const sortOrder = parseInt((body['sortOrder'] as string) || '0');

    if (!file || !houseId) {
      return c.json({ error: 'Missing image or houseId' }, 400);
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'househunt/houses' },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      ).end(buffer);
    });

    // Save image URL to database
    const newImage = await imageService.addImage({
      houseId,
      imageUrl: (result as any).secure_url,
      caption,
      isPrimary,
      sortOrder,
    });

    return c.json(newImage, 201);
  } catch (error: any) {
    console.error('Upload failed:', error);
    if (error.message === 'Image already exists for this house') {
      return c.json({ error: error.message }, 409);
    }
    return c.json({ error: error.message || 'Upload failed' }, 500);
  }
};