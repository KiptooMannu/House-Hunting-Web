import { db } from './db/db.js';
import { users, houses } from './db/schema.js';

async function fetchSeeds() {
    const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.role, 'seeker') });
    const house = await db.query.houses.findFirst();
    console.log(JSON.stringify({ seekerId: user?.userId, houseId: house?.houseId }));
    process.exit(0);
}
fetchSeeds();
