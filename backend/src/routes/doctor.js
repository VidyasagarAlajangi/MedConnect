const express = require("express");
const doctorrouter = express.Router();
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const { isAuthenticated, doctorAuth } = require("../middleware/Authentication");

doctorrouter.get("/", async (req, res) => {
  try {
    const {
      specialization,
      name,
      minExperience,
      maxExperience,
      minRating,
      isActive,
      sortBy,
    } = req.query;

    const filter = { isActive: true }; 

    if (specialization) {
      filter.specialization = { 
        $regex: new RegExp(specialization.replace(/\s+/g, '\\s*'), 'i') 
      };
    }

    if (name) {
      filter.name = { $regex: new RegExp(name, "i") };
    }

    if (minExperience || maxExperience) {
      filter.experience = {};
      if (minExperience) filter.experience.$gte = Number(minExperience);
      if (maxExperience) filter.experience.$lte = Number(maxExperience);
    }

    if (minRating) {
      filter.Rating = { $gte: Number(minRating) };
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    let sort = {};
    if (sortBy) {
      switch (sortBy) {
        case "experience-high":
          sort = { experience: -1 };
          break;
        case "experience-low":
          sort = { experience: 1 };
          break;
        case "rating-high":
          sort = { Rating: -1 };
          break;
        case "rating-low":
          sort = { Rating: 1 };
          break;
        case "name-asc":
          sort = { name: 1 };
          break;
        case "name-desc":
          sort = { name: -1 };
          break;
        default:
          sort = { Rating: -1 };
      }
    } else {
      sort = { Rating: -1 };
    }

    const doctors = await Doctor.find(filter)
      .select('name specialization experience address Rating img_url availableSlots About')
      .sort(sort);

    const formattedDoctors = doctors.map(doctor => ({
      _id: doctor._id,
      name: doctor.name || 'Dr. Unknown',
      specialization: doctor.specialization || 'General Physician',
      experience: doctor.experience || 0,
      address: doctor.address || 'Address not available',
      Rating: doctor.Rating || 0,
      img_url: doctor.img_url || 'https://www.shutterstock.com/image-vector/male-doctor-smiling-happy-face-600nw-2481032615.jpg',
      availableSlots: doctor.availableSlots || [],
      About: doctor.About || 'No description available'
    }));

    res.json({
      success: true,
      count: formattedDoctors.length,
      data: formattedDoctors
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch doctors",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

doctorrouter.get("/get-doctor-profile", isAuthenticated, doctorAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id })
      .populate("user", "name email phone")
      .select('-__v');
      
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        message: "Doctor not found" 
      });
    }

    res.json({ 
      success: true, 
      data: doctor 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

doctorrouter.get("/my-appointments", isAuthenticated, doctorAuth, async (req, res) => {
  try {
    
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        message: "Doctor not found" 
      });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email phone" }
      })
      .sort({ date: -1 });


    res.set('Cache-Control', 'private, max-age=300'); 
    res.set('ETag', `"${doctor._id}-${appointments.length}"`);

    res.json({ 
      success: true, 
      data: appointments,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch appointments" 
    });
  }
});

doctorrouter.get("/my-patients", isAuthenticated, doctorAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        message: "Doctor not found" 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const appointmentQuery = { doctor: doctor._id };
    
    const appointments = await Appointment.find(appointmentQuery)
      .populate({
        path: "patient",
        populate: { 
          path: "user", 
          select: "name email",
          match: search ? {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } }
            ]
          } : {}
        }
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalAppointments = await Appointment.countDocuments(appointmentQuery);

    const validAppointments = appointments.filter(app => app.patient && app.patient.user);

    const uniquePatients = {};
    validAppointments.forEach(app => {
      if (app.patient && app.patient._id) {
        uniquePatients[app.patient._id] = app.patient;
      }
    });

    res.json({ 
      success: true, 
      patients: Object.values(uniquePatients),
      total: totalAppointments,
      page,
      totalPages: Math.ceil(totalAppointments / limit)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch patients",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

doctorrouter.get("/:id", async (req, res) => {
  try {
    const doctorId = req.params.id;
    
    if (!doctorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID format"
      });
    }

    const doctor = await Doctor.findById(doctorId)
      .populate('user', 'name email')
      .select('-appointments');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

doctorrouter.put("/update-availability", isAuthenticated, doctorAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.availableSlots = req.body.availability;
    await doctor.save();

    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

doctorrouter.patch("/update-address", isAuthenticated, doctorAuth, async (req, res) => {
  try {
    const { address } = req.body;
    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.address = address;
    await doctor.save();

    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

doctorrouter.put("/update-profile", isAuthenticated, doctorAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const fields = ["name", "specialization", "experience", "address", "licenseNumber"];
    fields.forEach(field => {
      if (req.body[field] !== undefined) doctor[field] = req.body[field];
    });

    await doctor.save();
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

doctorrouter.put("/confirm-appointment/:id", isAuthenticated, doctorAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    appointment.status = "confirmed";
    await appointment.save();
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

doctorrouter.put("/cancel-appointment/:id", isAuthenticated, doctorAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    appointment.status = "cancelled";
    await appointment.save();
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = doctorrouter;
