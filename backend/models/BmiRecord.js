const mongoose = require('mongoose');

const bmiRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    height: { type: Number, required: true }, // cm, at time of record
    weight: { type: Number, required: true }, // kg, at time of record
    bmi: { type: Number, required: true },
    category: { type: String, required: true },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BmiRecord', bmiRecordSchema);
