const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const frequencyEnum = [
  'Once per week',
  'Twice per week',
  'Three times per week',
  'Almost every day',
  'Every day',
];

const userSchema = new mongoose.Schema(
  {
    // Personal Information
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    sex: { type: String, enum: ['Male', 'Female'], required: true },
    occupation: { type: String, required: true, trim: true },
    country: { type: String, default: 'Kenya' },
    county: { type: String, required: true, trim: true },
    residenceTown: { type: String, required: true, trim: true },

    // Body Measurements (current/latest snapshot; history lives in BmiRecord)
    height: { type: Number, required: true }, // cm
    weight: { type: Number, required: true }, // kg

    // Medical History
    hasCurrentMedicalCondition: { type: Boolean, default: false },
    currentMedicalConditionDetails: { type: String, default: '' },
    hasFamilyMedicalHistory: { type: Boolean, default: false },
    familyMedicalHistoryDetails: { type: String, default: '' },

    // Dietary Habits
    balancedDietFrequency: { type: String, enum: frequencyEnum, required: true },
    fruitVegFrequency: { type: String, enum: frequencyEnum, required: true },
    fastFoodFrequency: { type: String, enum: frequencyEnum, required: true },
    mealsPerDay: { type: String, enum: ['One', 'Two', 'Three', 'Four', 'Five'], required: true },

    // Lifestyle
    physicalActivity: { type: Boolean, default: false },
    drugUse: { type: Boolean, default: false },
    drugUseDetails: { type: String, default: '' },

    // Role-based access control
    role: { type: String, enum: ['client', 'admin'], default: 'client' },

    // Password reset
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// Virtual: current age computed from DOB
userSchema.virtual('age').get(function () {
  const birthDate = new Date(this.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
});

// Virtual: current BMI computed from stored height/weight
userSchema.virtual('bmi').get(function () {
  const heightM = this.height / 100;
  return Math.round((this.weight / (heightM * heightM)) * 10) / 10;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
