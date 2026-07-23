const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

const LOW_STOCK_THRESHOLD = 10;

// @desc    Shop Management dashboard summary
// @route   GET /api/shop-admin/dashboard
// @access  Private (admin)
const getDashboard = asyncHandler(async (req, res) => {
  const [totalProducts, totalOrders, revenueAgg, lowStockCount, outOfStockCount, latestOrders, bestSellers, recentReviews] =
    await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $nin: ['Cancelled', 'Refunded'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Product.countDocuments({ stockQuantity: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } }),
      Product.countDocuments({ stockQuantity: 0 }),
      Order.find().populate('user', 'fullName').sort({ createdAt: -1 }).limit(5),
      Product.find().sort({ salesCount: -1 }).limit(5).select('name thumbnail salesCount price'),
      Review.find().populate('user', 'fullName').populate('product', 'name').sort({ createdAt: -1 }).limit(5),
    ]);

  res.json({
    success: true,
    totalProducts,
    totalOrders,
    revenue: revenueAgg[0]?.total || 0,
    lowStockCount,
    outOfStockCount,
    latestOrders,
    bestSellers,
    recentReviews,
  });
});

// @desc    List low/out-of-stock products (for inventory alerts)
// @route   GET /api/shop-admin/inventory
// @access  Private (admin)
const getInventoryAlerts = asyncHandler(async (req, res) => {
  const lowStock = await Product.find({ stockQuantity: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } }).select('name sku stockQuantity thumbnail');
  const outOfStock = await Product.find({ stockQuantity: 0 }).select('name sku stockQuantity thumbnail');
  res.json({ success: true, lowStock, outOfStock });
});

module.exports = { getDashboard, getInventoryAlerts };
