const Vendor = require('../models/vendorModel');
const mongoose = require("mongoose");
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const jwt = require('jsonwebtoken');

const getVendorProfile = async (req, res) => {
  const vendorEmail = req.body.vendorEmail;
  // console.log("EMAIL RECEIVED:", vendorEmail);

  try {
    const vendor = await Vendor.findOne({ email: vendorEmail });
    // console.log(vendor);

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const vendorId = vendor._id;

    const products = await Product.find({ vendorId });
    const orders = await Order.find({ vendorId });
    // const name = vendor.ownerName;
    // const email = vendor.email;

    res.status(200).json({
      vendor,
      products,
      orders,
      // name,
      // email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};












// API endpoint to fetch vendor data with pagination
const fetchVendorData = async (req, res) => {
  const vendorBusinessName = req.params.businessName;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const vendor = await Vendor.findOne(
      { businessName: { $regex: new RegExp(`^${vendorBusinessName}\\s*$`, 'i') } },
      { reviews: { $slice: [skip, limit] } } // Specify the slice option to limit the reviews
    )
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          model: 'User',
          select: 'email',
        },
      });

    if (!vendor) {
      console.log(vendor);
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const vendorId = vendor._id;

    const products = await Product.find({ vendorId });

    res.json({
      vendor,
      products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// API endpoint to submit a review
const submitReview = async (req, res) => {
  const businessName = req.params.businessName;
  const { rating, comment, userId } = req.body;

  

  try {
    const numericRating = Number(rating);

    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Invalid rating. Must be a number between 1 and 5.' });
    }

    const vendor = await Vendor.findOne({ businessName: { $regex: new RegExp(`^${businessName}\\s*$`, 'i') } });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const vendorId = vendor._id;

    const user = await User.findById(userId);
    const userName = user.firstName;


    const review = new Review({ vendorId, rating: numericRating, comment, user: userId, userName });
    console.log('New review:', review);

    // Save the review first
    await review.save();
    console.log('Review saved successfully');

    // Now update the vendor
    vendor.reviews.push(review._id);

    // vendor.reviews.push(review);

    // Update the rating and numReviews for the vendor
    const totalReviews = vendor.reviews.length;
    const totalRating = (vendor.rating * (totalReviews - 1) + numericRating) || 0;
    vendor.rating = totalRating / totalReviews;
    vendor.numReviews = totalReviews;

    console.log('Updated vendor before save:', {
      rating: vendor.rating,
      numReviews: vendor.numReviews,
      totalRating,
      totalReviews
    });

    // Use findOneAndUpdate instead of save to bypass schema validation
    const updatedVendor = await Vendor.findOneAndUpdate(
      { _id: vendor._id },
      { 
        $set: { 
          rating: vendor.rating,
          numReviews: vendor.numReviews
        },
        $push: { reviews: review._id }
      },
      { new: true, runValidators: true }
    );


    console.log('Vendor updated successfully:', updatedVendor);
    console.log('Updated vendor:', vendor);

    
    await vendor.save();

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// API endpoint to update a review
const updateReview = async (req, res) => {
  const vendorName = req.params.vendorName;
  const reviewId = req.params.reviewId;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  try {
    const vendor = await Vendor.findOne({ vendorName });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const review = vendor.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user is authorized to update the review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this review' });
    }

    review.rating = rating;
    review.comment = comment;

    // Update the rating for the vendor
    const totalReviews = vendor.reviews.length;
    const totalRating = vendor.reviews.reduce((acc, review) => acc + review.rating, 0 - review.rating);
    vendor.rating = (totalRating + rating) / totalReviews;

    await vendor.save();

    res.json({ message: 'Review updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// API endpoint to delete a review
const deleteReview = async (req, res) => {
  const vendorName = req.params.vendorName;
  const reviewId = req.params.reviewId;
  const userId = req.user._id;

  try {
    const vendor = await Vendor.findOne({ vendorName });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const review = vendor.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user is authorized to delete the review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this review' });
    }

    // Remove the review from the vendor's reviews array
    vendor.reviews.pull(reviewId);

    // Update the rating and numReviews for the vendor
    const totalReviews = vendor.reviews.length;
    const totalRating = vendor.reviews.reduce((acc, review) => acc + review.rating, 0);
    vendor.rating = totalReviews > 0 ? totalRating / totalReviews : 0;
    vendor.numReviews = totalReviews;

    await vendor.save();

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Middleware function to authenticate the user
const authenticateUser = async (req, res, next) => {
  const email = req.body.email;

  if (!email) {
    return res.status(401).json({ message: 'Access denied. No email provided.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }

    req.userId = user._id; 

    return res.status(200).json({ message: 'Authentication successful', userId: user._id });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  getVendorProfile,
  fetchVendorData,
  submitReview,
  updateReview,
  deleteReview,
  authenticateUser,
}
