const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: { msg: 'Amount must be a valid number' },
      min: { args: [0], msg: 'Amount cannot be negative' },
    },
  },
  transaction_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Legacy or simulation transaction code',
  },
  mpesa_checkout_request_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Daraja STK Push CheckoutRequestID — used to match callbacks',
  },
  mpesa_merchant_request_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Daraja STK Push MerchantRequestID',
  },
  mpesa_receipt_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Actual M-Pesa receipt number (e.g. QJI1234567)',
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Phone number used for M-Pesa payment',
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['booking_id'] },
    { fields: ['transaction_code'], unique: true },
    { fields: ['payment_status'] },
  ],
});

module.exports = Payment;
