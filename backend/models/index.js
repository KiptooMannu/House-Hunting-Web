const sequelize = require('../config/db');
const User = require('./User');
const House = require('./House');
const Booking = require('./Booking');
const Payment = require('./Payment');
const ComplianceLog = require('./ComplianceLog');

// ===================== Associations =====================

// User (landlord) -> Houses
User.hasMany(House, { foreignKey: 'landlord_id', as: 'houses', onDelete: 'CASCADE' });
House.belongsTo(User, { foreignKey: 'landlord_id', as: 'landlord' });

// User (seeker) -> Bookings
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// House -> Bookings
House.hasMany(Booking, { foreignKey: 'house_id', as: 'bookings', onDelete: 'CASCADE' });
Booking.belongsTo(House, { foreignKey: 'house_id', as: 'house' });

// Booking -> Payment
Booking.hasOne(Payment, { foreignKey: 'booking_id', as: 'payment', onDelete: 'CASCADE' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// User (landlord) -> ComplianceLogs
User.hasMany(ComplianceLog, { foreignKey: 'landlord_id', as: 'complianceLogs', onDelete: 'CASCADE' });
ComplianceLog.belongsTo(User, { foreignKey: 'landlord_id', as: 'landlord' });

module.exports = {
  sequelize,
  User,
  House,
  Booking,
  Payment,
  ComplianceLog,
};
