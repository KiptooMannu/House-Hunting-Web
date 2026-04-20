import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import {
  users, auth, locations, houses, houseImages,
  bookings, payments, complianceLogs, auditLogs, notifications, jobs,
} from './schema.js';

const client = new Client({ connectionString: process.env.DATABASE_URL });
const db = drizzle(client);

async function seedFull() {
  await client.connect();
  console.log('🧹 Clearing existing data...');
  await db.delete(notifications);
  await db.delete(jobs);
  await db.delete(auditLogs);
  await db.delete(complianceLogs);
  await db.delete(payments);
  await db.delete(bookings);
  await db.delete(houseImages);
  await db.delete(houses);
  await db.delete(locations);
  await db.delete(auth);
  await db.delete(users);

  console.log('🌱 Creating users...');
  // ═══════════════ USERS ═══════════════
  const passwordHash = await bcrypt.hash('Test@123', 12);
  const adminHash = await bcrypt.hash('Admin@123', 12);

  const insertedUsers = await db.insert(users).values([
    // SEEKERS
    { fullName: 'John Mwangi', email: 'john@test.com',    phone: '254711223344', nationalId: '12345678', role: 'seeker' as any, accountStatus: 'active' as any, region: 'Nairobi' },
    { fullName: 'Mary Wanjiku', email: 'mary@test.com',   phone: '254722334455', nationalId: '23456789', role: 'seeker' as any, accountStatus: 'active' as any, region: 'Kiambu' },
    { fullName: 'James Ochieng', email: 'james@test.com', phone: '254755112233', nationalId: '56781234', role: 'seeker' as any, accountStatus: 'active' as any, region: 'Kisumu' },
    // LANDLORDS
    { fullName: 'Peter Omondi',  email: 'peter@test.com',    phone: '254733445566', nationalId: '34567890', role: 'landlord' as any, accountStatus: 'active' as any, region: 'Nairobi', kraPin: 'A001234567P' },
    { fullName: 'Grace Atieno',  email: 'grace@test.com',    phone: '254744556677', nationalId: '45678901', role: 'landlord' as any, accountStatus: 'active' as any, region: 'Mombasa', kraPin: 'A007654321P' },
    { fullName: 'Maina Kamau',   email: 'landlord@test.com', phone: '254712345678', nationalId: '11223344', role: 'landlord' as any, accountStatus: 'active' as any, region: 'Nairobi', kraPin: 'A016899943V' },
    // ADMIN
    { fullName: 'Admin User',    email: 'admin@test.com',    phone: '254799001122', nationalId: '90123456', role: 'admin' as any,    accountStatus: 'active' as any, region: 'Nairobi', kraPin: 'A009999999X' },
  ] as any).returning();

  // AUTH records
  for (const user of insertedUsers) {
    await db.insert(auth).values({
      userId: user.userId,
      passwordHash: user.role === 'admin' ? adminHash : passwordHash,
      isTemporaryPassword: false,
    });
  }
  console.log(`✅ ${insertedUsers.length} users created (Password: Test@123 / Admin: Admin@123)`);

  const seekers = insertedUsers.filter(u => u.role === 'seeker');
  const landlords = insertedUsers.filter(u => u.role === 'landlord');
  const admin = insertedUsers.find(u => u.role === 'admin')!;

  // ═══════════════ LOCATIONS ═══════════════
  console.log('🌱 Creating locations...');
  const insertedLocations = await db.insert(locations).values([
    { county: 'Nairobi',  subCounty: 'Westlands',  town: 'Westlands',  neighborhood: 'Riverside',     gpsLatitude: '-1.267', gpsLongitude: '36.803' },
    { county: 'Nairobi',  subCounty: 'Kibra',      town: 'Kibera',     neighborhood: 'Silicone Savannah', gpsLatitude: '-1.311', gpsLongitude: '36.789' },
    { county: 'Nairobi',  subCounty: 'Kilimani',   town: 'Kilimani',   neighborhood: 'State House',   gpsLatitude: '-1.292', gpsLongitude: '36.791' },
    { county: 'Nairobi',  subCounty: 'Lavington',  town: 'Lavington',  neighborhood: 'James Gichuru', gpsLatitude: '-1.278', gpsLongitude: '36.769' },
    { county: 'Mombasa',  subCounty: 'Nyali',      town: 'Nyali',      neighborhood: 'Links Road',    gpsLatitude: '-4.036', gpsLongitude: '39.696' },
    { county: 'Kisumu',   subCounty: 'Kisumu CBD', town: 'Kisumu',     neighborhood: 'Milimani',      gpsLatitude: '-0.091', gpsLongitude: '34.768' },
    { county: 'Nairobi',  subCounty: 'Karen',      town: 'Karen',      neighborhood: 'Hardy',         gpsLatitude: '-1.320', gpsLongitude: '36.700' },
    { county: 'Nairobi',  subCounty: 'Runda',      town: 'Runda',      neighborhood: 'Evergreen',     gpsLatitude: '-1.222', gpsLongitude: '36.820' },
  ] as any).returning();
  console.log(`✅ ${insertedLocations.length} locations created`);

  // ═══════════════ HOUSES ═══════════════
  console.log('🌱 Creating houses...');
  const houseConfigs = [
    // Active verified houses (visible to seekers)
    { title: 'The Skye Residence',     type: 'two_bedroom',       rent: 45000,  fee: 2250,  landlord: 0, loc: 0, status: 'active',           verified: true },
    { title: 'Azure Penthouse',        type: 'three_bedroom',     rent: 85000,  fee: 4250,  landlord: 0, loc: 2, status: 'active',           verified: true },
    { title: 'Ivory Terrace',          type: 'one_bedroom',       rent: 25000,  fee: 1500,  landlord: 1, loc: 3, status: 'active',           verified: true },
    { title: 'The Obsidian Loft',      type: 'studio',            rent: 18000,  fee: 1500,  landlord: 1, loc: 1, status: 'active',           verified: true },
    { title: 'Emerald Oasis',          type: 'four_bedroom_plus', rent: 150000, fee: 7500,  landlord: 2, loc: 6, status: 'active',           verified: true },
    { title: 'Savanna Heights',        type: 'two_bedroom',       rent: 35000,  fee: 1750,  landlord: 2, loc: 5, status: 'active',           verified: true },
    { title: 'Crimson Villa',          type: 'mansion',           rent: 280000, fee: 14000, landlord: 0, loc: 7, status: 'active',           verified: true },
    { title: 'Silverstone Suite',      type: 'bedsitter',         rent: 12000,  fee: 1500,  landlord: 1, loc: 1, status: 'active',           verified: true },
    // Pending approval (for admin queue)
    { title: 'Golden Gate Mansion',    type: 'mansion',           rent: 350000, fee: 17500, landlord: 0, loc: 7, status: 'pending_approval', verified: false },
    { title: 'Willow Creek Bungalow', type: 'bungalow',          rent: 65000,  fee: 3250,  landlord: 2, loc: 4, status: 'pending_approval', verified: false },
    { title: 'Marble Arch Studio',     type: 'studio',            rent: 22000,  fee: 1500,  landlord: 1, loc: 2, status: 'pending_approval', verified: false },
    // Draft (landlord only)
    { title: 'Falcon Nest',            type: 'one_bedroom',       rent: 30000,  fee: 1500,  landlord: 0, loc: 3, status: 'draft',            verified: false },
    { title: 'Riverbend Estate',       type: 'three_bedroom',     rent: 95000,  fee: 4750,  landlord: 2, loc: 0, status: 'draft',            verified: false },
  ];

  const propertyImages = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde',
    'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68',
    'https://images.unsplash.com/photo-1600585154542-637936dcf453',
    'https://images.unsplash.com/photo-1600121848594-d8644e57abab',
    'https://images.unsplash.com/photo-1600566752355-35792bed65ee',
    'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498f',
  ];

  const insertedHouses: any[] = [];
  for (let i = 0; i < houseConfigs.length; i++) {
    const cfg = houseConfigs[i];
    const loc = insertedLocations[cfg.loc];
    const landlord = landlords[cfg.landlord];

    const [house] = await db.insert(houses).values({
      landlordId: landlord.userId,
      locationId: loc.locationId,
      title: `${cfg.title} — ${loc.town}`,
      bookingFee: cfg.fee.toString(),
      description: `Premium ${cfg.title} in ${loc.neighborhood}, ${loc.town}. Modern finishes, smart home tech, 24/7 security. Open-plan living with natural light and panoramic views.`,
      houseType: cfg.type as any,
      furnishing: (['furnished', 'semi_furnished', 'unfurnished'] as any)[i % 3],
      bedrooms: Math.max(1, i % 5 + 1),
      bathrooms: Math.max(1, i % 3 + 1),
      monthlyRent: cfg.rent.toString(),
      dailyRate: Math.round(cfg.rent / 15).toString(),
      depositAmount: Math.round(cfg.rent * 1.5).toString(),
      isDepositNegotiable: i % 2 === 0,
      addressLine: `${100 + i} ${loc.neighborhood} Road, ${loc.town}`,
      amenities: JSON.stringify(['wifi', 'parking', 'security', 'gym', 'pool', 'elevator'].slice(0, (i % 5) + 2)),
      status: cfg.status as any,
      isVerified: cfg.verified,
      verifiedById: cfg.verified ? admin.userId : null,
      verifiedAt: cfg.verified ? new Date() : null,
    } as any).returning();

    insertedHouses.push(house);

    // Add images (4 per house)
    for (let j = 0; j < 4; j++) {
      await db.insert(houseImages).values({
        houseId: house.houseId,
        imageUrl: propertyImages[(i * 4 + j) % propertyImages.length] + `?auto=format&fit=crop&q=80&w=1200&h=800`,
        caption: j === 0 ? `${cfg.title} exterior` : `Interior view ${j}`,
        isPrimary: j === 0,
        sortOrder: j,
      } as any);
    }
  }
  console.log(`✅ ${insertedHouses.length} houses created with images`);

  // ═══════════════ BOOKINGS ═══════════════
  console.log('🌱 Creating bookings...');
  const activeHouses = insertedHouses.filter(h => h.status === 'active');

  const bookingData = [
    // Confirmed bookings (paid)
    { seeker: 0, house: 0, status: 'confirmed', fee: activeHouses[0].bookingFee },
    { seeker: 0, house: 2, status: 'confirmed', fee: activeHouses[2].bookingFee },
    { seeker: 1, house: 1, status: 'confirmed', fee: activeHouses[1].bookingFee },
    { seeker: 1, house: 3, status: 'confirmed', fee: activeHouses[3].bookingFee },
    { seeker: 2, house: 4, status: 'confirmed', fee: activeHouses[4].bookingFee },
    // Pending payment
    { seeker: 2, house: 5, status: 'pending_payment', fee: activeHouses[5].bookingFee },
    { seeker: 0, house: 6, status: 'pending_payment', fee: activeHouses[6].bookingFee },
    // Cancelled
    { seeker: 1, house: 7, status: 'cancelled', fee: activeHouses[7].bookingFee },
  ];

  const insertedBookings: any[] = [];
  for (const b of bookingData) {
    const [booking] = await db.insert(bookings).values({
      seekerId: seekers[b.seeker].userId,
      houseId: activeHouses[b.house].houseId,
      status: b.status as any,
      bookingFee: b.fee,
      moveInDate: '2026-05-01',
      specialRequests: b.status === 'confirmed' ? 'Need early check-in if possible' : null,
      confirmedAt: b.status === 'confirmed' ? new Date(Date.now() - (Math.random() * 7 * 86400000)) : null,
      cancelledAt: b.status === 'cancelled' ? new Date() : null,
      paymentMethod: 'mpesa',
    } as any).returning();
    insertedBookings.push(booking);
  }
  console.log(`✅ ${insertedBookings.length} bookings created`);

  // ═══════════════ PAYMENTS ═══════════════
  console.log('🌱 Creating payments...');
  const confirmedBookings = insertedBookings.filter(b => b.status === 'confirmed');
  const insertedPayments: any[] = [];
  
  for (let i = 0; i < confirmedBookings.length; i++) {
    const b = confirmedBookings[i];
    const receipt = `SIM${Date.now()}${i}`;
    const [pay] = await db.insert(payments).values({
      bookingId: b.bookingId,
      payerId: b.seekerId,
      amount: b.bookingFee,
      method: i % 3 === 0 ? 'card' : 'mpesa' as any,
      status: 'completed' as any,
      mpesaReceiptNumber: i % 3 !== 0 ? receipt : null,
      transactionReference: i % 3 === 0 ? `pi_sim_${Date.now()}_${i}` : null,
      paidAt: new Date(Date.now() - (Math.random() * 5 * 86400000)),
    } as any).returning();
    insertedPayments.push(pay);
  }
  console.log(`✅ ${insertedPayments.length} payment records created`);

  // ═══════════════ COMPLIANCE LOGS ═══════════════
  console.log('🌱 Creating compliance logs...');
  for (let i = 0; i < confirmedBookings.length; i++) {
    const b = confirmedBookings[i];
    const revenue = Number(b.bookingFee);
    const mri = revenue * 0.075;
    const vat = 1500 * 0.16;

    await db.insert(complianceLogs).values({
      action: 'revenue_report' as any,
      status: i < 3 ? 'submitted_sandbox' as any : 'queued_locally' as any,
      bookingId: b.bookingId,
      initiatedById: b.seekerId,
      totalRevenueKes: revenue.toString(),
      totalBookingFees: '1500',
      gavaConnectRequestId: `req_${Date.now()}_eTIMS_${i}`,
      gavaConnectResponse: JSON.stringify({ message: 'eTIMS Receipt generated', mriTax: mri, vatTax: vat }),
      notes: JSON.stringify({ eTIMS_Pipeline_MRI: `KSh ${revenue} (Tax: ${mri})`, eTIMS_Pipeline_VAT: `KSh 1500 (Tax: ${vat})` }),
    } as any);
  }

  // Add a nil filing
  await db.insert(complianceLogs).values({
    action: 'nil_filing' as any,
    status: 'submitted' as any,
    initiatedById: admin.userId,
    totalRevenueKes: '0',
    totalBookingFees: '0',
    gavaConnectRequestId: `nil_${Date.now()}`,
    gavaConnectResponse: JSON.stringify({ message: 'Nil filing accepted' }),
  } as any);
  console.log(`✅ ${confirmedBookings.length + 1} compliance logs created`);

  // ═══════════════ AUDIT LOGS ═══════════════
  console.log('🌱 Creating audit logs...');
  await db.insert(auditLogs).values([
    { performedById: admin.userId, action: 'house_approve' as any, tableName: 'houses', recordId: insertedHouses[0].houseId.toString(), newValues: JSON.stringify({ status: 'active', isVerified: true }) },
    { performedById: admin.userId, action: 'account_activate' as any, tableName: 'users', recordId: landlords[0].userId.toString(), newValues: JSON.stringify({ accountStatus: 'active', kraPin: 'A001234567P' }) },
    { performedById: seekers[0].userId, action: 'login' as any, tableName: 'users', recordId: seekers[0].userId.toString() },
    { performedById: seekers[1].userId, action: 'login' as any, tableName: 'users', recordId: seekers[1].userId.toString() },
    { performedById: landlords[0].userId, action: 'login' as any, tableName: 'users', recordId: landlords[0].userId.toString() },
    { performedById: admin.userId, action: 'login' as any, tableName: 'users', recordId: admin.userId.toString() },
    { performedById: admin.userId, action: 'house_approve' as any, tableName: 'houses', recordId: insertedHouses[1].houseId.toString(), newValues: JSON.stringify({ status: 'active', isVerified: true }) },
    { performedById: seekers[0].userId, action: 'booking_confirm' as any, tableName: 'bookings', recordId: insertedBookings[0].bookingId.toString() },
    { performedById: seekers[1].userId, action: 'payment_received' as any, tableName: 'payments', recordId: '1' },
  ] as any);
  console.log(`✅ 9 audit log entries created`);

  // ═══════════════ NOTIFICATIONS ═══════════════
  console.log('🌱 Creating notifications...');
  await db.insert(notifications).values([
    { userId: seekers[0].userId, title: 'Booking Confirmed! ✨', message: `Your reservation for "${activeHouses[0].title}" has been confirmed. You can now access move-in instructions.`, type: 'success' },
    { userId: seekers[0].userId, title: 'Payment Received', message: `KSh ${activeHouses[0].bookingFee} received via M-Pesa. Transaction recorded in your ledger.`, type: 'info' },
    { userId: seekers[1].userId, title: 'Booking Confirmed! ✨', message: `Your reservation for "${activeHouses[1].title}" has been confirmed.`, type: 'success' },
    { userId: landlords[0].userId, title: 'New Booking Reservation 🏠', message: `A seeker has reserved "${activeHouses[0].title}". Check your Active Bookings.`, type: 'info' },
    { userId: landlords[0].userId, title: 'Revenue Alert 💰', message: `KSh ${activeHouses[0].bookingFee} received for ${activeHouses[0].title}. Your M-Pesa ledger has been updated.`, type: 'success' },
    { userId: landlords[1].userId, title: 'Property Pending Review', message: `"${insertedHouses[10].title}" is waiting for admin verification before it goes live.`, type: 'warning' },
    { userId: admin.userId, title: 'New Listing Requires Approval', message: `"${insertedHouses[8].title}" by ${landlords[0].fullName} is pending your verification.`, type: 'info' },
    { userId: admin.userId, title: 'System Compliance Alert', message: `2 eTIMS receipts are in "queued_locally" status. Re-sync recommended.`, type: 'warning' },
    { userId: seekers[2].userId, title: 'Payment Pending ⏳', message: `Your booking for "${activeHouses[5].title}" is awaiting payment. Complete within 24h to secure your reservation.`, type: 'warning', isRead: false },
  ] as any);
  console.log(`✅ 9 notifications created`);

  // ═══════════════ SUMMARY ═══════════════
  console.log('\n══════════════════════════════════════════════');
  console.log('🚀 DATABASE SEEDED SUCCESSFULLY');
  console.log('══════════════════════════════════════════════');
  console.log(`  Users:       ${insertedUsers.length} (3 seekers, 3 landlords, 1 admin)`);
  console.log(`  Locations:   ${insertedLocations.length}`);
  console.log(`  Houses:      ${insertedHouses.length} (8 active, 3 pending, 2 draft)`);
  console.log(`  Bookings:    ${insertedBookings.length} (5 confirmed, 2 pending, 1 cancelled)`);
  console.log(`  Payments:    ${insertedPayments.length}`);
  console.log(`  Compliance:  ${confirmedBookings.length + 1} logs`);
  console.log(`  Audit Logs:  9`);
  console.log(`  Notifications: 9`);
  console.log('──────────────────────────────────────────────');
  console.log('  LOGIN CREDENTIALS:');
  console.log('  Seeker:   john@test.com    / Test@123');
  console.log('  Landlord: peter@test.com   / Test@123');
  console.log('  Admin:    admin@test.com   / Admin@123');
  console.log('══════════════════════════════════════════════\n');

  await client.end();
}

seedFull().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
