import { Context } from 'hono';
import * as userService from './users.service.js';
import {
  createUserSchema,
  updateUserSchema,
  userIdParam,
  userListQuery,
} from '../validators/validators.js';

export const createUser = async (c: Context) => {
  try {
    const data = createUserSchema.parse(await c.req.json());
    const result = await userService.createUser(data);
    return c.json(result, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const getUser = async (c: Context) => {
  try {
    const { userId } = userIdParam.parse(c.req.param());
    const user = await userService.getUser(userId);
    if (!user) return c.json({ error: 'User not found' }, 404);
    return c.json(user, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Invalid user ID' }, 400);
    return c.json({ error: error.message }, 500);
  }
};

export const listUsers = async (c: Context) => {
  try {
    const query = userListQuery.parse(c.req.query());
    const result = await userService.listUsers(query);
    return c.json(result, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Invalid query parameters', details: error.errors }, 400);
    return c.json({ error: error.message }, 500);
  }
};

export const updateUser = async (c: Context) => {
  try {
    const { userId } = userIdParam.parse(c.req.param());
    const updates = updateUserSchema.parse(await c.req.json());
    const updated = await userService.updateUser(userId, updates);
    if (!updated) return c.json({ error: 'User not found' }, 404);
    return c.json(updated, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const deleteUser = async (c: Context) => {
  try {
    const { userId } = userIdParam.parse(c.req.param());
    const deleted = await userService.deleteUser(userId);
    if (!deleted) return c.json({ error: 'User not found' }, 404);
    return c.json({ message: 'User deleted successfully' }, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Invalid user ID' }, 400);
    return c.json({ error: error.message }, 500);
  }
};

export const getProfile = async (c: Context) => {
  try {
    const userId = c.get('userId');
    const user = await userService.getUser(userId);
    if (!user) return c.json({ error: 'User not found' }, 404);
    return c.json({ user }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};