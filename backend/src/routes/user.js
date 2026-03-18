const express = require("express");
const userRouter = express.Router();
const User = require("../models/User");
const Patient = require("../models/patient");
const { isAuthenticated } = require("../middleware/Authentication");

userRouter.put("/profile", isAuthenticated, async (req, res) => {
  try {
    const { name, phone, address, medicalDetails } = req.body;

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

    let patient = await Patient.findOne({ user: req.user.id });
    
    if (patient) {
      patient = await Patient.findOneAndUpdate(
        { user: req.user.id },
        { address, medicalDetails },
        { new: true }
      );
    } else if (req.user.role === "patient") {
      patient = await Patient.create({
        user: req.user.id,
        address,
        medicalDetails
      });
    }

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
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
});

module.exports = userRouter;