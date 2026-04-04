const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require('./users.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

// All user routes require admin role
router.use(auth, authorize('admin'));

// GET /api/users - List all users
router.get('/', getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

// PUT /api/users/:id - Update user
router.put('/:id', updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

module.exports = router;
