const express = require("express");
const adminrouter = express.Router();
const User = require("../models/User");
const Doctor = require("../models/doctor");

const Appointment = require("../models/Appointment");
const { isAuthenticated, adminAuth } = require("../middleware/Authentication");

// Admin adds a new doctor
adminrouter.post("/add-doctor", adminAuth, async (req, res) => {
  try {
    const { name, email, password, specialization, experience, qualifications, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    const newUser = new User({ name, email, password, role: "doctor" });
    await newUser.save();

    const newDoctor = new Doctor({
      user: newUser._id, // <-- FIXED
      specialization,
      experience,
      qualifications,
      address,
      availableSlots: [],
      appointments: [],
    });
    await newDoctor.save();

    res.status(201).json({ message: "Doctor added successfully", doctor: newDoctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin deletes a doctor
adminrouter.delete("/delete-doctor/:doctorId", adminAuth, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    await Doctor.findByIdAndDelete(doctorId);
    await User.findByIdAndDelete(doctor.userId);
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin gets all doctors
adminrouter.get("/doctors", adminAuth, async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("user", "name email");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin updates doctor availability
adminrouter.patch("/doctors/:doctorId/availability", adminAuth, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const { availability } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    doctor.availableSlots = availability;
    await doctor.save();
    res.json({ message: "Availability updated successfully", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin views all appointments
adminrouter.get("/view-appointments", adminAuth, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" }, // <-- use "user" here
        select: "user specialization"
      })
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email" }, // <-- and here
        select: "user"
      });
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin views all users
adminrouter.get("/view-users", isAuthenticated, adminAuth, async (req, res) => {
  console.log("ADMIN ROUTE USER:", req.user); // <--- Add this
  try {
    const users = await User.find();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending doctors
adminrouter.get("/pending-doctors", async (req, res) => {
  try {
    const pendingDoctors = await Doctor.find({ isActive: false }).populate('user');
    res.json({ doctors: pendingDoctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify doctor (approve or reject)
adminrouter.patch("/verify-doctor/:doctorId", adminAuth, async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const doctorId = req.params.doctorId;
    const doctor = await Doctor.findById(doctorId).populate('user');

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (action === 'approve') {
      doctor.isActive = true;
      await doctor.save();
      await User.findByIdAndUpdate(doctor.user._id, { isActive: true });
      res.json({ message: "Doctor approved successfully", doctor });
    } else if (action === 'reject') {
      // Delete the doctor and associated user
      await Doctor.findByIdAndDelete(doctorId);
      await User.findByIdAndDelete(doctor.user._id);
      res.json({ message: "Doctor rejected successfully" });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = adminrouter;
