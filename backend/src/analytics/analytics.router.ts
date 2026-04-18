import { Hono } from 'hono';
import * as analyticsController from './analytics.controller.js';

export const analyticsRouter = new Hono();

analyticsRouter.get('/overview-stats', analyticsController.getOverviewStats);
analyticsRouter.get('/admin-stats', analyticsController.getAdminStats);
analyticsRouter.get('/market-pulse', analyticsController.getMarketPulse);
analyticsRouter.get('/neighborhood-trends', analyticsController.getNeighborhoodTrends);
