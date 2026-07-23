const express = require('express');
const { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('client'), createOrder);
router.get('/my', protect, authorize('client'), getMyOrders);
router.get('/', protect, authorize('admin'), getAllOrders);
router.get('/:id', protect, getOrderById); // owner or admin check happens inside controller
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;
