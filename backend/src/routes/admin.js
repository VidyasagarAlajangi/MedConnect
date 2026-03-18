const express = require("express");
const adminrouter = express.Router();
const User = require("../models/User");
const Doctor = require("../models/doctor");
const Patient = require("../models/patient");

const Appointment = require("../models/Appointment");
const { isAuthenticated, adminAuth } = require("../middleware/Authentication");

// Admin adds a new doctor
adminrouter.post("/add-doctor", isAuthenticated, adminAuth, async (req, res) => {
  try {
    const { name, email, password, specialization, experience, qualifications, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    const newUser = new User({ name, email, password, role: "doctor" });
    await newUser.save();

    const newDoctor = new Doctor({
      user: newUser._id,
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
adminrouter.delete("/delete-doctor/:doctorId", isAuthenticated, adminAuth, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    await Doctor.findByIdAndDelete(doctorId);
    // doctor.user contains the User ObjectId
    await User.findByIdAndDelete(doctor.user);
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin gets all doctors
adminrouter.get("/doctors", isAuthenticated, adminAuth, async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("user", "name email");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin gets all patients
adminrouter.get("/patients", isAuthenticated, adminAuth, async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin updates doctor availability
adminrouter.patch("/doctors/:doctorId/availability", isAuthenticated, adminAuth, async (req, res) => {
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
adminrouter.get("/view-appointments", isAuthenticated, adminAuth, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
        select: "user specialization"
      })
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email" },
        select: "user"
      });
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin views all users
adminrouter.get("/view-users", isAuthenticated, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending doctors
adminrouter.get("/pending-doctors", isAuthenticated, adminAuth, async (req, res) => {
  try {
    const pendingDoctors = await Doctor.find({ isActive: false }).populate("user");
    res.json({ doctors: pendingDoctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify doctor (approve or reject)
adminrouter.patch("/verify-doctor/:doctorId", isAuthenticated, adminAuth, async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const doctorId = req.params.doctorId;
    const doctor = await Doctor.findById(doctorId).populate("user");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (action === "approve") {
      doctor.isActive = true;
      await doctor.save();
      await User.findByIdAndUpdate(doctor.user._id, { isActive: true });
      res.json({ success: true, message: "Doctor approved successfully", doctor });
    } else if (action === "reject") {
      await Doctor.findByIdAndDelete(doctorId);
      await User.findByIdAndDelete(doctor.user._id);
      res.json({ success: true, message: "Doctor rejected successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid action. Use 'approve' or 'reject'." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = adminrouter;
