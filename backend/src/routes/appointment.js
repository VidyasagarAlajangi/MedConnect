const express = require("express");
const Appointment = require("../models/Appointment");
const Patient = require("../models/patient");
const Doctor = require("../models/Doctor");
const { patientAuth, doctorAuth, isAuthenticated } = require("../middleware/Authentication");
const { emitAppointmentStatus, emitNotification } = require("../sockets/socketManager");
const mongoose = require("mongoose");
const upload = require("../utils/fileUpload");

const router = express.Router();

const convertTo12Hour = (time24h) => {
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12.toString().padStart(2, '0')}:${minutes} ${period}`;
};

const convertTo24HourObj = (timeStr) => {
  if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
    return timeStr; 
  }
  const [time, modifier] = timeStr.trim().split(" ");
  let [hours, minutes] = time.split(":");
  
  if (modifier === "PM" && hours !== "12") {
    hours = String(parseInt(hours, 10) + 12);
  }
  if (modifier === "AM" && hours === "12") {
    hours = "00";
  }
  
  return `${hours.padStart(2, '0')}:${minutes}`;
};

const emitStatus = (req, appointmentId, status, extra = {}) => {
  const io = req.app.get('io');
  if (io) emitAppointmentStatus(io, appointmentId.toString(), status, extra);
};

router.get("/my-appointments", isAuthenticated, patientAuth, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const { date } = req.query;
    let query = { patient: patient._id };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
        select: "name specialization user",
      })
      .sort({ date: -1, time: 1 });

    const transformedAppointments = appointments.map((appointment) => ({
      _id: appointment._id,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      meetingId: appointment.meetingId,
      videoCallStatus: appointment.videoCallStatus,
      prescription: appointment.prescription,
      notes: appointment.notes,
      completedAt: appointment.completedAt,
      doctor: appointment.doctor
        ? {
            _id: appointment.doctor._id,
            name: appointment.doctor.user?.name || "Unknown Doctor",
            specialization: appointment.doctor.specialization || "",
            email: appointment.doctor.user?.email || "",
          }
        : null,
    }));

    res.json({ success: true, data: transformedAppointments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch appointments", error: error.message });
  }
});

router.get("/doctor-appointments", isAuthenticated, doctorAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const { date } = req.query;
    let query = { doctor: doctor._id };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email phone" },
      })
      .sort({ date: -1, time: 1 });

    const transformedAppointments = appointments.map((appointment) => ({
      _id: appointment._id,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      meetingId: appointment.meetingId,
      videoCallStatus: appointment.videoCallStatus,
      patient: appointment.patient
        ? {
            _id: appointment.patient._id,
            name: appointment.patient.user?.name || "Unknown Patient",
            email: appointment.patient.user?.email || "",
            phone: appointment.patient.user?.phone || "",
          }
        : null,
    }));

    res.json({ success: true, data: transformedAppointments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch appointments", error: error.message });
  }
});

router.put("/cancel/:appointmentId", isAuthenticated, patientAuth, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.appointmentId)) {
      return res.status(400).json({ success: false, message: "Invalid appointment ID" });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.appointmentId, patient: patient._id, status: { $in: ["pending", "confirmed"] } },
      { status: "cancelled" },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found or cannot be cancelled" });
    }

    const doctor = await Doctor.findById(appointment.doctor);
    if (doctor) {
      const appointmentDate = appointment.date.toISOString().split('T')[0];
      const time12Hour = convertTo12Hour(appointment.time);
      const slotIndex = doctor.availableSlots.findIndex((slot) => slot.date === appointmentDate);
      if (slotIndex !== -1 && !doctor.availableSlots[slotIndex].slots.includes(time12Hour)) {
        doctor.availableSlots[slotIndex].slots.push(time12Hour);
        await doctor.save();
      }
    }

    emitStatus(req, appointment._id, 'cancelled', { cancelledBy: 'patient' });

    res.json({ success: true, message: "Appointment cancelled successfully", data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/confirm/:appointmentId", isAuthenticated, doctorAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (!mongoose.Types.ObjectId.isValid(req.params.appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.appointmentId, doctor: doctor._id, status: "pending" },
      { status: "confirmed" },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found or cannot be confirmed" });
    }

    emitStatus(req, appointment._id, 'confirmed', {
      doctorName: req.user.name,
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
    });

    res.json({ success: true, message: "Appointment confirmed successfully", data: appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/doctor-cancel/:appointmentId", isAuthenticated, doctorAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.appointmentId, doctor: doctor._id, status: { $nin: ["rejected", "completed"] } },
      { status: "rejected" },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ message: "Appointment not found or cannot be cancelled" });

    emitStatus(req, appointment._id, 'rejected', { cancelledBy: 'doctor' });

    res.json({ success: true, message: "Appointment cancelled successfully", data: appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/book", isAuthenticated, patientAuth, async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const userId = req.user.id;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD." });
    }

    if (!time || !/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ success: false, message: "Invalid time format. Use HH:MM." });
    }

    const appointmentDate = new Date(date);
    const today = new Date();
    
    const apptDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (apptDateOnly < todayDateOnly) {
      return res.status(400).json({ success: false, message: "Cannot book appointments for past dates." });
    }

    const [hours, minutes] = time.split(':');
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const patient = await Patient.findOne({ user: userId });
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    const time12Hour = convertTo12Hour(time);
    const time24Hour = time;
    let matchedSlotTime = null;

    const isSlotAvailable = doctor.availableSlots.some(
      (slot) => {
        if (slot.date === date) {
          const found = slot.slots.find(t => {
            const t24 = convertTo24HourObj(t);
            return t24 === time24Hour || t === time12Hour || t === time;
          });
          if (found) {
            matchedSlotTime = found;
            return true;
          }
        }
        return false;
      }
    );

    if (!isSlotAvailable) {
      return res.status(400).json({ success: false, message: "Selected slot is not available" });
    }

    const appointment = new Appointment({
      patient: patient._id,
      doctor: doctor._id,
      date: appointmentDate,
      time,
      status: "pending",
    });

    await appointment.save();

    doctor.availableSlots = doctor.availableSlots.map((slot) => {
      if (slot.date === date) {
        return { ...slot, slots: slot.slots.filter((t) => t !== matchedSlotTime) };
      }
      return slot;
    });
    await doctor.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({ path: 'doctor', select: 'name user', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'patient', select: 'name user', populate: { path: 'user', select: 'name email' } });

    const io = req.app.get('io');
    if (io) {
      io.emit('appointment:new', {
        appointmentId: appointment._id,
        doctorId: doctor._id,
        patientName: req.user.name,
        date,
        time,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(201).json({ success: true, message: "Appointment booked successfully", data: populatedAppointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/:appointmentId/prescription", isAuthenticated, doctorAuth, upload.single('prescription'), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ success: false, message: "Invalid appointment ID" });
    }

    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    const appointment = await Appointment.findOne({ _id: appointmentId, doctor: doctor._id });
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    let prescriptionUrl = appointment.prescription;

    if (req.file) {
      prescriptionUrl = req.file.path;
    }

    appointment.status = "completed";
    appointment.notes = notes || appointment.notes;
    appointment.prescription = prescriptionUrl;
    appointment.completedAt = new Date();
    appointment.videoCallStatus = "inactive";
    await appointment.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`appointment:${appointmentId}`).emit('appointment:prescriptionUploaded', {
        appointmentId,
        prescriptionUrl,
        notes: appointment.notes,
        timestamp: new Date().toISOString(),
      });
      io.to(`appointment:${appointmentId}`).emit('appointment:statusChanged', {
        appointmentId,
        status: 'completed',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: "Prescription uploaded successfully",
      data: { prescriptionUrl, notes: appointment.notes, status: appointment.status }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;