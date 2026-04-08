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

const mainRouter = new Hono();

mainRouter.route('/auth', authRouter);
mainRouter.route('/users', usersRouter);
mainRouter.route('/locations', locationsRouter);
mainRouter.route('/houses', housesRouter);
mainRouter.route('/house-images', houseImagesRouter);
mainRouter.route('/chatbot-sessions', chatbotSessionsRouter);
mainRouter.route('/bookings', bookingsRouter);
mainRouter.route('/payments', paymentsRouter);
mainRouter.route('/compliance-logs', complianceLogsRouter);
mainRouter.route('/audit-logs', auditLogsRouter);

export default mainRouter;