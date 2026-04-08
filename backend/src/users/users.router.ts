import { Hono } from 'hono';
import * as userController from './users.controller.js';
// import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

export const usersRouter = new Hono();

// Public routes? Probably protected. Add middleware as needed.
usersRouter.get('/', userController.listUsers);
usersRouter.get('/:userId', userController.getUser);
usersRouter.post('/', userController.createUser);
usersRouter.put('/:userId', userController.updateUser);
usersRouter.delete('/:userId', userController.deleteUser);