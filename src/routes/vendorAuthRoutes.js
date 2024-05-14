const express = require('express');
const router = express.Router();
const {
  vendorRegister,
    verifyEmail,
    vendorLogin,
    resetPassword,
    updatePassword,
    resendOTP,
    logoutVendor
} = require('../controllers/vendorAuthController');

const rateLimit = require('express-rate-limit');

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Apply rate limiter to all requests
router.use(limiter);

// Vendor signup
router.post('/register', vendorRegister);

// Resend OTP
router.post('/resend-otp', resendOTP);

// Verify email
router.post('/verify-email', verifyEmail);

// Vendor login
router.post('/login', vendorLogin);

// Reset password
router.post('/reset-password', resetPassword);

// Update password
router.put('/update-password', updatePassword);

// Logout vendor
router.post('/logout', logoutVendor);

module.exports = router;