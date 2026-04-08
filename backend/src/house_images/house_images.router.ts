import { Hono } from 'hono';
import * as imageController from './house_images.controller';

export const houseImagesRouter = new Hono();

houseImagesRouter.get('/house/:houseId', imageController.listImagesByHouse);
houseImagesRouter.get('/:imageId', imageController.getImage);
houseImagesRouter.post('/', imageController.addImage);
houseImagesRouter.put('/:imageId', imageController.updateImage);
houseImagesRouter.delete('/:imageId', imageController.deleteImage);