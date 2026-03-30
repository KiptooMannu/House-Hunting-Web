const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

// POST /api/auth/register - Register a new user
router.post('/register', register);

// POST /api/auth/login - Login
router.post('/login', login);

// GET /api/auth/profile - Get current user profile
router.get('/profile', auth, getProfile);

module.exports = router;
