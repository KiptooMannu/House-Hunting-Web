import { Hono } from 'hono';
import {
  login,
  changePassword,
  adminCreateUser,
  adminResetPassword,
  refreshToken,
} from './auth.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

export const authRouter = new Hono();

// Public routes (no authentication)
authRouter.post('/login', login);
authRouter.post('/refresh', refreshToken);

// Protected routes (require valid access token)
authRouter.post('/change-password', authMiddleware, changePassword);

// Admin-only routes (require authentication + admin role)
authRouter.post('/users', authMiddleware, adminMiddleware, adminCreateUser);
authRouter.post('/users/:userId/reset-password', authMiddleware, adminMiddleware, adminResetPassword);