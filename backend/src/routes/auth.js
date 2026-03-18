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

// Helper to ensure profile existence
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
        console.log(`Lazy created patient profile for ${user.email}`);
      }
    } else if (user.role === "doctor") {
      const existingDoctor = await Doctor.findOne({ user: user._id });
      if (!existingDoctor) {
        // We only create doctor profile if we have enough data (likely from register-doctor)
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
            About: data.qualifications || "", // Map qualifications to About if not present in schema
            isActive: false,
          });
          console.log(`Created doctor profile for ${user.email}`);
        } else {
          console.warn(`Cannot lazy create doctor profile for ${user.email} - missing required fields`);
        }
      }
    }
  } catch (err) {
    console.error(`Error in ensureProfile for ${user.email}:`, err.message);
  }
}

// Unified Registration route
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

    // Ensure corresponding profile exists
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
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Register doctor
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

    // Pass role-specific data to ensureProfile
    await ensureProfile(newUser, { ...req.body, photo, certificateUrl });

    res.status(201).json({ 
      success: true, 
      message: "Doctor registration submitted successfully! Awaiting admin verification." 
    });
  } catch (error) {
    console.error("Error in register-doctor:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Alias signup to register for backward compatibility
authrouter.post("/signup", (req, res) => {
  req.url = "/register";
  authrouter.handle(req, res);
});

// Login user
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
      return res.status(400).json({ success: false, message: "Invalid role for this user" });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Lazy ensure profile existence on login
    await ensureProfile(user);

    const token = await user.getJWT();

    res.json({ 
      success: true,
      message: "User logged in successfully", 
      token, 
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      } 
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Verify token
authrouter.get("/verify", isAuthenticated, async (req, res) => {
  try {
    console.log("Token verification request received");
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log("User not found during verification");
      return res.status(401).json({ success: false, message: "User not found" });
    }

    console.log("Token verification successful for user:", user.email);
    res.json({
      success: true,
      message: "Token is valid",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error("Error during token verification:", error);
    res.status(500).json({ success: false, message: "Token verification failed" });
  }
});

// Logout – clear server-side auth cache
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
