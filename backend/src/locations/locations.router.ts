import { Hono } from 'hono';
import * as locationController from './locations.controller.js';

export const locationsRouter = new Hono();

locationsRouter.get('/', locationController.listLocations);
locationsRouter.get('/:locationId', locationController.getLocation);
locationsRouter.post('/', locationController.createLocation);
locationsRouter.put('/:locationId', locationController.updateLocation);
locationsRouter.delete('/:locationId', locationController.deleteLocation);  