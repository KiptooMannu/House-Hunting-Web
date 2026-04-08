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

// Admin middleware – checks if the authenticated user has role 'admin'
// Must be used after authMiddleware
export const adminMiddleware = async (c: Context, next: Next) => {
  const role = c.get('userRole');
  if (role !== 'admin') {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }
  await next();
};

// Optional: Combined middleware for admin-only routes
export const adminAuthMiddleware = async (c: Context, next: Next) => {
  await authMiddleware(c, async () => {
    await adminMiddleware(c, next);
  });
};