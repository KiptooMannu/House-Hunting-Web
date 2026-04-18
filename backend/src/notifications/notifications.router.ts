import { Hono } from 'hono';
import * as notificationController from './notifications.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const notificationsRouter = new Hono();

notificationsRouter.use('/*', authMiddleware);

notificationsRouter.get('/', notificationController.listNotifications);
notificationsRouter.patch('/:id/read', notificationController.markAsRead);
notificationsRouter.post('/read-all', notificationController.markAllAsRead);
