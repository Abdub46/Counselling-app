/**
 * Calculate BMI given height (cm) and weight (kg).
 * Formula: weight (kg) / (height (m))^2
 */
const calculateBMI = (heightCm, weightKg) => {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10; // one decimal place
};

/**
 * Return the WHO BMI category for a given BMI value.
 */
const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  if (bmi < 35) return 'Obese Class I';
  if (bmi < 40) return 'Obese Class II';
  return 'Obese Class III';
};

/**
 * Calculate age (in years) from a date of birth.
 */
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Generate a simple, rule-based interpretation of BMI trend history.
 * history: array of { bmi, weight, recordedAt } sorted ascending by date.
 */
const analyzeBMITrend = (history) => {
  if (!history || history.length === 0) {
    return {
      progress: 'No data yet',
      weightTrend: 'No data yet',
      interpretation: 'Add your first weight entry to start tracking your progress.',
      recommendation: 'Update your weight regularly (e.g. weekly) to get personalized insights.',
    };
  }

  if (history.length === 1) {
    const latest = history[0];
    return {
      progress: `Your current BMI is ${latest.bmi} (${getBMICategory(latest.bmi)}).`,
      weightTrend: 'Not enough data to determine a trend yet.',
      interpretation: `A BMI of ${latest.bmi} falls in the "${getBMICategory(latest.bmi)}" category.`,
      recommendation:
        'Keep logging your weight regularly so we can start showing you trends and tailored recommendations.',
    };
  }

  const first = history[0];
  const last = history[history.length - 1];
  const bmiChange = Math.round((last.bmi - first.bmi) * 10) / 10;
  const weightChange = Math.round((last.weight - first.weight) * 10) / 10;

  const firstDate = new Date(first.recordedAt);
  const lastDate = new Date(last.recordedAt);
  const daysDiff = Math.max(1, Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
  const periodLabel =
    daysDiff >= 60 ? `${Math.round(daysDiff / 30)} months` : `${daysDiff} days`;

  let progress;
  let recommendation;
  const category = getBMICategory(last.bmi);
  const wasOverweightOrObese = first.bmi >= 25;
  const isNowHealthier = last.bmi < first.bmi;

  if (bmiChange === 0) {
    progress = `Your BMI has remained steady at ${last.bmi} over the last ${periodLabel}.`;
  } else if (wasOverweightOrObese && isNowHealthier) {
    progress = `Your BMI has decreased from ${first.bmi} to ${last.bmi} over the last ${periodLabel}, indicating positive progress toward a healthier weight.`;
  } else if (!wasOverweightOrObese && last.bmi > first.bmi && last.bmi >= 25) {
    progress = `Your BMI has increased from ${first.bmi} to ${last.bmi} over the last ${periodLabel}, moving out of the healthy weight range.`;
  } else if (bmiChange > 0) {
    progress = `Your BMI has increased from ${first.bmi} to ${last.bmi} over the last ${periodLabel}.`;
  } else {
    progress = `Your BMI has decreased from ${first.bmi} to ${last.bmi} over the last ${periodLabel}.`;
  }

  const weightTrend =
    weightChange === 0
      ? 'Your weight has stayed about the same.'
      : weightChange > 0
      ? `You have gained approximately ${Math.abs(weightChange)} kg.`
      : `You have lost approximately ${Math.abs(weightChange)} kg.`;

  const interpretation = `Your current BMI of ${last.bmi} places you in the "${category}" category.`;

  if (category === 'Normal weight') {
    recommendation =
      'Continue maintaining a balanced diet rich in fruits, vegetables and whole grains, along with regular physical activity.';
  } else if (category === 'Underweight') {
    recommendation =
      'Consider increasing your intake of nutrient-dense foods and consult a nutrition professional for a personalized meal plan.';
  } else {
    recommendation =
      'Continue maintaining a balanced diet and regular physical activity, and consider booking an appointment with a nutrition counsellor for personalized guidance.';
  }

  return { progress, weightTrend, interpretation, recommendation };
};

module.exports = { calculateBMI, getBMICategory, calculateAge, analyzeBMITrend };
