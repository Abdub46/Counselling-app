const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const BmiRecord = require('../models/BmiRecord');
const generateToken = require('../utils/generateToken');
const { calculateBMI, getBMICategory } = require('../utils/bmiUtils');
const { isValidKenyanPhone, isDOBValid, isHeightValid, isWeightValid } = require('../utils/validators');
const { sendEmail } = require('../services/emailService');

// @desc    Register a new client user
// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    phone,
    dateOfBirth,
    sex,
    occupation,
    county,
    residenceTown,
    height,
    weight,
    hasCurrentMedicalCondition,
    currentMedicalConditionDetails,
    hasFamilyMedicalHistory,
    familyMedicalHistoryDetails,
    balancedDietFrequency,
    fruitVegFrequency,
    fastFoodFrequency,
    mealsPerDay,
    physicalActivity,
    drugUse,
    drugUseDetails,
  } = req.body;

  // Required field checks
  const requiredFields = {
    fullName,
    email,
    password,
    phone,
    dateOfBirth,
    sex,
    occupation,
    county,
    residenceTown,
    height,
    weight,
    balancedDietFrequency,
    fruitVegFrequency,
    fastFoodFrequency,
    mealsPerDay,
  };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (value === undefined || value === null || value === '') {
      res.status(400);
      throw new Error(`${key} is required`);
    }
  }

  if (!isValidKenyanPhone(phone)) {
    res.status(400);
    throw new Error('Please provide a valid Kenyan phone number');
  }

  if (!isDOBValid(dateOfBirth)) {
    res.status(400);
    throw new Error('Date of birth cannot be in the future');
  }

  if (!isHeightValid(Number(height))) {
    res.status(400);
    throw new Error('Height must be between 50cm and 250cm');
  }

  if (!isWeightValid(Number(weight))) {
    res.status(400);
    throw new Error('Weight must be between 10kg and 400kg');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error('Email is already registered');
  }

  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    dateOfBirth,
    sex,
    occupation,
    county,
    residenceTown,
    country: 'Kenya',
    height: Number(height),
    weight: Number(weight),
    hasCurrentMedicalCondition: !!hasCurrentMedicalCondition,
    currentMedicalConditionDetails: hasCurrentMedicalCondition ? currentMedicalConditionDetails : '',
    hasFamilyMedicalHistory: !!hasFamilyMedicalHistory,
    familyMedicalHistoryDetails: hasFamilyMedicalHistory ? familyMedicalHistoryDetails : '',
    balancedDietFrequency,
    fruitVegFrequency,
    fastFoodFrequency,
    mealsPerDay,
    physicalActivity: !!physicalActivity,
    drugUse: !!drugUse,
    drugUseDetails: drugUse ? drugUseDetails : '',
    role: 'client',
  });

  // Create the first BMI record so trend history starts at signup
  const bmi = calculateBMI(user.height, user.weight);
  await BmiRecord.create({
    user: user._id,
    height: user.height,
    weight: user.weight,
    bmi,
    category: getBMICategory(bmi),
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id, user.role),
    user: sanitizeUser(user),
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    success: true,
    token: generateToken(user._id, user.role),
    user: sanitizeUser(user),
  });
});

// @desc    Get current logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});

// @desc    Forgot password - generate reset token & email it
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  // Always respond the same way to avoid leaking which emails are registered
  const genericResponse = {
    success: true,
    message: 'If an account with that email exists, a reset link has been sent.',
  };

  if (!user) return res.json(genericResponse);

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>Hello ${user.fullName},</p><p>You requested a password reset. Click the link below to set a new password. This link expires in 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email.</p>`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Email could not be sent, please try again later');
  }

  res.json(genericResponse);
});

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    res.status(400);
    throw new Error('Reset token is invalid or has expired');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    success: true,
    token: generateToken(user._id, user.role),
    message: 'Password has been reset successfully',
  });
});

// Remove sensitive fields before sending user object to client
const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

module.exports = { signup, login, getMe, forgotPassword, resetPassword };
