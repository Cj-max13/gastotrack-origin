const express = require('express');
const router  = express.Router();
const { getSummary, getDashboard } = require('../controllers/analyticsController');
const { protect } = require('../middleware/autMiddleware');

// GET /api/analytics/summary?period=day|week|month
router.get('/summary',   protect, getSummary);

// GET /api/analytics/dashboard
router.get('/dashboard', protect, getDashboard);

module.exports = router;
