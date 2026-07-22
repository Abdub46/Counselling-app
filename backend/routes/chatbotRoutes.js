const express = require('express');
const { sendMessage } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');
const { chatbotLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.post('/message', protect, chatbotLimiter, sendMessage);

module.exports = router;
