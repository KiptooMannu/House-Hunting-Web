// src/modules/houses/houses.controller.ts
import { Context } from 'hono';
import * as houseService from './houses.service.js';
import {
  createHouseSchema,
  updateHouseSchema,
  houseIdParam,
  houseListQuery,
} from '../validators/validators.js';

export const createHouse = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = createHouseSchema.parse(body);
    const landlordId = c.get('userId');
    const result = await houseService.createHouse({
      ...validatedData,
      landlordId,
    });
    return c.json(result, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 400);
  }
};

export const getHouse = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const house = await houseService.getHouse(houseId);
    if (!house) return c.json({ error: 'House not found' }, 404);
    return c.json(house, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const listHouses = async (c: Context) => {
  try {
    const query = houseListQuery.parse(c.req.query());
    const result = await houseService.listHouses(query);
    return c.json(result, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ error: 'Invalid query', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 500);
  }
};

export const listUniqueTowns = async (c: Context) => {
  try {
    const results = await houseService.listUniqueTowns();
    return c.json(results, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const updateHouse = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const updates = updateHouseSchema.parse(await c.req.json());
    const updated = await houseService.updateHouse(houseId, updates);
    if (!updated) return c.json({ error: 'House not found' }, 404);
    return c.json(updated, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 400);
  }
};

export const deleteHouse = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const deleted = await houseService.deleteHouse(houseId);
    if (!deleted) return c.json({ error: 'House not found' }, 404);
    return c.json({ message: 'House deleted' }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};