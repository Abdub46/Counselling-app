const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Upload/replace a product's thumbnail
// @route   POST /api/products/:id/thumbnail
// @access  Private (admin)
const uploadThumbnail = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  product.thumbnail = `/uploads/${req.file.filename}`;
  await product.save();
  res.json({ success: true, thumbnail: product.thumbnail });
});

// @desc    Upload additional gallery images (appends)
// @route   POST /api/products/:id/gallery
// @access  Private (admin)
const uploadGalleryImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No image files provided');
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const newImages = req.files.map((f) => `/uploads/${f.filename}`);
  product.gallery.push(...newImages);
  await product.save();
  res.json({ success: true, gallery: product.gallery });
});

// @desc    Remove a single gallery image by URL
// @route   DELETE /api/products/:id/gallery
// @access  Private (admin)
const removeGalleryImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  product.gallery = product.gallery.filter((img) => img !== imageUrl);
  await product.save();
  res.json({ success: true, gallery: product.gallery });
});

module.exports = { uploadThumbnail, uploadGalleryImages, removeGalleryImage };
