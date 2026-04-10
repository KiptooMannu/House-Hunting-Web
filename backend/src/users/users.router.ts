import { Hono } from 'hono';
import * as userController from './users.controller.js';
import { authMiddleware, adminOrLandlordMiddleware } from '../middleware/authMiddleware.js';

export const usersRouter = new Hono();

// Public registration (creating a user)
usersRouter.post('/', userController.createUser);

// Protected profile route (any logged in user can see their own)
usersRouter.get('/profile', authMiddleware, userController.getProfile);

// Management routes - only Admin or Landlord can list or manage others
usersRouter.get('/', authMiddleware, adminOrLandlordMiddleware, userController.listUsers);
usersRouter.get('/:userId', authMiddleware, adminOrLandlordMiddleware, userController.getUser);
usersRouter.put('/:userId', authMiddleware, adminOrLandlordMiddleware, userController.updateUser);
usersRouter.delete('/:userId', authMiddleware, adminOrLandlordMiddleware, userController.deleteUser);