const express = require('express');
const router  = express.Router();
const rateLimit = require('express-rate-limit');
const { chat } = require('../controllers/aiController');
const { protect } = require('../middleware/autMiddleware');

// Rate limit AI — 30 messages per minute per user
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/chat', protect, aiLimiter, chat);

module.exports = router;
