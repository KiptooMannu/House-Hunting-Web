import { db } from './db/db.js';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    console.log('Migrating audit_action enum...');
    await db.execute(sql`ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'house_reject'`);
    await db.execute(sql`ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'house_revoke'`);
    console.log('✅ Migration successful');
  } catch (e: any) {
    console.error('Error:', e.message);
  }
  process.exit();
}

migrate();
