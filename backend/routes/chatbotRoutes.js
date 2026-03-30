const express = require('express');
const router = express.Router();
const { sendMessage, resetSession } = require('../controllers/chatbotController');

// POST /api/chatbot/message - Send message to chatbot (Public)
router.post('/message', sendMessage);

// POST /api/chatbot/reset - Reset chatbot session (Public)
router.post('/reset', resetSession);

module.exports = router;
