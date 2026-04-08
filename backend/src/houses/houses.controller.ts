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
    console.log('📦 [createHouse] Received body:', JSON.stringify(body, null, 2));

    const validatedData = createHouseSchema.parse(body);
    console.log('✅ [createHouse] Zod validation passed');

    const landlordId = c.get('userId');
    console.log('👤 [createHouse] Landlord ID from token:', landlordId);

    const result = await houseService.createHouse({
      ...validatedData,
      landlordId,
    });
    console.log('🏠 [createHouse] House created, ID:', result.houseId);
    return c.json(result, 201);
  } catch (error: any) {
    console.error('❌ [createHouse] Error:', error);
    if (error.name === 'ZodError') {
      console.error('🔴 Zod validation errors:', JSON.stringify(error.errors, null, 2));
      return c.json(
        {
          error: 'Validation failed',
          details: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        400
      );
    }
    return c.json({ error: error.message }, 400);
  }
};

export const updateHouse = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const updates = updateHouseSchema.parse(await c.req.json());
    console.log('✏️ [updateHouse] Updating house', houseId, updates);
    const updated = await houseService.updateHouse(houseId, updates);
    if (!updated) return c.json({ error: 'House not found' }, 404);
    return c.json(updated, 200);
  } catch (error: any) {
    console.error('❌ [updateHouse] Error:', error);
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 400);
  }
};

export const deleteHouse = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    console.log('🗑️ [deleteHouse] Deleting house ID:', houseId);
    const deleted = await houseService.deleteHouse(houseId);
    if (!deleted) return c.json({ error: 'House not found' }, 404);
    return c.json({ message: 'House deleted' }, 200);
  } catch (error: any) {
    console.error('❌ [deleteHouse] Error:', error);
    return c.json({ error: error.message }, 500);
  }
};