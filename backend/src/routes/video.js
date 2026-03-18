const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/patient");
const { isAuthenticated } = require("../middleware/Authentication");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const axios = require("axios");
const upload = require("../utils/fileUpload");

/**
 * Create a real VideoSDK room via their API and return the roomId.
 * VideoSDK requires rooms to be created through their API — a random UUID will 404.
 */
async function createVideoSDKRoom() {
  const token = generateVideoSDKToken();
  const response = await axios.post(
    "https://api.videosdk.live/v2/rooms",
    {},
    { headers: { Authorization: token, "Content-Type": "application/json" } }
  );
  return response.data.roomId;
}

const VIDEOSDK_API_KEY = process.env.VIDEOSDK_API_KEY || "e08760ac-338d-4e95-8685-e1a90eab65cd";
const VIDEOSDK_SECRET = process.env.VIDEOSDK_SECRET_KEY || "85e071889b095ef8768ae68632ea5aed4c444fcc4965db37d4caef97c9dc6913";

/**
 * Generate a fresh VideoSDK JWT token.
 * VideoSDK tokens are standard HS256 JWTs signed with the secret key.
 * Each token is valid for 24 hours.
 */
function generateVideoSDKToken() {
  const payload = {
    apikey: VIDEOSDK_API_KEY,
    permissions: ["allow_join", "allow_mod"],
    version: 2,
    roomId: undefined, // undefined means valid for any room
  };
  return jwt.sign(payload, VIDEOSDK_SECRET, {
    algorithm: "HS256",
    expiresIn: "24h",
    jwtid: uuidv4(),
  });
}

// Get VideoSDK token (always fresh)
router.get("/token", isAuthenticated, async (req, res) => {
  try {
    const token = generateVideoSDKToken();
    res.json({ token });
  } catch (error) {
    console.error("Error generating VideoSDK token:", error);
    res.status(500).json({ message: "Failed to get video call token" });
  }
});


// Patient join video call (read-only — just fetches token + meetingId)
router.get("/appointment/:appointmentId/join", isAuthenticated, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "confirmed") {
      return res.status(400).json({ message: "Appointment is not confirmed" });
    }

    if (!appointment.meetingId) {
      return res.status(400).json({ message: "Video call has not been started yet. Please wait for the doctor." });
    }

    // Verify patient is authorised
    let isAuthorized = false;
    if (userRole === "patient") {
      const userDoc = await Patient.findOne({ user: userId });
      isAuthorized = userDoc && userDoc._id.toString() === appointment.patient.toString();
    } else if (userRole === "doctor") {
      const userDoc = await Doctor.findOne({ user: userId });
      isAuthorized = userDoc && userDoc._id.toString() === appointment.doctor.toString();
    } else if (userRole === "admin") {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized to join this video call" });
    }

    res.json({ meetingId: appointment.meetingId, token: generateVideoSDKToken() });
  } catch (error) {
    console.error("Error joining video call:", error);
    res.status(500).json({ message: "Failed to join video call", error: error.message });
  }
});

// Start video call
router.post("/appointment/:appointmentId/start", isAuthenticated, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log("Starting video call for appointment:", {
      appointmentId,
      userId,
      userRole
    });

    // Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      console.log("Invalid appointment ID:", appointmentId);
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    // Find appointment without population first
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      console.log("Appointment not found:", appointmentId);
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Log raw appointment data
    console.log("Raw appointment data:", {
      id: appointment._id,
      doctorId: appointment.doctor,
      patientId: appointment.patient,
      status: appointment.status,
      videoCallStatus: appointment.videoCallStatus
    });

    // Check if appointment is confirmed
    if (appointment.status !== "confirmed") {
      console.log("Appointment not confirmed:", {
        currentStatus: appointment.status,
        requiredStatus: "confirmed"
      });
      return res.status(400).json({ message: "Appointment is not confirmed" });
    }

    // Find the patient or doctor document based on user role
    let isAuthorized = false;
    let userDoc = null;

    if (userRole === "patient") {
      userDoc = await Patient.findOne({ user: userId });
      isAuthorized = userDoc && userDoc._id.toString() === appointment.patient.toString();
    } else if (userRole === "doctor") {
      userDoc = await Doctor.findOne({ user: userId });
      isAuthorized = userDoc && userDoc._id.toString() === appointment.doctor.toString();
    } else if (userRole === "admin") {
      isAuthorized = true;
    }

    // Log authorization check details
    console.log("Authorization check details:", {
      userRole,
      userId,
      userDocId: userDoc?._id?.toString(),
      doctorId: appointment.doctor?.toString(),
      patientId: appointment.patient?.toString(),
      isAuthorized
    });

    if (!isAuthorized) {
      console.log("Authorization failed:", {
        userRole,
        userId,
        doctorId: appointment.doctor?.toString(),
        patientId: appointment.patient?.toString(),
        reason: "User ID does not match doctor or patient ID"
      });
      return res.status(403).json({
        message: "Not authorized to start this video call",
        details: {
          userRole,
          userId,
          doctorId: appointment.doctor?.toString(),
          patientId: appointment.patient?.toString()
        }
      });
    }

    // Always create a fresh VideoSDK room to ensure the room is active
    // (old rooms may expire on VideoSDK servers)
    console.log("Creating fresh VideoSDK room via API...");
    appointment.meetingId = await createVideoSDKRoom();
    appointment.videoCallStatus = "active";
    await appointment.save();
    console.log("VideoSDK room created:", appointment.meetingId);

    // Emit video:call:incoming via socket to notify patient
    const io = req.app.get('io');
    if (io) {
      io.to(`appointment:${appointment._id}`).emit('video:call:incoming', {
        appointmentId: appointment._id,
        meetingId: appointment.meetingId,
        doctorName: req.user.name,
        timestamp: new Date().toISOString(),
      });
    }

    // Now populate the appointment for the response
    const populatedAppointment = await Appointment.findById(appointmentId)
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" }
      })
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email" }
      });

    console.log("Sending response with meeting data:", {
      meetingId: appointment.meetingId,
      doctor: populatedAppointment.doctor,
      patient: populatedAppointment.patient
    });

    res.json({
      meetingId: appointment.meetingId,
      doctor: populatedAppointment.doctor,
      patient: populatedAppointment.patient
    });
  } catch (error) {
    console.error("Error starting video call:", error);
    res.status(500).json({
      message: "Failed to start video call",
      error: error.message
    });
  }
});

// End video call
router.post("/appointment/:appointmentId/end", isAuthenticated, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log("Ending video call:", {
      appointmentId,
      userId,
      userRole
    });

    // Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      console.log("Invalid appointment ID:", appointmentId);
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    // Find appointment without population first
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      console.log("Appointment not found:", appointmentId);
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Find the patient or doctor document based on user role
    let isAuthorized = false;
    let userDoc = null;

    if (userRole === "patient") {
      userDoc = await Patient.findOne({ user: userId });
      isAuthorized = userDoc && userDoc._id.toString() === appointment.patient.toString();
    } else if (userRole === "doctor") {
      userDoc = await Doctor.findOne({ user: userId });
      isAuthorized = userDoc && userDoc._id.toString() === appointment.doctor.toString();
    } else if (userRole === "admin") {
      isAuthorized = true;
    }

    // Log authorization check details
    console.log("Authorization check details:", {
      userRole,
      userId,
      userDocId: userDoc?._id?.toString(),
      doctorId: appointment.doctor?.toString(),
      patientId: appointment.patient?.toString(),
      isAuthorized
    });

    if (!isAuthorized) {
      console.log("Authorization failed:", {
        userRole,
        userId,
        doctorId: appointment.doctor?.toString(),
        patientId: appointment.patient?.toString(),
        reason: "User ID does not match doctor or patient ID"
      });
      return res.status(403).json({
        message: "Not authorized to end this video call",
        details: {
          userRole,
          userId,
          doctorId: appointment.doctor?.toString(),
          patientId: appointment.patient?.toString()
        }
      });
    }

    appointment.videoCallStatus = "inactive";
    await appointment.save();
    console.log("Video call ended successfully");

    res.json({ message: "Video call ended successfully" });
  } catch (error) {
    console.error("Error ending video call:", error);
    res.status(500).json({
      message: "Failed to end video call",
      error: error.message
    });
  }
});

// Complete appointment with prescription and notes
router.post("/appointment/:appointmentId/complete", isAuthenticated, upload.single('prescription'), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log("Completing appointment:", {
      appointmentId,
      userId,
      userRole,
      notes
    });

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      console.log("Appointment not found:", appointmentId);
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only doctor can complete the appointment
    if (userRole !== "doctor") {
      console.log("Only doctor can complete appointment");
      return res.status(403).json({ message: "Only doctor can complete appointment" });
    }

    // Verify doctor is authorized
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor || doctor._id.toString() !== appointment.doctor.toString()) {
      console.log("Doctor not authorized");
      return res.status(403).json({ message: "Not authorized to complete this appointment" });
    }

    // Handle prescription file upload if present via Multer
    let prescriptionUrl = appointment.prescription;
    if (req.file) {
      prescriptionUrl = req.file.path;
    }

    // Update appointment
    appointment.status = "completed";
    appointment.notes = notes;
    appointment.prescription = prescriptionUrl;
    appointment.completedAt = new Date();
    appointment.videoCallStatus = "inactive";
    await appointment.save();

    // Populate appointment for response
    const populatedAppointment = await Appointment.findById(appointmentId)
      .populate("doctor", "name email")
      .populate("patient", "name email");

    console.log("Appointment completed successfully:", {
      appointmentId,
      status: appointment.status,
      prescription: prescriptionUrl
    });

    res.json({
      message: "Appointment completed successfully",
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).json({
      message: "Failed to complete appointment",
      error: error.message
    });
  }
});

module.exports = router; 