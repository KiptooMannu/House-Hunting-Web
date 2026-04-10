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
  console.log('🌱 Clearing existing data...');
  await db.delete(auditLogs);
  await db.delete(complianceLogs);
  await db.delete(payments);
  await db.delete(bookings);
  await db.delete(chatbotSessions);
  await db.delete(houseImages);
  await db.delete(houses);
  await db.delete(locations);
  await db.delete(auth);
  await db.delete(users);
  
  console.log('🌱 Seeding database...');

  // 1. USERS
  const userData = [
    { fullName: 'John Mwangi', email: 'john@example.com', phone: '254711223344', nationalId: '12345678', role: 'seeker' as any, accountStatus: 'active' as any, region: 'Nairobi' },
    { fullName: 'Mary Wanjiku', email: 'mary@example.com', phone: '254722334455', nationalId: '23456789', role: 'seeker' as any, accountStatus: 'active' as any, region: 'Kiambu' },
    { fullName: 'Peter Omondi', email: 'peter@example.com', phone: '254733445566', nationalId: '34567890', role: 'landlord' as any, accountStatus: 'active' as any, region: 'Kisumu' },
    { fullName: 'Grace Atieno', email: 'grace@example.com', phone: '254744556677', nationalId: '45678901', role: 'landlord' as any, accountStatus: 'active' as any, region: 'Mombasa' },
    { fullName: 'Admin User', email: 'admin@example.com', phone: '254799001122', nationalId: '90123456', role: 'admin' as any, accountStatus: 'active' as any, region: 'Nairobi' },
    { fullName: 'Maina Kamau', email: 'landlord@example.com', phone: '254712345678', nationalId: '11223344', role: 'landlord' as any, accountStatus: 'active' as any, region: 'Nairobi' },
  ];
  const insertedUsers = await db.insert(users).values(userData as any).returning();

  // 2. AUTH
  for (const user of insertedUsers) {
    const pass = user.email === 'admin@example.com' ? 'Admin@123' : 'Temp@123';
    const passwordHash = await bcrypt.hash(pass, 12);
    await db.insert(auth).values({
      userId: user.userId,
      passwordHash,
      isTemporaryPassword: false,
    });
  }

  // 3. LOCATIONS
  const locationData = [
    { county: 'Nairobi', subCounty: 'Westlands', town: 'Westlands', neighborhood: 'Riverside', gpsLatitude: '-1.267', gpsLongitude: '36.803' },
    { county: 'Nairobi', subCounty: 'Dagoretti', town: 'Karen', neighborhood: 'Karen End', gpsLatitude: '-1.320', gpsLongitude: '36.700' },
    { county: 'Nairobi', subCounty: 'Kilimani', town: 'Kilimani', neighborhood: 'State House', gpsLatitude: '-1.292', gpsLongitude: '36.791' },
    { county: 'Nairobi', subCounty: 'Lavington', town: 'Lavington', neighborhood: 'James Gichuru', gpsLatitude: '-1.278', gpsLongitude: '36.769' },
    { county: 'Nairobi', subCounty: 'Runda', town: 'Runda', neighborhood: 'Evergreen', gpsLatitude: '-1.222', gpsLongitude: '36.820' },
    { county: 'Nairobi', subCounty: 'Kileleshwa', town: 'Kileleshwa', neighborhood: 'Kandara Road', gpsLatitude: '-1.282', gpsLongitude: '36.786' },
  ];
  const insertedLocations = await db.insert(locations).values(locationData as any).returning();

  // 4. HOUSES
  const landlords = insertedUsers.filter(u => u.role === 'landlord' || u.role === 'admin');
  const houseData = [];
  
  const titles = [
    'The Skye Residence', 'Azure Penthouse', 'Ivory Terrace', 'The Obsidian Loft', 
    'Emerald Oasis', 'Savanna Heights', 'Crimson Villa', 'Silverstone Suite', 
    'Golden Gate Mansion', 'Willow Creek Bungalow', 'Marble Arch Studio', 'Falcon Nest', 
    'Riverbend Estate', 'Sunset Ridge', 'Crystal Waters', 'Palisades Park', 
    'Royal Garden', 'Urban Sanctuary', 'Skyline View', 'Harbor Light', 
    'Alpine Lodge', 'Desert Rose', 'Ocean Mist', 'Grand Vista', 
    'Maple Leaf', 'Oakwood Manor', 'Pine Valley', 'Cedar Ridge', 
    'Breezy Point', 'Serene Valley'
  ];

  for (let i = 0; i < 30; i++) {
    const loc = insertedLocations[i % insertedLocations.length];
    const landlord = landlords[i % landlords.length];
    const baseRent = i < 5 ? 15000 : i < 15 ? 45000 : i < 25 ? 120000 : 350000;
    const variation = (i % 10) * 10000;
    const rent = baseRent + variation;

    houseData.push({
      landlordId: landlord.userId,
      locationId: loc.locationId,
      title: `${titles[i]} - ${loc.town}`,
      description: `Premium ${titles[i]} offering unmatched luxury and comfort. Features high-end finishes, smart home tech, and panoramic views of ${loc.town}. Large windows allow for natural lighting, and the open-plan kitchen is perfect for gourmet cooking.`,
      houseType: ['bedsitter', 'one_bedroom', 'two_bedroom', 'three_bedroom', 'mansion', 'bungalow', 'studio'][i % 7] as any,
      furnishing: ['furnished', 'semi_furnished', 'unfurnished'][i % 3] as any,
      bedrooms: (i % 5) + 1,
      bathrooms: (i % 4) + 1,
      monthlyRent: rent.toString(),
      dailyRate: (rent / 15).toFixed(0),
      depositAmount: (rent * 1.5).toFixed(0),
      isDepositNegotiable: i % 2 === 0,
      addressLine: `${100 + i} ${loc.neighborhood} Road, ${loc.town}`,
      amenities: JSON.stringify(['wifi', 'parking', 'gym', 'pool', 'security', 'elevator'].slice(0, (i % 6) + 1)),
      status: 'active' as any,
      isVerified: true,
      verifiedById: landlords[0].userId,
      verifiedAt: new Date(),
    });
  }

  const insertedHouses = await db.insert(houses).values(houseData as any).returning();
  console.log(`✅ Created ${insertedHouses.length} premium houses`);

  // 5. HOUSE IMAGES (3 PER HOUSE)
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
    'https://images.unsplash.com/photo-1600607687644-c7171b42498f'
  ];

  const imageData = [];
  for (const house of insertedHouses) {
    // 5 unique images per house from the set
    for (let j = 0; j < 5; j++) {
      imageData.push({
        houseId: house.houseId,
        imageUrl: propertyImages[(house.houseId * 5 + j) % propertyImages.length] + '?auto=format&fit=crop&q=80&w=1200',
        caption: j === 0 ? `Exterior of ${house.title}` : `Interior View ${j} of ${house.title}`,
        isPrimary: j === 0,
        sortOrder: j,
      });
    }
  }
  await db.insert(houseImages).values(imageData as any);
  console.log(`✅ Added ${imageData.length} curated images (3 per house)`);

  console.log('🚀 Seeding Completed Successfully with Multi-Image Support!');
  await client.end();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});