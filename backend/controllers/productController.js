const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { slugify } = require('../utils/slugify');

// @desc    Public product listing with search, filters, sort, pagination
// @route   GET /api/products
// @access  Public
// Query params: q, category, brand, minPrice, maxPrice, minRating, inStock,
//               sort=newest|price_asc|price_desc|best_selling|discount|rating
//               page, limit, featured, newArrival, bestSeller
const getProducts = asyncHandler(async (req, res) => {
  const {
    q, category, brand, minPrice, maxPrice, minRating, inStock,
    sort = 'newest', page = 1, limit = 12, featured, newArrival, bestSeller,
  } = req.query;

  const filter = { status: 'Published' };

  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (minRating) filter.ratingAverage = { $gte: Number(minRating) };
  if (inStock === 'true') filter.stockQuantity = { $gt: 0 };
  if (featured === 'true') filter.isFeatured = true;
  if (newArrival === 'true') filter.isNewArrival = true;
  if (bestSeller === 'true') filter.isBestSeller = true;

  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    best_selling: { salesCount: -1 },
    discount: { discountPercent: -1 },
    rating: { ratingAverage: -1 },
  };
  const sortBy = sortMap[sort] || sortMap.newest;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter).populate('brand', 'name slug').populate('category', 'name slug')
      .sort(sortBy).skip(skip).limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Autocomplete / search suggestions
// @route   GET /api/products/suggestions?q=
// @access  Public
const getSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json({ success: true, suggestions: [] });

  const products = await Product.find({
    status: 'Published',
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
    ],
  })
    .select('name slug thumbnail price')
    .limit(8);

  res.json({ success: true, suggestions: products });
});

// @desc    Get single product by slug (for product detail page)
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, status: 'Published' })
    .populate('brand', 'name slug logo')
    .populate('category', 'name slug');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    status: 'Published',
  }).limit(4);

  res.json({ success: true, product, related });
});

// @desc    Admin: get all products (any status), with search/filter/sort/pagination
// @route   GET /api/products/admin/all
// @access  Private (admin)
const getAdminProducts = asyncHandler(async (req, res) => {
  const { q, status, category, brand, page = 1, limit = 20, sort = 'newest' } = req.query;

  const filter = {};
  if (q) filter.name = { $regex: q, $options: 'i' };
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (brand) filter.brand = brand;

  const sortMap = { newest: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 } };
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [products, total] = await Promise.all([
    Product.find(filter).populate('brand', 'name').populate('category', 'name')
      .sort(sortMap[sort] || sortMap.newest).skip((pageNum - 1) * limitNum).limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({ success: true, products, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
});

// @desc    Admin: get single product by id (any status)
// @route   GET /api/products/admin/:id
// @access  Private (admin)
const getAdminProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('brand', 'name').populate('category', 'name');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

// @desc    Admin: create product
// @route   POST /api/products
// @access  Private (admin)
const createProduct = asyncHandler(async (req, res) => {
  const body = req.body;
  if (!body.name || !body.sku || !body.brand || !body.category || !body.price || !body.description) {
    res.status(400);
    throw new Error('Name, SKU, brand, category, price and description are required');
  }

  let slug = slugify(body.name);
  const existingSlug = await Product.findOne({ slug });
  if (existingSlug) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const product = await Product.create({
    ...body,
    slug,
    tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',').map((t) => t.trim()) : []),
  });

  res.status(201).json({ success: true, product });
});

// @desc    Admin: update product
// @route   PUT /api/products/:id
// @access  Private (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const body = { ...req.body };
  if (body.name && body.name !== product.name) {
    let slug = slugify(body.name);
    const existingSlug = await Product.findOne({ slug, _id: { $ne: product._id } });
    if (existingSlug) slug = `${slug}-${Date.now().toString().slice(-5)}`;
    body.slug = slug;
  }
  if (body.tags && !Array.isArray(body.tags)) {
    body.tags = body.tags.split(',').map((t) => t.trim());
  }

  Object.assign(product, body);
  await product.save();

  res.json({ success: true, product });
});

// @desc    Admin: delete product
// @route   DELETE /api/products/:id
// @access  Private (admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});

// @desc    Admin: duplicate product
// @route   POST /api/products/:id/duplicate
// @access  Private (admin)
const duplicateProduct = asyncHandler(async (req, res) => {
  const original = await Product.findById(req.params.id).lean();
  if (!original) {
    res.status(404);
    throw new Error('Product not found');
  }
  delete original._id;
  delete original.createdAt;
  delete original.updatedAt;

  original.name = `${original.name} (Copy)`;
  original.slug = `${slugify(original.name)}-${Date.now().toString().slice(-5)}`;
  original.sku = `${original.sku}-COPY-${Date.now().toString().slice(-5)}`;
  original.status = 'Draft';
  original.ratingAverage = 0;
  original.ratingCount = 0;
  original.salesCount = 0;

  const duplicate = await Product.create(original);
  res.status(201).json({ success: true, product: duplicate });
});

// @desc    Admin: bulk actions (delete, publish, hide)
// @route   POST /api/products/bulk
// @access  Private (admin)
const bulkAction = asyncHandler(async (req, res) => {
  const { ids, action } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400);
    throw new Error('No products selected');
  }

  if (action === 'delete') {
    await Product.deleteMany({ _id: { $in: ids } });
  } else if (action === 'publish') {
    await Product.updateMany({ _id: { $in: ids } }, { status: 'Published' });
  } else if (action === 'hide') {
    await Product.updateMany({ _id: { $in: ids } }, { status: 'Hidden' });
  } else {
    res.status(400);
    throw new Error('Invalid bulk action');
  }

  res.json({ success: true, message: `Bulk ${action} completed for ${ids.length} product(s)` });
});

module.exports = {
  getProducts, getSuggestions, getProductBySlug, getAdminProducts, getAdminProductById,
  createProduct, updateProduct, deleteProduct, duplicateProduct, bulkAction,
};
