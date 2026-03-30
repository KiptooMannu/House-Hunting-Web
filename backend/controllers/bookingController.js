const { Booking, House, User, Payment } = require('../models');

/**
 * POST /api/bookings
 * Create a new booking (User role only).
 */
const createBooking = async (req, res, next) => {
  try {
    const { house_id, booking_date } = req.body;

    // Check house exists and is available
    const house = await House.findByPk(house_id);
    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found.',
      });
    }

    if (house.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'This house is not available for booking.',
      });
    }

    // Prevent landlords from booking their own houses
    if (house.landlord_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own house.',
      });
    }

    // Check for duplicate pending booking
    const existingBooking = await Booking.findOne({
      where: {
        user_id: req.user.id,
        house_id,
        booking_status: 'pending',
      },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending booking for this house.',
      });
    }

    const booking = await Booking.create({
      user_id: req.user.id,
      house_id,
      booking_date,
    });

    // Include house and user info in response
    const fullBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: House, as: 'house', attributes: ['id', 'title', 'rent', 'location_name'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking: fullBooking },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings
 * Get bookings - users see their own, landlords see bookings for their houses, admins see all.
 */
const getBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.booking_status = status;

    // Role-based filtering
    if (req.user.role === 'user') {
      where.user_id = req.user.id;
    }

    const queryOptions = {
      where,
      include: [
        { model: House, as: 'house', attributes: ['id', 'title', 'rent', 'location_name', 'landlord_id'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Payment, as: 'payment' },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    // If landlord, show bookings for their houses only
    if (req.user.role === 'landlord') {
      queryOptions.include[0].where = { landlord_id: req.user.id };
    }

    const { count, rows: bookings } = await Booking.findAndCountAll(queryOptions);

    res.json({
      success: true,
      data: {
        bookings,
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
 * GET /api/bookings/:id
 * Get a single booking.
 */
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: House, as: 'house' },
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Payment, as: 'payment' },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Users can only see their own bookings
    if (req.user.role === 'user' && booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    // Landlords can only see bookings for their houses
    if (req.user.role === 'landlord' && booking.house.landlord_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    res.json({ success: true, data: { booking } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/bookings/:id/status
 * Update booking status (Landlord or Admin).
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { booking_status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(booking_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, confirmed, or cancelled.',
      });
    }

    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: House, as: 'house' }],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Landlords can only update bookings for their own houses
    if (req.user.role === 'landlord' && booking.house.landlord_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage bookings for your own houses.',
      });
    }

    await booking.update({ booking_status });

    // If confirmed, mark house as booked
    if (booking_status === 'confirmed') {
      await House.update({ status: 'booked' }, { where: { id: booking.house_id } });
    }

    // If cancelled, mark house as available again
    if (booking_status === 'cancelled') {
      await House.update({ status: 'available' }, { where: { id: booking.house_id } });
    }

    res.json({
      success: true,
      message: `Booking ${booking_status} successfully`,
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getBookings, getBookingById, updateBookingStatus };
