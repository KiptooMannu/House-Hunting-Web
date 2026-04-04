/**
 * Admin Seed Script
 * Creates a default admin user if one doesn't already exist.
 * Run: npm run seed:admin
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../src/models');

const ADMIN_DATA = {
  name: 'System Admin',
  email: 'admin@househunting.co.ke',
  phone: '+254700000000',
  password: 'Admin@123',
  role: 'admin',
};

async function seedAdmin() {
  try {
    // Connect and sync
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync();
    console.log('✅ Tables synced');

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: ADMIN_DATA.email },
    });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists. Skipping seed.');
      console.log(`   Email: ${ADMIN_DATA.email}`);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, salt);

    // Create admin
    const admin = await User.create({
      ...ADMIN_DATA,
      password: hashedPassword,
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Name:  ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Phone: ${admin.phone}`);
    console.log(`   Role:  ${admin.role}`);
    console.log(`   Password: ${ADMIN_DATA.password} (change in production!)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seedAdmin();
