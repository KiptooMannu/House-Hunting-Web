import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import {
  users,
  auth,
  locations,
  houses,
  houseImages,
  chatbotSessions,
  bookings,
  payments,
  complianceLogs,
  auditLogs,
} from './schema.js';

const client = new Client({ connectionString: process.env.DATABASE_URL });
const db = drizzle(client);

async function seed() {
  await client.connect();
  console.log('🌱 Seeding database...');

  // ------------------- USERS -------------------
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    const userData = [
      { fullName: 'John Mwangi', email: 'john@example.com', phone: '254711223344', nationalId: '12345678', role: 'seeker' as any, accountStatus: 'active' as any, region: 'Nairobi' },
      { fullName: 'Mary Wanjiku', email: 'mary@example.com', phone: '254722334455', nationalId: '23456789', role: 'seeker' as any, accountStatus: 'active' as any, region: 'Kiambu' },
      { fullName: 'Peter Omondi', email: 'peter@example.com', phone: '254733445566', nationalId: '34567890', role: 'landlord' as any, accountStatus: 'active' as any, region: 'Kisumu' },
      { fullName: 'Grace Atieno', email: 'grace@example.com', phone: '254744556677', nationalId: '45678901', role: 'landlord' as any, accountStatus: 'active' as any, region: 'Mombasa' },
      { fullName: 'James Kariuki', email: 'james@example.com', phone: '254755667788', nationalId: '56789012', role: 'seeker' as any, accountStatus: 'active' as any, region: 'Nakuru' },
      { fullName: 'Lucy Muthoni', email: 'lucy@example.com', phone: '254766778899', nationalId: '67890123', role: 'seeker' as any, accountStatus: 'active' as any, region: 'Eldoret' },
      { fullName: 'David Maina', email: 'david@example.com', phone: '254777889900', nationalId: '78901234', role: 'landlord' as any, accountStatus: 'active' as any, region: 'Thika' },
      { fullName: 'Sarah Chebet', email: 'sarah@example.com', phone: '254788990011', nationalId: '89012345', role: 'seeker' as any, accountStatus: 'active' as any, region: 'Kericho' },
      { fullName: 'Admin User', email: 'admin@example.com', phone: '254799001122', nationalId: '90123456', role: 'admin' as any, accountStatus: 'active' as any, region: 'Nairobi' },
      { fullName: 'Joseph Ngugi', email: 'joseph@example.com', phone: '254710112233', nationalId: '01234567', role: 'landlord' as any, accountStatus: 'active' as any, region: 'Nyeri' },
    ];
    const insertedUsers = await db.insert(users).values(userData as any).returning();
    console.log(`✅ Created ${insertedUsers.length} users`);

    // ------------------- AUTH -------------------
    for (const user of insertedUsers) {
      const tempPassword = user.email === 'admin@example.com' ? 'Admin@123' : 'Temp@123';
      const passwordHash = await bcrypt.hash(tempPassword, 12);
      await db.insert(auth).values({
        userId: user.userId,
        passwordHash,
        isTemporaryPassword: user.email !== 'admin@example.com',
      });
    }
    console.log(`✅ Created auth records for ${insertedUsers.length} users`);
  } else {
    console.log('⚠️ Users already exist, skipping...');
  }

  // ------------------- LOCATIONS -------------------
  const existingLocations = await db.select().from(locations);
  if (existingLocations.length === 0) {
    const locationData = [
      { county: 'Nairobi', subCounty: 'Westlands', town: 'Westlands', neighborhood: 'Mvuli', gpsLatitude: '-1.267', gpsLongitude: '36.803' },
      { county: 'Kiambu', subCounty: 'Kiambu Town', town: 'Kiambu', neighborhood: 'Tigoni', gpsLatitude: '-1.152', gpsLongitude: '36.835' },
      { county: 'Kisumu', subCounty: 'Kisumu Central', town: 'Kisumu', neighborhood: 'Milimani', gpsLatitude: '-0.091', gpsLongitude: '34.768' },
      { county: 'Mombasa', subCounty: 'Mvita', town: 'Mombasa', neighborhood: 'Nyali', gpsLatitude: '-4.043', gpsLongitude: '39.668' },
      { county: 'Nakuru', subCounty: 'Nakuru East', town: 'Nakuru', neighborhood: 'Milimani', gpsLatitude: '-0.303', gpsLongitude: '36.080' },
      { county: 'Uasin Gishu', subCounty: 'Eldoret East', town: 'Eldoret', neighborhood: 'Kapsoya', gpsLatitude: '0.514', gpsLongitude: '35.270' },
      { county: 'Tharaka Nithi', subCounty: 'Tharaka', town: 'Chuka', neighborhood: 'Kangeta', gpsLatitude: '-0.344', gpsLongitude: '37.644' },
      { county: 'Kericho', subCounty: 'Kericho Town', town: 'Kericho', neighborhood: 'Kapsoit', gpsLatitude: '-0.367', gpsLongitude: '35.283' },
      { county: 'Nyeri', subCounty: 'Nyeri Town', town: 'Nyeri', neighborhood: 'Ruringu', gpsLatitude: '-0.419', gpsLongitude: '36.951' },
      { county: 'Machakos', subCounty: 'Machakos Town', town: 'Machakos', neighborhood: 'Kaloleni', gpsLatitude: '-1.517', gpsLongitude: '37.267' },
    ];
    const insertedLocations = await db.insert(locations).values(locationData as any).returning();
    console.log(`✅ Created ${insertedLocations.length} locations`);
  } else {
    console.log('⚠️ Locations already exist, skipping...');
  }

  // Get inserted IDs after potential inserts
  const allUsers = await db.select().from(users);
  const allLocations = await db.select().from(locations);

  // ------------------- HOUSES -------------------
  const existingHouses = await db.select().from(houses);
  if (existingHouses.length === 0) {
    const landlords = allUsers.filter((u) => u.role === 'landlord');
    const houseData = [];
    for (let i = 0; i < 10; i++) {
      const landlord = landlords[i % landlords.length];
      const location = allLocations[i % allLocations.length];
      houseData.push({
        landlordId: landlord.userId,
        locationId: location.locationId,
        title: `${['Cozy', 'Spacious', 'Modern', 'Luxury', 'Affordable'][i % 5]} ${
          ['Bedsitter', '1 Bedroom', '2 Bedroom', '3 Bedroom'][i % 4]
        } in ${location.neighborhood}`,
        description: 'A beautiful house with great amenities.',
        houseType: ['bedsitter', 'one_bedroom', 'two_bedroom', 'three_bedroom'][i % 4] as any,
        furnishing: ['furnished', 'semi_furnished', 'unfurnished'][i % 3] as any,
        bedrooms: i % 4,
        bathrooms: (i % 3) + 1,
        monthlyRent: (10000 + i * 2000).toString(),
        depositAmount: (5000 + i * 1000).toString(),
        isDepositNegotiable: i % 2 === 0,
        addressLine: `House ${i + 1}, ${location.neighborhood}`,
        amenities: JSON.stringify(['wifi', 'parking', 'water'].slice(0, (i % 3) + 1)),
        status: 'active' as any,
      });
    }
    const insertedHouses = await db.insert(houses).values(houseData as any).returning();
    console.log(`✅ Created ${insertedHouses.length} houses`);
  } else {
    console.log('⚠️ Houses already exist, skipping...');
  }

  const allHouses = await db.select().from(houses);

  // ------------------- HOUSE IMAGES -------------------
  const existingImages = await db.select().from(houseImages);
  if (existingImages.length === 0) {
    const imageData = [];
    for (const house of allHouses) {
      for (let i = 0; i < 2; i++) {
        imageData.push({
          houseId: house.houseId,
          imageUrl: `https://picsum.photos/id/${house.houseId + i}/800/600`,
          caption: `View ${i + 1} of ${house.title}`,
          isPrimary: i === 0,
          sortOrder: i,
        });
      }
    }
    await db.insert(houseImages).values(imageData as any);
    console.log(`✅ Created ${imageData.length} house images`);
  } else {
    console.log('⚠️ House images already exist, skipping...');
  }

  // ------------------- CHATBOT SESSIONS -------------------
  const existingSessions = await db.select().from(chatbotSessions);
  if (existingSessions.length === 0) {
    const seekers = allUsers.filter((u) => u.role === 'seeker');
    const sessionData = [];
    for (let i = 0; i < 10; i++) {
      const seeker = seekers[i % seekers.length];
      sessionData.push({
        userId: seeker.userId,
        sessionToken: `token_${Date.now()}_${i}`,
        status: 'completed' as any,
        preferredCounty: allLocations[i % allLocations.length].county,
        budgetMin: (15000 + i * 1000).toString(),
        budgetMax: (30000 + i * 2000).toString(),
        preferredHouseType: ['bedsitter', 'one_bedroom', 'two_bedroom'][i % 3] as any,
        conversationHistory: JSON.stringify([{ role: 'user', content: 'Looking for a house' }]),
        resultHouseIds: JSON.stringify(allHouses.slice(0, 3).map((h) => h.houseId)),
        completedAt: new Date(),
      });
    }
    await db.insert(chatbotSessions).values(sessionData as any);
    console.log(`✅ Created ${sessionData.length} chatbot sessions`);
  } else {
    console.log('⚠️ Chatbot sessions already exist, skipping...');
  }

  const allSessions = await db.select().from(chatbotSessions);

  // ------------------- BOOKINGS -------------------
  const existingBookings = await db.select().from(bookings);
  if (existingBookings.length === 0) {
    const seekers = allUsers.filter((u) => u.role === 'seeker');
    const bookingData = [];
    for (let i = 0; i < 10; i++) {
      const seeker = seekers[i % seekers.length];
      const house = allHouses[i % allHouses.length];
      const session = allSessions[i % allSessions.length];
      bookingData.push({
        seekerId: seeker.userId,
        houseId: house.houseId,
        chatbotSessionId: session.sessionId,
        status: 'confirmed' as any,
        bookingFee: (1000 + i * 200).toString(),
        moveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        specialRequests: 'Please provide parking',
        confirmedAt: new Date(),
      });
    }
    await db.insert(bookings).values(bookingData as any);
    console.log(`✅ Created ${bookingData.length} bookings`);
  } else {
    console.log('⚠️ Bookings already exist, skipping...');
  }

  const allBookings = await db.select().from(bookings);

  // ------------------- PAYMENTS -------------------
  const existingPayments = await db.select().from(payments);
  if (existingPayments.length === 0) {
    const paymentData = [];
    for (let i = 0; i < 10; i++) {
      const booking = allBookings[i % allBookings.length];
      const payer = allUsers.find((u) => u.userId === booking.seekerId);
      paymentData.push({
        bookingId: booking.bookingId,
        payerId: payer!.userId,
        amount: (1500 + i * 100).toString(),
        method: 'mpesa' as any,
        status: 'completed' as any,
        mpesaPhoneNumber: '254712345678',
        mpesaReceiptNumber: `REC${Date.now()}${i}`,
        paidAt: new Date(),
        idempotencyKey: `idem_${Date.now()}_${i}`,
      });
    }
    await db.insert(payments).values(paymentData as any);
    console.log(`✅ Created ${paymentData.length} payments`);
  } else {
    console.log('⚠️ Payments already exist, skipping...');
  }

  // ------------------- COMPLIANCE LOGS -------------------
  const existingCompliance = await db.select().from(complianceLogs);
  if (existingCompliance.length === 0) {
    const admin = allUsers.find((u) => u.role === 'admin');
    const logData = [];
    for (let i = 0; i < 10; i++) {
      logData.push({
        initiatedById: admin!.userId,
        action: (i % 2 === 0 ? 'revenue_report' : 'nil_filing') as any,
        status: 'submitted' as any,
        periodStart: new Date(2024, i % 12, 1).toISOString().split('T')[0], // YYYY-MM-DD
        periodEnd: new Date(2024, (i % 12) + 1, 0).toISOString().split('T')[0], // last day of month
        totalRevenueKes: (10000 * (i + 1)).toString(),
        totalBookingFees: (500 * (i + 1)).toString(),
        gavaConnectRequestId: `gava_${Date.now()}_${i}`,
        acknowledgedAt: new Date(),
      });
    }
    await db.insert(complianceLogs).values(logData as any);
    console.log(`✅ Created ${logData.length} compliance logs`);
  } else {
    console.log('⚠️ Compliance logs already exist, skipping...');
  }

  // ------------------- AUDIT LOGS -------------------
  const existingAudit = await db.select().from(auditLogs);
  if (existingAudit.length === 0) {
    const auditData = [];
    for (let i = 0; i < 10; i++) {
      const user = allUsers[i % allUsers.length];
      auditData.push({
        performedById: user.userId,
        action: ['login', 'create', 'update', 'delete'][i % 4] as any,
        tableName: ['users', 'houses', 'bookings'][i % 3],
        recordId: `${i + 1}`,
        ipAddress: `192.168.1.${i}`,
        userAgent: 'Mozilla/5.0 (seed script)',
      });
    }
    await db.insert(auditLogs).values(auditData as any);
    console.log(`✅ Created ${auditData.length} audit logs`);
  } else {
    console.log('⚠️ Audit logs already exist, skipping...');
  }

  console.log('🌱 Seeding completed!');
  await client.end();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});