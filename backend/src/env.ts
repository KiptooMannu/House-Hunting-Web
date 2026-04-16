import { z } from 'zod';
import 'dotenv/config';
import logger from './utils/logger';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().default('3000'),
  KRA_PIN: z.string().min(11),
  KRA_APIGEE_APP_ID: z.string().uuid(),
  KRA_SANDBOX_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  logger.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
