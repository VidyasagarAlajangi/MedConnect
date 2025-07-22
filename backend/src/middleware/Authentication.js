const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Cache for storing authenticated users
const authCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const isAuthenticated = async (req, res, next) => {
  try {
    console.log("Checking authentication");
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: "No token provided" });
    }

    // Check cache first
    const cachedUser = authCache.get(token);
    if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_TTL) {
      console.log("User found in cache");
      req.user = cachedUser.user;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified, user ID:", decoded.id);
    
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({ message: "User not found" });
    }

    // Update cache
    authCache.set(token, {
      user,
      timestamp: Date.now()
    });

    req.user = user;
    console.log("Authentication successful for user:", user.email);
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Invalid token" });
  }
};

const doctorAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Not authorized as doctor" });
    }

    next();
  } catch (error) {
    console.error("Doctor auth error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const patientAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Not authorized as patient" });
    }

    next();
  } catch (error) {
    console.error("Patient auth error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Clear cache entry when user logs out
const clearAuthCache = (token) => {
  authCache.delete(token);
};

module.exports = {
  isAuthenticated,
  doctorAuth,
  patientAuth,
  adminAuth,
  clearAuthCache
};

