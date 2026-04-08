import { Hono } from 'hono';
import * as houseController from './houses.controller.js';

export const housesRouter = new Hono();

housesRouter.get('/', houseController.listHouses);
housesRouter.get('/:houseId', houseController.getHouse);
housesRouter.post('/', houseController.createHouse);
housesRouter.put('/:houseId', houseController.updateHouse);
housesRouter.delete('/:houseId', houseController.deleteHouse);