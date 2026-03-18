const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    address: {
      type: String,
      default: ""
    },
    medicalDetails: {
      type: String,
      default: ""
    },
    // You can add more patient-specific fields here as needed
    medicalHistory: [
      {
        condition: String,
        diagnosedDate: Date,
        notes: String
      }
    ],
    allergies: [String],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  { timestamps: true }
);

const Patient = mongoose.models.Patient || mongoose.model("Patient", patientSchema);

module.exports = Patient;