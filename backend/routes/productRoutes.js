const express = require('express');
const {
  getProducts, getSuggestions, getProductBySlug, getAdminProducts, getAdminProductById,
  createProduct, updateProduct, deleteProduct, duplicateProduct, bulkAction,
} = require('../controllers/productController');
const { uploadThumbnail, uploadGalleryImages, removeGalleryImage } = require('../controllers/productImageController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/suggestions', getSuggestions);
router.get('/slug/:slug', getProductBySlug);

// Admin
router.get('/admin/all', protect, authorize('admin'), getAdminProducts);
router.get('/admin/:id', protect, authorize('admin'), getAdminProductById);
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/:id/duplicate', protect, authorize('admin'), duplicateProduct);
router.post('/bulk', protect, authorize('admin'), bulkAction);

router.post('/:id/thumbnail', protect, authorize('admin'), upload.single('image'), uploadThumbnail);
router.post('/:id/gallery', protect, authorize('admin'), upload.array('images', 8), uploadGalleryImages);
router.delete('/:id/gallery', protect, authorize('admin'), removeGalleryImage);

module.exports = router;
