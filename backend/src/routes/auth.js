const express = require("express");
const authrouter = express.Router();
const User = require("../models/User");
const Patient = require("../models/patient");
const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuthenticated, clearAuthCache } = require("../middleware/Authentication");
const path = require('path');
const upload = require('../utils/fileUpload');

async function ensureProfile(user, data = {}) {
  try {
    if (user.role === "patient") {
      const existingPatient = await Patient.findOne({ user: user._id });
      if (!existingPatient) {
        await Patient.create({
          user: user._id,
          address: data.address || "",
          medicalDetails: data.medicalIssues || "",
        });
      }
    } else if (user.role === "doctor") {
      const existingDoctor = await Doctor.findOne({ user: user._id });
      if (!existingDoctor) {
        if (data.specialization && data.experience) {
          await Doctor.create({
            user: user._id,
            name: user.name,
            specialization: data.specialization,
            experience: Number(data.experience),
            address: data.address || "",
            licenseNumber: data.licenseNumber || "",
            certificateUrl: data.certificateUrl || null,
            photo: data.photo || null,
            img_url: data.photo || "https://www.shutterstock.com/image-vector/male-doctor-smiling-happy-face-600nw-2481032615.jpg",
            About: data.qualifications || "",
            isActive: false,
          });
        } else {
        }
      }
    }
  } catch (err) {
  }
}

authrouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    if (!["patient", "doctor"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const newUser = new User({ name, email, password, phone, role });
    await newUser.save();

    await ensureProfile(newUser, req.body);

    const token = await newUser.getJWT();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

authrouter.post("/register-doctor", upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    let photo = req.files?.photo ? req.files.photo[0].path : null;
    let certificateUrl = req.files?.certificate ? req.files.certificate[0].path : null;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      password,
      phone,
      role: "doctor",
      img_url: photo
    });
    await newUser.save();

    await ensureProfile(newUser, { ...req.body, photo, certificateUrl });

    res.status(201).json({
      success: true,
      message: "Doctor registration submitted successfully! Awaiting admin verification."
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

authrouter.post("/signup", (req, res) => {
  req.url = "/register";
  authrouter.handle(req, res);
});

authrouter.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Special case for admin email
    if (email === 'admin@gmail.com') {
      let user = await User.findOne({ email });
      if (!user) {
        const hashedPassword = await bcrypt.hash('12345', 10);
        user = new User({
          name: 'Admin',
          email: 'admin@gmail.com',
          password: hashedPassword,
          role: 'admin',
          phone: '0000000000'
        });
        await user.save();
      }

      const isPasswordValid = password === '12345' || await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ success: false, message: "Invalid email or password" });
      }

      const token = await user.getJWT();
      return res.json({
        success: true,
        message: "Admin logged in successfully",
        token,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: `Access denied. Please log in as a ${user.role}.` });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    await ensureProfile(user);

    const token = await user.getJWT();
    let extraData = {};
    if (user.role === 'patient') {
      const patientData = await Patient.findOne({ user: user._id });
      if (patientData) extraData = { address: patientData.address, medicalDetails: patientData.medicalDetails };
    } else if (user.role === 'doctor') {
      const doctorData = await Doctor.findOne({ user: user._id });
      if (doctorData) extraData = { address: doctorData.address, specialization: doctorData.specialization };
    }

    res.json({
      success: true,
      message: "User logged in successfully",
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        ...extraData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

authrouter.get("/verify", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    let extraData = {};
    if (user.role === 'patient') {
      const patientData = await Patient.findOne({ user: user._id });
      if (patientData) extraData = { address: patientData.address, medicalDetails: patientData.medicalDetails };
    } else if (user.role === 'doctor') {
      const doctorData = await Doctor.findOne({ user: user._id });
      if (doctorData) extraData = { address: doctorData.address, specialization: doctorData.specialization };
    }

    res.json({
      success: true,
      message: "Token is valid",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        ...extraData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Token verification failed" });
  }
});

authrouter.get("/logout", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) clearAuthCache(token);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
});

module.exports = authrouter;
