import { db } from './db/db.js';
import { users, houses, locations } from './db/schema.js';
import { sql } from 'drizzle-orm';

async function diagnose() {
  console.log('--- Savanna Horizon System Diagnostic ---');
  console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);
  if (process.env.DATABASE_URL) {
      console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.slice(0, 20) + '...');
  }
  
  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    console.log(`✅ Database Connection: OK (${Date.now() - start}ms)`);
  } catch (err: any) {
    console.error('❌ Database Connection: FAILED', err.message);
    return;
  }

  try {
    const userCount = await db.select({ count: sql`count(*)` }).from(users);
    console.log(`👤 Users in DB: ${userCount[0].count}`);
  } catch (err: any) {
    console.error('❌ Failed to fetch users:', err.message);
  }

  try {
    const houseCount = await db.select({ count: sql`count(*)` }).from(houses);
    console.log(`🏠 Houses in DB: ${houseCount[0].count}`);
  } catch (err: any) {
    console.error('❌ Failed to fetch houses:', err.message);
  }

  try {
    const locCount = await db.select({ count: sql`count(*)` }).from(locations);
    console.log(`📍 Locations in DB: ${locCount[0].count}`);
  } catch (err: any) {
    console.error('❌ Failed to fetch locations:', err.message);
  }

  console.log('--- Diagnostic Complete ---');
}

diagnose().catch(console.error);
