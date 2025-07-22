const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
    },
    role: {
      type: String,
      enum: ["doctor", "patient", "admin"],
      required: true,
      default: "patient",
    },
    img_url: { type: String },
    phone: {
      type: String,
      validate: (value) => {
        if (!validator.isMobilePhone(value)) throw new Error("Invalid phone number");
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving it
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

// Create JWT token
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET , {
    expiresIn: "1d",
  });
  return token;
};

// Validate password
userSchema.methods.validatePassword = async function (passwordByUser) {
  const user = this;
  const isMatch = await bcrypt.compare(passwordByUser, user.password);
  return isMatch;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);