const express = require('express');
const {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('client'), createAppointment);
router.get('/my', protect, authorize('client'), getMyAppointments);
router.get('/', protect, authorize('admin'), getAllAppointments);
router.put('/:id/status', protect, authorize('admin'), updateAppointmentStatus);

module.exports = router;
