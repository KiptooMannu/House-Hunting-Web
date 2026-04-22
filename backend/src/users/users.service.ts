import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db/db.js';
import { users, auth } from '../db/schema.js';
import bcrypt from 'bcryptjs';

// Map frontend sort keys to database column names
const columnMap: Record<string, string> = {
  fullName: 'full_name',
  email: 'email',
  role: 'role',
  accountStatus: 'account_status',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  lastLoginAt: 'last_login_at',
  totalBookings: 'total_bookings',
  totalListings: 'total_listings',
};

export const createUser = async (data: any) => {
  const { password, email, phone, ...userData } = data;

  // UNIQUE CHECKS
  if (email) {
    const existingEmail = await db.query.users.findFirst({ where: eq(users.email, email.trim().toLowerCase()) });
    if (existingEmail) throw new Error('A user with this email is already registered. Please login instead.');
  }

  if (phone) {
    const existingPhone = await db.query.users.findFirst({ where: eq(users.phone, phone) });
    if (existingPhone) throw new Error('This phone number is already in use. Please use a different one.');
  }
  
  // All registrations now use permanent passwords by default
  const actualPassword = password || generateTempPassword();
  const passwordHash = await bcrypt.hash(actualPassword, 12);
  const isTemporary = false; 

  const [newUser] = await db.insert(users).values({ ...userData, email, phone }).returning();
  
  await db.insert(auth).values({ 
    userId: newUser.userId, 
    passwordHash, 
    isTemporaryPassword: isTemporary 
  });

  return { 
    user: newUser, 
    password: actualPassword // Return the password (provided or generated)
  };
};

export const getUser = async (userId: number) => {
  return await db.query.users.findFirst({ where: eq(users.userId, userId) });
};

export const listUsers = async (query: any) => {
  const {
    page = 1,
    limit = 20,
    sortBy,
    sortOrder = 'asc',
    role,
    accountStatus,
    search,
  } = query;

  const offset = (page - 1) * limit;

  // Build filter conditions
  const conditions = [];
  if (role) conditions.push(eq(users.role, role));
  if (accountStatus) conditions.push(eq(users.accountStatus, accountStatus));
  if (search) {
    conditions.push(
      sql`(${users.fullName} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`})`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Determine sort column
  let orderColumn = 'created_at';
  if (sortBy && columnMap[sortBy]) {
    orderColumn = columnMap[sortBy];
  }
  const order = sql`${sql.raw(orderColumn)} ${sql.raw(sortOrder)}`;

  // For Landlords: Revenue from their houses
  // For Seekers: Revenue they paid
  const items = await db.select({
    userId: users.userId,
    fullName: users.fullName,
    email: users.email,
    phone: users.phone,
    role: users.role,
    accountStatus: users.accountStatus,
    profileImage: users.profileImage,
    kraPin: users.kraPin,
    nationalId: users.nationalId,
    createdAt: users.createdAt,
    totalBookings: users.totalBookings,
    totalListings: users.totalListings,
    totalRevenue: sql<string>`COALESCE(
      CASE 
        WHEN ${users.role} = 'landlord' THEN (
          SELECT SUM(p.amount) FROM payments p 
          JOIN bookings b ON p.booking_id = b.booking_id 
          JOIN houses h ON b.house_id = h.house_id 
          WHERE h.landlord_id = ${users.userId} AND p.status = 'completed'
        )
        WHEN ${users.role} = 'seeker' THEN (
          SELECT SUM(amount) FROM payments WHERE payer_id = ${users.userId} AND status = 'completed'
        )
        ELSE 0 
      END, 0)::numeric`
  })
  .from(users)
  .where(whereClause)
  .orderBy(order)
  .limit(limit)
  .offset(offset);

  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(users).where(whereClause);
  const total = totalResult[0]?.count ?? 0;

  return { items, total, page, limit };
};

export const updateUser = async (userId: number, updates: any) => {
  const [updated] = await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.userId, userId)).returning();
  return updated;
};

export const deleteUser = async (userId: number) => {
  const [deleted] = await db.delete(users).where(eq(users.userId, userId)).returning();
  return deleted;
};

function generateTempPassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const special = '@#$%!';
  const all = upper + lower + nums + special;
  let pwd = upper[Math.floor(Math.random() * upper.length)] + lower[Math.floor(Math.random() * lower.length)] + nums[Math.floor(Math.random() * nums.length)] + special[Math.floor(Math.random() * special.length)];
  for (let i = 0; i < 8; i++) pwd += all[Math.floor(Math.random() * all.length)];
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}