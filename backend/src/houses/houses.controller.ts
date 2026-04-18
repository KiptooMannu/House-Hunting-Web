// src/modules/houses/houses.controller.ts
import { Context } from 'hono';
import * as houseService from './houses.service.js';
import { uploadImage } from '../utils/cloudinary.js';
import {
  createHouseSchema,
  updateHouseSchema,
  houseIdParam,
  houseListQuery,
} from '../validators/validators.js';

export const createHouse = async (c: Context) => {
  try {
    const contentType = c.req.header('content-type') || '';
    let data: any = {};
    let files: any[] = [];

    if (contentType.includes('multipart/form-data')) {
      const body = await c.req.parseBody();
      
      // Extract non-file fields
      data = {
        title: body['title'],
        description: body['description'],
        houseType: body['houseType'],
        furnishing: body['furnishing'] || 'unfurnished',
        bedrooms: body['bedrooms'],
        bathrooms: body['bathrooms'],
        monthlyRent: body['rent'] || body['monthlyRent'],
        bookingFee: body['bookingFee'],
        dailyRate: body['dailyRate'],
        county: body['county'],
        locationName: body['locationName'],
        amenities: (() => {
          const raw = body['amenities'] || body['amenities[]'];
          if (!raw) return undefined;
          if (Array.isArray(raw)) return raw.filter((v): v is string => typeof v === 'string').join(',');
          return typeof raw === 'string' ? raw : undefined;
        })(),
      };

      // Handle multiple images
      const imagesField = body['images'];
      if (imagesField) {
        if (Array.isArray(imagesField)) {
          files = imagesField;
        } else {
          files = [imagesField];
        }
      }
    } else {
      data = await c.req.json();
    }

    // Validate the core house data
    const validatedData = createHouseSchema.parse({
      ...data,
      bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
      bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
      monthlyRent: data.monthlyRent ? Number(data.monthlyRent) : undefined,
      dailyRate: data.dailyRate ? Number(data.dailyRate) : undefined,
    });

    const landlordId = c.get('userId');

    // Upload images to Cloudinary
    const imageUrls: string[] = [];
    for (const file of files) {
       if (file instanceof File) {
         const buffer = Buffer.from(await file.arrayBuffer());
         const url = await uploadImage(buffer);
         imageUrls.push(url);
       }
    }

    const result = await houseService.createHouse({
      ...validatedData,
      landlordId,
      imageUrls,
      locationName: data.locationName,
      county: data.county
    });

    return c.json(result, 201);
  } catch (error: any) {
    console.error('❌ [createHouse] Error:', error);
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ 
      error: error.message || 'Validation/Insert failed', 
      details: error, 
      stack: error.stack 
    }, 400);
  }
};

export const getHouse = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const house = await houseService.getHouse(houseId);
    if (!house) return c.json({ error: 'House not found' }, 404);
    return c.json(house, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const listHouses = async (c: Context) => {
  try {
    const query = houseListQuery.parse(c.req.query());
    
    // Visibility enforcement:
    // - Admins can query any status explicitly
    // - Landlords viewing their own portfolio (landlordId param) see all their statuses
    // - Everyone else (public / seekers) only sees 'active' approved listings
    const userRole = c.get('userRole'); // may be undefined for public routes
    const isAdmin = userRole === 'admin';
    const isOwnerQuery = !!query.landlordId; // landlord viewing their own listings

    if (!isAdmin && !isOwnerQuery && !query.status) {
      query.status = 'active'; // Default: public only sees approved listings
    }

    const result = await houseService.listHouses(query);
    return c.json(result, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ error: 'Invalid query', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 500);
  }
};

export const listUniqueTowns = async (c: Context) => {
  try {
    const results = await houseService.listUniqueTowns();
    return c.json(results, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const listUniqueLocations = async (c: Context) => {
  try {
    const results = await houseService.listUniqueLocations();
    return c.json(results, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const updateHouse = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const updates = updateHouseSchema.parse(await c.req.json());
    
    const currentHouse = await houseService.getHouse(houseId);
    if (!currentHouse) return c.json({ error: 'House not found' }, 404);
    
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    
    if (userRole !== 'admin' && currentHouse.landlordId !== userId) {
      return c.json({ error: 'Forbidden: You do not have proprietary authority over this asset.' }, 403);
    }

    const updated = await houseService.updateHouse(houseId, updates);
    return c.json(updated, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 400);
  }
};

export const deleteHouse = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    
    const currentHouse = await houseService.getHouse(houseId);
    if (!currentHouse) return c.json({ error: 'House not found' }, 404);
    
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    
    if (userRole !== 'admin' && currentHouse.landlordId !== userId) {
      return c.json({ error: 'Forbidden: You do not have proprietary authority to decommission this asset.' }, 403);
    }

    await houseService.deleteHouse(houseId);
    return c.json({ message: 'House decommissioned successfully' }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const approveListing = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const adminId = c.get('userId');
    const userRole = c.get('userRole');

    if (userRole !== 'admin') {
      return c.json({ error: 'Forbidden: Only administrators can authorize assets.' }, 403);
    }

    const updated = await houseService.approveHouse(houseId, adminId);
    return c.json({ message: 'Listing authorized successfully', listing: updated }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const rejectListing = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const { reason } = await c.req.json();
    const adminId = c.get('userId');
    const userRole = c.get('userRole');

    if (userRole !== 'admin') {
      return c.json({ error: 'Forbidden: Only administrators can reject assets.' }, 403);
    }

    const updated = await houseService.rejectHouse(houseId, adminId, reason);
    return c.json({ message: 'Listing rejected', listing: updated }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const revokeListing = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const { reason } = await c.req.json();
    const adminId = c.get('userId');
    const userRole = c.get('userRole');

    if (userRole !== 'admin') {
      return c.json({ error: 'Forbidden: Only administrators can revoke authorizations.' }, 403);
    }

    const updated = await houseService.revokeHouse(houseId, adminId, reason);
    return c.json({ message: 'Listing authorization revoked', listing: updated }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const toggleSavedHouse = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const seekerId = c.get('userId');
    const { saved } = await c.req.json();

    if (saved) {
      await houseService.saveHouse(seekerId, houseId);
      return c.json({ message: 'House saved to collection' }, 200);
    } else {
      await houseService.removeSavedHouse(seekerId, houseId);
      return c.json({ message: 'House removed from collection' }, 200);
    }
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const listSavedHouses = async (c: Context) => {
  try {
    const seekerId = c.get('userId');
    const results = await houseService.listSavedHouses(seekerId);
    return c.json(results, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};