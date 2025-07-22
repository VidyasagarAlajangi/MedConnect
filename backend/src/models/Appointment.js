const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    videoCallStatus: {
      type: String,
      enum: ["inactive", "active"],
      default: "inactive",
    },
    meetingId: {
      type: String,
      default: null,
    },
    prescription: {
      type: String, // URL to the uploaded prescription file
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
