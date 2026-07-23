const express = require('express');
const { getWishlist, toggleWishlistItem } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getWishlist);
router.post('/toggle', protect, toggleWishlistItem);

module.exports = router;
