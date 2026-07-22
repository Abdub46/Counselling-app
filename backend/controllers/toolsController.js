const asyncHandler = require('express-async-handler');

// @desc    Daily water intake calculator (does not save data)
// @route   POST /api/tools/water-intake
// @access  Public
// Formula: 35ml per kg of body weight, adjusted +350ml if physically active
const waterIntake = asyncHandler(async (req, res) => {
  const { weight, physicalActivity } = req.body;
  const w = Number(weight);

  if (!w || w < 10 || w > 400) {
    res.status(400);
    throw new Error('A valid weight (10-400kg) is required');
  }

  let mlPerDay = w * 35;
  if (physicalActivity) mlPerDay += 350;

  res.json({
    success: true,
    litersPerDay: Math.round((mlPerDay / 1000) * 10) / 10,
    mlPerDay: Math.round(mlPerDay),
    glasses250ml: Math.round(mlPerDay / 250),
  });
});

// @desc    Daily calorie requirement calculator using Mifflin-St Jeor equation (does not save data)
// @route   POST /api/tools/calorie-requirement
// @access  Public
const calorieRequirement = asyncHandler(async (req, res) => {
  const { weight, height, age, sex, activityLevel } = req.body;
  const w = Number(weight);
  const h = Number(height);
  const a = Number(age);

  if (!w || w < 10 || w > 400) {
    res.status(400);
    throw new Error('A valid weight (10-400kg) is required');
  }
  if (!h || h < 50 || h > 250) {
    res.status(400);
    throw new Error('A valid height (50-250cm) is required');
  }
  if (!a || a < 1 || a > 120) {
    res.status(400);
    throw new Error('A valid age is required');
  }
  if (!['Male', 'Female'].includes(sex)) {
    res.status(400);
    throw new Error('Sex must be Male or Female');
  }

  // Mifflin-St Jeor BMR
  let bmr = 10 * w + 6.25 * h - 5 * a;
  bmr += sex === 'Male' ? 5 : -161;

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const multiplier = activityMultipliers[activityLevel] || activityMultipliers.sedentary;

  const tdee = Math.round(bmr * multiplier);

  res.json({
    success: true,
    bmr: Math.round(bmr),
    dailyCalorieRequirement: tdee,
    activityLevel: activityLevel || 'sedentary',
  });
});

module.exports = { waterIntake, calorieRequirement };
