const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @desc    Validate a coupon code against an order subtotal (used at checkout preview)
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = await Coupon.findOne({ code: (code || '').toUpperCase(), isActive: true });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code');
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    res.status(400);
    throw new Error('This coupon has expired');
  }
  if (subtotal < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`This coupon requires a minimum order of KSh ${coupon.minOrderAmount}`);
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('This coupon has reached its usage limit');
  }

  const discountAmount =
    coupon.discountType === 'percent' ? Math.round(subtotal * (coupon.discountValue / 100)) : coupon.discountValue;

  res.json({ success: true, discountAmount, code: coupon.code });
});

// @desc    Admin: list coupons
// @route   GET /api/coupons
// @access  Private (admin)
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

// @desc    Admin: create coupon
// @route   POST /api/coupons
// @access  Private (admin)
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, expiresAt, usageLimit } = req.body;
  if (!code || !discountValue) {
    res.status(400);
    throw new Error('Code and discount value are required');
  }
  const coupon = await Coupon.create({ code, discountType, discountValue, minOrderAmount, expiresAt, usageLimit });
  res.status(201).json({ success: true, coupon });
});

// @desc    Admin: update coupon
// @route   PUT /api/coupons/:id
// @access  Private (admin)
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  Object.assign(coupon, req.body);
  await coupon.save();
  res.json({ success: true, coupon });
});

// @desc    Admin: delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private (admin)
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  await coupon.deleteOne();
  res.json({ success: true, message: 'Coupon deleted' });
});

module.exports = { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon };
