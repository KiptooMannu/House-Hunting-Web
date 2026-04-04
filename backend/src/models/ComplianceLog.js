const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ComplianceLog = sequelize.define('ComplianceLog', {
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
  period: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Tax period e.g. "2026-03"',
  },
  compliance_action: {
    type: DataTypes.ENUM('nil_filing', 'revenue_report'),
    allowNull: false,
  },
  total_revenue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  tax_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  response_status: {
    type: DataTypes.ENUM('pending', 'filed', 'failed'),
    defaultValue: 'pending',
  },
  gava_reference_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Reference number returned by GavaConnect API',
  },
  gava_raw_response: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Full GavaConnect API response for audit trail',
  },
  log_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'compliance_logs',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['landlord_id'] },
    { fields: ['period'] },
    { fields: ['response_status'] },
  ],
});

module.exports = ComplianceLog;
