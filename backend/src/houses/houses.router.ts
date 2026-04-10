import { Hono } from 'hono';
import * as houseController from './houses.controller.js';
import { authMiddleware, adminOrLandlordMiddleware } from '../middleware/authMiddleware.js';

export const housesRouter = new Hono();

// Create route - only Admin or Landlord
housesRouter.post('/', authMiddleware, adminOrLandlordMiddleware, houseController.createHouse);

// Global list and details are public
housesRouter.get('/', houseController.listHouses);
housesRouter.get('/:houseId', houseController.getHouse);

// Update/Delete - only Admin or Landlord
housesRouter.put('/:houseId', authMiddleware, adminOrLandlordMiddleware, houseController.updateHouse);
housesRouter.delete('/:houseId', authMiddleware, adminOrLandlordMiddleware, houseController.deleteHouse);