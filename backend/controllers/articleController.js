const asyncHandler = require('express-async-handler');
const Article = require('../models/Article');

// @desc    Get all articles (card format)
// @route   GET /api/articles
// @access  Public
const getArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find().sort({ publishedAt: -1 });
  res.json({ success: true, articles });
});

// @desc    Get single article (read more page)
// @route   GET /api/articles/:id
// @access  Public
const getArticleById = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }
  res.json({ success: true, article });
});

// @desc    Create article
// @route   POST /api/articles
// @access  Private (admin)
const createArticle = asyncHandler(async (req, res) => {
  const { title, summary, content, featuredImage, publishedAt } = req.body;

  if (!title || !summary || !content) {
    res.status(400);
    throw new Error('Title, summary and content are required');
  }

  const article = await Article.create({
    title,
    summary,
    content,
    featuredImage,
    author: req.user._id,
    publishedAt: publishedAt || Date.now(),
  });

  res.status(201).json({ success: true, article });
});

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private (admin)
const updateArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  const { title, summary, content, featuredImage, publishedAt } = req.body;
  if (title !== undefined) article.title = title;
  if (summary !== undefined) article.summary = summary;
  if (content !== undefined) article.content = content;
  if (featuredImage !== undefined) article.featuredImage = featuredImage;
  if (publishedAt !== undefined) article.publishedAt = publishedAt;

  await article.save();
  res.json({ success: true, article });
});

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private (admin)
const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }
  await article.deleteOne();
  res.json({ success: true, message: 'Article deleted' });
});

module.exports = { getArticles, getArticleById, createArticle, updateArticle, deleteArticle };
