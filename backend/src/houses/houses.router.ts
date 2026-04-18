import { Hono } from 'hono';
import * as houseController from './houses.controller.js';
import { authMiddleware, adminOrLandlordMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

export const housesRouter = new Hono();

// Create route - only Admin or Landlord
housesRouter.post('/', authMiddleware, adminOrLandlordMiddleware, houseController.createHouse);

// Global list and details are public
housesRouter.get('/meta/towns', houseController.listUniqueTowns);
housesRouter.get('/meta/locations', houseController.listUniqueLocations);
housesRouter.get('/', houseController.listHouses);
housesRouter.get('/:houseId', houseController.getHouse);

// Update/Delete - only Admin or Landlord
housesRouter.put('/:houseId', authMiddleware, adminOrLandlordMiddleware, houseController.updateHouse);
housesRouter.delete('/:houseId', authMiddleware, adminOrLandlordMiddleware, houseController.deleteHouse);

// Admin Approval/Rejection/Revocation - STRICTLY ADMIN
housesRouter.patch('/:houseId/approve', authMiddleware, adminMiddleware, houseController.approveListing);
housesRouter.patch('/:houseId/reject', authMiddleware, adminMiddleware, houseController.rejectListing);
housesRouter.patch('/:houseId/revoke', authMiddleware, adminMiddleware, houseController.revokeListing);

// Saved Houses (Favorites)
housesRouter.post('/:houseId/save', authMiddleware, houseController.toggleSavedHouse);
housesRouter.get('/collections/saved', authMiddleware, houseController.listSavedHouses);