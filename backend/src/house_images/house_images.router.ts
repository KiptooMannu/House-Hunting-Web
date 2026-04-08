import { Hono } from 'hono';
import * as imageController from './house_images.controller.js';

export const houseImagesRouter = new Hono();

houseImagesRouter.get('/house/:houseId', imageController.listImagesByHouse);
houseImagesRouter.get('/:imageId', imageController.getImage);
houseImagesRouter.post('/', imageController.addImage);
houseImagesRouter.put('/:imageId', imageController.updateImage);
houseImagesRouter.delete('/:imageId', imageController.deleteImage);

// Upload route – uses Hono's native parseBody (needs @hono/node-server)
houseImagesRouter.post('/upload', imageController.uploadHouseImage);