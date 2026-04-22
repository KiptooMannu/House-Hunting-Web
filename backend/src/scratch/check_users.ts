import { db } from './db/db.js';
import { users } from './db/schema.js';

async function check() {
  const allUsers = await db.select().from(users);
  console.log(JSON.stringify(allUsers.map(u => ({id: u.userId, email: u.email, role: u.role})), null, 2));
  process.exit(0);
}
check();
