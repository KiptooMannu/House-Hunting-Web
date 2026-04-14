/**
 * Landlord-specific seed: Wire up houses, bookings and payments
 * for the existing landlord user loraine@gmail.com.
 * 
 * This does NOT wipe the database — it only adds data for that landlord.
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { eq } from 'drizzle-orm';
import {
  users,
  locations,
  houses,
  houseImages,
  bookings,
  payments,
} from './schema.js';

const client = new Client({ connectionString: process.env.DATABASE_URL });
const db = drizzle(client);

async function seedLandlord() {
  await client.connect();
  console.log('🔍 Looking up landlord loraine@gmail.com ...');

  // 1. Find the existing landlord
  const [landlord] = await db.select().from(users).where(eq(users.email, 'loraine@gmail.com'));
  if (!landlord) {
    console.error('❌ No user found with email loraine@gmail.com. Aborting.');
    await client.end();
    process.exit(1);
  }
  console.log(`✅ Found landlord: ${landlord.fullName} (userId: ${landlord.userId}, role: ${landlord.role})`);

  // If user is not a landlord, update role
  if (landlord.role !== 'landlord') {
    console.log(`⚠️  User role is "${landlord.role}", updating to "landlord"...`);
    await db.update(users).set({ role: 'landlord' as any }).where(eq(users.userId, landlord.userId));
    console.log('✅ Role updated to landlord');
  }

  // 2. Find or create a seeker to make bookings
  let [seeker] = await db.select().from(users).where(eq(users.email, 'john@example.com'));
  if (!seeker) {
    console.log('📦 Creating a seeker user for bookings...');
    const [newSeeker] = await db.insert(users).values({
      fullName: 'John Mwangi',
      email: 'john@example.com',
      phone: '254711223344',
      nationalId: '12345678',
      role: 'seeker' as any,
      accountStatus: 'active' as any,
      region: 'Nairobi',
    }).returning();
    seeker = newSeeker;
  }
  console.log(`✅ Seeker: ${seeker.fullName} (userId: ${seeker.userId})`);

  // 3. Ensure locations exist
  const locationData = [
    { county: 'Nairobi', subCounty: 'Westlands', town: 'Westlands', neighborhood: 'Riverside' },
    { county: 'Nairobi', subCounty: 'Dagoretti', town: 'Karen', neighborhood: 'Karen End' },
    { county: 'Nairobi', subCounty: 'Kilimani', town: 'Kilimani', neighborhood: 'State House' },
    { county: 'Nairobi', subCounty: 'Lavington', town: 'Lavington', neighborhood: 'James Gichuru' },
    { county: 'Mombasa', subCounty: 'Nyali', town: 'Nyali', neighborhood: 'Links Road' },
    { county: 'Nairobi', subCounty: 'Runda', town: 'Runda', neighborhood: 'Evergreen' },
  ];

  const insertedLocations: any[] = [];
  for (const loc of locationData) {
    const existing = await db.select().from(locations)
      .where(eq(locations.town, loc.town!))
      .limit(1);
    if (existing.length > 0) {
      insertedLocations.push(existing[0]);
    } else {
      const [newLoc] = await db.insert(locations).values(loc as any).returning();
      insertedLocations.push(newLoc);
    }
  }
  console.log(`✅ ${insertedLocations.length} locations ready`);

  // 4. Create houses for this landlord
  const propertyImages = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=1200',
  ];

  const houseSpecs = [
    { title: 'The Sapphire Penthouse - Westlands', type: 'mansion' as const, rent: 185000, beds: 4, baths: 3, locIdx: 0 },
    { title: 'Aurora Sky Suite - Karen', type: 'three_bedroom' as const, rent: 120000, beds: 3, baths: 2, locIdx: 1 },
    { title: 'Jade Terrace - Kilimani', type: 'two_bedroom' as const, rent: 75000, beds: 2, baths: 2, locIdx: 2 },
    { title: 'Golden Palm Villa - Lavington', type: 'mansion' as const, rent: 250000, beds: 5, baths: 4, locIdx: 3 },
    { title: 'Coral Reef Studio - Nyali', type: 'studio' as const, rent: 35000, beds: 1, baths: 1, locIdx: 4 },
    { title: 'Emerald Heights - Runda', type: 'bungalow' as const, rent: 160000, beds: 4, baths: 3, locIdx: 5 },
  ];

  const insertedHouses: any[] = [];
  for (let i = 0; i < houseSpecs.length; i++) {
    const spec = houseSpecs[i];
    const loc = insertedLocations[spec.locIdx];
    const [house] = await db.insert(houses).values({
      landlordId: landlord.userId,
      locationId: loc.locationId,
      title: spec.title,
      description: `Luxurious ${spec.title} featuring ${spec.beds} bedrooms, ${spec.baths} bathrooms, smart home technology, and panoramic views. Located in the heart of ${loc.town}, this property offers premium finishes, a state-of-the-art kitchen, and dedicated parking.`,
      houseType: spec.type,
      furnishing: i % 3 === 0 ? 'furnished' as any : i % 3 === 1 ? 'semi_furnished' as any : 'unfurnished' as any,
      bedrooms: spec.beds,
      bathrooms: spec.baths,
      monthlyRent: spec.rent.toString(),
      dailyRate: Math.round(spec.rent / 15).toString(),
      depositAmount: Math.round(spec.rent * 1.5).toString(),
      isDepositNegotiable: i % 2 === 0,
      addressLine: `${100 + i} ${loc.neighborhood} Road, ${loc.town}`,
      amenities: JSON.stringify(['wifi', 'parking', 'gym', 'pool', 'security', 'elevator'].slice(0, (i % 6) + 1)),
      status: 'active' as any,
      isVerified: true,
      verifiedById: landlord.userId,
      verifiedAt: new Date(),
    } as any).returning();

    insertedHouses.push(house);

    // Add images for each house
    const imageRecords = [];
    for (let j = 0; j < 3; j++) {
      imageRecords.push({
        houseId: house.houseId,
        imageUrl: propertyImages[(i + j) % propertyImages.length],
        caption: j === 0 ? `Exterior of ${spec.title}` : `Interior View ${j}`,
        isPrimary: j === 0,
        sortOrder: j,
      });
    }
    await db.insert(houseImages).values(imageRecords as any);
  }
  console.log(`✅ Created ${insertedHouses.length} houses for landlord ${landlord.fullName}`);

  // 5. Create bookings for these houses (simulating seekers booking landlord's properties)
  const bookingStatuses = ['confirmed', 'pending_payment', 'confirmed', 'confirmed', 'pending_payment', 'confirmed'] as const;
  const insertedBookings: any[] = [];

  for (let i = 0; i < insertedHouses.length; i++) {
    const house = insertedHouses[i];
    const fee = Math.max(Number(house.monthlyRent) * 0.05, 1500);
    const moveIn = new Date();
    moveIn.setDate(moveIn.getDate() + (i + 1) * 7); // stagger move-in dates

    const [booking] = await db.insert(bookings).values({
      seekerId: seeker.userId,
      houseId: house.houseId,
      status: bookingStatuses[i] as any,
      bookingFee: fee.toFixed(2),
      totalPrice: house.monthlyRent,
      moveInDate: moveIn.toISOString().split('T')[0],
      checkoutDate: new Date(moveIn.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      specialRequests: i === 0 ? 'Early move-in requested' : null,
      confirmedAt: bookingStatuses[i] === 'confirmed' ? new Date() : null,
    } as any).returning();
    insertedBookings.push(booking);
  }
  console.log(`✅ Created ${insertedBookings.length} bookings`);

  // 6. Create payments for confirmed bookings
  const confirmedBookings = insertedBookings.filter((b) => b.status === 'confirmed');
  let paymentCount = 0;
  const receiptBase = 'QKJ3B7';
  
  for (let i = 0; i < confirmedBookings.length; i++) {
    const booking = confirmedBookings[i];

    // Create 2-3 monthly payments per confirmed booking to simulate history
    const paymentMonths = i < 2 ? 3 : 2;
    for (let m = 0; m < paymentMonths; m++) {
      const paidDate = new Date();
      paidDate.setMonth(paidDate.getMonth() - m);
      
      await db.insert(payments).values({
        bookingId: booking.bookingId,
        payerId: seeker.userId,
        amount: booking.totalPrice,
        method: 'mpesa' as any,
        status: 'completed' as any,
        mpesaPhoneNumber: '254711223344',
        mpesaReceiptNumber: `${receiptBase}${paymentCount}${String(m).padStart(2, '0')}`,
        mpesaTransactionDate: paidDate,
        transactionReference: `TXN-${booking.bookingId}-${m}-${Date.now()}`,
        paidAt: paidDate,
        idempotencyKey: `IDEM-${booking.bookingId}-${m}-${Date.now()}`,
      } as any);
      paymentCount++;
    }
  }
  console.log(`✅ Created ${paymentCount} M-Pesa payments for confirmed bookings`);

  // Summary
  console.log('\n🚀 ────────────────────────────────────────────');
  console.log('   LANDLORD SEED COMPLETE');
  console.log('────────────────────────────────────────────────');
  console.log(`   Landlord: ${landlord.fullName} (${landlord.email})`);
  console.log(`   User ID:  ${landlord.userId}`);
  console.log(`   Houses:   ${insertedHouses.length}`);
  console.log(`   Bookings: ${insertedBookings.length}`);
  console.log(`   Payments: ${paymentCount}`);
  console.log('────────────────────────────────────────────────\n');

  await client.end();
}

seedLandlord().catch((err) => {
  console.error('❌ Landlord seed failed:', err);
  process.exit(1);
});
