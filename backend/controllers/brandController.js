const asyncHandler = require('express-async-handler');
const Brand = require('../models/Brand');
const { slugify } = require('../utils/slugify');

const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find().sort({ name: 1 });
  res.json({ success: true, brands });
});

const createBrand = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Brand name is required');
  }
  const slug = slugify(name);
  const logo = req.file ? `/uploads/${req.file.filename}` : '';

  const brand = await Brand.create({ name, slug, description, logo });
  res.status(201).json({ success: true, brand });
});

const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }
  const { name, description } = req.body;
  if (name) {
    brand.name = name;
    brand.slug = slugify(name);
  }
  if (description !== undefined) brand.description = description;
  if (req.file) brand.logo = `/uploads/${req.file.filename}`;

  await brand.save();
  res.json({ success: true, brand });
});

const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }
  await brand.deleteOne();
  res.json({ success: true, message: 'Brand deleted' });
});

module.exports = { getBrands, createBrand, updateBrand, deleteBrand };
