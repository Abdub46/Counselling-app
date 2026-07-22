const express = require('express');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAnalytics,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes require authentication AND admin role - enforced server-side
router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/analytics', getAnalytics);

module.exports = router;
