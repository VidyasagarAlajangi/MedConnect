const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/patient');
const { isAuthenticated } = require('../middleware/Authentication');
const { emitAppointmentStatus } = require('../sockets/socketManager');
const mongoose = require('mongoose');

const verifyAppointmentAccess = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const userId = req.user._id.toString();
    const role = req.user.role;

    let authorized = role === 'admin';

    if (!authorized && role === 'patient') {
      const patient = await Patient.findOne({ user: userId });
      authorized = patient && appointment.patient.toString() === patient._id.toString();
    }

    if (!authorized && role === 'doctor') {
      const doctor = await Doctor.findOne({ user: userId });
      authorized = doctor && appointment.doctor.toString() === doctor._id.toString();
    }

    if (!authorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this appointment' });
    }

    req.appointment = appointment;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

router.get('/:appointmentId', isAuthenticated, verifyAppointmentAccess, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await Message.find({ appointmentId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    await Message.updateMany(
      { appointmentId, senderId: { $ne: req.user._id }, readAt: null },
      { $set: { readAt: new Date() } }
    );

    res.json({
      success: true,
      data: messages.reverse(), 
      page,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

router.post('/:appointmentId', isAuthenticated, verifyAppointmentAccess, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const message = new Message({
      appointmentId,
      senderId: req.user._id,
      senderRole: req.user.role,
      senderName: req.user.name,
      text: text.trim(),
    });

    await message.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`appointment:${appointmentId}`).emit('chat:message', {
        _id: message._id,
        appointmentId,
        senderId: req.user._id,
        senderRole: req.user.role,
        senderName: req.user.name,
        text: message.text,
        createdAt: message.createdAt,
      });
    }

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

module.exports = router;
