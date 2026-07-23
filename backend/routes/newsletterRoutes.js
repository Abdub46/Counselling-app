const express = require('express');
const { subscribe } = require('../controllers/newsletterController');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.post('/subscribe', authLimiter, subscribe);

module.exports = router;
