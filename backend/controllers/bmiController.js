const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const BmiRecord = require('../models/BmiRecord');
const { calculateBMI, getBMICategory, analyzeBMITrend } = require('../utils/bmiUtils');
const { isHeightValid, isWeightValid } = require('../utils/validators');

// @desc    Update logged-in user's weight (and optionally height); creates a new BMI history record
// @route   POST /api/bmi/update
// @access  Private
const updateWeight = asyncHandler(async (req, res) => {
  const { weight, height } = req.body;

  if (weight === undefined || !isWeightValid(Number(weight))) {
    res.status(400);
    throw new Error('A valid weight (10-400kg) is required');
  }
  if (height !== undefined && !isHeightValid(Number(height))) {
    res.status(400);
    throw new Error('Height must be between 50cm and 250cm');
  }

  const user = await User.findById(req.user._id);
  user.weight = Number(weight);
  if (height !== undefined) user.height = Number(height);
  await user.save();

  const bmi = calculateBMI(user.height, user.weight);
  const category = getBMICategory(bmi);

  const record = await BmiRecord.create({
    user: user._id,
    height: user.height,
    weight: user.weight,
    bmi,
    category,
  });

  res.status(201).json({ success: true, record, user: { height: user.height, weight: user.weight, bmi, category } });
});

// @desc    Get logged-in user's BMI history (for trend graph)
// @route   GET /api/bmi/history
// @access  Private
const getHistory = asyncHandler(async (req, res) => {
  const records = await BmiRecord.find({ user: req.user._id }).sort({ recordedAt: 1 });
  res.json({ success: true, records });
});

// @desc    Get automatic analysis/interpretation of the user's BMI trend
// @route   GET /api/bmi/analysis
// @access  Private
const getAnalysis = asyncHandler(async (req, res) => {
  const records = await BmiRecord.find({ user: req.user._id }).sort({ recordedAt: 1 });
  const analysis = analyzeBMITrend(records);
  res.json({ success: true, analysis });
});

// @desc    Dashboard BMI calculator - uses logged-in user's stored height, saves history
// @route   POST /api/bmi/calculate
// @access  Private
const calculateForUser = asyncHandler(async (req, res) => {
  const { weight } = req.body;
  if (weight === undefined || !isWeightValid(Number(weight))) {
    res.status(400);
    throw new Error('A valid weight (10-400kg) is required');
  }

  const user = await User.findById(req.user._id);
  const bmi = calculateBMI(user.height, Number(weight));
  const category = getBMICategory(bmi);

  user.weight = Number(weight);
  await user.save();

  const record = await BmiRecord.create({
    user: user._id,
    height: user.height,
    weight: user.weight,
    bmi,
    category,
  });

  res.status(201).json({ success: true, bmi, category, record });
});

// @desc    Tools BMI calculator - temporary height/weight, does NOT save
// @route   POST /api/bmi/tools-calculate
// @access  Public
const toolsCalculate = asyncHandler(async (req, res) => {
  const { height, weight } = req.body;

  if (!isHeightValid(Number(height))) {
    res.status(400);
    throw new Error('Height must be between 50cm and 250cm');
  }
  if (!isWeightValid(Number(weight))) {
    res.status(400);
    throw new Error('Weight must be between 10kg and 400kg');
  }

  const bmi = calculateBMI(Number(height), Number(weight));
  const category = getBMICategory(bmi);

  res.json({ success: true, bmi, category });
});

module.exports = { updateWeight, getHistory, getAnalysis, calculateForUser, toolsCalculate };
