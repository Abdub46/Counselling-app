/**
 * Seed an initial admin user so the admin dashboard is accessible.
 * Run with: npm run seed:admin
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = (process.env.ADMIN_EMAIL || 'admin@nutritionapp.com').toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    process.exit(0);
  }

  await User.create({
    fullName: process.env.ADMIN_NAME || 'System Admin',
    email,
    password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
    phone: '0700000000',
    dateOfBirth: '1990-01-01',
    sex: 'Male',
    occupation: 'Administrator',
    county: 'Nairobi',
    residenceTown: 'Nairobi',
    height: 170,
    weight: 70,
    balancedDietFrequency: 'Every day',
    fruitVegFrequency: 'Every day',
    fastFoodFrequency: 'Once per week',
    mealsPerDay: 'Three',
    role: 'admin',
  });

  console.log(`Admin user created: ${email}`);
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
