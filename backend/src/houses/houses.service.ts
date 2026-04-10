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
    with: { 
      location: true, 
      images: {
        orderBy: (images, { asc }) => [asc(images.sortOrder)]
      }, 
      landlord: true 
    },
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
    county,
    search,
    lat,
    lng
  } = query;

  const offset = (page - 1) * limit;
  const { locations } = await import('../db/schema.js');

  // Build filter conditions
  const conditions = [];
  if (minRent !== undefined) conditions.push(sql`${houses.monthlyRent}::numeric >= ${minRent}`);
  if (maxRent !== undefined) conditions.push(sql`${houses.monthlyRent}::numeric <= ${maxRent}`);
  if (houseType) conditions.push(eq(houses.houseType, houseType));
  if (furnishing) conditions.push(eq(houses.furnishing, furnishing));
  if (bedrooms !== undefined) conditions.push(sql`${houses.bedrooms} >= ${bedrooms}`);
  if (status) conditions.push(eq(houses.status, status));
  if (locationId) conditions.push(eq(houses.locationId, locationId));
  
  if (county) {
    conditions.push(sql`(${locations.county} ILIKE ${'%' + county + '%'} OR ${locations.town} ILIKE ${'%' + county + '%'} OR ${locations.neighborhood} ILIKE ${'%' + county + '%'})`);
  }
  
  if (search) {
    conditions.push(sql`(${houses.title} ILIKE ${'%' + search + '%'} OR ${houses.description} ILIKE ${'%' + search + '%'})`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let order;
  if (lat && lng) {
    // Proximity search using Euclidean distance (simplified Haversine for performance)
    order = sql`(${houses.gpsLatitude}::numeric - ${lat})^2 + (${houses.gpsLongitude}::numeric - ${lng})^2 ASC`;
  } else {
    let orderColumn = 'created_at';
    if (sortBy && sortableColumns.includes(sortBy as SortableColumn)) {
      orderColumn = sortBy;
    }
    order = sql`houses.${sql.raw(orderColumn)} ${sql.raw(sortOrder)}`;
  }

  const itemsQuery = db.select({
    house: houses,
    location: locations
  })
    .from(houses)
    .leftJoin(locations, eq(houses.locationId, locations.locationId))
    .where(whereClause)
    .orderBy(order)
    .limit(limit)
    .offset(offset);

  const rawItems = await itemsQuery;
  const items = rawItems.map(row => ({
    ...row.house,
    location: row.location
  }));

  const totalResult = await db.select({ count: sql<number>`count(*)` })
    .from(houses)
    .leftJoin(locations, eq(houses.locationId, locations.locationId))
    .where(whereClause);
  const total = Number(totalResult[0]?.count ?? 0);

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