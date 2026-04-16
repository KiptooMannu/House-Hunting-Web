import logger from './logger.js';

/**
 * A simple adaptive throttle for external API calls.
 * Ensures we don't exceed governmental rate limits.
 */
export class Throttle {
  private lastCall: number = 0;
  private minInterval: number; // in ms

  constructor(requestsPerSecond: number = 2) {
    this.minInterval = 1000 / requestsPerSecond;
  }

  async execute<T>(fn: () => Promise<T>, metadata?: any): Promise<T> {
    const now = Date.now();
    const timeSinceLast = now - this.lastCall;

    if (timeSinceLast < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLast;
      logger.info(`[Throttler] Throttling request to avoid rate limits`, { waitTime, ...metadata });
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    try {
      this.lastCall = Date.now();
      return await fn();
    } catch (error: any) {
      if (error.status === 429) {
        logger.warn(`[Throttler] 429 Rate Limit Hit. Forced cooling...`, { ...metadata });
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5s cooling
      }
      throw error;
    }
  }
}

export const kraThrottler = new Throttle(2); // 2 requests per second for KRA
