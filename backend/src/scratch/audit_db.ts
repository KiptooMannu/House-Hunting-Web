import { db } from '../db/db';
import { sql } from 'drizzle-orm';

async function checkDb() {
  console.log('--- DB COLUMN AUDIT ---');
  try {
    const res = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'houses'
    `);
    console.log('Actual DB Columns for "houses":', res.rows);
  } catch (err) {
    console.error('Audit failed:', err);
  }
  process.exit(0);
}

checkDb();
