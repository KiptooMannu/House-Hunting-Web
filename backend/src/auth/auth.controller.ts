// src/modules/auth/auth.controller.ts
import { Context } from 'hono';
import {
  loginService,
  adminCreateUserService,
  changePasswordService,
  adminResetPasswordService,
  refreshTokenService,
} from './auth.service.js';
import {
  loginSchema,
  changePasswordSchema,
  createUserSchema,
  refreshTokenSchema,
  resetPasswordParams,
} from '../validators/validators.js';

export const login = async (c: Context) => {
  try {
    const body = await c.req.json();
    console.log('🔐 [Login endpoint] Received request:', { email: body.email });

    const { email, password } = loginSchema.parse(body);
    console.log('✅ [Login endpoint] Validation passed for:', email);

    const data = await loginService(email, password);
    console.log('✅ [Login endpoint] Login service returned successfully for userId:', data.user.userId);

    return c.json(data, 200);
  } catch (error: any) {
    console.error('❌ [Login endpoint] Error:', error.message);

    if (error.name === 'ZodError') {
      console.error('Validation errors:', error.errors);
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 401);
  }
};

export const changePassword = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);
    const userId = c.get('userId') as number;
    console.log('🔐 [ChangePassword] Request for userId:', userId);

    const data = await changePasswordService(userId, currentPassword, newPassword);
    return c.json(data, 200);
  } catch (error: any) {
    console.error('❌ [ChangePassword] Error:', error.message);
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 400);
  }
};

export const adminCreateUser = async (c: Context) => {
  try {
    const body = await c.req.json();
    const data = createUserSchema.parse(body);
    console.log('🔐 [AdminCreateUser] Creating user:', data.email);

    const result = await adminCreateUserService(data);
    return c.json(result, 201);
  } catch (error: any) {
    console.error('❌ [AdminCreateUser] Error:', error.message);
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 400);
  }
};

export const adminResetPassword = async (c: Context) => {
  try {
    const params = resetPasswordParams.parse(c.req.param());
    console.log('🔐 [AdminResetPassword] Resetting password for userId:', params.userId);

    const result = await adminResetPasswordService(params.userId);
    return c.json(result, 200);
  } catch (error: any) {
    console.error('❌ [AdminResetPassword] Error:', error.message);
    if (error.name === 'ZodError') {
      return c.json({ error: 'Invalid user ID' }, 400);
    }
    return c.json({ error: error.message }, 400);
  }
};

export const refreshToken = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { refreshToken: token } = refreshTokenSchema.parse(body);
    console.log('🔐 [RefreshToken] Request received');

    const data = await refreshTokenService(token);
    return c.json(data, 200);
  } catch (error: any) {
    console.error('❌ [RefreshToken] Error:', error.message);
    if (error.name === 'ZodError') {
      return c.json({ error: 'Invalid request body' }, 400);
    }
    return c.json({ error: error.message }, 401);
  }
};