const mongoose = require("mongoose");
const Vendor = require('../models/vendorModel');

const reviewSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: { type: String, required: true },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5,
    validate: {
      validator: function(v) {
        return Number.isInteger(v) && v >= 1 && v <= 5;
      },
      message: props => `${props.value} is not a valid rating! Must be an integer between 1 and 5.`
    }
  },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;