import { Hono } from 'hono';
import * as houseController from './houses.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const housesRouter = new Hono();

// Protect the create route with authentication
housesRouter.post('/', authMiddleware, houseController.createHouse);

// Other routes (public or protected as needed)
housesRouter.get('/', houseController.listHouses);
housesRouter.get('/:houseId', houseController.getHouse);
housesRouter.put('/:houseId', authMiddleware, houseController.updateHouse);
housesRouter.delete('/:houseId', authMiddleware, houseController.deleteHouse);