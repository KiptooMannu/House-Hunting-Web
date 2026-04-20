import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import {
  listWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
} from './webhooks.controller.js';

export const webhooksRouter = new Hono();

// Secure: Admin only for all routes
webhooksRouter.use('*', authMiddleware, adminMiddleware);

webhooksRouter.get('/', listWebhooks);
webhooksRouter.post('/', createWebhook);
webhooksRouter.put('/:webhookId', updateWebhook);
webhooksRouter.delete('/:webhookId', deleteWebhook);
