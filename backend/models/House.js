const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const House = sequelize.define('House', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  landlord_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title is required' },
    },
  },
  description: {
    type: DataTypes.TEXT,
  },
  rent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: { msg: 'Rent must be a valid number' },
      min: { args: [0], msg: 'Rent cannot be negative' },
    },
  },
  // PostGIS is optional; when it is not installed we store coordinates as plain numbers.
  lat: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  lng: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  location_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Human-readable address or area name',
  },
  county: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Kenyan county e.g. Nairobi, Mombasa',
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: { args: [0], msg: 'Bedrooms cannot be negative' },
    },
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: { args: [0], msg: 'Bathrooms cannot be negative' },
    },
  },
  amenities: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [],
    comment: 'e.g. ["WiFi", "Parking", "Security", "Water"]',
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [],
    comment: 'Array of image URLs',
  },
  approval_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  status: {
    type: DataTypes.ENUM('available', 'booked', 'unlisted'),
    defaultValue: 'available',
  },
}, {
  tableName: 'houses',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['landlord_id'] },
    { fields: ['status'] },
    { fields: ['county'] },
    { fields: ['rent'] },
  ],
});

module.exports = House;
