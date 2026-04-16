import { eq, desc, asc, and, sql, inArray } from 'drizzle-orm';
import { db } from '../db/db.js';
import { houses, locations, houseImages } from '../db/schema.js';

// Mapping of sortable column names to actual column names in DB
const sortableColumns = ['monthly_rent', 'bedrooms', 'view_count', 'booking_count', 'updated_at', 'created_at'] as const;
type SortableColumn = typeof sortableColumns[number];

export const createHouse = async (input: any) => {
  const { imageUrls, locationName, county, ...houseData } = input;

  return await db.transaction(async (tx) => {
    // 1. Resolve Location
    // We try to find an existing location or create a new one
    let locationId = houseData.locationId;
    
    if (!locationId && locationName && county) {
      const existing = await tx.select().from(locations)
        .where(and(
          eq(locations.town, locationName),
          eq(locations.county, county)
        ))
        .limit(1);

      if (existing.length > 0) {
        locationId = existing[0].locationId;
      } else {
        const [newLoc] = await tx.insert(locations).values({
          town: locationName,
          county: county,
          neighborhood: locationName,
        }).returning();
        locationId = newLoc.locationId;
      }
    }

    // 2. Insert House
    const [newHouse] = await tx.insert(houses).values({
      ...houseData,
      locationId: locationId,
      status: 'active', // Default to active for new curated listings
    }).returning();

    // 3. Insert Images
    if (imageUrls && imageUrls.length > 0) {
      const imageRecords = imageUrls.map((url: string, idx: number) => ({
        houseId: newHouse.houseId,
        imageUrl: url,
        isPrimary: idx === 0,
        sortOrder: idx,
      }));
      await tx.insert(houseImages).values(imageRecords);
    }

    return { ...newHouse, images: imageUrls };
  });
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
    conditions.push(sql`(${houses.title} ILIKE ${'%' + search + '%'} 
      OR ${houses.description} ILIKE ${'%' + search + '%'}
      OR ${locations.county} ILIKE ${'%' + search + '%'}
      OR ${locations.town} ILIKE ${'%' + search + '%'}
      OR ${locations.neighborhood} ILIKE ${'%' + search + '%'})`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let orderExpr: any;
  if (lat && lng) {
    orderExpr = sql`(${houses.gpsLatitude}::numeric - ${lat})^2 + (${houses.gpsLongitude}::numeric - ${lng})^2 ASC`;
  } else {
    let orderColumn = houses.createdAt;
    const columnMap: Record<string, any> = {
      'monthly_rent': houses.monthlyRent,
      'bedrooms': houses.bedrooms,
      'view_count': houses.viewCount,
      'booking_count': houses.bookingCount,
      'updated_at': houses.updatedAt,
      'created_at': houses.createdAt
    };
    const targetColumn = sortBy && columnMap[sortBy] ? columnMap[sortBy] : orderColumn;
    orderExpr = sortOrder === 'desc' ? desc(targetColumn) : asc(targetColumn);
  }

  // Items query using select + join to support filtering on related table
  const itemsResult = await db.select({
    house: houses,
    location: locations,
  })
    .from(houses)
    .leftJoin(locations, eq(houses.locationId, locations.locationId))
    .where(whereClause)
    .orderBy(orderExpr)
    .limit(limit)
    .offset(offset);

  // Fetch images for these houses
  const houseIds = itemsResult.map(r => r.house.houseId);
  let imagesList: any[] = [];
  if (houseIds.length > 0) {
    imagesList = await db.query.houseImages.findMany({
      where: inArray(houseImages.houseId, houseIds),
      orderBy: [asc(houseImages.sortOrder)]
    });
  }

  const items = itemsResult.map(r => ({
    ...r.house,
    location: r.location,
    images: imagesList.filter(img => img.houseId === r.house.houseId)
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

export const listUniqueTowns = async () => {
  const { locations } = await import('../db/schema.js');
  const results = await db.selectDistinct({ town: locations.town })
    .from(locations)
    .where(sql`${locations.town} IS NOT NULL`)
    .orderBy(asc(locations.town));
  return results.map(r => r.town);
};

export const listUniqueLocations = async () => {
  const { locations } = await import('../db/schema.js');
  return await db.selectDistinct({ 
    town: locations.town, 
    county: locations.county 
  })
    .from(locations)
    .where(and(
      sql`${locations.town} IS NOT NULL`,
      sql`${locations.county} IS NOT NULL`
    ))
    .orderBy(asc(locations.county), asc(locations.town));
};