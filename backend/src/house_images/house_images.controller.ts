import { Context } from 'hono';
import * as imageService from './house_images.service.js';
import { createHouseImageSchema, updateHouseImageSchema, imageIdParam, houseIdParam } from '../validators/validators.js';

export const addImage = async (c: Context) => {
  try {
    const data = createHouseImageSchema.parse(await c.req.json());
    const result = await imageService.addImage(data);
    return c.json(result, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
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
    if (error.name === 'ZodError') return c.json({ error: 'Invalid house ID' }, 400);
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
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
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