/**
 * Seed an initial admin user so the admin dashboard is accessible.
 * Run with: npm run seed:admin
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    // Validate required environment variables
    const requiredEnv = ["MONGO_URI", "ADMIN_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"];

    for (const key of requiredEnv) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.ADMIN_EMAIL.toLowerCase().trim();

    // Check if the user already exists
    const existing = await User.findOne({ email });

    if (existing) {
      if (existing.role !== "admin") {
        existing.role = "admin";
        await existing.save();

        console.log(`✅ Promoted ${email} to admin.`);
      } else {
        console.log(`✅ Admin user already exists: ${email}`);
      }

      await mongoose.connection.close();
      process.exit(0);
    }

    // Create new admin
    await User.create({
      fullName: process.env.ADMIN_NAME,
      email,
      password: process.env.ADMIN_PASSWORD,
      phone: "0700000000",
      dateOfBirth: "1990-01-01",
      sex: "Male",
      occupation: "Administrator",
      country: "Kenya",
      county: "Nairobi",
      residenceTown: "Nairobi",
      height: 170,
      weight: 70,
      hasCurrentMedicalCondition: false,
      currentMedicalConditionDetails: "",
      hasFamilyMedicalHistory: false,
      familyMedicalHistoryDetails: "",
      balancedDietFrequency: "Every day",
      fruitVegFrequency: "Every day",
      fastFoodFrequency: "Once per week",
      mealsPerDay: "Three",
      physicalActivity: true,
      drugUse: false,
      drugUseDetails: "",
      role: "admin",
    });

    console.log(`✅ Admin user created: ${email}`);

    await mongoose.connection.close();
    process.exit(0);

  } catch (err) {
    console.error("❌ Error seeding admin:", err.message);

    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

seedAdmin();