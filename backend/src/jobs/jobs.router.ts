// src/jobs/jobs.router.ts — Offline Queue Monitor (Admin Only)
import { Hono } from 'hono';
import { db } from '../db/db.js';
import { jobs } from '../db/schema.js';
import { desc, eq, and, lt } from 'drizzle-orm';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

export const jobsRouter = new Hono();

jobsRouter.use('*', authMiddleware, adminMiddleware);

// List all jobs (last 100)
jobsRouter.get('/', async (c) => {
  const allJobs = await db.select().from(jobs).orderBy(desc(jobs.createdAt)).limit(100);
  return c.json(allJobs);
});

// Job queue stats
jobsRouter.get('/stats', async (c) => {
  const allJobs = await db.select().from(jobs);
  const stats = {
    total:      allJobs.length,
    pending:    allJobs.filter(j => j.status === 'pending').length,
    processing: allJobs.filter(j => j.status === 'processing').length,
    completed:  allJobs.filter(j => j.status === 'completed').length,
    failed:     allJobs.filter(j => j.status === 'failed').length,
    retryQueued: allJobs.filter(j => j.status === 'pending' && j.attempts > 0).length,
  };
  return c.json(stats);
});

// Retry a failed job
jobsRouter.post('/:jobId/retry', async (c) => {
  const jobId = parseInt(c.req.param('jobId'), 10);
  const [updated] = await db.update(jobs)
    .set({ status: 'pending', nextRunAt: new Date(), updatedAt: new Date() })
    .where(eq(jobs.jobId, jobId))
    .returning();
  if (!updated) return c.json({ error: 'Job not found' }, 404);
  return c.json({ message: 'Job queued for retry', job: updated });
});

// Purge completed jobs older than 7 days
jobsRouter.delete('/purge', async (c) => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const deleted = await db.delete(jobs)
    .where(and(
      eq(jobs.status, 'completed'),
      lt(jobs.updatedAt, cutoff)
    ))
    .returning();
  return c.json({ message: `Purged ${deleted.length} completed jobs` });
});
