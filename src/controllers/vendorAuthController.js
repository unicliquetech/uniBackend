const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Vendor = require('../models/vendorModel');
const nodemailer = require('nodemailer');
const { validateEmail } = require('../utils/vendorValidators');

// Send verification email
const sendVerificationEmail = async (email, businessName, ownerName, otp) => {
  try {
    // Configure email transport settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Email Verification',
      html: `<p>Dear ${ownerName},</p>
             <p>Your OTP to verify your email address for ${businessName} is:${otp}"</p>`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

// Vendor signup
const vendorRegister = async (req, res) => {
  try {
    const {
      ownerName,
        businessName,
        businessDescription,
        businessType,
        businessCategory,
        location,
        email,
        phoneNumber,
        university,
        department,
        matricNumber,
        sex,
        yearOfEntry,
        dateOfBirth,
        password,
        confirmPassword,
    } = req.body;

    // Validate the email
    const isValidEmail = validateEmail(email);
    if (!isValidEmail) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if the vendor already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ error: 'Vendor already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);


  
      // Generate an OTP
      const generateOTP = () => {
        const otp = Math.floor(10000 + Math.random() * 90000);
        return otp.toString();
      };
      
      const otp = generateOTP();
  
      // Set the OTP expiration time (4 minutes from now)
      const otpExpires = new Date(Date.now() + 4 * 60 * 1000);
  
      // Create a new vendor document
      const newVendor = new Vendor({
        ownerName,
        businessName,
        businessDescription,
        businessType,
        businessCategory,
        location,
        email,
        phoneNumber,
        university,
        department,
        matricNumber,
        sex,
        yearOfEntry,
        dateOfBirth,
        password,
        confirmPassword,
        isVerified: false,
        otp,
        otpExpires,
        role: 'vendor',
      });
  
      // Save the vendor data to the database
      await newVendor.save();
  
      // Send verification email
      sendVerificationEmail(email, businessName, ownerName, otp);
  
      res.setHeader('email', ` ${email}`);
      res.status(200).json({ message: 'Vendor registered successfully. Please verify your email.', email });
    } catch (error) {
      console.error('Error registering vendor:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };
  
  // Verify email
  const verifyEmail = async (req, res) => {
    try {
      const { otp } = req.body;
  
      // Find the vendor by the OTP
      const vendor = await Vendor.findOne({ otp });
  
      if (!vendor) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }
  
      // Check if the OTP has expired
      const currentTime = new Date();
      if (currentTime > vendor.otpExpires) {
        return res.status(400).json({ error: 'OTP has expired' });
      }
  
      // Mark the vendor as verified and remove the verification otp and otpExpires
      vendor.isVerified = true;
      vendor.otp = null;
      vendor.otpExpires = null;
      await vendor.save();
  
      res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Error verifying email:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };
  
  // Vendor login
  const vendorLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find the vendor by email
      const vendor = await Vendor.findOne({ email });
  
      if (!vendor) {
        console.log("Not a vendor");
        return res.status(404).json({ error: 'Invalid credentials' });
      }
  
      // Check if the vendor is verified
      if (!vendor.isVerified) {
        console.log("verification issue");
        return res.status(400).json({ error: 'Please verify your email' });
      }
  
      // Compare the provided password with the hashed password
      const isPasswordValid = await bcrypt.compare(password, vendor.password);
  
      if (vendor.password !== password) {
        console.log("encryption issue")
        return res.status(400).json({ error: 'Invalid credentials' });
      }
  
      // Generate a JWT token
      const token = jwt.sign({ vendorId: vendor._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.json({ msg: `Welcome back, ${vendor.ownerName}`, token });
    } catch (error) {
      console.error('Error logging in vendor:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };
  
  // Reset password
  const resetPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Validate the email
      const isValidEmail = validateEmail(email);
      if (!isValidEmail) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
  
      // Check if the vendor exists
      const vendor = await Vendor.findOne({ email });
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
  
      // Generate an OTP
      const generateOTP = () => {
        const otp = Math.floor(10000 + Math.random() * 90000);
        return otp.toString();
      };
      
      const resetOtp = generateOTP();
  
      // Set the OTP expiration time (4 minutes from now)
      const otpExpires = new Date(Date.now() + 4 * 60 * 1000);
  
      // Save the reset token to the vendor's document
      vendor.resetOtp = resetOtp;
      vendor.otpExpires = otpExpires;
      await vendor.save();
  
      // Send the password reset email
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
  
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Password Reset',
        html: `<p>You have requested a password reset. <p>Your OTP to reset your password is:${resetOtp}"</p>`,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
      conssole.log(error);
      console.error('Error resetting password:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };
  
  // Update password
  const updatePassword = async (req, res) => {
    try {
      const { confirmPassword, resetOtp, newPassword } = req.body;
      console.log(resetOtp, confirmPassword, newPassword);

  
      // Check if the vendor exists
      const vendor = await Vendor.findOne({ resetOtp });
      console.log(vendor);
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
  
      // Verify the reset token and expiration time
      if (!vendor.resetOtp || vendor.resetOtp !== resetOtp || Date.now() > vendor.resetOtpExpires) {
        return res.status(400).json({ error: 'Invalid or expired reset OTP' });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the vendor's password and reset token
      vendor.password = hashedPassword;
      vendor.resetOtp = undefined;
      vendor.resetOtpExpires = undefined;
      await vendor.save();
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };
  
  // Logout vendor
  const logoutVendor = async (req, res) => {
    try {
      // Clear the JWT token from the client
      res.clearCookie('token');
  
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Error logging out vendor:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };
  
  // Resend OTP
  const resendOTP = async (req, res) => {
    try {
      let email = (req.headers.email);
  
      // Find the vendor by email
      const vendor = await Vendor.findOne({ email });
  
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
  
      // Generate a new OTP
      const generateOTP = () => {
        const otp = Math.floor(10000 + Math.random() * 90000);
        return otp.toString();
      };
      const newOTP = generateOTP();
  
      // Set the new OTP and OTP expiration time (4 minutes from now)
      vendor.otp = newOTP;
      const otpExpires = new Date(Date.now() + 4 * 60 * 1000);
      vendor.otpExpires = otpExpires;
  
      // Save the updated vendor document
      await vendor.save();
  
      // Send the new OTP to the vendor's email
      const { businessName, ownerName } = vendor;
      sendVerificationEmail(email, businessName, ownerName, newOTP);
  
      res.status(200).json({ message: 'New OTP sent successfully' });
    } catch (error) {
      console.error('Error resending OTP:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };


  module.exports = { 
    vendorRegister,
    verifyEmail,
    vendorLogin,
    resetPassword,
    updatePassword,
    resendOTP,
    logoutVendor
   }; 