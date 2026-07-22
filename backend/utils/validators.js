// Validates Kenyan phone numbers: 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX, +2541XXXXXXXX, 2547XXXXXXXX
const KENYAN_PHONE_REGEX = /^(?:\+254|254|0)(7\d{8}|1\d{8})$/;

const isValidKenyanPhone = (phone) => KENYAN_PHONE_REGEX.test(String(phone || '').trim());

const isDOBValid = (dob) => {
  const date = new Date(dob);
  if (isNaN(date.getTime())) return false;
  return date < new Date();
};

const isHeightValid = (heightCm) => heightCm >= 50 && heightCm <= 250;
const isWeightValid = (weightKg) => weightKg >= 10 && weightKg <= 400;

module.exports = { isValidKenyanPhone, isDOBValid, isHeightValid, isWeightValid };
