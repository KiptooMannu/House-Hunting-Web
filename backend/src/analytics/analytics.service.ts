import { sql, eq, and, gte, lte } from 'drizzle-orm';
import { db } from '../db/db.js';
import { users, houses, payments, locations } from '../db/schema.js';

export const getOverviewStats = async () => {
   // 1. Total Revenue (Completed Payments)
   const [revenueResult] = await db.select({ 
     total: sql<number>`COALESCE(SUM(${payments.amount}), 0)::float` 
   }).from(payments).where(eq(payments.status, 'completed'));

   // 2. Active Inventory
   const [activeResult] = await db.select({ 
     count: sql<number>`count(*)::int` 
   }).from(houses).where(eq(houses.status, 'active'));

   // 3. Pending Approvals
   const [pendingResult] = await db.select({ 
     count: sql<number>`count(*)::int` 
   }).from(houses).where(eq(houses.status, 'pending_approval'));

   // 4. Total Landlords
   const [landlordResult] = await db.select({ 
     count: sql<number>`count(*)::int` 
   }).from(users).where(eq(users.role, 'landlord'));

   return {
     totalRevenue: revenueResult.total,
     activeHouses: activeResult.count,
     pendingApprovals: pendingResult.count,
     totalLandlords: landlordResult.count,
   };
};

export const getAdminStats = async () => {
  // 1. User Growth (Last 6 Months) - Live data
  const userGrowth = await db.select({
    month: sql<string>`TO_CHAR(${users.createdAt}, 'Mon')`,
    role: users.role,
    count: sql<number>`count(*)::int`,
    monthNum: sql<number>`EXTRACT(MONTH FROM ${users.createdAt})`
  })
  .from(users)
  .where(gte(users.createdAt, sql`now() - interval '6 months'`))
  .groupBy(sql`TO_CHAR(${users.createdAt}, 'Mon')`, users.role, sql`EXTRACT(MONTH FROM ${users.createdAt})`)
  .orderBy(sql`EXTRACT(MONTH FROM ${users.createdAt})`);

  // 2. Revenue Growth (Last 6 Months) - Live data
  const revenueGrowth = await db.select({
    month: sql<string>`TO_CHAR(${payments.createdAt}, 'Mon')`,
    revenue: sql<number>`sum(${payments.amount})::float`,
    monthNum: sql<number>`EXTRACT(MONTH FROM ${payments.createdAt})`
  })
  .from(payments)
  .where(and(
    eq(payments.status, 'completed'),
    gte(payments.createdAt, sql`now() - interval '6 months'`)
  ))
  .groupBy(sql`TO_CHAR(${payments.createdAt}, 'Mon')`, sql`EXTRACT(MONTH FROM ${payments.createdAt})`)
  .orderBy(sql`EXTRACT(MONTH FROM ${payments.createdAt})`);

  return {
    userGrowth,
    revenueGrowth
  };
};

export const getMarketPulse = async () => {
  // Simple avg monthly rent trend
  const trends = await db.select({
    month: sql<string>`TO_CHAR(${houses.createdAt}, 'Mon')`,
    avgRent: sql<number>`avg(${houses.monthlyRent})::float`,
    monthNum: sql<number>`EXTRACT(MONTH FROM ${houses.createdAt})`
  })
  .from(houses)
  .groupBy(sql`TO_CHAR(${houses.createdAt}, 'Mon')`, sql`EXTRACT(MONTH FROM ${houses.createdAt})`)
  .orderBy(sql`EXTRACT(MONTH FROM ${houses.createdAt})`);

  return trends;
};

export const getNeighborhoodTrends = async () => {
  const neighborhoods = ['Westlands', 'Karen', 'Kilimani'];
  const trends = await db.select({
    month: sql<string>`TO_CHAR(${houses.createdAt}, 'Mon')`,
    neighborhood: locations.neighborhood,
    avgRent: sql<number>`avg(${houses.monthlyRent})::float`,
    monthNum: sql<number>`EXTRACT(MONTH FROM ${houses.createdAt})`
  })
  .from(houses)
  .innerJoin(locations, eq(houses.locationId, locations.locationId))
  .where(sql`${locations.neighborhood} IN ${neighborhoods}`)
  .groupBy(sql`TO_CHAR(${houses.createdAt}, 'Mon')`, locations.neighborhood, sql`EXTRACT(MONTH FROM ${houses.createdAt})`)
  .orderBy(sql`EXTRACT(MONTH FROM ${houses.createdAt})`);

  return trends;
};
