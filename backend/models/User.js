const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Name is required' },
      len: { args: [2, 255], msg: 'Name must be between 2 and 255 characters' },
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: { msg: 'Email already exists' },
    validate: {
      isEmail: { msg: 'Please provide a valid email' },
    },
  },
  phone: {
    type: DataTypes.STRING(20),
    validate: {
      is: {
        args: /^(\+254|0)\d{9}$/,
        msg: 'Please provide a valid Kenyan phone number (+254... or 0...)',
      },
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: { args: [6, 255], msg: 'Password must be at least 6 characters' },
    },
  },
  role: {
    type: DataTypes.ENUM('user', 'landlord', 'admin'),
    defaultValue: 'user',
    validate: {
      isIn: {
        args: [['user', 'landlord', 'admin']],
        msg: 'Role must be user, landlord, or admin',
      },
    },
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['role'] },
  ],
});

module.exports = User;
