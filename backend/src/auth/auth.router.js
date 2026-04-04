const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, getProfile } = require('./auth.controller');
const auth = require('../middleware/auth');

// Strict Rate Limiting for Auth Endpoints (max 5 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { success: false, message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' }
});

// POST /api/auth/register - Register a new user
router.post('/register', authLimiter, register);

// POST /api/auth/login - Login
router.post('/login', authLimiter, login);

// GET /api/auth/profile - Get current user profile
router.get('/profile', auth, getProfile);

module.exports = router;
