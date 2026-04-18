import { db } from './db/db.js';
import { sql } from 'drizzle-orm';

async function check() {
  try {
    const res = await db.execute(sql`SELECT enum_range(NULL::audit_action)`);
    console.log(JSON.stringify(res, null, 2));
  } catch (e: any) {
    console.error('Error:', e.message);
  }
  process.exit();
}

check();
