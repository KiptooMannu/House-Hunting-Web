// src/modules/auth/auth.service.ts
import { eq, and, gt } from 'drizzle-orm';
import { db } from '../db/db.js';
import { users, auth } from '../db/schema.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_change_me';
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
const TEMP_PASSWORD_EXPIRY_HOURS = 48;

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateTempPassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const special = '@#$%!';
  const all = upper + lower + nums + special;
  let pwd =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    nums[Math.floor(Math.random() * nums.length)] +
    special[Math.floor(Math.random() * special.length)];
  for (let i = 0; i < 8; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}

function signAccessToken(payload: { userId: number; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
}

function signRefreshToken(payload: { userId: number }) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: number };
}

// ── Login ─────────────────────────────────────────────────────────────────────

export const loginService = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  console.log('🔍 [loginService] Starting login for:', normalizedEmail);

  const user = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
    with: { auth: true },
  });

  console.log('📊 [loginService] User query result:', user ? `Found user ${user.userId}` : 'User not found');
  if (!user || !user.auth) {
    console.log('❌ [loginService] User or auth record missing');
    throw new Error('wrong password or username please try again');
  }

  console.log('👤 [loginService] User status:', user.accountStatus);
  if (user.accountStatus === 'inactive') {
    console.log('❌ [loginService] Account is inactive');
    throw new Error('Account is deactivated. Contact your administrator.');
  }

  // Check if account is locked
  if (user.auth.lockedUntil && user.auth.lockedUntil > new Date()) {
    console.log('❌ [loginService] Account locked until:', user.auth.lockedUntil);
    throw new Error(`Account is locked until ${user.auth.lockedUntil.toISOString()}`);
  }

  console.log('🔐 [loginService] Comparing passwords...');
  const isMatch = await bcrypt.compare(password, user.auth.passwordHash);
  console.log('🔐 [loginService] Password match:', isMatch);

  if (!isMatch) {
    const newAttempts = (user.auth.loginAttempts ?? 0) + 1;
    console.log(`❌ [loginService] Invalid password, attempt ${newAttempts}/${MAX_LOGIN_ATTEMPTS}`);
    const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;
    await db
      .update(auth)
      .set({
        loginAttempts: newAttempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
          : null,
        updatedAt: new Date(),
      })
      .where(eq(auth.userId, user.userId));

    if (shouldLock) {
      console.log(`🔒 [loginService] Account locked for ${LOCK_DURATION_MINUTES} minutes`);
      throw new Error(`Account locked for ${LOCK_DURATION_MINUTES} minutes after too many failed attempts`);
    }
    throw new Error('wrong password or username please try again');
  }

  // Successful login - reset attempts
  const refreshToken = signRefreshToken({ userId: user.userId });
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db
    .update(auth)
    .set({
      loginAttempts: 0,
      lockedUntil: null,
      refreshToken,
      refreshTokenExpiresAt: refreshExpiresAt,
      updatedAt: new Date(),
    })
    .where(eq(auth.userId, user.userId));

  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.userId, user.userId));

  const accessToken = signAccessToken({ userId: user.userId, role: user.role });

  const { auth: _auth, ...userProfile } = user;
  console.log('✅ [loginService] Login successful, returning tokens');
  return {
    accessToken,
    refreshToken,
    requiresPasswordChange: user.auth.isTemporaryPassword,
    user: {
      ...userProfile,
      id: userProfile.userId,
      isTemporaryPassword: user.auth.isTemporaryPassword,
    },
  };
};

// ── Admin: Create User ────────────────────────────────────────────────────────

export const adminCreateUserService = async (data: {
  fullName: string;
  email: string;
  phone: string;
  nationalId?: string;
  role: 'seeker' | 'landlord' | 'admin';
  region?: string;
}) => {
  console.log('🔍 [adminCreateUserService] Creating user:', data.email);
  const existing = await db.query.users.findFirst({ where: eq(users.email, data.email) });
  if (existing) {
    console.log('❌ [adminCreateUserService] User already exists');
    throw new Error('A user with that email already exists');
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);
  const expiresAt = new Date(Date.now() + TEMP_PASSWORD_EXPIRY_HOURS * 60 * 60 * 1000);

  const [newUser] = await db
    .insert(users)
    .values({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      nationalId: data.nationalId,
      role: data.role,
      region: data.region,
      accountStatus: 'pending_verification',
    })
    .returning();

  await db.insert(auth).values({
    userId: newUser.userId,
    passwordHash,
    isTemporaryPassword: true,
    temporaryPasswordExpiresAt: expiresAt,
  });

  console.log('✅ [adminCreateUserService] User created with temp password');
  return { user: newUser, temporaryPassword: tempPassword };
};

// ── Change Password (First Login / Voluntary) ──────────────────────────────────

export const changePasswordService = async (
  userId: number,
  currentPassword: string,
  newPassword: string
) => {
  console.log('🔍 [changePasswordService] Changing password for userId:', userId);
  const userAuth = await db.query.auth.findFirst({ where: eq(auth.userId, userId) });
  if (!userAuth) {
    console.log('❌ [changePasswordService] Auth record not found');
    throw new Error('Auth record not found');
  }

  // If it's still a temp password, check expiry
  if (userAuth.isTemporaryPassword && userAuth.temporaryPasswordExpiresAt) {
    if (new Date() > userAuth.temporaryPasswordExpiresAt) {
      console.log('❌ [changePasswordService] Temporary password expired');
      throw new Error('Temporary password has expired. Please contact your administrator.');
    }
  }

  const isMatch = await bcrypt.compare(currentPassword, userAuth.passwordHash);
  if (!isMatch) {
    console.log('❌ [changePasswordService] Current password incorrect');
    throw new Error('Current password is incorrect');
  }

  const hash = await bcrypt.hash(newPassword, 12);

  await db
    .update(auth)
    .set({
      passwordHash: hash,
      isTemporaryPassword: false,
      temporaryPasswordExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(auth.userId, userId));

  await db
    .update(users)
    .set({ accountStatus: 'active', updatedAt: new Date() })
    .where(eq(users.userId, userId));

  console.log('✅ [changePasswordService] Password changed successfully');
  return { message: 'Password changed successfully' };
};

// ── Admin: Reset User Password ────────────────────────────────────────────────

export const adminResetPasswordService = async (targetUserId: number) => {
  console.log('🔍 [adminResetPasswordService] Resetting password for userId:', targetUserId);
  const user = await db.query.users.findFirst({ where: eq(users.userId, targetUserId) });
  if (!user) {
    console.log('❌ [adminResetPasswordService] User not found');
    throw new Error('User not found');
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);
  const expiresAt = new Date(Date.now() + TEMP_PASSWORD_EXPIRY_HOURS * 60 * 60 * 1000);

  await db
    .update(auth)
    .set({
      passwordHash,
      isTemporaryPassword: true,
      temporaryPasswordExpiresAt: expiresAt,
      loginAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(auth.userId, targetUserId));

  await db
    .update(users)
    .set({ accountStatus: 'pending_verification', updatedAt: new Date() })
    .where(eq(users.userId, targetUserId));

  console.log('✅ [adminResetPasswordService] Password reset successfully');
  return { temporaryPassword: tempPassword };
};

// ── Refresh Access Token ──────────────────────────────────────────────────────

export const refreshTokenService = async (refreshToken: string) => {
  console.log('🔍 [refreshTokenService] Refreshing token');
  const payload = verifyRefreshToken(refreshToken);

  const userAuth = await db.query.auth.findFirst({
    where: and(
      eq(auth.userId, payload.userId),
      eq(auth.refreshToken, refreshToken),
      gt(auth.refreshTokenExpiresAt, new Date())
    ),
  });

  if (!userAuth) {
    console.log('❌ [refreshTokenService] Invalid or expired refresh token');
    throw new Error('Invalid or expired refresh token');
  }

  const user = await db.query.users.findFirst({ where: eq(users.userId, payload.userId) });
  if (!user) {
    console.log('❌ [refreshTokenService] User not found');
    throw new Error('User not found');
  }

  const newAccessToken = signAccessToken({ userId: user.userId, role: user.role });
  console.log('✅ [refreshTokenService] New access token issued');
  return { accessToken: newAccessToken };
};