import { Hono } from 'hono';
import * as sessionController from './chatbot.controller.js';

export const chatbotSessionsRouter = new Hono();

chatbotSessionsRouter.get('/', sessionController.listSessions);
chatbotSessionsRouter.get('/:sessionId', sessionController.getSession);
chatbotSessionsRouter.post('/', sessionController.createSession);
chatbotSessionsRouter.put('/:sessionId', sessionController.updateSession);
chatbotSessionsRouter.delete('/:sessionId', sessionController.deleteSession);