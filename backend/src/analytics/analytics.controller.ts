import { Context } from 'hono';
import * as analyticsService from './analytics.service.js';

export const getOverviewStats = async (c: Context) => {
  try {
    const stats = await analyticsService.getOverviewStats();
    return c.json(stats, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const getAdminStats = async (c: Context) => {
  try {
    const stats = await analyticsService.getAdminStats();
    return c.json(stats, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const getMarketPulse = async (c: Context) => {
  try {
    const pulse = await analyticsService.getMarketPulse();
    return c.json(pulse, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const getNeighborhoodTrends = async (c: Context) => {
  try {
    const trends = await analyticsService.getNeighborhoodTrends();
    return c.json(trends, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};
