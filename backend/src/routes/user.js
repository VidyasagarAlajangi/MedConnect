const express = require("express");
const userRouter = express.Router();
const User = require("../models/User");
const Patient = require("../models/Patient");
const { isAuthenticated } = require("../middleware/Authentication");

// Update user profile
userRouter.put("/profile", isAuthenticated, async (req, res) => {
  try {
    const { name, phone, address, medicalDetails } = req.body;

    // Update user data
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if this user has an associated patient record
    let patient = await Patient.findOne({ user: req.user.id });
    
    // Update or create patient-specific data if needed
    if (patient) {
      patient = await Patient.findOneAndUpdate(
        { user: req.user.id },
        { address, medicalDetails },
        { new: true }
      );
    } else if (req.user.role === "patient") {
      // Create new patient record if it doesn't exist
      patient = await Patient.create({
        user: req.user.id,
        address,
        medicalDetails
      });
    }

    // Prepare the response data
    const userData = {
      ...updatedUser.toObject(),
      address: patient?.address || "",
      medicalDetails: patient?.medicalDetails || ""
    };

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { 
        user: userData
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
});

module.exports = userRouter;