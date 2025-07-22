const express = require("express");
const Appointment = require("../models/Appointment");
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const { patientAuth, doctorAuth, isAuthenticated } = require("../middleware/Authentication");
const mongoose = require("mongoose");

const router = express.Router();

// 🔹 Patient views their appointments
router.get("/my-appointments", isAuthenticated, patientAuth, async (req, res) => {
  try {
    console.log("Fetching appointments for patient:", req.user.id);
    
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      console.log("Patient not found for user:", req.user.id);
      return res.status(404).json({ 
        success: false,
        message: "Patient not found" 
      });
    }

    // Get date filter from query params
    const { date } = req.query;
    let query = { patient: patient._id };

    // If date is provided, filter by date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Fetch appointments with populated doctor data
    const appointments = await Appointment.find(query)
      .populate({
        path: "doctor",
        populate: { 
          path: "user", 
          select: "name email" 
        },
        select: "name specialization user"
      })
      .sort({ date: -1, time: 1 });

    console.log(`Found ${appointments.length} appointments for patient`);

    // Transform the response to include only necessary data
    const transformedAppointments = appointments.map(appointment => ({
      _id: appointment._id,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      doctor: appointment.doctor ? {
        _id: appointment.doctor._id,
        name: appointment.doctor.user?.name || "Unknown Doctor",
        specialization: appointment.doctor.specialization || "",
        email: appointment.doctor.user?.email || ""
      } : null
    }));

    res.json({ 
      success: true, 
      data: transformedAppointments 
    });
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch appointments",
      error: error.message 
    });
  }
});

// 🔹 Doctor views their appointments
router.get("/doctor-appointments", isAuthenticated, doctorAuth, async (req, res) => {
  try {
    console.log("Fetching appointments for doctor:", req.user.id);
    
    // First verify the doctor exists
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      console.log("Doctor not found for user:", req.user.id);
      return res.status(404).json({ 
        success: false,
        message: "Doctor not found" 
      });
    }

    // Get date filter from query params
    const { date } = req.query;
    let query = { doctor: doctor._id };

    // If date is provided, filter by date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Fetch appointments with populated patient data
    const appointments = await Appointment.find(query)
      .populate({
        path: "patient",
        populate: { 
          path: "user", 
          select: "name email phone" 
        }
      })
      .sort({ date: -1, time: 1 });

    console.log(`Found ${appointments.length} appointments for doctor`);

    // Transform the response to include only necessary data
    const transformedAppointments = appointments.map(appointment => ({
      _id: appointment._id,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      patient: appointment.patient ? {
        _id: appointment.patient._id,
        name: appointment.patient.user?.name || "Unknown Patient",
        email: appointment.patient.user?.email || "",
        phone: appointment.patient.user?.phone || ""
      } : null
    }));

    res.json({ 
      success: true, 
      data: transformedAppointments 
    });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch appointments",
      error: error.message 
    });
  }
});

// 🔹 Patient cancels an appointment (only if it's pending or confirmed)
router.put("/cancel/:appointmentId", patientAuth, async (req, res) => {
  try {
    // First find the patient using the user ID
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: "Patient not found" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.appointmentId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid appointment ID" 
      });
    }

    // Find and update the appointment
    const appointment = await Appointment.findOneAndUpdate(
      { 
        _id: req.params.appointmentId, 
        patient: patient._id,  // Use patient._id instead of req.user.id
        status: { $in: ["pending", "confirmed"] }  // Allow cancellation of both pending and confirmed appointments
      },
      { status: "cancelled" },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: "Appointment not found or cannot be cancelled" 
      });
    }

    // If the appointment was cancelled, add the slot back to doctor's available slots
    const doctor = await Doctor.findById(appointment.doctor);
    if (doctor) {
      const appointmentDate = appointment.date.toISOString().split('T')[0];
      const time12Hour = convertTo12Hour(appointment.time);

      // Find the slot in doctor's availableSlots
      const slotIndex = doctor.availableSlots.findIndex(slot => slot.date === appointmentDate);
      
      if (slotIndex !== -1) {
        // Add the time back to the slots array if it doesn't exist
        if (!doctor.availableSlots[slotIndex].slots.includes(time12Hour)) {
          doctor.availableSlots[slotIndex].slots.push(time12Hour);
          await doctor.save();
        }
      }
    }

    res.json({ 
      success: true,
      message: "Appointment cancelled successfully", 
      data: appointment 
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// 🔹 Doctor confirms an appointment
router.patch("/confirm/:appointmentId", isAuthenticated, doctorAuth, async (req, res) => {
  try {
    // First find the doctor using the user ID
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    // Check if appointment exists and belongs to the doctor
    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: req.params.appointmentId,
        doctor: doctor._id,
        status: "pending"  // Only confirm if currently pending
      },
      {
        status: "confirmed"
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found or cannot be confirmed" });
    }

    res.json({ message: "Appointment confirmed successfully", data: appointment });
  } catch (error) {
    console.error("Error confirming appointment:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🔹 Doctor cancels an appointment
router.put("/doctor-cancel/:appointmentId", isAuthenticated, doctorAuth, async (req, res) => {
  try {
    const doctorId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(req.params.appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.appointmentId, doctor: doctorId, status: { $nin: ["rejected", "completed"] } },
      { status: "rejected" },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ message: "Appointment not found or cannot be cancelled" });

    res.json({ message: "Appointment cancelled successfully", data: appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to convert 24-hour time to 12-hour format
const convertTo12Hour = (time24h) => {
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12.toString().padStart(2, '0')}:${minutes} ${period}`;
};

//book appointment
router.post(
  "/book",
  patientAuth,
  async (req, res) => {
    try {
      const { doctorId, date, time } = req.body;
      const userId = req.user.id;

      console.log('Booking request received:', { doctorId, date, time, userId });

      // Validate date format (YYYY-MM-DD)
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        console.error('Invalid date format:', date);
        return res.status(400).json({ 
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD." 
        });
      }

      // Validate time format (HH:MM)
      if (!time || !/^\d{2}:\d{2}$/.test(time)) {
        console.error('Invalid time format:', time);
        return res.status(400).json({ 
          success: false,
          message: "Invalid time format. Use HH:MM." 
        });
      }

      // Validate date is not in the past
      const appointmentDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Set the appointment time
      const [hours, minutes] = time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      console.log('Date validation:', {
        appointmentDate: appointmentDate.toISOString(),
        today: today.toISOString(),
        isPast: appointmentDate < today
      });

      if (appointmentDate < today) {
        console.error('Date is in the past:', {
          appointmentDate: appointmentDate.toISOString(),
          today: today.toISOString()
        });
        return res.status(400).json({ 
          success: false,
          message: "Cannot book appointments for past dates." 
        });
      }

      // Find the Patient document for this user
      const patient = await Patient.findOne({ user: userId });
      if (!patient) {
        console.error('Patient not found for user:', userId);
        return res.status(404).json({ 
          success: false,
          message: "Patient not found" 
        });
      }

      // Find the Doctor document
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        console.error('Doctor not found:', doctorId);
        return res.status(404).json({ 
          success: false,
          message: "Doctor not found" 
        });
      }

      // Convert time to 12-hour format for comparison with available slots
      const time12Hour = convertTo12Hour(time);
      console.log('Time format conversion:', {
        original: time,
        converted: time12Hour
      });

      // Check if the slot is available
      const isSlotAvailable = doctor.availableSlots.some(slot => 
        slot.date === date && slot.slots.includes(time12Hour)
      );

      if (!isSlotAvailable) {
        console.error('Slot not available:', { date, time, time12Hour });
        return res.status(400).json({ 
          success: false,
          message: "Selected slot is not available" 
        });
      }

      // Create a new appointment
      const appointment = new Appointment({
        patient: patient._id,
        doctor: doctor._id,
        date: appointmentDate,
        time,
        status: "pending",
      });

      await appointment.save();

      // Remove the booked slot from doctor's available slots
      const updatedSlots = doctor.availableSlots.map(slot => {
        if (slot.date === date) {
          return {
            ...slot,
            slots: slot.slots.filter(t => t !== time12Hour)
          };
        }
        return slot;
      });

      doctor.availableSlots = updatedSlots;
      await doctor.save();

      // Populate the appointment with doctor and patient details
      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate({
          path: 'doctor',
          select: 'name user',
          populate: {
            path: 'user',
            select: 'name email'
          }
        })
        .populate({
          path: 'patient',
          select: 'name user',
          populate: {
            path: 'user',
            select: 'name email'
          }
        });

      console.log("Appointment booked successfully:", populatedAppointment);

      res.status(201).json({ 
        success: true,
        message: "Appointment booked successfully", 
        data: populatedAppointment 
      });
    } catch (error) {
      console.error("Error booking appointment:", error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
);

module.exports = router;