const express = require('express');
const {
  getProductReviews, createReview, getAllReviews,
  approveReview, hideReview, deleteReview, replyToReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', protect, authorize('client'), createReview);

router.get('/', protect, authorize('admin'), getAllReviews);
router.put('/:id/approve', protect, authorize('admin'), approveReview);
router.put('/:id/hide', protect, authorize('admin'), hideReview);
router.put('/:id/reply', protect, authorize('admin'), replyToReview);
router.delete('/:id', protect, authorize('admin'), deleteReview);

module.exports = router;
