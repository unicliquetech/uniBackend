const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
  },
  businessDescription: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  businessType: {
    type: String,
    required: true,
  },
  businessCategory: {
    type: String,
    required: true,
  },
  university: {
    type: String,
  },
  department: {
    true: String,
  },
  matricNumber: {
  },
  dateOfBirth: {
    true: Date,
  },
  sex: {
    true: String,
  },
  yearOfEntry: {
    true: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  resetOtp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
});

module.exports = mongoose.model("Vendor", vendorSchema);
