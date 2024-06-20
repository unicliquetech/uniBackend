const Vendor = require('../models/vendorModel');
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
  console.log('Business Name:', vendorBusinessName);
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
  const { rating, comment } = req.body;
  // const userId = req.user._id;
  const userId = req.user._id;

  try {
    const vendor = await Vendor.findOne({ businessName: { $regex: new RegExp(`^${businessName}\\s*$`, 'i') } });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const review = new Review({ vendorName, rating, comment, user: userId });
    vendor.reviews.push(review);

    // Update the rating and numReviews for the vendor
    const totalReviews = vendor.reviews.length;
    const totalRating = vendor.reviews.reduce((acc, review) => acc + review.rating, 0);
    vendor.rating = totalRating / totalReviews;
    vendor.numReviews = totalReviews;

    await review.save();
    await vendor.save();

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err) {
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
const authenticateToken = async(req, res, next) => {
  // const authHeader = req.headers['authorization'];
  const token = req.body.token;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
}

module.exports = {
  getVendorProfile,
  fetchVendorData,
  submitReview,
  updateReview,
  deleteReview,
  authenticateToken,
}
