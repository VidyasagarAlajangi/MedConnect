const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; 

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const cachedUser = authCache.get(token);
    if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_TTL) {
      req.user = cachedUser.user;
      return next();
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server misconfigured: JWT_SECRET missing" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    authCache.set(token, {
      user,
      timestamp: Date.now()
    });

    req.user = user;
    next();
  } catch (error) {
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
    res.status(500).json({ message: "Server error" });
  }
};

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

