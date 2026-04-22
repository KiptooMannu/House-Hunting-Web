
import { db } from './db/db.js';
import { complianceLogs, users, houses, bookings, locations } from './db/schema.js';
import { generateETIMSReceipt } from './compliance/compliance.service.js';
import logger from './utils/logger.js';

async function simulate() {
  console.log('🚀 Starting Financial Transaction Simulation...');

  // 1. Find or create a mock location
  console.log('Ensuring simulation location exists...');
  let loc = await db.query.locations.findFirst({
    where: (l, { eq }) => eq(l.town, 'Kilimani')
  });

  if (!loc) {
     [loc] = await db.insert(locations).values({
      county: 'Nairobi',
      town: 'Kilimani',
      neighborhood: 'Simulation Zone'
    } as any).returning();
  }
  const locId = loc.locationId;

  // 2. Find or create a mock landlord
  console.log('Finding/Creating mock landlord...');
  let landlord = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.role, 'landlord') });
  
  if (!landlord) {
    [landlord] = await db.insert(users).values({
      fullName: 'Simulation Landlord',
      email: `sim_${Date.now()}@test.com`,
      phone: `+254712${Math.floor(Math.random() * 1000000)}`,
      password: 'password', // Note: this isn't hashed but enough for mock
      role: 'landlord',
      accountStatus: 'active',
      kraPin: 'A000123456Z'
    } as any).returning();
  }

  // 3. Create a mock property
  console.log('Creating simulation property...');
  const [house] = await db.insert(houses).values({
    landlordId: landlord.userId,
    title: 'Kilimani Luxury Suite (SIM)',
    description: 'A beautiful luxury suite for simulation purposes.',
    houseType: 'two_bedroom',
    locationId: locId, 
    bedrooms: 2,
    bathrooms: 2,
    monthlyRent: "45000",
    dailyRate: "5000",
    status: 'active',
    amenities: JSON.stringify(['wifi', 'parking', 'gym']),
  } as any).returning();

  // 4. Create a mock booking
  console.log('Registering guest booking...');
  const [booking] = await db.insert(bookings).values({
    houseId: house.houseId,
    seekerId: landlord.userId, // Using landlord as seeker for sim
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 86400000 * 3), 
    totalPrice: "15000",
    bookingFee: "450",
    status: 'confirmed'
  } as any).returning();

  // 5. Calculate & Trigger Compliance Intelligence
  const rentPortion = 14550;
  const feePortion = 450;
  const mriTax = (rentPortion * 0.075).toFixed(2);
  const vatTax = (feePortion * 0.16).toFixed(2);

  console.log('\n--- 🧾 FINANCIAL MANIFEST (PRE-FLIGHT) ---');
  console.log(`🏠 Gross Rent:     KES ${rentPortion}`);
  console.log(`💳 Booking Fee:    KES ${feePortion}`);
  console.log(`---`);
  console.log(`🇰🇪 MRI Tax (7.5%): KES ${mriTax}`);
  console.log(`🏛️ VAT Tax (16%):  KES ${vatTax}`);
  console.log(`------------------------------------------\n`);

  console.log('Triggering Tax & Compliance manifest...');
  await generateETIMSReceipt(booking.bookingId);

  console.log('✅ Simulation Complete! Check your Admin Dashboard Ledger now.');
  process.exit(0);
}

simulate().catch(err => {
  console.error('❌ Simulation Failed:', err);
  process.exit(1);
});
