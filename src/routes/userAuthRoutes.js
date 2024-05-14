const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/userAuthController');
const {
  login,
  registerUser,
  verifyEmail,
  resendOTP,
  resetPasswordEmail,
  updatePassword,
  logoutUser,
} = require('../controllers/userAuthController');


// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Apply rate limiter to all requests
router.use(limiter);

// @route POST /auth/login
// @desc Authenticate a user and generate a JWT
// @access Public
router.post('/login', login);

// Route for verifying email
router.post('/verify-email', verifyEmail);

// Resend OTP POST Route
router.post('/resend-otp', resendOTP);

// @route POST /auth/register
// @desc Register a new user
// @access Public
router.post('/register', registerUser);

// @route POST /auth/logout
// @desc Logout a user
// @access Private
router.post('/logout', logoutUser);

// @route POST /auth/reset-password
// @desc Send a password reset email
// @access Public
// Reset Password Email Route
router.post('/reset-password-email', resetPasswordEmail);



// @route POST /auth/update-password
// @desc Update a user's password
// @access Public
router.post('/update-password', updatePassword);

module.exports = router;