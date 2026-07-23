const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const { slugify } = require('../utils/slugify');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ success: true, categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }
  const slug = slugify(name);
  const image = req.file ? `/uploads/${req.file.filename}` : '';

  const category = await Category.create({ name, slug, description, image });
  res.status(201).json({ success: true, category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  const { name, description } = req.body;
  if (name) {
    category.name = name;
    category.slug = slugify(name);
  }
  if (description !== undefined) category.description = description;
  if (req.file) category.image = `/uploads/${req.file.filename}`;

  await category.save();
  res.json({ success: true, category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
