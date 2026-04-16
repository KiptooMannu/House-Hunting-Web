// src/modules/validators/validators.ts
import { z } from 'zod';

// ============================================================
// ENUMS (as before)
// ============================================================
export const UserRoleEnum = z.enum(['seeker', 'landlord', 'admin']);
export const AccountStatusEnum = z.enum(['active', 'inactive', 'locked', 'pending_verification']);
export const HouseTypeEnum = z.enum([
  'bedsitter', 'one_bedroom', 'two_bedroom', 'three_bedroom',
  'four_bedroom_plus', 'studio', 'bungalow', 'mansion'
]);
export const FurnishingEnum = z.enum(['furnished', 'semi_furnished', 'unfurnished']);
export const ListingStatusEnum = z.enum(['active', 'booked', 'unavailable', 'draft', 'removed']);
export const BookingStatusEnum = z.enum(['pending_payment', 'confirmed', 'cancelled', 'expired', 'rejected']);
export const PaymentStatusEnum = z.enum(['pending', 'completed', 'failed', 'refunded']);
export const PaymentMethodEnum = z.enum(['mpesa', 'bank_transfer', 'cash']);
export const ChatbotSessionStatusEnum = z.enum(['active', 'completed', 'abandoned']);
export const ComplianceActionEnum = z.enum(['nil_filing', 'revenue_report', 'tax_submission', 'audit_query']);
export const ComplianceStatusEnum = z.enum(['pending', 'submitted', 'acknowledged', 'rejected']);
export const AuditActionEnum = z.enum([
  'login', 'logout', 'register', 'create', 'update', 'delete',
  'password_reset', 'account_lock', 'account_activate', 'account_deactivate',
  'booking_confirm', 'payment_received'
]);

// ============================================================
// BASE SCHEMAS (full table columns)
// ============================================================
export const userSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  nationalId: z.string().optional().nullable(),
  role: UserRoleEnum.default('seeker'),
  accountStatus: AccountStatusEnum.default('pending_verification'),
  profileImage: z.string().url().optional().nullable(),
  region: z.string().optional().nullable(),
  kraPin: z.string().optional().nullable(),
  agencyName: z.string().optional().nullable(),
  lastLoginAt: z.date().optional().nullable(),
  totalBookings: z.number().int().min(0).default(0),
  totalListings: z.number().int().min(0).default(0),
});

export const createUserSchema = userSchema.extend({
  password: z.string().min(8).optional(),
}).omit({ 
  totalBookings: true, 
  totalListings: true, 
  lastLoginAt: true 
});

export const authSchema = z.object({
  userId: z.number().int().positive(),
  passwordHash: z.string().min(1),
  isTemporaryPassword: z.boolean().default(false),
  temporaryPasswordExpiresAt: z.date().optional().nullable(),
  loginAttempts: z.number().int().min(0).default(0),
  lockedUntil: z.date().optional().nullable(),
  refreshToken: z.string().optional().nullable(),
  refreshTokenExpiresAt: z.date().optional().nullable(),
  passwordResetToken: z.string().optional().nullable(),
  passwordResetExpiresAt: z.date().optional().nullable(),
});

export const locationSchema = z.object({
  county: z.string().min(1),
  subCounty: z.string().optional(),
  town: z.string().optional(),
  neighborhood: z.string().optional(),
  gpsLatitude: z.string().or(z.number()).optional().transform((v: string | number | undefined) => v?.toString()),
  gpsLongitude: z.string().or(z.number()).optional().transform((v: string | number | undefined) => v?.toString()),
});

export const houseSchema = z.object({
  landlordId: z.number().int().positive(),
  locationId: z.number().int().positive().optional().nullable(),
  title: z.string().min(1),
  bookingFee: z.string().or(z.number()).optional().transform(v => v ? Number(v) : 0),
  description: z.string().optional(),
  houseType: HouseTypeEnum,
  furnishing: FurnishingEnum.default('unfurnished'),
  bedrooms: z.number().int().min(0).default(1),
  bathrooms: z.number().int().min(0).default(1),
  monthlyRent: z.string().or(z.number()).transform((v: string | number) => Number(v)),
  dailyRate: z.string().or(z.number()).optional().transform((v: string | number | undefined) => v ? Number(v) : 0),
  depositAmount: z.string().or(z.number()).optional().transform((v: string | number | undefined) => v ? Number(v) : undefined),
  isDepositNegotiable: z.boolean().default(false),
  availableFrom: z.string().date().optional().nullable(),
  gpsLatitude: z.string().or(z.number()).optional().transform((v: string | number | undefined) => v?.toString()),
  gpsLongitude: z.string().or(z.number()).optional().transform((v: string | number | undefined) => v?.toString()),
  addressLine: z.string().optional(),
  amenities: z.string().optional(),
  status: ListingStatusEnum.default('draft'),
  isVerified: z.boolean().default(false),
  verifiedById: z.number().int().positive().optional().nullable(),
  verifiedAt: z.date().optional().nullable(),
  viewCount: z.number().int().min(0).default(0),
  bookingCount: z.number().int().min(0).default(0),
});

export const houseImageSchema = z.object({
  houseId: z.number().int().positive(),
  imageUrl: z.string().url(),
  caption: z.string().optional(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export const chatbotSessionSchema = z.object({
  userId: z.number().int().positive().optional().nullable(),
  sessionToken: z.string().min(1),
  status: ChatbotSessionStatusEnum.default('active'),
  preferredCounty: z.string().optional(),
  preferredTown: z.string().optional(),
  budgetMin: z.string().or(z.number()).optional().transform((v: string | number | undefined) => v ? Number(v) : undefined),
  budgetMax: z.string().or(z.number()).optional().transform((v: string | number | undefined) => v ? Number(v) : undefined),
  preferredHouseType: HouseTypeEnum.optional(),
  preferredFurnishing: FurnishingEnum.optional(),
  preferredBedrooms: z.number().int().min(0).optional(),
  additionalPreferences: z.string().optional(),
  conversationHistory: z.string().optional(),
  resultHouseIds: z.string().optional(),
  startedAt: z.date().default(() => new Date()),
  completedAt: z.date().optional().nullable(),
  lastActivityAt: z.date().default(() => new Date()),
});

export const bookingSchema = z.object({
  seekerId: z.number().int().positive(),
  houseId: z.number().int().positive(),
  chatbotSessionId: z.number().int().positive().optional().nullable(),
  status: BookingStatusEnum.default('pending_payment'),
  bookingFee: z.string().or(z.number()).transform((v: string | number) => Number(v)),
  moveInDate: z.string().date().optional().nullable(),
  checkoutDate: z.string().date().optional().nullable(),
  totalPrice: z.string().or(z.number()).optional().transform((v: string | number | undefined) => v ? Number(v) : 0),
  specialRequests: z.string().optional(),
  rejectionReason: z.string().optional(),
  confirmedAt: z.date().optional().nullable(),
  cancelledAt: z.date().optional().nullable(),
  expiresAt: z.date().optional().nullable(),
});

export const paymentSchema = z.object({
  bookingId: z.number().int().positive(),
  payerId: z.number().int().positive(),
  amount: z.string().or(z.number()).transform((v: string | number) => Number(v)),
  method: PaymentMethodEnum.default('mpesa'),
  status: PaymentStatusEnum.default('pending'),
  mpesaPhoneNumber: z.string().regex(/^254\d{9}$/).optional(),
  mpesaCheckoutRequestId: z.string().optional(),
  mpesaMerchantRequestId: z.string().optional(),
  mpesaReceiptNumber: z.string().optional(),
  mpesaTransactionDate: z.date().optional().nullable(),
  transactionReference: z.string().optional(),
  failureReason: z.string().optional(),
  paidAt: z.date().optional().nullable(),
  refundedAt: z.date().optional().nullable(),
  refundReason: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export const complianceLogSchema = z.object({
  initiatedById: z.number().int().positive().optional().nullable(),
  action: ComplianceActionEnum,
  status: ComplianceStatusEnum.default('pending'),
  periodStart: z.string().date().optional().nullable(),
  periodEnd: z.string().date().optional().nullable(),
  totalRevenueKes: z.string().or(z.number()).optional().transform((v: string | number | undefined) => v ? Number(v) : undefined),
  totalBookingFees: z.string().or(z.number()).optional().transform((v: string | number | undefined) => v ? Number(v) : undefined),
  gavaConnectRequestId: z.string().optional(),
  gavaConnectResponse: z.string().optional(),
  acknowledgedAt: z.date().optional().nullable(),
  notes: z.string().optional(),
});

export const auditLogSchema = z.object({
  performedById: z.number().int().positive().optional().nullable(),
  action: AuditActionEnum,
  tableName: z.string().optional(),
  recordId: z.string().optional(),
  previousValues: z.string().optional(),
  newValues: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

// ============================================================
// ID PARAMS (for each resource)
// ============================================================
export const userIdParam = z.object({ userId: z.string().transform((val: string) => parseInt(val, 10)) });
export const locationIdParam = z.object({ locationId: z.string().transform((val: string) => parseInt(val, 10)) });
export const houseIdParam = z.object({ houseId: z.string().transform((val: string) => parseInt(val, 10)) });
export const imageIdParam = z.object({ imageId: z.string().transform((val: string) => parseInt(val, 10)) });
export const sessionIdParam = z.object({ sessionId: z.string().transform((val: string) => parseInt(val, 10)) });
export const bookingIdParam = z.object({ bookingId: z.string().transform((val: string) => parseInt(val, 10)) });
export const paymentIdParam = z.object({ paymentId: z.string().transform((val: string) => parseInt(val, 10)) });
export const complianceIdParam = z.object({ logId: z.string().transform((val: string) => parseInt(val, 10)) });
export const auditIdParam = z.object({ logId: z.string().transform((val: string) => parseInt(val, 10)) });

// Generic ID (if needed)
export const idParamSchema = z.object({ id: z.string().transform((val: string) => parseInt(val, 10)) });

// ============================================================
// ============================================================
// CREATE (omit auto-generated fields that actually exist)
// ============================================================
export const createLocationSchema = locationSchema;
export const createHouseSchema = houseSchema.omit({ viewCount: true, bookingCount: true, isVerified: true, verifiedAt: true, landlordId: true });
export const createHouseImageSchema = houseImageSchema;
export const createChatbotSessionSchema = chatbotSessionSchema.omit({ startedAt: true, lastActivityAt: true });
export const createBookingSchema = bookingSchema.omit({ status: true, confirmedAt: true, cancelledAt: true });
export const createPaymentSchema = paymentSchema.omit({ status: true, paidAt: true, refundedAt: true });
export const createComplianceLogSchema = complianceLogSchema.omit({ status: true, acknowledgedAt: true });
export const createAuditLogSchema = auditLogSchema;
// ============================================================
// UPDATE (partial)
// ============================================================
export const updateUserSchema = createUserSchema.partial();
export const updateLocationSchema = createLocationSchema.partial();
export const updateHouseSchema = createHouseSchema.partial();
export const updateHouseImageSchema = createHouseImageSchema.partial();
export const updateChatbotSessionSchema = createChatbotSessionSchema.partial();
export const updateBookingSchema = createBookingSchema.partial();
export const updatePaymentSchema = createPaymentSchema.partial();
export const updateComplianceLogSchema = createComplianceLogSchema.partial();
export const updateAuditLogSchema = createAuditLogSchema.partial();

// ============================================================
// LIST QUERY PARAMS (pagination, filtering, sorting)
// ============================================================
export const paginationSchema = z.object({
  page: z.string().optional().transform((val: string | undefined) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val: string | undefined) => (val ? parseInt(val, 10) : 20)),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// Extend for each resource:
export const userListQuery = paginationSchema.extend({
  role: UserRoleEnum.optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  accountStatus: AccountStatusEnum.optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  search: z.string().optional(),
});

export const houseListQuery = paginationSchema.extend({
  minRent: z.string().optional().transform((v: string | undefined) => (v && v !== '') ? Number(v) : undefined),
  maxRent: z.string().optional().transform((v: string | undefined) => (v && v !== '') ? Number(v) : undefined),
  houseType: HouseTypeEnum.optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  furnishing: FurnishingEnum.optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  bedrooms: z.string().optional().transform((v: string | undefined) => (v && v !== '') ? parseInt(v, 10) : undefined),
  status: ListingStatusEnum.optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  locationId: z.string().optional().transform((v: string | undefined) => (v && v !== '') ? parseInt(v, 10) : undefined),
  county: z.string().optional(),
  search: z.string().optional(),
});

// ============================================================
// AUTHENTICATION SCHEMAS
// ============================================================
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const resetPasswordParams = z.object({
  userId: z.string().transform((val: string) => parseInt(val, 10)),
});

// Admin create user (matches service)
export const adminCreateUserSchema = createUserSchema.pick({
  fullName: true, email: true, phone: true, nationalId: true, role: true, region: true
});