const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');

// @desc    Get logged-in user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  res.json({ success: true, wishlist });
});

// @desc    Toggle a product in/out of the wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
const toggleWishlistItem = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    res.status(400);
    throw new Error('productId is required');
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });

  const exists = wishlist.products.some((p) => p.toString() === productId);
  if (exists) {
    wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
  } else {
    wishlist.products.push(productId);
  }
  await wishlist.save();

  res.json({ success: true, wishlist, added: !exists });
});

module.exports = { getWishlist, toggleWishlistItem };
