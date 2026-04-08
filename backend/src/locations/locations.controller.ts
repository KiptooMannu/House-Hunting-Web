import { Context } from 'hono';
import * as locationService from './locations.service.js';
import { createLocationSchema, updateLocationSchema, locationIdParam } from '../validators/validators.js';

export const createLocation = async (c: Context) => {
  try {
    const data = createLocationSchema.parse(await c.req.json());
    const result = await locationService.createLocation(data);
    return c.json(result, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const getLocation = async (c: Context) => {
  try {
    const { locationId } = locationIdParam.parse(c.req.param());
    const location = await locationService.getLocation(locationId);
    if (!location) return c.json({ error: 'Location not found' }, 404);
    return c.json(location, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const listLocations = async (c: Context) => {
  try {
    const locations = await locationService.listLocations();
    return c.json(locations, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const updateLocation = async (c: Context) => {
  try {
    const { locationId } = locationIdParam.parse(c.req.param());
    const updates = updateLocationSchema.parse(await c.req.json());
    const updated = await locationService.updateLocation(locationId, updates);
    if (!updated) return c.json({ error: 'Location not found' }, 404);
    return c.json(updated, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const deleteLocation = async (c: Context) => {
  try {
    const { locationId } = locationIdParam.parse(c.req.param());
    const deleted = await locationService.deleteLocation(locationId);
    if (!deleted) return c.json({ error: 'Location not found' }, 404);
    return c.json({ message: 'Location deleted' }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};