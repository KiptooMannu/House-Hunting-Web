import { Context } from 'hono';
import * as notificationService from './notifications.service.js';

export const listNotifications = async (c: Context) => {
  try {
    const userId = c.get('userId');
    const result = await notificationService.listNotifications(userId);
    return c.json(result, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const markAsRead = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    const updated = await notificationService.markAsRead(id);
    return c.json(updated, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const markAllAsRead = async (c: Context) => {
  try {
    const userId = c.get('userId');
    await notificationService.markAllAsRead(userId);
    return c.json({ message: 'All notifications marked as read' }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};
