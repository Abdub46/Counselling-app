const express = require('express');
const {
  updateWeight,
  getHistory,
  getAnalysis,
  calculateForUser,
  toolsCalculate,
} = require('../controllers/bmiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/update', protect, updateWeight);
router.get('/history', protect, getHistory);
router.get('/analysis', protect, getAnalysis);
router.post('/calculate', protect, calculateForUser);
router.post('/tools-calculate', toolsCalculate); // public, temporary calculator

module.exports = router;
