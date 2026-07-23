const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const SHIPPING_FEE = 300; // flat rate in KES; extend later with zones/weight

const generateOrderNumber = () => `ORD-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;

// @desc    Place a new order (checkout)
// @route   POST /api/orders
// @access  Private (client)
const createOrder = asyncHandler(async (req, res) => {
  const { items, customerInfo, couponCode, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }
  if (!customerInfo?.fullName || !customerInfo?.phone || !customerInfo?.email || !customerInfo?.deliveryAddress) {
    res.status(400);
    throw new Error('Full name, phone, email and delivery address are required');
  }

  // Re-validate stock & prices server-side (never trust the cart payload's prices)
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || product.status !== 'Published') {
      res.status(400);
      throw new Error(`Product no longer available: ${item.productId}`);
    }
    if (product.stockQuantity < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    const unitPrice = product.finalPrice;
    orderItems.push({
      product: product._id,
      name: product.name,
      thumbnail: product.thumbnail,
      price: unitPrice,
      quantity: item.quantity,
    });
    subtotal += unitPrice * item.quantity;
  }

  // Apply coupon if provided
  let discountAmount = 0;
  let appliedCouponCode = '';
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date()) && subtotal >= coupon.minOrderAmount) {
      if (coupon.usageLimit === 0 || coupon.usedCount < coupon.usageLimit) {
        discountAmount =
          coupon.discountType === 'percent' ? Math.round(subtotal * (coupon.discountValue / 100)) : coupon.discountValue;
        appliedCouponCode = coupon.code;
        coupon.usedCount += 1;
        await coupon.save();
      }
    }
  }

  const shippingFee = SHIPPING_FEE;
  const total = Math.max(0, subtotal - discountAmount) + shippingFee;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    items: orderItems,
    customerInfo,
    subtotal,
    couponCode: appliedCouponCode,
    discountAmount,
    shippingFee,
    total,
    paymentMethod: paymentMethod || 'Cash on Delivery',
    status: 'Pending',
  });

  // Decrement stock & bump sales count
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stockQuantity: -item.quantity, salesCount: item.quantity },
    });
  }

  res.status(201).json({ success: true, order });
});

// @desc    Get logged-in user's order history
// @route   GET /api/orders/my
// @access  Private (client)
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc    Get single order detail (owner or admin)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.json({ success: true, order });
});

// @desc    Admin: get all orders with filters/search/pagination
// @route   GET /api/orders
// @access  Private (admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { orderNumber: { $regex: q, $options: 'i' } },
      { 'customerInfo.fullName': { $regex: q, $options: 'i' } },
      { 'customerInfo.email': { $regex: q, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'fullName email').sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum).limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, orders, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
});

// @desc    Admin: update order status
// @route   PUT /api/orders/:id/status
// @access  Private (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Restock items if cancelling/refunding an order that wasn't already cancelled/refunded
  if (['Cancelled', 'Refunded'].includes(status) && !['Cancelled', 'Refunded'].includes(order.status)) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: item.quantity, salesCount: -item.quantity } });
    }
  }

  order.status = status;
  await order.save();
  res.json({ success: true, order });
});

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
