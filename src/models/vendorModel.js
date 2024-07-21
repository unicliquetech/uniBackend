const mongoose = require("mongoose");
const Review = require('../models/reviewModel');

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
  location: {
    type: String,
    required: true,
  },
  openingHours: {
    type: String,
    required: true,
  },
  closingHours: {
    type: String,
    required: true,
  },
  bank: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  accountName: {
    type: String,
    required: true,
  },
  university: {
    type: String,
  },
  department: {
    true: String,
  },
  matricNumber: {},
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
  role: {
    type: String,
  },
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5,
    set: v => Math.round(v * 100) / 100 
  },
  numReviews: { 
    type: Number, 
    default: 0 
  },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
