const express = require('express');
const { getDashboard, getInventoryAlerts } = require('../controllers/shopAdminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/inventory', getInventoryAlerts);

module.exports = router;
