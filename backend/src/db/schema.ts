// src/db/schema.ts
// Project 2: Chatbot-Assisted House-Hunting Web Application for Kenya

import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  date,
  pgEnum,
  index,
  unique,
  uniqueIndex,
  jsonb,
} from 'drizzle-orm/pg-core';
import { type InferSelectModel, type InferInsertModel, relations, sql } from 'drizzle-orm';
import { z } from 'zod';

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['seeker', 'landlord', 'admin']);
export const accountStatusEnum = pgEnum('account_status', [
  'active',
  'inactive',
  'locked',
  'pending_verification',
]);
export const houseTypeEnum = pgEnum('house_type', [
  'bedsitter',
  'one_bedroom',
  'two_bedroom',
  'three_bedroom',
  'four_bedroom_plus',
  'studio',
  'bungalow',
  'mansion',
]);
export const furnishingEnum = pgEnum('furnishing', ['furnished', 'semi_furnished', 'unfurnished']);
export const listingStatusEnum = pgEnum('listing_status', [
  'active',
  'booked',
  'unavailable',
  'draft',
  'pending_approval',
  'rejected',
  'removed',
]);
export const bookingStatusEnum = pgEnum('booking_status', [
  'pending_payment',
  'confirmed',
  'cancelled',
  'expired',
  'rejected',
]);
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'completed',
  'failed',
  'refunded',
]);
export const paymentMethodEnum = pgEnum('payment_method', ['mpesa', 'bank_transfer', 'cash', 'card']);
export const chatbotSessionStatusEnum = pgEnum('chatbot_session_status', [
  'active',
  'completed',
  'abandoned',
]);
export const complianceActionEnum = pgEnum('compliance_action', [
  'nil_filing',
  'revenue_report',
  'tax_submission',
  'audit_query',
]);
export const complianceStatusEnum = pgEnum('compliance_status', [
  'pending',
  'submitted',
  'submitted_sandbox',
  'queued_locally',
  'offline_sync_pending',
  'acknowledged',
  'rejected',
]);

export const jobStatusEnum = pgEnum('job_status', [
  'pending',
  'processing',
  'completed',
  'failed',
]);
export const auditActionEnum = pgEnum('audit_action', [
  'login',
  'logout',
  'register',
  'create',
  'update',
  'delete',
  'password_reset',
  'account_lock',
  'account_activate',
  'account_deactivate',
  'booking_confirm',
  'payment_received',
  'house_approve',
  'house_reject',
  'house_revoke',
]);

// ─────────────────────────────────────────────
// TABLES
// NOTE: chatbotSessions is declared BEFORE bookings
// to fix the forward-reference TypeScript error.
// ─────────────────────────────────────────────

// 1. USERS
export const users = pgTable('users', {
  userId: serial('user_id').primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  phone: varchar('phone', { length: 20 }).unique().notNull(),
  nationalId: varchar('national_id', { length: 50 }).unique(),
  role: userRoleEnum('role').notNull().default('seeker'),
  accountStatus: accountStatusEnum('account_status').notNull().default('pending_verification'),
  profileImage: varchar('profile_image', { length: 500 }),
  region: varchar('region', { length: 255 }),
  kraPin: varchar('kra_pin', { length: 50 }),
  agencyName: varchar('agency_name', { length: 255 }),
  lastLoginAt: timestamp('last_login_at'),
  totalBookings: integer('total_bookings').default(0),
  totalListings: integer('total_listings').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2. AUTH
export const auth = pgTable('auth', {
  authId: serial('auth_id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.userId, { onDelete: 'cascade' }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  isTemporaryPassword: boolean('is_temporary_password').default(false),
  temporaryPasswordExpiresAt: timestamp('temporary_password_expires_at'),
  loginAttempts: integer('login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  refreshToken: text('refresh_token'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpiresAt: timestamp('password_reset_expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. LOCATIONS
export const locations = pgTable(
  'locations',
  {
    locationId: serial('location_id').primaryKey(),
    county: varchar('county', { length: 100 }).notNull(),
    subCounty: varchar('sub_county', { length: 100 }),
    town: varchar('town', { length: 100 }),
    neighborhood: varchar('neighborhood', { length: 100 }),
    gpsLatitude: decimal('gps_latitude', { precision: 10, scale: 7 }),
    gpsLongitude: decimal('gps_longitude', { precision: 10, scale: 7 }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    unique('unique_location').on(
      table.county,
      table.subCounty,
      table.town,
      table.neighborhood
    ),
  ]
);

// 4. HOUSES
export const houses = pgTable(
  'houses',
  {
    houseId: serial('house_id').primaryKey(),
    landlordId: integer('landlord_id')
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    locationId: integer('location_id').references(() => locations.locationId, {
      onDelete: 'set null',
    }),
    title: varchar('title', { length: 255 }).notNull(),
    // In houses table, add:
    bookingFee: decimal('booking_fee', { precision: 10, scale: 2 }).default('0.00'),
    description: text('description'),
    houseType: houseTypeEnum('house_type').notNull(),
    furnishing: furnishingEnum('furnishing').notNull().default('unfurnished'),
    bedrooms: integer('bedrooms').notNull().default(1),
    bathrooms: integer('bathrooms').notNull().default(1),
    monthlyRent: decimal('monthly_rent', { precision: 12, scale: 2 }).notNull(),
    dailyRate: decimal('daily_rate', { precision: 12, scale: 2 }).default('0.00'),
    depositAmount: decimal('deposit_amount', { precision: 12, scale: 2 }),
    isDepositNegotiable: boolean('is_deposit_negotiable').default(false),
    availableFrom: date('available_from'),
    gpsLatitude: decimal('gps_latitude', { precision: 10, scale: 7 }),
    gpsLongitude: decimal('gps_longitude', { precision: 10, scale: 7 }),
    addressLine: text('address_line'),
    amenities: text('amenities'), // JSON string e.g. ["wifi","parking","water"]
    status: listingStatusEnum('status').notNull().default('draft'),
    isVerified: boolean('is_verified').default(false),
    verifiedById: integer('verified_by_id').references(() => users.userId, {
      onDelete: 'set null',
    }),
    verifiedAt: timestamp('verified_at'),
    viewCount: integer('view_count').default(0),
    bookingCount: integer('booking_count').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_houses_landlord_status').on(table.landlordId, table.status),
    index('idx_houses_location_rent').on(table.locationId, table.monthlyRent),
  ]
);

// 5. HOUSE IMAGES
export const houseImages = pgTable('house_images', {
  imageId: serial('image_id').primaryKey(),
  houseId: integer('house_id')
    .notNull()
    .references(() => houses.houseId, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  caption: varchar('caption', { length: 255 }),
  isPrimary: boolean('is_primary').default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. NOTIFICATIONS
export const notifications = pgTable('notifications', {
  notificationId: serial('notification_id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).default('info'), // info, success, warning, error
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. CHATBOT SESSIONS — declared BEFORE bookings so bookings can safely reference it
export const chatbotSessions = pgTable('chatbot_sessions', {
  sessionId: serial('session_id').primaryKey(),
  userId: integer('user_id').references(() => users.userId, { onDelete: 'set null' }),
  sessionToken: varchar('session_token', { length: 255 }).unique().notNull(),
  status: chatbotSessionStatusEnum('status').notNull().default('active'),
  preferredCounty: varchar('preferred_county', { length: 100 }),
  preferredTown: varchar('preferred_town', { length: 100 }),
  budgetMin: decimal('budget_min', { precision: 10, scale: 2 }),
  budgetMax: decimal('budget_max', { precision: 10, scale: 2 }),
  preferredHouseType: houseTypeEnum('preferred_house_type'),
  preferredFurnishing: furnishingEnum('preferred_furnishing'),
  preferredBedrooms: integer('preferred_bedrooms'),
  additionalPreferences: text('additional_preferences'), // JSON
  conversationHistory: text('conversation_history'),     // JSON array of messages
  resultHouseIds: text('result_house_ids'),              // JSON array of houseIds
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  lastActivityAt: timestamp('last_activity_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. BOOKINGS — references chatbotSessions (safe now, declared above)
export const bookings = pgTable(
  'bookings',
  {
    bookingId: serial('booking_id').primaryKey(),
    seekerId: integer('seeker_id')
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    houseId: integer('house_id')
      .notNull()
      .references(() => houses.houseId, { onDelete: 'cascade' }),
    chatbotSessionId: integer('chatbot_session_id').references(
      () => chatbotSessions.sessionId,
      { onDelete: 'set null' }
    ),
    status: bookingStatusEnum('status').notNull().default('pending_payment'),
    bookingFee: decimal('booking_fee', { precision: 10, scale: 2 }).notNull(),
    moveInDate: date('move_in_date'),
    checkoutDate: date('checkout_date'),
    totalPrice: decimal('total_price', { precision: 12, scale: 2 }).default('0.00'),
    specialRequests: text('special_requests'),
    rejectionReason: text('rejection_reason'),
    confirmedAt: timestamp('confirmed_at'),
    cancelledAt: timestamp('cancelled_at'),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    paymentMethod: varchar('payment_method', { length: 20 }),
    mpesaCheckoutRequestId: varchar('mpesa_checkout_request_id', { length: 100 }),
  },
  (table) => [
    uniqueIndex('unique_active_seeker_house')
      .on(table.seekerId, table.houseId)
      .where(sql`${table.status} NOT IN ('cancelled', 'expired', 'rejected')`),
  ]
);

// 8. PAYMENTS
export const payments = pgTable(
  'payments',
  {
    paymentId: serial('payment_id').primaryKey(),
    bookingId: integer('booking_id')
      .notNull()
      .references(() => bookings.bookingId, { onDelete: 'cascade' }),
    payerId: integer('payer_id')
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    method: paymentMethodEnum('method').notNull().default('mpesa'),
    status: paymentStatusEnum('status').notNull().default('pending'),
    mpesaPhoneNumber: varchar('mpesa_phone_number', { length: 20 }),
    mpesaCheckoutRequestId: varchar('mpesa_checkout_request_id', { length: 100 }),
    mpesaMerchantRequestId: varchar('mpesa_merchant_request_id', { length: 100 }),
    mpesaReceiptNumber: varchar('mpesa_receipt_number', { length: 50 }),
    mpesaTransactionDate: timestamp('mpesa_transaction_date'),
    transactionReference: varchar('transaction_reference', { length: 255 }).unique(),
    failureReason: text('failure_reason'),
    paidAt: timestamp('paid_at'),
    refundedAt: timestamp('refunded_at'),
    refundReason: text('refund_reason'),
    idempotencyKey: varchar('idempotency_key', { length: 255 }).unique(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_payments_idempotency').on(table.idempotencyKey),
    index('idx_mpesa_checkout').on(table.mpesaCheckoutRequestId),
  ]
);

// 9. COMPLIANCE LOGS
export const complianceLogs = pgTable('compliance_logs', {
  logId: serial('log_id').primaryKey(),
  initiatedById: integer('initiated_by_id').references(() => users.userId, {
    onDelete: 'set null',
  }),
  action: complianceActionEnum('action').notNull(),
  status: complianceStatusEnum('status').notNull().default('pending'),
  periodStart: date('period_start'),
  periodEnd: date('period_end'),
  totalRevenueKes: decimal('total_revenue_kes', { precision: 14, scale: 2 }),
  totalBookingFees: decimal('total_booking_fees', { precision: 14, scale: 2 }),
  bookingId: integer('booking_id').references(() => bookings.bookingId, {
    onDelete: 'set null',
  }),
  gavaConnectRequestId: varchar('gava_connect_request_id', { length: 255 }),
  gavaConnectResponse: text('gava_connect_response'), // JSON
  acknowledgedAt: timestamp('acknowledged_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 10. AUDIT LOGS
export const auditLogs = pgTable('audit_logs', {
  logId: serial('log_id').primaryKey(),
  performedById: integer('performed_by_id').references(() => users.userId, {
    onDelete: 'set null',
  }),
  action: auditActionEnum('action').notNull(),
  tableName: varchar('table_name', { length: 100 }),
  recordId: varchar('record_id', { length: 100 }),
  previousValues: text('previous_values'), // JSON
  newValues: text('new_values'),           // JSON
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 11. SAVED HOUSES (FAVORITES)
export const savedHouses = pgTable(
  'saved_houses',
  {
    saveId: serial('save_id').primaryKey(),
    seekerId: integer('seeker_id')
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    houseId: integer('house_id')
      .notNull()
      .references(() => houses.houseId, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('unique_seeker_house_save').on(table.seekerId, table.houseId),
  ]
);

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  auth: one(auth, { fields: [users.userId], references: [auth.userId] }),
  listings: many(houses, { relationName: 'landlord_listings' }),
  verifiedHouses: many(houses, { relationName: 'verified_by' }),
  bookings: many(bookings, { relationName: 'seeker_bookings' }),
  savedHouses: many(savedHouses),
  payments: many(payments),
  chatbotSessions: many(chatbotSessions),
  auditLogs: many(auditLogs),
  complianceLogs: many(complianceLogs),
}));

export const authRelations = relations(auth, ({ one }) => ({
  user: one(users, { fields: [auth.userId], references: [users.userId] }),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
  houses: many(houses),
}));

export const housesRelations = relations(houses, ({ one, many }) => ({
  landlord: one(users, {
    fields: [houses.landlordId],
    references: [users.userId],
    relationName: 'landlord_listings',
  }),
  location: one(locations, {
    fields: [houses.locationId],
    references: [locations.locationId],
  }),
  verifiedBy: one(users, {
    fields: [houses.verifiedById],
    references: [users.userId],
    relationName: 'verified_by',
  }),
  images: many(houseImages),
  bookings: many(bookings),
  savedBy: many(savedHouses),
}));

export const savedHousesRelations = relations(savedHouses, ({ one }) => ({
  seeker: one(users, {
    fields: [savedHouses.seekerId],
    references: [users.userId],
  }),
  house: one(houses, {
    fields: [savedHouses.houseId],
    references: [houses.houseId],
  }),
}));

export const houseImagesRelations = relations(houseImages, ({ one }) => ({
  house: one(houses, { fields: [houseImages.houseId], references: [houses.houseId] }),
}));

export const chatbotSessionsRelations = relations(chatbotSessions, ({ one, many }) => ({
  user: one(users, { fields: [chatbotSessions.userId], references: [users.userId] }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  seeker: one(users, {
    fields: [bookings.seekerId],
    references: [users.userId],
    relationName: 'seeker_bookings',
  }),
  house: one(houses, { fields: [bookings.houseId], references: [houses.houseId] }),
  chatbotSession: one(chatbotSessions, {
    fields: [bookings.chatbotSessionId],
    references: [chatbotSessions.sessionId],
  }),
  payments: many(payments),
}));


export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.bookingId] }),
  payer: one(users, { fields: [payments.payerId], references: [users.userId] }),
}));

export const complianceLogsRelations = relations(complianceLogs, ({ one }) => ({
  initiatedBy: one(users, {
    fields: [complianceLogs.initiatedById],
    references: [users.userId],
  }),
  booking: one(bookings, {
    fields: [complianceLogs.bookingId],
    references: [bookings.bookingId],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  performedBy: one(users, {
    fields: [auditLogs.performedById],
    references: [users.userId],
  }),
}));

// ─────────────────────────────────────────────
// TYPES
// Using InferSelectModel / InferInsertModel (modern Drizzle API, no implicit any)
// ─────────────────────────────────────────────

export type TSUsers = InferSelectModel<typeof users>;
export type TIUsers = InferInsertModel<typeof users>;
export type TSAuth = InferSelectModel<typeof auth>;
export type TIAuth = InferInsertModel<typeof auth>;
export type TSLocations = InferSelectModel<typeof locations>;
export type TILocations = InferInsertModel<typeof locations>;
export type TSHouses = InferSelectModel<typeof houses>;
export type TIHouses = InferInsertModel<typeof houses>;
export type TSHouseImages = InferSelectModel<typeof houseImages>;
export type TIHouseImages = InferInsertModel<typeof houseImages>;
export type TSChatbotSessions = InferSelectModel<typeof chatbotSessions>;
export type TIChatbotSessions = InferInsertModel<typeof chatbotSessions>;
export type TSBookings = InferSelectModel<typeof bookings>;
export type TIBookings = InferInsertModel<typeof bookings>;
export type TSPayments = InferSelectModel<typeof payments>;
export type TIPayments = InferInsertModel<typeof payments>;
export type TSSavedHouses = InferSelectModel<typeof savedHouses>;
export type TISavedHouses = InferInsertModel<typeof savedHouses>;
// ─────────────────────────────────────────────
// JOBS QUEUE (PERSISTENCE & RETRIES)
// ─────────────────────────────────────────────

export const jobs = pgTable('jobs', {
  jobId: serial('job_id').primaryKey(),
  type: varchar('type', { length: 100 }).notNull(), // e.g., 'kra_etims_sync'
  payload: jsonb('payload').notNull(),
  status: jobStatusEnum('status').default('pending').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  maxAttempts: integer('max_attempts').default(5).notNull(),
  nextRunAt: timestamp('next_run_at').defaultNow(),
  lastError: text('last_error'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type TSComplianceLogs = InferSelectModel<typeof complianceLogs>;
export type TIComplianceLogs = InferInsertModel<typeof complianceLogs>;
export type TSAuditLogs = InferSelectModel<typeof auditLogs>;
export type TIAuditLogs = InferInsertModel<typeof auditLogs>;

// ─────────────────────────────────────────────
// COMPLIANCE ZOD SCHEMAS & TYPES
// ─────────────────────────────────────────────

export const RevenueReportSchema = z.object({
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
  totalRevenueKes: z.number().nonnegative(),
  totalBookingFees: z.number().nonnegative(),
  bookingId: z.number().int().positive().optional(),
  initiatedById: z.number().int().positive().optional(),
});

export type RevenueReportPayload = z.infer<typeof RevenueReportSchema>;

export const TCCValidationSchema = z.object({
  kraPIN: z.string().length(11, 'KRA PIN must be 11 characters'),
  tccNumber: z.string().min(5),
});

export type TCCValidationPayload = z.infer<typeof TCCValidationSchema>;

export interface KRAResponse {
  transactionId?: string;
  status: string;
  message?: string;
  taxBreakdown?: {
    mriTax: number;
    vatTax: number;
  };
}