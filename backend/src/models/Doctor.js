const mongoose = require("mongoose");
const validator = require("validator");

let Doctor; 

try {
  Doctor = mongoose.model('Doctor'); 
} catch (e) {
  if (e.name === 'MissingSchemaError') {
  
    const doctorSchema = new mongoose.Schema({
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
      },
      name: { type: String, required: true },
      specialization: { type: String, required: true },
      experience: { type: Number, required: true },
      address: { type: String, required: true },
      licenseNumber: { type: String },
      photo: { type: String }, 
      availableSlots: [{
        date: String,
        slots: [String]
      }],
      isActive: { type: Boolean, default: true },
      About: { type: String },
      Rating: { type: Number, default: 0 },
      img_url: {
        type: String,
        default: "https://www.shutterstock.com/image-vector/male-doctor-smiling-happy-face-600nw-2481032615.jpg"
      }
    }, { timestamps: true });

    Doctor = mongoose.model("Doctor", doctorSchema);
  } else {
    throw e; 
  }
}

module.exports = Doctor;