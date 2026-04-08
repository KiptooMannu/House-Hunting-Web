// src/index.ts
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { authRouter } from './auth/auth.router.js';
import { usersRouter } from './users/users.router.js';
import { locationsRouter } from './locations/locations.router.js';
import { housesRouter } from './houses/houses.router.js';
import { houseImagesRouter } from './house_images/house_images.router.js';
import { chatbotSessionsRouter } from './chatbot/chatbot.router.js';
import { bookingsRouter } from './bookings/bookings.router.js';
import { paymentsRouter } from './payments/payments.router.js';
import { complianceLogsRouter } from './compliance/compliance.router.js';
import { auditLogsRouter } from './audit_logs/audit_logs.router.js';

const app = new Hono();

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Mount all routers
app.route('/auth', authRouter);
app.route('/users', usersRouter);
app.route('/locations', locationsRouter);
app.route('/houses', housesRouter);
app.route('/house-images', houseImagesRouter);
app.route('/chatbot-sessions', chatbotSessionsRouter);
app.route('/bookings', bookingsRouter);
app.route('/payments', paymentsRouter);
app.route('/compliance-logs', complianceLogsRouter);
app.route('/audit-logs', auditLogsRouter);

// 404 handler
app.notFound((c) => c.json({ error: 'Route not found' }, 404));

// Start server – convert PORT to number
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
serve({ fetch: app.fetch, port }, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});