import { Context } from 'hono';
import * as webhookService from './webhooks.service.js';

export const listWebhooks = async (c: Context) => {
  try {
    const webhooks = await webhookService.listWebhooks();
    return c.json(webhooks, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const createWebhook = async (c: Context) => {
  try {
    const body = await c.req.json();
    const result = await webhookService.createWebhook(body);
    return c.json(result, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const updateWebhook = async (c: Context) => {
  try {
    const webhookId = parseInt(c.req.param('webhookId') || '0');
    const updates = await c.req.json();
    const updated = await webhookService.updateWebhook(webhookId, updates);
    if (!updated) return c.json({ error: 'Webhook not found' }, 404);
    return c.json(updated, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const deleteWebhook = async (c: Context) => {
  try {
    const webhookId = parseInt(c.req.param('webhookId') || '0');
    const result = await webhookService.deleteWebhook(webhookId);
    if (!result) return c.json({ error: 'Webhook not found' }, 404);
    return c.json({ message: 'Webhook deleted' }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};
