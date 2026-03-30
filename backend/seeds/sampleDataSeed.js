/**
 * Sample data seed script (landlord + houses).
 *
 * Run:
 *   node seeds/sampleDataSeed.js
 */
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { sequelize, User, House } = require('../models');

const LANDLORD_DATA = {
  name: 'Sample Landlord',
  email: 'landlord@househunting.co.ke',
  phone: '+254700111222',
  password: 'Landlord@123',
  role: 'landlord',
};

const HOUSES = [
  {
    title: 'Kilimani Cozy 1BR Apartment',
    description: 'Modern 1BR apartment in Kilimani. Secure, spacious, close to amenities.',
    rent: 45000,
    location_name: 'Kilimani, Nairobi',
    county: 'Nairobi',
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['WiFi', 'Security', 'Water'],
    images: [],
  },
  {
    title: 'Mombasa Beachside Studio',
    description: 'Affordable studio near the beach with great ventilation and security.',
    rent: 38000,
    location_name: 'Nyali, Mombasa',
    county: 'Mombasa',
    bedrooms: 0,
    bathrooms: 1,
    amenities: ['Security', 'Water'],
    images: [],
  },
  {
    title: 'Nakuru 2BR Family House',
    description: 'Comfortable 2BR home suitable for families; quiet neighborhood.',
    rent: 52000,
    location_name: 'Hyrax Hill, Nakuru',
    county: 'Nakuru',
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['Parking', 'Security', 'Water'],
    images: [],
  },
  {
    title: 'Eldoret 3BR Executive House',
    description: 'Executive 3BR home with ample space and reliable water.',
    rent: 65000,
    location_name: 'Eldoret Town, Uasin Gishu',
    county: 'Eldoret',
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['Parking', 'Security', 'Water'],
    images: [],
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    let landlord = await User.findOne({ where: { email: LANDLORD_DATA.email } });
    if (!landlord) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(LANDLORD_DATA.password, salt);

      landlord = await User.create({
        name: LANDLORD_DATA.name,
        email: LANDLORD_DATA.email,
        phone: LANDLORD_DATA.phone,
        password: hashedPassword,
        role: LANDLORD_DATA.role,
      });
      console.log(`✅ Created landlord: ${landlord.email}`);
    } else {
      console.log(`ℹ️ Landlord already exists: ${landlord.email}`);
    }

    let createdCount = 0;
    for (const house of HOUSES) {
      const existing = await House.findOne({
        where: { landlord_id: landlord.id, title: house.title },
      });

      if (existing) continue;

      await House.create({
        landlord_id: landlord.id,
        title: house.title,
        description: house.description,
        rent: house.rent,
        location_name: house.location_name,
        county: house.county,
        bedrooms: house.bedrooms,
        bathrooms: house.bathrooms,
        amenities: house.amenities || [],
        images: house.images || [],
        status: 'available',
        lat: null,
        lng: null,
      });
      createdCount += 1;
    }

    console.log(`✅ Sample houses created: ${createdCount}`);
  } catch (error) {
    console.error('❌ Sample seed failed:', error.message);
    process.exit(1);
  }
  process.exit(0);
}

seed();

