const express = require('express');
const router = express.Router();
const {
  createComplianceLog,
  getComplianceLogs,
  getComplianceLogById,
  sendRevenueToGava,
  submitNilFiling,
} = require('./compliance.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

// All compliance routes require authentication
router.use(auth);

// Platform compliance is admin-managed (website revenue, not landlord revenue)
router.post('/', authorize('admin'), createComplianceLog);
router.post('/gava/send-revenue', authorize('admin'), sendRevenueToGava);
router.post('/gava/nil-filing', authorize('admin'), submitNilFiling);
router.get('/', authorize('admin'), getComplianceLogs);
router.get('/:id', authorize('admin'), getComplianceLogById);

module.exports = router;
