import { Context, Next } from 'hono';
import { verifyAccessToken } from '../auth/auth.service.js';

// Authentication middleware – verifies JWT and sets userId/userRole
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    c.set('userId', payload.userId);
    c.set('userRole', payload.role);
    await next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return c.json({ error: 'Unauthorized: Token expired' }, 401);
    }
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }
};

export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = verifyAccessToken(token);
      c.set('userId', payload.userId);
      c.set('userRole', payload.role);
    } catch (error: any) {
      // Silently ignore if token is invalid
    }
  }
  await next();
};

// Admin middleware – checks if the authenticated user has role 'admin'
export const adminMiddleware = async (c: Context, next: Next) => {
  const role = c.get('userRole');
  if (role !== 'admin') {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }
  await next();
};

// Landlord middleware - checks if authenticated user is a landlord or admin
export const landlordMiddleware = async (c: Context, next: Next) => {
  const role = c.get('userRole');
  if (role !== 'landlord' && role !== 'admin') {
    return c.json({ error: 'Forbidden: Landlord access required' }, 403);
  }
  await next();
};

// Shared middleware for routes both Admin and Landlord can access
export const adminOrLandlordMiddleware = async (c: Context, next: Next) => {
  const role = c.get('userRole');
  if (role !== 'admin' && role !== 'landlord') {
    return c.json({ error: 'Forbidden: Elevated privileges required' }, 403);
  }
  await next();
};