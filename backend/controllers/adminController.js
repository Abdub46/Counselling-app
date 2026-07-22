const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { calculateBMI, getBMICategory } = require('../utils/bmiUtils');

// @desc    Get all users (table view) - admin only
// @route   GET /api/admin/users
// @access  Private (admin)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'client' }).sort({ createdAt: -1 });
  const shaped = users.map((u) => ({
    _id: u._id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    county: u.county,
    occupation: u.occupation,
    bmi: calculateBMI(u.height, u.weight),
    bmiCategory: getBMICategory(calculateBMI(u.height, u.weight)),
    registrationDate: u.createdAt,
  }));
  res.json({ success: true, users: shaped });
});

// @desc    Get single user detail - admin only
// @route   GET /api/admin/users/:id
// @access  Private (admin)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// @desc    Update a user - admin only
// @route   PUT /api/admin/users/:id
// @access  Private (admin)
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const editableFields = [
    'fullName', 'phone', 'occupation', 'county', 'residenceTown', 'height', 'weight',
    'hasCurrentMedicalCondition', 'currentMedicalConditionDetails',
    'hasFamilyMedicalHistory', 'familyMedicalHistoryDetails',
    'balancedDietFrequency', 'fruitVegFrequency', 'fastFoodFrequency', 'mealsPerDay',
    'physicalActivity', 'drugUse', 'drugUseDetails',
  ];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  await user.save();
  res.json({ success: true, user });
});

// @desc    Delete a user - admin only
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});

// @desc    Analytics summary for admin dashboard
// @route   GET /api/admin/analytics
// @access  Private (admin)
const getAnalytics = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: 'client' });
  const totalAppointments = await Appointment.countDocuments();

  // Monthly signup trend (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const signupAgg = await User.aggregate([
    { $match: { role: 'client', createdAt: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  const monthlySignupTrend = signupAgg.map((item) => ({
    label: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    count: item.count,
  }));

  // Gender distribution
  const genderAgg = await User.aggregate([
    { $match: { role: 'client' } },
    { $group: { _id: '$sex', count: { $sum: 1 } } },
  ]);
  const genderDistribution = genderAgg.map((g) => ({ label: g._id, count: g.count }));

  // County distribution
  const countyAgg = await User.aggregate([
    { $match: { role: 'client' } },
    { $group: { _id: '$county', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const countyDistribution = countyAgg.map((c) => ({ label: c._id, count: c.count }));

  // BMI distribution (computed in app-layer since BMI is a virtual)
  const users = await User.find({ role: 'client' }).select('height weight');
  const bmiBuckets = { Underweight: 0, 'Normal weight': 0, Overweight: 0, Obese: 0 };
  users.forEach((u) => {
    const bmi = calculateBMI(u.height, u.weight);
    const category = getBMICategory(bmi);
    if (category === 'Underweight') bmiBuckets.Underweight += 1;
    else if (category === 'Normal weight') bmiBuckets['Normal weight'] += 1;
    else if (category === 'Overweight') bmiBuckets.Overweight += 1;
    else bmiBuckets.Obese += 1; // Obese Class I/II/III grouped together
  });
  const bmiDistribution = Object.entries(bmiBuckets).map(([label, count]) => ({ label, count }));

  res.json({
    success: true,
    totalUsers,
    totalAppointments,
    monthlySignupTrend,
    bmiDistribution,
    genderDistribution,
    countyDistribution,
  });
});

module.exports = { getUsers, getUserById, updateUser, deleteUser, getAnalytics };
