import { db } from '../db/db.js';
import { jobs } from '../db/schema.js';
import { eq, lt, and, sql } from 'drizzle-orm';
import logger from './logger.js';
import crypto from 'crypto';

export interface JobPayload {
  [key: string]: any;
}

export const enqueueJob = async (type: string, payload: JobPayload) => {
  logger.info(`Enqueueing job: ${type}`, { payload });
  const [newJob] = await db.insert(jobs).values({
    type,
    payload,
    status: 'pending',
  }).returning();
  return newJob;
};

export const runWorker = async () => {
  logger.info('Starting Persistent Job Worker...');

  const processBatch = async () => {
    // 1. Fetch jobs that are pending and ready to run
    const pendingJobs = await db.select()
      .from(jobs)
      .where(and(
        eq(jobs.status, 'pending'),
        lt(jobs.nextRunAt, new Date())
      ))
      .limit(5); // Process in small batches

    for (const job of pendingJobs) {
      await processJob(job);
    }
  };

  // Run immediately and then every 30 seconds (simulation of a queue worker)
  setInterval(processBatch, 30000);
  processBatch();
};

const processJob = async (job: any) => {
  logger.info(`Processing job ${job.jobId}`, { type: job.type });
  
  await db.update(jobs).set({ status: 'processing', updatedAt: new Date() }).where(eq(jobs.jobId, job.jobId));

  try {
    if (job.type === 'kra_etims_sync') {
      const { sendRevenueToGava } = await import('../compliance/compliance.service.js');
      await sendRevenueToGava(job.payload);
    } else if (job.type === 'webhook_dispatch') {
      const { url, secret, eventType, data, timestamp } = job.payload;
      
      const body = JSON.stringify({ eventType, data, timestamp });
      const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-HouseHunt-Signature': signature,
          'X-HouseHunt-Event': eventType
        },
        body
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }
      logger.info(`Webhook ${eventType} dispatched to ${url}`);
    }
    
    // Mark as completed
    await db.update(jobs).set({ status: 'completed', updatedAt: new Date() }).where(eq(jobs.jobId, job.jobId));
    logger.info(`Job ${job.jobId} completed successfully`);
  } catch (error: any) {
    const attempts = job.attempts + 1;
    const isFinalFailure = attempts >= job.maxAttempts;

    // Exponential Backoff: 2^attempts * 60 seconds
    const backoffSeconds = Math.pow(2, attempts) * 60;
    const nextRun = new Date(Date.now() + backoffSeconds * 1000);

    logger.error(`Job ${job.jobId} failed. Attempt ${attempts}/${job.maxAttempts}`, { error: error.message });

    await db.update(jobs).set({
      status: isFinalFailure ? 'failed' : 'pending',
      attempts,
      nextRunAt: nextRun,
      lastError: error.message,
      updatedAt: new Date(),
    }).where(eq(jobs.jobId, job.jobId));
  }
};
