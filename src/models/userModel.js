const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
  },
  resetOtp: {
    type: Number,
  },
  otpExpires: {
    type: Date,
  },
  resetOtpExpires: {
    type: Date,
  },
});

module.exports = mongoose.model("User", UserSchema);
