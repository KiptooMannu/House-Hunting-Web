import { Context } from 'hono';
import * as sessionService from './chatbot.service.js';
import { createChatbotSessionSchema, updateChatbotSessionSchema, sessionIdParam } from '../validators/validators.js';

export const createSession = async (c: Context) => {
  try {
    const data = createChatbotSessionSchema.parse(await c.req.json());
    // If user is authenticated, attach userId
    // data.userId = c.get('userId');
    const result = await sessionService.createSession(data);
    return c.json(result, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const getSession = async (c: Context) => {
  try {
    const { sessionId } = sessionIdParam.parse(c.req.param());
    const session = await sessionService.getSession(sessionId);
    if (!session) return c.json({ error: 'Session not found' }, 404);
    return c.json(session, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const listSessions = async (c: Context) => {
  try {
    const sessions = await sessionService.listSessions();
    return c.json(sessions, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const updateSession = async (c: Context) => {
  try {
    const { sessionId } = sessionIdParam.parse(c.req.param());
    const updates = updateChatbotSessionSchema.parse(await c.req.json());
    const updated = await sessionService.updateSession(sessionId, updates);
    if (!updated) return c.json({ error: 'Session not found' }, 404);
    return c.json(updated, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const deleteSession = async (c: Context) => {
  try {
    const { sessionId } = sessionIdParam.parse(c.req.param());
    const deleted = await sessionService.deleteSession(sessionId);
    if (!deleted) return c.json({ error: 'Session not found' }, 404);
    return c.json({ message: 'Session deleted' }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const sendMessage = async (c: Context) => {
  try {
    const { message } = await c.req.json();
    const response = await sessionService.getChatResponse(message);
    return c.json({ response }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};