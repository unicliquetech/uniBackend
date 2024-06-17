const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    vendorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  });

module.exports = mongoose.model("Review", reviewSchema);