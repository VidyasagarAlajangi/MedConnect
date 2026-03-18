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


async function createVideoSDKRoom() {
  const token = generateVideoSDKToken();
  const response = await axios.post(
    "https://api.videosdk.live/v2/rooms",
    {},
    { headers: { Authorization: token, "Content-Type": "application/json" } }
  );
  return response.data.roomId;
}

const VIDEOSDK_API_KEY = process.env.VIDEOSDK_API_KEY;
const VIDEOSDK_SECRET = process.env.VIDEOSDK_SECRET_KEY;


function generateVideoSDKToken() {
  if (!VIDEOSDK_API_KEY || !VIDEOSDK_SECRET) {
    throw new Error("Video service not configured. Missing VIDEOSDK_API_KEY / VIDEOSDK_SECRET_KEY.");
  }
  const payload = {
    apikey: VIDEOSDK_API_KEY,
    permissions: ["allow_join", "allow_mod"],
    version: 2,
    roomId: undefined, 
  };
  return jwt.sign(payload, VIDEOSDK_SECRET, {
    algorithm: "HS256",
    expiresIn: "24h",
    jwtid: uuidv4(),
  });
}

router.get("/token", isAuthenticated, async (req, res) => {
  try {
    const token = generateVideoSDKToken();
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Failed to get video call token" });
  }
});


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
    res.status(500).json({ message: "Failed to join video call", error: error.message });
  }
});

router.post("/appointment/:appointmentId/start", isAuthenticated, async (req, res) => {
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

     

    if (!isAuthorized) {
        
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

    appointment.meetingId = await createVideoSDKRoom();
    appointment.videoCallStatus = "active";
    await appointment.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`appointment:${appointment._id}`).emit('video:call:incoming', {
        appointmentId: appointment._id,
        meetingId: appointment.meetingId,
        doctorName: req.user.name,
        timestamp: new Date().toISOString(),
      });
    }

    const populatedAppointment = await Appointment.findById(appointmentId)
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" }
      })
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email" }
      });


    res.json({
      meetingId: appointment.meetingId,
      doctor: populatedAppointment.doctor,
      patient: populatedAppointment.patient
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to start video call",
      error: error.message
    });
  }
});

router.post("/appointment/:appointmentId/end", isAuthenticated, async (req, res) => {
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

     

    if (!isAuthorized) {
        
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

    res.json({ message: "Video call ended successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to end video call",
      error: error.message
    });
  }
});

router.post("/appointment/:appointmentId/complete", isAuthenticated, upload.single('prescription'), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;


    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (userRole !== "doctor") {
      return res.status(403).json({ message: "Only doctor can complete appointment" });
    }

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor || doctor._id.toString() !== appointment.doctor.toString()) {
      return res.status(403).json({ message: "Not authorized to complete this appointment" });
    }

    let prescriptionUrl = appointment.prescription;
    if (req.file) {
      prescriptionUrl = req.file.path;
    }

    appointment.status = "completed";
    appointment.notes = notes;
    appointment.prescription = prescriptionUrl;
    appointment.completedAt = new Date();
    appointment.videoCallStatus = "inactive";
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointmentId)
      .populate("doctor", "name email")
      .populate("patient", "name email");


    res.json({
      message: "Appointment completed successfully",
      appointment: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to complete appointment",
      error: error.message
    });
  }
});

module.exports = router; 