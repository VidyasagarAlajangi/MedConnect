const express = require("express");
const authrouter = express.Router();
const User = require("../models/User");
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middleware/Authentication");
const multer = require('multer');
const path = require('path');

// Configure multer for file storage (example: local storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save uploads in backend/uploads (not inside src/routes)
    const uploadDir = path.join(__dirname, '..', 'uploads');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Signup user
authrouter.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", existingUser);
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate role
    if (!["patient", "doctor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Create new user
    const newUser = new User({ name, email, password, phone, role });
    await newUser.save();

    if (role === "patient") {
      await Patient.create({ user: newUser._id });
    }

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Add token to cookie
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    res.status(201).json({ message: "User registered successfully", token, data: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
authrouter.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    console.log("Login attempt with email:", email);
    console.log("Received login:", req.body);

    // Special case for admin email
    if (email === 'admin@gmail.com') {
      // Find or create admin user
      let user = await User.findOne({ email });
      
      if (!user) {
        // Create admin user if doesn't exist
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

      // For admin, check if password matches '12345'
      const isPasswordValid = password === '12345' || await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log("Invalid password for admin email");
        return res.status(400).json({ 
          success: false,
          message: "Invalid email or password" 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // Return user data without password
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      };

      return res.json({ 
        success: true,
        message: "Admin logged in successfully", 
        token, 
        data: userData 
      });
    }

    // Regular user login flow
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Check if user role matches the requested role
    if (role && user.role !== role) {
      console.log("Role mismatch:", user.role, role);
      return res.status(400).json({ 
        success: false,
        message: "Invalid role for this user" 
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password for email:", email);
      return res.status(400).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || "medi@123",
      { expiresIn: "1d" }
    );

    // Return user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    };

    console.log("Login successful for user:", user.email);
    console.log("Sending response with token and user data");

    // Return token in response
    res.json({ 
      success: true,
      message: "User logged in successfully", 
      token, 
      data: userData 
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
});

// Logout user
authrouter.get("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.json({ message: "User logged out successfully" });
});

// Register doctor
authrouter.post("/register-doctor", upload.single('photo'), async (req, res) => {
  console.log("register-doctor route called"); // Add logging
  try {
    const { name, email, password, specialization, experience, qualifications, address, licenseNumber } = req.body;
    const photo = req.file ? path.join('uploads', req.file.filename) : null; // Store the relative path

    console.log("Request body:", req.body); // Log request body

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    const newUser = new User({ name, email, password, role: "doctor", isActive: false }); // Set to inactive initially
    await newUser.save();

    const newDoctor = new Doctor({
      user: newUser._id,
      name,
      specialization,
      experience,
      qualifications,
      address,
      licenseNumber,
      photo,
      availableSlots: [],
      isActive: false, // Doctor is not active until approved
    });
    await newDoctor.save();

    res.status(201).json({ message: "Doctor registration submitted successfully!" });
  } catch (error) {
    console.error("Error in register-doctor route:", error); // Log the error
    res.status(500).json({ message: error.message });
  }
});

// Register route (newly added)
authrouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", existingUser);
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate role
    if (!["patient", "doctor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Create new user
    const newUser = new User({ name, email, password, phone, role });
    await newUser.save();

    if (role === "patient") {
      await Patient.create({ user: newUser._id });
    }

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: token,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        // Add any other relevant user data here
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Verify token
authrouter.get("/verify", isAuthenticated, async (req, res) => {
  try {
    console.log("Token verification request received");
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log("User not found during verification");
      return res.status(401).json({ message: "User not found" });
    }

    console.log("Token verification successful for user:", user.email);
    res.json({
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
    res.status(500).json({ message: "Token verification failed" });
  }
});

module.exports = authrouter;
