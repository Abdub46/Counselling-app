const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const { calculateBMI } = require('../utils/bmiUtils');

// @desc    Create a new appointment booking
// @route   POST /api/appointments
// @access  Private (client)
const createAppointment = asyncHandler(async (req, res) => {
  const { reason, problemDuration, currentManagement, goal, appointmentType, preferredDate, preferredTime } =
    req.body;

  const requiredFields = { reason, problemDuration, currentManagement, goal, appointmentType, preferredDate, preferredTime };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      res.status(400);
      throw new Error(`${key} is required`);
    }
  }

  if (!['Online', 'Physical'].includes(appointmentType)) {
    res.status(400);
    throw new Error('Appointment type must be Online or Physical');
  }

  const preferredDateObj = new Date(preferredDate);
  if (isNaN(preferredDateObj.getTime()) || preferredDateObj < new Date().setHours(0, 0, 0, 0)) {
    res.status(400);
    throw new Error('Preferred date must be a valid future date');
  }

  const user = req.user;
  const bmi = calculateBMI(user.height, user.weight);

  const appointment = await Appointment.create({
    user: user._id,
    snapshot: {
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      sex: user.sex,
      age: user.age,
      height: user.height,
      weight: user.weight,
      bmi,
    },
    reason,
    problemDuration,
    currentManagement,
    goal,
    appointmentType,
    preferredDate: preferredDateObj,
    preferredTime,
  });

  res.status(201).json({ success: true, appointment });
});

// @desc    Get logged-in user's appointments
// @route   GET /api/appointments/my
// @access  Private (client)
const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, appointments });
});

// @desc    Get all appointments (admin)
// @route   GET /api/appointments
// @access  Private (admin)
const getAllAppointments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const appointments = await Appointment.find(filter)
    .populate('user', 'fullName email phone')
    .sort({ createdAt: -1 });
  res.json({ success: true, appointments });
});

// @desc    Update appointment status (admin)
// @route   PUT /api/appointments/:id/status
// @access  Private (admin)
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['Pending', 'Approved', 'Completed', 'Cancelled'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  appointment.status = status;
  await appointment.save();

  res.json({ success: true, appointment });
});

module.exports = { createAppointment, getMyAppointments, getAllAppointments, updateAppointmentStatus };
