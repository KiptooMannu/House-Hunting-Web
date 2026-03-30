const { Op } = require('sequelize');
const { House, User, sequelize } = require('../models');

/**
 * GET /api/houses
 * List and search houses (Public).
 * Query params: county, minRent, maxRent, bedrooms, status, search, page, limit
 */
const getAllHouses = async (req, res, next) => {
  try {
    const {
      county,
      minRent,
      maxRent,
      bedrooms,
      status = 'available',
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filter by status
    if (status) where.status = status;

    // Filter by county
    if (county) where.county = { [Op.iLike]: `%${county}%` };

    // Filter by rent range
    if (minRent || maxRent) {
      where.rent = {};
      if (minRent) where.rent[Op.gte] = parseFloat(minRent);
      if (maxRent) where.rent[Op.lte] = parseFloat(maxRent);
    }

    // Filter by bedrooms
    if (bedrooms) where.bedrooms = parseInt(bedrooms);

    // Search by title or description
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { location_name: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Build query options
    const queryOptions = {
      where,
      include: [
        {
          model: User,
          as: 'landlord',
          attributes: ['id', 'name', 'email', 'phone'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    const { count, rows: houses } = await House.findAndCountAll(queryOptions);

    res.json({
      success: true,
      data: {
        houses,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/houses/:id
 * Get a single house (Public).
 */
const getHouseById = async (req, res, next) => {
  try {
    const house = await House.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'landlord',
          attributes: ['id', 'name', 'email', 'phone'],
        },
      ],
    });

    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found.',
      });
    }

    res.json({ success: true, data: { house } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/houses
 * Create a new house listing (Landlord only).
 */
const createHouse = async (req, res, next) => {
  try {
    const {
      title, description, rent, location_name, county,
      bedrooms, bathrooms, amenities, images, lat, lng,
    } = req.body;

    // Support multipart/form-data uploads (multer) and JSON body image URLs
    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    const uploadedUrls = uploadedFiles.map((f) => `/uploads/houses/${f.filename}`);
    const bodyImages = Array.isArray(images) ? images : (images ? [images] : []);
    const mergedImages = [...uploadedUrls, ...bodyImages].filter(Boolean);

    const house = await House.create({
      landlord_id: req.user.id,
      title,
      description,
      rent,
      lat: lat !== undefined && lat !== null ? parseFloat(lat) : null,
      lng: lng !== undefined && lng !== null ? parseFloat(lng) : null,
      location_name,
      county,
      bedrooms,
      bathrooms,
      amenities: amenities || [],
      images: mergedImages,
      approval_status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'House listing created successfully',
      data: { house },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/houses/:id
 * Update a house listing (Owner landlord only).
 */
const updateHouse = async (req, res, next) => {
  try {
    const house = await House.findByPk(req.params.id);

    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found.',
      });
    }

    // Only the owner landlord can update
    if (house.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own listings.',
      });
    }

    const {
      title, description, rent, location_name, county,
      bedrooms, bathrooms, amenities, images, status, lat, lng,
      approval_status,
    } = req.body;

    const updates = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(rent && { rent }),
      ...(lat !== undefined && lat !== null ? { lat: parseFloat(lat) } : {}),
      ...(lng !== undefined && lng !== null ? { lng: parseFloat(lng) } : {}),
      ...(location_name && { location_name }),
      ...(county && { county }),
      ...(bedrooms !== undefined && { bedrooms }),
      ...(bathrooms !== undefined && { bathrooms }),
      ...(amenities && { amenities }),
      ...(images && { images }),
    };

    // Listing visibility/status can be changed by owner or admin (already enforced above)
    if (status) {
      Object.assign(updates, { status });
    }

    // Only admins can change approval status
    if (approval_status && req.user.role === 'admin') {
      Object.assign(updates, { approval_status });
    }

    await house.update(updates);

    res.json({
      success: true,
      message: 'House listing updated successfully',
      data: { house },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/houses/:id
 * Delete a house listing (Owner landlord or Admin).
 */
const deleteHouse = async (req, res, next) => {
  try {
    const house = await House.findByPk(req.params.id);

    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found.',
      });
    }

    // Only owner or admin can delete
    if (house.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own listings.',
      });
    }

    await house.destroy();

    res.json({
      success: true,
      message: 'House listing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllHouses, getHouseById, createHouse, updateHouse, deleteHouse };
