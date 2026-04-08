import { eq, desc, asc, and, sql } from 'drizzle-orm';
import { db } from '../db/db.js';
import { houses } from '../db/schema.js';

// Mapping of sortable column names to actual column names in DB
const sortableColumns = ['monthly_rent', 'bedrooms', 'view_count', 'booking_count', 'updated_at', 'created_at'] as const;
type SortableColumn = typeof sortableColumns[number];

export const createHouse = async (data: any) => {
  const [newHouse] = await db.insert(houses).values(data).returning();
  return newHouse;
};

export const getHouse = async (houseId: number) => {
  return await db.query.houses.findFirst({
    where: eq(houses.houseId, houseId),
    with: { location: true, images: true, landlord: true },
  });
};

export const listHouses = async (query: any) => {
  const {
    page = 1,
    limit = 20,
    sortBy,
    sortOrder = 'asc',
    minRent,
    maxRent,
    houseType,
    furnishing,
    bedrooms,
    status,
    locationId,
  } = query;

  const offset = (page - 1) * limit;

  // Build filter conditions
  const conditions = [];
  if (minRent !== undefined) conditions.push(sql`${houses.monthlyRent} >= ${minRent}`);
  if (maxRent !== undefined) conditions.push(sql`${houses.monthlyRent} <= ${maxRent}`);
  if (houseType) conditions.push(eq(houses.houseType, houseType));
  if (furnishing) conditions.push(eq(houses.furnishing, furnishing));
  if (bedrooms) conditions.push(eq(houses.bedrooms, bedrooms));
  if (status) conditions.push(eq(houses.status, status));
  if (locationId) conditions.push(eq(houses.locationId, locationId));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Build order by clause using raw SQL to avoid type issues
  let orderColumn = 'created_at';
  if (sortBy && sortableColumns.includes(sortBy as SortableColumn)) {
    orderColumn = sortBy;
  }
  const order = sql`${sql.raw(orderColumn)} ${sql.raw(sortOrder)}`;

  const items = await db.select().from(houses).where(whereClause).orderBy(order).limit(limit).offset(offset);
  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(houses).where(whereClause);
  const total = totalResult[0]?.count ?? 0;

  return { items, total, page, limit };
};

export const updateHouse = async (houseId: number, updates: any) => {
  const [updated] = await db.update(houses).set({ ...updates, updatedAt: new Date() }).where(eq(houses.houseId, houseId)).returning();
  return updated;
};

export const deleteHouse = async (houseId: number) => {
  const [deleted] = await db.delete(houses).where(eq(houses.houseId, houseId)).returning();
  return deleted;
};