const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');

const recalculateRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, status: 'Approved' } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, {
    ratingAverage: Math.round(avg * 10) / 10,
    ratingCount: count,
  });
};

// @desc    Get approved reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, status: 'Approved' })
    .populate('user', 'fullName')
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

// @desc    Submit a review (goes to Pending until admin approves)
// @route   POST /api/reviews
// @access  Private (client)
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  if (!productId || !rating || !comment) {
    res.status(400);
    throw new Error('Product, rating and comment are required');
  }
  const review = await Review.create({ product: productId, user: req.user._id, rating, comment, status: 'Pending' });
  res.status(201).json({ success: true, review, message: 'Review submitted and pending approval' });
});

// @desc    Admin: get all reviews (any status)
// @route   GET /api/reviews
// @access  Private (admin)
const getAllReviews = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const reviews = await Review.find(filter).populate('user', 'fullName email').populate('product', 'name').sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

// @desc    Admin: approve review
// @route   PUT /api/reviews/:id/approve
// @access  Private (admin)
const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  review.status = 'Approved';
  await review.save();
  await recalculateRating(review.product);
  res.json({ success: true, review });
});

// @desc    Admin: hide review
// @route   PUT /api/reviews/:id/hide
// @access  Private (admin)
const hideReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  review.status = 'Hidden';
  await review.save();
  await recalculateRating(review.product);
  res.json({ success: true, review });
});

// @desc    Admin: delete review
// @route   DELETE /api/reviews/:id
// @access  Private (admin)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  const productId = review.product;
  await review.deleteOne();
  await recalculateRating(productId);
  res.json({ success: true, message: 'Review deleted' });
});

// @desc    Admin: reply to a review
// @route   PUT /api/reviews/:id/reply
// @access  Private (admin)
const replyToReview = asyncHandler(async (req, res) => {
  const { reply } = req.body;
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  review.adminReply = reply;
  await review.save();
  res.json({ success: true, review });
});

module.exports = { getProductReviews, createReview, getAllReviews, approveReview, hideReview, deleteReview, replyToReview };
