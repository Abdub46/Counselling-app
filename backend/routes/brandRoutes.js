const express = require('express');
const { getBrands, createBrand, updateBrand, deleteBrand } = require('../controllers/brandController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getBrands);
router.post('/', protect, authorize('admin'), upload.single('logo'), createBrand);
router.put('/:id', protect, authorize('admin'), upload.single('logo'), updateBrand);
router.delete('/:id', protect, authorize('admin'), deleteBrand);

module.exports = router;
