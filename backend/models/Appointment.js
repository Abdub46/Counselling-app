const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Snapshot of user info at time of booking (read-only in the UI)
    snapshot: {
      name: String,
      email: String,
      phone: String,
      sex: String,
      age: Number,
      height: Number,
      weight: Number,
      bmi: Number,
    },

    reason: { type: String, required: true },
    problemDuration: { type: String, required: true },
    currentManagement: { type: String, required: true },
    goal: { type: String, required: true },

    appointmentType: { type: String, enum: ['Online', 'Physical'], required: true },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, required: true },

    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
