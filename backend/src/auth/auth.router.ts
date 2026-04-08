// src/modules/auth/auth.router.ts
import { Hono } from 'hono';
import {
  login,
  changePassword,
  adminCreateUser,
  adminResetPassword,
  refreshToken,
} from './auth.controller.js';

export const authRouter = new Hono();

// Public routes (no restrictions)
authRouter.post('/login', login);
authRouter.post('/refresh', refreshToken);
authRouter.post('/change-password', changePassword);
authRouter.post('/users', adminCreateUser);
authRouter.post('/users/:userId/reset-password', adminResetPassword);